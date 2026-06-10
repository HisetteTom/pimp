import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Accueil',
  description: "Plateforme de gestion et suivi des projets étudiants de l'ISEN.",
};

export default async function HomePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/login');
  }

  if (session.user.role === 'student') {
    redirect('/dashboard/student');
  }

  if (
    session.user.role === 'professor' ||
    session.user.role === 'jury' ||
    session.user.role === 'owner'
  ) {
    redirect('/dashboard/professor');
  }

  if (session.user.role === 'admin') {
    redirect('/dashboard/admin');
  }

  return null;
}
