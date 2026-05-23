'use client';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import { EventClickArg } from '@fullcalendar/core';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import Image from 'next/image';
import { LayoutDashboard } from 'lucide-react';

export default function CalendarClient() {
  const [eventsList, setEventsList] = useState([
    { id: '1', title: 'Fin du projet', start: '2026-06-24' },
    { id: '2', title: 'Début du projet', start: '2026-05-18' },
  ]);

  const handleDateClick = (selectInfo: DateClickArg) => {
    const title = prompt('Entrez le titre du nouvel événement :');

    if (title) {
      const newEvent = {
        id: String(Date.now()),
        title: title,
        start: selectInfo.dateStr,
        allDay: true,
      };

      setEventsList([...eventsList, newEvent]);
    }
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    if (window.confirm(`Supprimer l'événement "${clickInfo.event.title}" ?`)) {
      const updatedEvents = eventsList.filter((event) => event.id !== clickInfo.event.id);
      setEventsList(updatedEvents);
    }
  };

  return (
    <div className="bg-background border-secondary flex min-h-screen flex-col items-center justify-center gap-y-6 border-t-8 p-4">
      <div className="mt-4 flex flex-col items-center gap-y-2">
        <Image src="/pimp_logo.png" alt="PIMP Logo" width={80} height={80} />
        <h1 className="text-secondary flex items-center gap-2 text-2xl font-semibold tracking-tighter">
          <LayoutDashboard className="size-6" /> Calendrier
        </h1>
      </div>
      <div className="grid min-h-[80vh] w-full max-w-6xl gap-6">
        <Card className="border-secondary/10 bg-card flex flex-col justify-between border-2 shadow-xl">
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin, timeGridPlugin]}
            initialView="dayGridMonth"
            locale="fr"
            events={eventsList}
            dateClick={handleDateClick}
            eventClick={handleEventClick}
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek',
            }}
            height="auto"
            aspectRatio={1.35}
          />
        </Card>
      </div>
    </div>
  );
}
