import { NextRequest } from 'next/server';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { db } from '@/db';
import { livrable, projectEnrollment } from '@/db/schema';
import { s3Client, BUCKET_NAME } from '@/lib/storage';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { eq, and } from 'drizzle-orm';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return new Response('Unauthorized', { status: 401 });
    }

    const { id: idStr } = await params;
    const deliverableId = parseInt(idStr, 10);
    if (isNaN(deliverableId)) {
      return new Response('Invalid deliverable ID', { status: 400 });
    }

    const deliverable = await db.query.livrable.findFirst({
      where: eq(livrable.id, deliverableId),
    });

    if (!deliverable) {
      return new Response('Deliverable not found', { status: 404 });
    }

    if (session.user.role === 'student') {
      const enrollment = await db.query.projectEnrollment.findFirst({
        where: and(
          eq(projectEnrollment.userId, session.user.id),
          eq(projectEnrollment.teamId, deliverable.teamId),
        ),
      });

      if (!enrollment) {
        return new Response('Forbidden: You do not have access to this deliverable', {
          status: 403,
        });
      }
    } else if (
      session.user.role !== 'professor' &&
      session.user.role !== 'jury' &&
      session.user.role !== 'owner'
    ) {
      return new Response('Forbidden: Invalid role', { status: 403 });
    }

    if (!deliverable.source) {
      return new Response('Deliverable has no source file', { status: 400 });
    }

    const s3Response = await s3Client.send(
      new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: deliverable.source,
      }),
    );

    const body = s3Response.Body;
    if (!body) {
      return new Response('File content is empty', { status: 404 });
    }

    const stream =
      typeof (body as unknown as { transformToWebStream?: () => ReadableStream })
        .transformToWebStream === 'function'
        ? (body as unknown as { transformToWebStream: () => ReadableStream }).transformToWebStream()
        : (body as unknown as ReadableStream);

    // Detect if we should download or view in browser
    const headersList = new Headers();
    headersList.set('Content-Type', s3Response.ContentType || 'application/octet-stream');
    if (s3Response.ContentLength) {
      headersList.set('Content-Length', s3Response.ContentLength.toString());
    }

    // Attempt to parse clean filename from key
    const fileName = deliverable.source.split('/').pop() || deliverable.name;
    headersList.set(
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(fileName)}"`,
    );

    return new Response(stream as unknown as BodyInit, {
      status: 200,
      headers: headersList,
    });
  } catch (error) {
    console.error('Error downloading deliverable:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(`Internal Server Error: ${errorMessage}`, { status: 500 });
  }
}
