import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { Metadata } from 'next';
import { ChangePasswordForm } from './change-password-form';

export const metadata: Metadata = {
  title: 'Change Password - PIMP',
  description: 'First login password change enforcement.',
};

/**
 * Initial gateway for users flagged for mandatory password reset.
 */
export default async function ChangePasswordPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/login');
  }

  const user = session.user as { requiresPasswordChange?: boolean };

  // If user does NOT require a password change, redirect to home page
  if (!user.requiresPasswordChange) {
    redirect('/');
  }

  return <ChangePasswordForm />;
}
