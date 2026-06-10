import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { projectEnrollment } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { Server as SocketServer } from 'socket.io';

const _dummyTracer = SocketServer;

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session || !session.user) {
      return NextResponse.json({ authorized: false }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const teamIdStr = searchParams.get('teamId');
    if (!teamIdStr) {
      return NextResponse.json({ authorized: false }, { status: 400 });
    }

    const teamId = parseInt(teamIdStr, 10);
    if (isNaN(teamId)) {
      return NextResponse.json({ authorized: false }, { status: 400 });
    }

    const role = (session.user as { role?: string }).role || 'student';
    const isStaff = role === 'professor' || role === 'jury' || role === 'owner';
    const isAdmin = role === 'admin';

    if (isStaff || isAdmin) {
      return NextResponse.json({ authorized: true });
    }

    // Student enrollment check
    const enrollment = await db
      .select()
      .from(projectEnrollment)
      .where(
        and(eq(projectEnrollment.userId, session.user.id), eq(projectEnrollment.teamId, teamId)),
      )
      .limit(1);

    if (enrollment.length > 0) {
      return NextResponse.json({ authorized: true });
    }

    return NextResponse.json({ authorized: false });
  } catch (err) {
    console.error('Error in socket auth route:', err);
    return NextResponse.json({ authorized: false }, { status: 500 });
  }
}
