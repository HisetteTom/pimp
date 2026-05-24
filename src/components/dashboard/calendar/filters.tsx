'use client';

interface CalendarFiltersProps {
  onlyTeacherDates: boolean;
  setOnlyTeacherDates: (val: boolean) => void;
  hideInProgress: boolean;
  setHideInProgress: (val: boolean) => void;
}

export function CalendarFilters({
  onlyTeacherDates,
  setOnlyTeacherDates,
  hideInProgress,
  setHideInProgress,
}: CalendarFiltersProps) {
  return (
    <div className="border-zinc-150 flex flex-wrap items-center gap-4 border-2 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
      <span className="font-mono text-[10px] font-black tracking-widest text-zinc-400 uppercase">
        Filters:
      </span>
      <button
        type="button"
        onClick={() => setOnlyTeacherDates(!onlyTeacherDates)}
        className={`cursor-pointer border-2 px-3 py-1.5 font-mono text-[10px] font-bold tracking-widest uppercase transition-all duration-200 active:translate-y-[1px] ${
          onlyTeacherDates
            ? 'bg-primary border-primary text-primary-foreground shadow-[2px_2px_0px_rgba(var(--primary-rgb),0.3)]'
            : 'border-zinc-200 text-zinc-500 hover:border-zinc-400 hover:text-zinc-700 dark:border-zinc-800 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:text-zinc-200'
        }`}
      >
        {onlyTeacherDates ? "✓ Only Teacher's Dates" : "Only Teacher's Dates"}
      </button>

      <button
        type="button"
        disabled={onlyTeacherDates}
        onClick={() => setHideInProgress(!hideInProgress)}
        className={`cursor-pointer border-2 px-3 py-1.5 font-mono text-[10px] font-bold tracking-widest uppercase transition-all duration-200 active:translate-y-[1px] disabled:pointer-events-none disabled:opacity-30 ${
          hideInProgress
            ? 'bg-secondary border-secondary text-secondary-foreground shadow-[2px_2px_0px_rgba(var(--secondary-rgb),0.3)]'
            : 'border-zinc-200 text-zinc-500 hover:border-zinc-400 hover:text-zinc-700 dark:border-zinc-800 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:text-zinc-200'
        }`}
      >
        {hideInProgress ? '✓ Hide Tasks In Progress' : 'Hide Tasks In Progress'}
      </button>
    </div>
  );
}
