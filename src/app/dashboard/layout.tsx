import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { NotificationListener } from '@/components/dashboard/notification-listener';

/**
 * Core dashboard context layout. Checks session validity and handles base redirections.
 */
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/login');
  }

  const user = session.user as { requiresPasswordChange?: boolean; role?: string };

  if (user.requiresPasswordChange) {
    redirect('/change-password');
  }

  // Role based redirection

  if (
    user.role !== 'student' &&
    user.role !== 'professor' &&
    user.role !== 'jury' &&
    user.role !== 'admin' &&
    user.role !== 'owner'
  ) {
    redirect('/login');
  }

  return (
    <>
      <NotificationListener />
      {children}
    </>
  );
}
