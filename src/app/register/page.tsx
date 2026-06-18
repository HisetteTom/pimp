import { Metadata } from 'next';
import { RegisterForm } from './register-form';

export const metadata: Metadata = {
  title: 'Inscription',
  description: 'Créez votre compte PIMP pour rejoindre la plateforme de gestion de projets.',
};

/**
 * Registration gateway page wrapper.
 */
export default function RegisterPage() {
  return <RegisterForm />;
}
