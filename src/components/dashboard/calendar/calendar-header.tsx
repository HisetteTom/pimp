'use client';

import { RefObject } from 'react';
import FullCalendar from '@fullcalendar/react';
import { useTranslations } from 'next-intl';

interface CalendarHeaderProps {
  calendarRef: RefObject<FullCalendar | null>;
  viewTitle: string;
  onlyTeacherDates: boolean;
  hideInProgress: boolean;
  currentView: string;
  onToggleTeacherDates: () => void;
  onToggleHideInProgress: () => void;
  onSetView: (viewType: string) => void;
}

export function CalendarHeader({
  calendarRef,
  viewTitle,
  onlyTeacherDates,
  hideInProgress,
  currentView,
  onToggleTeacherDates,
  onToggleHideInProgress,
  onSetView,
}: CalendarHeaderProps) {
  const t = useTranslations('Calendar');

  return (
    <div className="mb-4 flex flex-col gap-3 border-b border-zinc-100 pb-3 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800">
      {/* Left Side: Navigation */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => calendarRef.current?.getApi().prev()}
          className="cursor-pointer border-2 border-zinc-200 bg-white px-2.5 py-1 font-mono text-[10px] font-bold text-zinc-700 transition-all duration-150 hover:border-zinc-400 active:translate-y-[1px] dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-zinc-600"
          title={t('previous')}
        >
          ←
        </button>
        <button
          type="button"
          onClick={() => calendarRef.current?.getApi().next()}
          className="cursor-pointer border-2 border-zinc-200 bg-white px-2.5 py-1 font-mono text-[10px] font-bold text-zinc-700 transition-all duration-150 hover:border-zinc-400 active:translate-y-[1px] dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-zinc-600"
          title={t('next')}
        >
          →
        </button>
        <button
          type="button"
          onClick={() => calendarRef.current?.getApi().today()}
          className="cursor-pointer border-2 border-zinc-200 bg-white px-3 py-1 font-mono text-[9px] font-bold tracking-widest text-zinc-700 uppercase transition-all duration-150 hover:border-zinc-400 active:translate-y-[1px] dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-zinc-600"
        >
          {t('today')}
        </button>
      </div>

      {/* Center: Title */}
      <div className="text-center sm:text-left">
        <h2 className="font-mono text-[11px] font-semibold tracking-widest text-zinc-800 uppercase sm:text-xs dark:text-zinc-200">
          {viewTitle}
        </h2>
      </div>

      {/* Right Side: Filters & Views */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-end">
        {/* Filters Group */}
        <div className="border-zinc-150 mr-1 flex items-center gap-1 border-r pr-2 dark:border-zinc-800">
          <button
            type="button"
            onClick={onToggleTeacherDates}
            className={`cursor-pointer border-2 px-2.5 py-1 font-mono text-[9px] font-bold tracking-widest uppercase transition-all duration-200 active:translate-y-[1px] ${
              onlyTeacherDates
                ? 'bg-primary border-primary text-primary-foreground shadow-[2px_2px_0px_rgba(var(--primary-rgb),0.3)]'
                : 'border-zinc-200 text-zinc-500 hover:border-zinc-400 hover:text-zinc-700 dark:border-zinc-800 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:text-zinc-200'
            }`}
          >
            {onlyTeacherDates ? `✓ ${t('teachers')}` : t('teachers')}
          </button>
          <button
            type="button"
            disabled={onlyTeacherDates}
            onClick={onToggleHideInProgress}
            className={`cursor-pointer border-2 px-2.5 py-1 font-mono text-[9px] font-bold tracking-widest uppercase transition-all duration-200 active:translate-y-[1px] disabled:pointer-events-none disabled:opacity-30 ${
              hideInProgress
                ? 'bg-secondary border-secondary text-secondary-foreground shadow-[2px_2px_0px_rgba(var(--secondary-rgb),0.3)]'
                : 'border-zinc-200 text-zinc-500 hover:border-zinc-400 hover:text-zinc-700 dark:border-zinc-800 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:text-zinc-200'
            }`}
          >
            {hideInProgress ? `✓ ${t('hideIp')}` : t('hideIp')}
          </button>
        </div>

        {/* Views Group */}
        <div className="flex items-center gap-1">
          {[
            { id: 'dayGridMonth', key: 'month' },
            { id: 'timeGridWeek', key: 'week' },
            { id: 'timeGridDay', key: 'day' },
          ].map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => {
                calendarRef.current?.getApi().changeView(v.id);
                onSetView(v.id);
              }}
              className={`cursor-pointer border-2 px-2.5 py-1 font-mono text-[9px] font-bold tracking-widest uppercase transition-all duration-200 active:translate-y-[1px] ${
                currentView === v.id
                  ? 'bg-secondary border-secondary text-secondary-foreground shadow-[2px_2px_0px_rgba(var(--secondary-rgb),0.3)]'
                  : 'border-zinc-200 text-zinc-500 hover:border-zinc-400 hover:text-zinc-700 dark:border-zinc-800 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:text-zinc-200'
              }`}
            >
              {t(v.key)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
