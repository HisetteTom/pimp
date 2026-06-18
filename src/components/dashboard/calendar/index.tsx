'use client';

import { useRef, useReducer } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { EventClickArg, DatesSetArg } from '@fullcalendar/core';
import frLocale from '@fullcalendar/core/locales/fr';
import { useLocale } from 'next-intl';
import { DetailsDialog } from './details-dialog';
import { CalendarHeader } from './calendar-header';
import { Checkpoint, CheckpointNote, CalendarEventProps, Task as BaseTask } from './types';

export interface ProjectCalendarProps<TTask extends BaseTask = BaseTask> {
  project: {
    id: number;
    name: string;
    dateStart?: string | null;
    dateEnd?: string | null;
  };
  tasks: TTask[];
  checkpoints: Checkpoint[];
  checkpointNotes: CheckpointNote[];
  members?: { id: string; name: string }[];
  onSelectTask?: (task: TTask) => void;
}

const EMPTY_MEMBERS: { id: string; name: string }[] = [];

interface CalendarState {
  onlyTeacherDates: boolean;
  hideInProgress: boolean;
  selectedEvent: CalendarEventProps | null;
  modalOpen: boolean;
  viewTitle: string;
  currentView: string;
}

type CalendarAction =
  | { type: 'TOGGLE_TEACHER_DATES' }
  | { type: 'TOGGLE_HIDE_IN_PROGRESS' }
  | { type: 'OPEN_DETAILS'; event: CalendarEventProps }
  | { type: 'SET_MODAL_OPEN'; open: boolean }
  | { type: 'SET_VIEW_AND_TITLE'; title: string; viewType: string }
  | { type: 'SET_VIEW'; viewType: string };

const initialState: CalendarState = {
  onlyTeacherDates: false,
  hideInProgress: false,
  selectedEvent: null,
  modalOpen: false,
  viewTitle: '',
  currentView: 'dayGridMonth',
};

function calendarReducer(state: CalendarState, action: CalendarAction): CalendarState {
  switch (action.type) {
    case 'TOGGLE_TEACHER_DATES':
      return {
        ...state,
        onlyTeacherDates: !state.onlyTeacherDates,
      };
    case 'TOGGLE_HIDE_IN_PROGRESS':
      return {
        ...state,
        hideInProgress: !state.hideInProgress,
      };
    case 'OPEN_DETAILS':
      return {
        ...state,
        selectedEvent: action.event,
        modalOpen: true,
      };
    case 'SET_MODAL_OPEN':
      return {
        ...state,
        modalOpen: action.open,
      };
    case 'SET_VIEW_AND_TITLE':
      return {
        ...state,
        viewTitle: action.title,
        currentView: action.viewType,
      };
    case 'SET_VIEW':
      return {
        ...state,
        currentView: action.viewType,
      };
    default:
      return state;
  }
}

/**
 * Renders the interactive project schedule calendar.
 * Integrates FullCalendar to map out boundary start/end dates,
 * checkpoints, and team tasks, supporting localized viewports and filtering logic.
 */
export function ProjectCalendar<TTask extends BaseTask = BaseTask>({
  project,
  tasks,
  checkpoints,
  checkpointNotes,
  members = EMPTY_MEMBERS,
  onSelectTask,
}: ProjectCalendarProps<TTask>) {
  const [state, dispatch] = useReducer(calendarReducer, initialState);
  const locale = useLocale();
  const { onlyTeacherDates, hideInProgress, selectedEvent, modalOpen, viewTitle, currentView } =
    state;

  const calendarRef = useRef<FullCalendar>(null);

  const handleDatesSet = (arg: DatesSetArg) => {
    dispatch({
      type: 'SET_VIEW_AND_TITLE',
      title: arg.view.title,
      viewType: arg.view.type,
    });
  };

  const calendarEvents = (() => {
    interface CalendarEventInput {
      id: string;
      title: string;
      start: string;
      end?: string;
      allDay?: boolean;
      backgroundColor?: string;
      borderColor?: string;
      textColor?: string;
      className?: string;
      display?: string;
      extendedProps?: {
        type: 'boundary' | 'checkpoint' | 'task';
        title?: string;
        date?: string;
        notes?: string;
        description?: string;
        task?: TTask;
        isRange?: boolean;
        startActual?: string;
        endActual?: string;
      };
    }
    const list: CalendarEventInput[] = [];

    if (project.dateStart) {
      list.push({
        id: 'project-start',
        title: 'Project Start',
        start: project.dateStart,
        allDay: true,
        backgroundColor: '#71717a',
        borderColor: '#71717a',
        extendedProps: {
          type: 'boundary',
          title: 'Project Start Date',
          date: project.dateStart,
          description: 'Official start date of the project proposal.',
        },
      });
    }

    if (project.dateEnd) {
      list.push({
        id: 'project-end',
        title: 'Project End',
        start: project.dateEnd,
        allDay: true,
        backgroundColor: '#27272a',
        borderColor: '#27272a',
        extendedProps: {
          type: 'boundary',
          title: 'Project End Date',
          date: project.dateEnd,
          description: 'Official final deadline for all deliverables and evaluations.',
        },
      });
    }

    checkpoints.forEach((cp) => {
      const note = checkpointNotes.find((n) => n.checkpointId === cp.id);
      const startStr = typeof cp.dueDate === 'string' ? cp.dueDate : cp.dueDate.toISOString();
      list.push({
        id: `checkpoint-${cp.id}`,
        title: `${cp.title}`,
        start: startStr.split('T')[0],
        allDay: true,
        backgroundColor: 'oklch(0.7 0.2 45)',
        borderColor: 'oklch(0.7 0.2 45)',
        textColor: '#ffffff',
        extendedProps: {
          type: 'checkpoint',
          title: cp.title,
          date: startStr,
          notes: note?.notes || '',
        },
      });
    });

    // Tasks
    if (!onlyTeacherDates) {
      tasks.forEach((t) => {
        if (!t.deadline) return;
        if (hideInProgress && t.status === 'in_progress') return;

        const startVal = t.inProgressAt
          ? new Date(t.inProgressAt)
          : new Date(t.createdAt || t.deadline);

        const endVal =
          t.status === 'done' && t.completedAt ? new Date(t.completedAt) : new Date(t.deadline);

        const startIso = startVal.toISOString().split('T')[0];
        const endIso = endVal.toISOString().split('T')[0];

        const isRange = startIso !== endIso && startVal.getTime() < endVal.getTime();

        let eventColor = 'oklch(0.5 0.2 280)';
        let displayTitle = `${t.name}`;

        if (t.status === 'done') {
          eventColor = 'oklch(0.62 0.17 145)';
          displayTitle = `${t.name}`;
        } else if (t.status === 'in_progress') {
          eventColor = 'oklch(0.65 0.22 80)';
          displayTitle = `${t.name}`;
        }

        const endDayPlusOne = new Date(endVal.getTime() + 86400000).toISOString().split('T')[0];

        list.push({
          id: `task-${t.id}`,
          title: displayTitle,
          start: isRange ? startIso : endIso,
          end: isRange ? endDayPlusOne : undefined,
          allDay: true,
          backgroundColor: eventColor,
          borderColor: eventColor,
          textColor: '#ffffff',
          className: t.status === 'done' ? 'line-through opacity-85' : '',
          extendedProps: {
            type: 'task',
            task: t,
            isRange,
            startActual: startIso,
            endActual: endIso,
          },
        });
      });
    }

    return list;
  })();

  const handleEventClick = (info: EventClickArg) => {
    const props = info.event.extendedProps as unknown as {
      type: 'boundary' | 'checkpoint' | 'task';
      title?: string;
      date?: string;
      notes?: string;
      description?: string;
      task?: TTask;
    };
    if (props.type === 'task' && onSelectTask) {
      onSelectTask(props.task as TTask);
      return;
    }
    dispatch({
      type: 'OPEN_DETAILS',
      event: {
        id: info.event.id,
        title: info.event.title,
        ...props,
        task: props.task as unknown as BaseTask,
      },
    });
  };

  return (
    <div className="border-zinc-150 animate-fade-in relative border-2 bg-white p-4 shadow-sm sm:p-5 dark:border-zinc-800 dark:bg-zinc-950">
      <CalendarHeader
        calendarRef={calendarRef}
        viewTitle={viewTitle}
        onlyTeacherDates={onlyTeacherDates}
        hideInProgress={hideInProgress}
        currentView={currentView}
        onToggleTeacherDates={() => dispatch({ type: 'TOGGLE_TEACHER_DATES' })}
        onToggleHideInProgress={() => dispatch({ type: 'TOGGLE_HIDE_IN_PROGRESS' })}
        onSetView={(viewType) => dispatch({ type: 'SET_VIEW', viewType })}
      />

      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={calendarEvents}
        eventClick={handleEventClick}
        headerToolbar={false}
        height="auto"
        datesSet={handleDatesSet}
        editable={false}
        selectable={false}
        dayMaxEvents={true}
        locales={[frLocale]}
        locale={locale}
      />

      <DetailsDialog
        selectedEvent={selectedEvent}
        isOpen={modalOpen}
        onOpenChange={(open) => dispatch({ type: 'SET_MODAL_OPEN', open })}
        members={members}
      />
    </div>
  );
}
