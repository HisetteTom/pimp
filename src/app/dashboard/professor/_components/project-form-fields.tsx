'use client';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FileText, Calendar, Users } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface ProjectFormFieldsProps {
  formState: {
    name: string;
    description: string;
    dateStart: string;
    dateEnd: string;
    maxGroups: string;
    maxMembersPerGroup: string;
    showEvaluationGrid?: boolean;
  };
  onChange: (field: string, value: string | boolean) => void;
  isPending: boolean;
}

export function ProjectFormFields({ formState, onChange, isPending }: ProjectFormFieldsProps) {
  const t = useTranslations('ProfessorProjectFormFields');

  return (
    <>
      <div className="space-y-2">
        <Label
          htmlFor="name"
          className="text-[11px] font-black tracking-widest text-zinc-500 uppercase"
        >
          {t('name')} <span className="text-purple-500">*</span>
        </Label>
        <div className="relative">
          <FileText className="absolute top-3 left-3 size-4 text-zinc-400" />
          <Input
            id="name"
            type="text"
            className="h-11 rounded-none border-2 border-zinc-200 pl-10 transition-colors hover:border-zinc-300 focus-visible:border-purple-500 focus-visible:ring-3 focus-visible:ring-purple-500/50 dark:border-zinc-800 dark:hover:border-zinc-700"
            value={formState.name}
            onChange={(e) => onChange('name', e.target.value)}
            required
            disabled={isPending}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label
          htmlFor="description"
          className="text-[11px] font-black tracking-widest text-zinc-500 uppercase"
        >
          {t('description')}
        </Label>
        <Textarea
          id="description"
          rows={4}
          className="resize-none rounded-none border-2 border-zinc-200 p-3 transition-colors hover:border-zinc-300 focus-visible:border-purple-500 focus-visible:ring-3 focus-visible:ring-purple-500/50 dark:border-zinc-800 dark:hover:border-zinc-700"
          value={formState.description}
          onChange={(e) => onChange('description', e.target.value)}
          disabled={isPending}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label
            htmlFor="dateStart"
            className="text-[11px] font-black tracking-widest text-zinc-500 uppercase"
          >
            {t('startDate')}
          </Label>
          <div className="relative">
            <Calendar className="absolute top-3 left-3 size-4 text-zinc-400" />
            <Input
              id="dateStart"
              type="date"
              className="h-11 rounded-none border-2 border-zinc-200 pl-10 transition-colors hover:border-zinc-300 focus-visible:border-purple-500 focus-visible:ring-3 focus-visible:ring-purple-500/50 dark:border-zinc-800 dark:hover:border-zinc-700"
              value={formState.dateStart}
              onChange={(e) => onChange('dateStart', e.target.value)}
              disabled={isPending}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label
            htmlFor="dateEnd"
            className="text-[11px] font-black tracking-widest text-zinc-500 uppercase"
          >
            {t('endDate')}
          </Label>
          <div className="relative">
            <Calendar className="absolute top-3 left-3 size-4 text-zinc-400" />
            <Input
              id="dateEnd"
              type="date"
              className="h-11 rounded-none border-2 border-zinc-200 pl-10 transition-colors hover:border-zinc-300 focus-visible:border-purple-500 focus-visible:ring-3 focus-visible:ring-purple-500/50 dark:border-zinc-800 dark:hover:border-zinc-700"
              value={formState.dateEnd}
              onChange={(e) => onChange('dateEnd', e.target.value)}
              disabled={isPending}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label
            htmlFor="maxGroups"
            className="text-[11px] font-black tracking-widest text-zinc-500 uppercase"
          >
            {t('maxTeams')}
          </Label>
          <div className="relative">
            <Users className="absolute top-3 left-3 size-4 text-zinc-400" />
            <Input
              id="maxGroups"
              type="number"
              min="1"
              max="50"
              className="h-11 rounded-none border-2 border-zinc-200 pl-10 transition-colors hover:border-zinc-300 focus-visible:border-purple-500 focus-visible:ring-3 focus-visible:ring-purple-500/50 dark:border-zinc-800 dark:hover:border-zinc-700"
              value={formState.maxGroups}
              onChange={(e) => onChange('maxGroups', e.target.value)}
              required
              disabled={isPending}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label
            htmlFor="maxMembersPerGroup"
            className="text-[11px] font-black tracking-widest text-zinc-500 uppercase"
          >
            {t('maxMembersPerTeam')}
          </Label>
          <div className="relative">
            <Users className="absolute top-3 left-3 size-4 text-zinc-400" />
            <Input
              id="maxMembersPerGroup"
              type="number"
              min="1"
              max="20"
              className="h-11 rounded-none border-2 border-zinc-200 pl-10 transition-colors hover:border-zinc-300 focus-visible:border-purple-500 focus-visible:ring-3 focus-visible:ring-purple-500/50 dark:border-zinc-800 dark:hover:border-zinc-700"
              value={formState.maxMembersPerGroup}
              onChange={(e) => onChange('maxMembersPerGroup', e.target.value)}
              required
              disabled={isPending}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <input
          id="showEvaluationGrid"
          type="checkbox"
          checked={formState.showEvaluationGrid || false}
          aria-label={t('showEvaluationGrid')}
          onChange={(e) => onChange('showEvaluationGrid', e.target.checked)}
          disabled={isPending}
          className="size-4 cursor-pointer rounded border-2 border-zinc-300 accent-purple-600 focus:ring-purple-500/50"
        />
        <Label
          htmlFor="showEvaluationGrid"
          className="cursor-pointer text-xs font-bold tracking-widest text-zinc-600 uppercase select-none dark:text-zinc-400"
        >
          {t('showEvaluationGrid')}
        </Label>
      </div>
    </>
  );
}
