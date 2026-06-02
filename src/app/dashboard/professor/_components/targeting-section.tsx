'use client';

import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StudentDropdownItem, ProfDropdownItem } from './project-dialog-types';
import { useTranslations } from 'next-intl';

interface TargetingSectionProps {
  targetPromos: string[];
  setTargetPromos: (promos: string[]) => void;
  targetUsers: string[];
  setTargetUsers: (users: string[]) => void;
  coTeachers: string[];
  setCoTeachers: (teachers: string[]) => void;
  students: StudentDropdownItem[];
  professors: ProfDropdownItem[];
  studentSearch: string;
  setStudentSearch: (search: string) => void;
  profSearch: string;
  setProfSearch: (search: string) => void;
  isPending: boolean;
}

export function TargetingSection({
  targetPromos,
  setTargetPromos,
  targetUsers,
  setTargetUsers,
  coTeachers,
  setCoTeachers,
  students,
  professors,
  studentSearch,
  setStudentSearch,
  profSearch,
  setProfSearch,
  isPending,
}: TargetingSectionProps) {
  const t = useTranslations('ProfessorTargetingSection');

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.email.toLowerCase().includes(studentSearch.toLowerCase()) ||
      (s.promo && s.promo.toLowerCase().includes(studentSearch.toLowerCase())),
  );

  const filteredProfs = professors.filter(
    (p) =>
      p.name.toLowerCase().includes(profSearch.toLowerCase()) ||
      p.email.toLowerCase().includes(profSearch.toLowerCase()),
  );

  return (
    <div className="space-y-6 border-t border-b border-zinc-100 py-4 dark:border-zinc-800">
      {/* Target Promos Section */}
      <div className="space-y-2">
        <Label className="text-[11px] font-black tracking-widest text-zinc-500 uppercase">
          {t('targetCohorts')}
        </Label>
        <div className="flex flex-wrap gap-2">
          {['ISEN1', 'ISEN2', 'ISEN3', 'ISEN4', 'ISEN5'].map((p) => {
            const active = targetPromos.includes(p);
            return (
              <Button
                key={p}
                type="button"
                variant="unstyled"
                disabled={isPending}
                onClick={() => {
                  setTargetPromos(
                    targetPromos.includes(p)
                      ? targetPromos.filter((x) => x !== p)
                      : [...targetPromos, p],
                  );
                }}
                className={`h-9 cursor-pointer border px-4 text-xs font-bold uppercase transition-all ${
                  active
                    ? 'border-purple-600 bg-purple-600 text-white shadow-[2px_2px_0px_0px_rgba(168,85,247,0.2)]'
                    : 'border-zinc-200 bg-white text-zinc-800 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900'
                }`}
              >
                {p}
              </Button>
            );
          })}
        </div>
        <p className="text-[10px] font-bold text-zinc-400 uppercase italic">{t('privateNote')}</p>
      </div>

      {/* Target Specific Students */}
      <div className="space-y-2">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <Label
            htmlFor="student-search"
            className="text-[11px] font-black tracking-widest text-zinc-500 uppercase"
          >
            {t('targetStudents', { count: targetUsers.length })}
          </Label>
          <Input
            id="student-search"
            placeholder={t('filterStudents')}
            className="h-8 rounded-none border border-zinc-200 text-xs sm:w-48 dark:border-zinc-800"
            value={studentSearch}
            onChange={(e) => setStudentSearch(e.target.value)}
            disabled={isPending}
          />
        </div>
        <div className="h-32 space-y-1 overflow-y-auto rounded-none border border-zinc-200 bg-zinc-50/50 p-2 dark:border-zinc-800 dark:bg-zinc-900/20">
          {filteredStudents.length === 0 ? (
            <p className="p-2 text-xs text-zinc-400 italic">{t('noStudentsFound')}</p>
          ) : (
            filteredStudents.map((s) => {
              const checked = targetUsers.includes(s.id);
              return (
                <label
                  key={s.id}
                  htmlFor={`student-chk-${s.id}`}
                  className="flex cursor-pointer items-center gap-2 rounded-none p-1 text-xs font-medium hover:bg-zinc-100 dark:hover:bg-zinc-900"
                >
                  <input
                    type="checkbox"
                    id={`student-chk-${s.id}`}
                    aria-label={`Target student ${s.name}`}
                    checked={checked}
                    disabled={isPending}
                    onChange={() => {
                      setTargetUsers(
                        targetUsers.includes(s.id)
                          ? targetUsers.filter((id) => id !== s.id)
                          : [...targetUsers, s.id],
                      );
                    }}
                    className="size-4 rounded border-zinc-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-zinc-700 dark:text-zinc-300">
                    {s.name}{' '}
                    <span className="font-bold text-purple-500">({s.promo || t('noPromo')})</span> -{' '}
                    <span className="text-zinc-500">{s.email}</span>
                  </span>
                </label>
              );
            })
          )}
        </div>
      </div>

      {/* Invite Collaborating Professors */}
      <div className="space-y-2">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <Label
            htmlFor="prof-search"
            className="text-[11px] font-black tracking-widest text-zinc-500 uppercase"
          >
            {t('inviteCollaborators', { count: coTeachers.length })}
          </Label>
          <Input
            id="prof-search"
            placeholder={t('filterProfessors')}
            className="h-8 rounded-none border border-zinc-200 text-xs sm:w-48 dark:border-zinc-800"
            value={profSearch}
            onChange={(e) => setProfSearch(e.target.value)}
            disabled={isPending}
          />
        </div>
        <div className="h-28 space-y-1 overflow-y-auto rounded-none border border-zinc-200 bg-zinc-50/50 p-2 dark:border-zinc-800 dark:bg-zinc-900/20">
          {filteredProfs.length === 0 ? (
            <p className="p-2 text-xs text-zinc-400 italic">{t('noProfessorsFound')}</p>
          ) : (
            filteredProfs.map((p) => {
              const checked = coTeachers.includes(p.id);
              return (
                <label
                  key={p.id}
                  htmlFor={`prof-chk-${p.id}`}
                  className="flex cursor-pointer items-center gap-2 rounded-none p-1 text-xs font-medium hover:bg-zinc-100 dark:hover:bg-zinc-900"
                >
                  <input
                    type="checkbox"
                    id={`prof-chk-${p.id}`}
                    aria-label={`Invite professor ${p.name}`}
                    checked={checked}
                    disabled={isPending}
                    onChange={() => {
                      setCoTeachers(
                        coTeachers.includes(p.id)
                          ? coTeachers.filter((id) => id !== p.id)
                          : [...coTeachers, p.id],
                      );
                    }}
                    className="size-4 rounded border-zinc-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-zinc-700 dark:text-zinc-300">
                    {p.name} - <span className="text-zinc-500">{p.email}</span>
                  </span>
                </label>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
