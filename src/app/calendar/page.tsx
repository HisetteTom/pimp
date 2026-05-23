import { Metadata } from 'next';
import CalendarClient from './calendar-client';

export const metadata: Metadata = {
  title: 'Calendrier | PIMP',
  description: 'Consultez et gérez le calendrier de vos projets étudiants sur PIMP.',
};

export default function CalendarPage() {
  return <CalendarClient />;
}
