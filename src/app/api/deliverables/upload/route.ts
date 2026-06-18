import { NextRequest, NextResponse } from 'next/server';
import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { db } from '@/db';
import { livrable, projectEnrollment, team, project } from '@/db/schema';
import { s3Client, BUCKET_NAME, ensureBucketExists } from '@/lib/storage';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { eq, and } from 'drizzle-orm';
import { createNotification } from '@/app/dashboard/actions-notification';

/**
 * Endpoint for uploading team deliverables to S3 storage.
 * Creates database records for the deliverables and triggers supervisor notifications.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const teamIdStr = formData.get('teamId') as string | null;
    const deliverableName = formData.get('name') as string | null;
    const deliverableIdStr = formData.get('deliverableId') as string | null;

    if (!teamIdStr || !deliverableName) {
      return NextResponse.json({ error: 'Missing teamId or name' }, { status: 400 });
    }

    const teamId = parseInt(teamIdStr, 10);
    if (isNaN(teamId)) {
      return NextResponse.json({ error: 'Invalid teamId' }, { status: 400 });
    }

    const enrollment = await db.query.projectEnrollment.findFirst({
      where: and(
        eq(projectEnrollment.userId, session.user.id),
        eq(projectEnrollment.teamId, teamId),
      ),
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: 'Forbidden: You do not belong to this team' },
        { status: 403 },
      );
    }

    let existingDeliverable = null;
    if (deliverableIdStr) {
      const deliverableId = parseInt(deliverableIdStr, 10);
      if (!isNaN(deliverableId)) {
        existingDeliverable = await db.query.livrable.findFirst({
          where: and(eq(livrable.id, deliverableId), eq(livrable.teamId, teamId)),
        });
      }
    }

    let uniqueKey = existingDeliverable?.source || '';

    // Only upload a new file if provided
    if (file && file.size > 0) {
      await ensureBucketExists();

      if (existingDeliverable?.source) {
        try {
          await s3Client.send(
            new DeleteObjectCommand({
              Bucket: BUCKET_NAME,
              Key: existingDeliverable.source,
            }),
          );
        } catch (delError) {
          console.warn('Failed to delete old file from S3:', delError);
        }
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      uniqueKey = `teams/${teamId}/${Date.now()}-${cleanFileName}`;

      await s3Client.send(
        new PutObjectCommand({
          Bucket: BUCKET_NAME,
          Key: uniqueKey,
          Body: buffer,
          ContentType: file.type || 'application/octet-stream',
        }),
      );
    }

    let resultDeliverable;

    if (existingDeliverable) {
      // Update existing deliverable, reset status to pending
      const [updated] = await db
        .update(livrable)
        .set({
          name: deliverableName,
          source: uniqueKey,
          status: 'pending',
          createdAt: new Date(), // update submission time
        })
        .where(eq(livrable.id, existingDeliverable.id))
        .returning();
      resultDeliverable = updated;
    } else {
      // Create new deliverable
      const [inserted] = await db
        .insert(livrable)
        .values({
          name: deliverableName,
          source: uniqueKey,
          teamId: teamId,
          status: 'pending',
        })
        .returning();
      resultDeliverable = inserted;
    }

    try {
      const teamRecord = await db.query.team.findFirst({
        where: eq(team.id, teamId),
      });
      if (teamRecord) {
        const projectRecord = await db.query.project.findFirst({
          where: eq(project.id, teamRecord.projectId),
        });
        if (projectRecord && projectRecord.teacherId) {
          const notificationMessage = existingDeliverable
            ? `Team "${teamRecord.name}" updated their deliverable: "${deliverableName}".`
            : `Team "${teamRecord.name}" submitted a new deliverable: "${deliverableName}".`;

          await createNotification({
            userId: projectRecord.teacherId,
            title: existingDeliverable ? 'Deliverable Updated' : 'New Deliverable Submitted',
            message: notificationMessage,
            type: 'deliverable_submitted',
            link: `/dashboard/professor/projects/${projectRecord.id}/teams/${teamId}?tab=deliverables`,
          });
        }
      }
    } catch (notifError) {
      console.error('Failed to notify professor:', notifError);
    }

    return NextResponse.json({
      success: true,
      deliverable: resultDeliverable,
    });
  } catch (error) {
    console.error('Error uploading deliverable:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Internal server error', details: errorMessage },
      { status: 500 },
    );
  }
}
