'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Printer } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

interface Criterion {
  id: number;
  name: string;
  maxPoints: number;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
}

interface TeamScore {
  criterionId: number;
  score: number | null;
  comment: string | null;
}

interface TeamData {
  id: number;
  name: string;
  grade: string | null;
  feedback: string | null;
  notes: string | null;
  members: TeamMember[];
  scores: TeamScore[];
}

interface ExportProject {
  id: number;
  name: string;
  showEvaluationGrid: boolean;
  criteria: Criterion[];
  teams: TeamData[];
}

interface ExportManagerProps {
  initialProjects: ExportProject[];
}

export function ExportManager({ initialProjects }: ExportManagerProps) {
  const t = useTranslations('ProfessorExport');
  const [selectedIds, setSelectedIds] = useState<number[]>(() => initialProjects.map((p) => p.id));

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const selectAll = () => {
    setSelectedIds(initialProjects.map((p) => p.id));
  };

  const deselectAll = () => {
    setSelectedIds([]);
  };

  const selectedProjects = initialProjects.filter((p) => selectedIds.includes(p.id));

  // CSV Generator
  const handleExportCSV = () => {
    if (selectedProjects.length === 0) {
      toast.error(t('noProjectsSelected'));
      return;
    }

    try {
      let csvContent = '\uFEFF'; // UTF-8 BOM for perfect French accents in Excel

      // We will loop over each project and add its rows
      for (const p of selectedProjects) {
        // Generate headers dynamically based on criteria
        const baseHeaders = [
          t('colProject'),
          t('colTeam'),
          t('colMembers'),
          t('colGrade'),
          t('colNotes'),
          t('colFeedback'),
        ];

        const criteriaHeaders = p.criteria.map((c) => `${c.name} (/${c.maxPoints})`);
        const allHeaders = [...baseHeaders, ...criteriaHeaders];

        csvContent += allHeaders.map((h) => `"${h.replace(/"/g, '""')}"`).join(';') + '\n';

        // Add rows for each team
        for (const team of p.teams) {
          const membersList = team.members.map((m) => `${m.name} (${m.email})`).join(', ');
          const rowValues = [
            p.name,
            team.name,
            membersList,
            team.grade || '',
            team.notes || '',
            team.feedback || '',
          ];

          // Build a map of scores by criterion ID for instant lookup
          const scoresMap = new Map(team.scores.map((s) => [s.criterionId, s]));

          // Add criteria scores
          for (const criterion of p.criteria) {
            const scoreObj = scoresMap.get(criterion.id);
            const scoreVal =
              scoreObj && scoreObj.score !== null ? `${scoreObj.score}/${criterion.maxPoints}` : '';
            rowValues.push(scoreVal);
          }

          csvContent += rowValues.map((v) => `"${v.replace(/"/g, '""')}"`).join(';') + '\n';
        }

        csvContent += '\n\n'; // Spacer between projects
      }

      // Download trigger
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `evaluations_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(t('exportCSVSuccess'));
    } catch (err) {
      console.error(err);
      toast.error(t('exportCSVError'));
    }
  };

  const handlePrintPDF = () => {
    if (selectedProjects.length === 0) {
      toast.error(t('noProjectsSelected'));
      return;
    }
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* 1. Project Selector Checklist */}
      <Card className="bg-card border-2 border-zinc-200 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)] dark:border-zinc-800">
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <CardTitle className="text-lg font-black tracking-tight text-zinc-900 uppercase dark:text-zinc-100">
                {t('selectProjectsTitle')}
              </CardTitle>
              <CardDescription className="text-xs font-medium text-zinc-400">
                {t('selectProjectsDesc')}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={selectAll}
                className="h-8 rounded-none border-2 border-zinc-200 text-xs font-bold uppercase transition-all hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-900"
              >
                {t('selectAll')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={deselectAll}
                className="h-8 rounded-none border-2 border-zinc-200 text-xs font-bold uppercase transition-all hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-900"
              >
                {t('deselectAll')}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {initialProjects.length === 0 ? (
            <p className="py-4 text-center text-sm font-medium text-zinc-500">
              {t('noProjectsFound')}
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
              {initialProjects.map((p) => {
                const isSelected = selectedIds.includes(p.id);
                return (
                  <label
                    key={p.id}
                    className={`flex cursor-pointer items-center gap-3 border-2 p-3 transition-all outline-none hover:border-purple-500/50 focus-visible:border-purple-500 ${
                      isSelected
                        ? 'border-purple-600 bg-purple-50/5 dark:border-purple-500 dark:bg-purple-950/10'
                        : 'border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      aria-label={p.name}
                      onChange={() => toggleSelect(p.id)}
                      className="size-4 shrink-0 cursor-pointer rounded border-2 border-zinc-300 accent-purple-600"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold text-zinc-800 uppercase dark:text-zinc-200">
                        {p.name}
                      </p>
                      <p className="text-[10px] font-bold text-zinc-400">
                        {t('teamCount', { count: p.teams.length })}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 2. Export Actions Cards */}
      <ExportActions
        selectedProjectsCount={selectedProjects.length}
        handleExportCSV={handleExportCSV}
        handlePrintPDF={handlePrintPDF}
      />

      {/* 3. PRINT-ONLY CONTAINER (Invisible in UI, styled beautifully for window.print()) */}
      <PrintContainer selectedProjects={selectedProjects} />
    </div>
  );
}

interface ExportActionsProps {
  selectedProjectsCount: number;
  handleExportCSV: () => void;
  handlePrintPDF: () => void;
}

function ExportActions({
  selectedProjectsCount,
  handleExportCSV,
  handlePrintPDF,
}: ExportActionsProps) {
  const t = useTranslations('ProfessorExport');

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      {/* Excel Export */}
      <Card className="bg-card border-2 border-zinc-200 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)] transition-shadow hover:shadow-none dark:border-zinc-800">
        <CardContent className="flex flex-col items-center justify-center gap-4 p-8 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/30">
            <Download className="size-7 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-base font-black tracking-tight text-zinc-950 uppercase dark:text-zinc-50">
              {t('exportCSVBtn')}
            </h3>
            <p className="max-w-xs text-xs text-zinc-400">{t('exportCSVDesc')}</p>
          </div>
          <Button
            variant="unstyled"
            onClick={handleExportCSV}
            disabled={selectedProjectsCount === 0}
            className="flex h-11 cursor-pointer items-center gap-2 border-transparent bg-emerald-600 px-6 font-black tracking-wider text-white uppercase shadow-[4px_4px_0px_0px_rgba(16,185,129,0.2)] transition-all hover:bg-emerald-700 hover:text-white active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:pointer-events-none disabled:opacity-50"
          >
            <Download className="size-4" />
            {t('downloadExcel')}
          </Button>
        </CardContent>
      </Card>

      {/* PDF Export */}
      <Card className="bg-card border-2 border-zinc-200 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)] transition-shadow hover:shadow-none dark:border-zinc-800">
        <CardContent className="flex flex-col items-center justify-center gap-4 p-8 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-950/30">
            <Printer className="size-7 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-base font-black tracking-tight text-zinc-950 uppercase dark:text-zinc-50">
              {t('exportPDFBtn')}
            </h3>
            <p className="max-w-xs text-xs text-zinc-400">{t('exportPDFDesc')}</p>
          </div>
          <Button
            variant="unstyled"
            onClick={handlePrintPDF}
            disabled={selectedProjectsCount === 0}
            className="flex h-11 cursor-pointer items-center gap-2 border-transparent bg-purple-600 px-6 font-black tracking-wider text-white uppercase shadow-[4px_4px_0px_0px_rgba(168,85,247,0.2)] transition-all hover:bg-purple-700 hover:text-white active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:pointer-events-none disabled:opacity-50"
          >
            <Printer className="size-4" />
            {t('printSavePDF')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

interface PrintContainerProps {
  selectedProjects: ExportProject[];
}

function PrintContainer({ selectedProjects }: PrintContainerProps) {
  const t = useTranslations('ProfessorExport');

  if (selectedProjects.length === 0) return null;

  return (
    <div className="hidden space-y-12 p-8 print:block">
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-container, .print-container * {
            visibility: visible;
          }
          .print-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .page-break {
            page-break-after: always;
            break-after: page;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
            margin-bottom: 25px;
          }
          th, td {
            border: 1px solid #e4e4e7;
            padding: 8px 12px;
            text-align: left;
            font-size: 11px;
          }
          th {
            background-color: #f4f4f5 !important;
            font-weight: bold;
          }
        }
      `}</style>

      <div className="print-container space-y-8">
        <div className="border-b border-zinc-300 pb-4">
          <h1 className="text-2xl font-black text-zinc-900 uppercase">{t('printReportHeader')}</h1>
          <p className="text-xs text-zinc-500" suppressHydrationWarning>
            {t('printReportSubtitle', { date: new Date().toLocaleDateString() })}
          </p>
        </div>

        {selectedProjects.map((p, idx) => (
          <div
            key={p.id}
            className={`${idx < selectedProjects.length - 1 ? 'page-break' : ''} space-y-6`}
          >
            <div className="border-b border-zinc-200 pb-2">
              <span className="text-[10px] font-black tracking-wider text-purple-600 uppercase">
                {t('reportProjectLabel')}
              </span>
              <h2 className="text-xl font-bold text-zinc-900 uppercase">{p.name}</h2>
            </div>

            {p.teams.length === 0 ? (
              <p className="text-xs text-zinc-500 italic">{t('noTeamsEnrolled')}</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th className="w-1/6">{t('colTeam')}</th>
                    <th className="w-1/4">{t('colMembers')}</th>
                    {p.criteria.map((c) => (
                      <th key={c.id} className="text-center">
                        {c.name} (/{c.maxPoints})
                      </th>
                    ))}
                    <th className="w-1/6">{t('colFeedback')}</th>
                    <th className="w-12 text-center">{t('colGrade')}</th>
                  </tr>
                </thead>
                <tbody>
                  {p.teams.map((team) => (
                    <tr key={team.id}>
                      <td className="font-bold text-zinc-900">{team.name}</td>
                      <td className="text-xs">
                        {team.members.map((m) => `${m.name} (${m.email})`).join(', ')}
                      </td>
                      {p.criteria.map((criterion) => {
                        const scoreObj = team.scores.find((s) => s.criterionId === criterion.id);
                        const scoreVal =
                          scoreObj && scoreObj.score !== null
                            ? `${scoreObj.score}/${criterion.maxPoints}`
                            : '-';
                        return (
                          <td key={criterion.id} className="text-center font-mono font-bold">
                            {scoreVal}
                          </td>
                        );
                      })}
                      <td className="text-xs">{team.feedback || team.notes || '-'}</td>
                      <td className="text-center font-mono text-sm font-bold text-zinc-900">
                        {team.grade || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
