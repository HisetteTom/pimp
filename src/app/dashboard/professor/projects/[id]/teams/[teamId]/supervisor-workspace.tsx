"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LayoutDashboard, CheckSquare, FileUp, Kanban as KanbanIcon, Clock, ArrowLeft, User, FileText, Plus, Trash2, Save, Loader2 } from "lucide-react";
import { useMemo, useSyncExternalStore, useState, useEffect, useTransition } from "react";
import dynamic from 'next/dynamic';
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { SupervisorFeedbackCard } from "./supervisor-feedback-card";
import { ReadOnlyKanban } from "./read-only-kanban";
import { DeliverableReviewer } from "../../deliverable-reviewer";
import { saveTeamNotes } from "../../../../actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer), { ssr: false });
const AreaChart = dynamic(() => import('recharts').then(mod => mod.AreaChart), { ssr: false });
const Area = dynamic(() => import('recharts').then(mod => mod.Area), { ssr: false });
const XAxis = dynamic(() => import('recharts').then(mod => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then(mod => mod.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then(mod => mod.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then(mod => mod.Tooltip), { ssr: false });
const PieChart = dynamic(() => import('recharts').then(mod => mod.PieChart), { ssr: false });
const Pie = dynamic(() => import('recharts').then(mod => mod.Pie), { ssr: false });
const Cell = dynamic(() => import('recharts').then(mod => mod.Cell), { ssr: false });
const Sector = dynamic(() => import('recharts').then(mod => mod.Sector), { ssr: false });

interface SupervisorWorkspaceProps {
  project: any;
  team: any;
  members: any[];
  tasks: any[];
  livrables: any[];
}

const COLORS = ['#000000', '#666666', '#cccccc'];

const PieGradient = (props: any) => {
  const entryName = props.payload.name;
  const colorMap: Record<string, string> = {
    "To Do": "#a1a1aa",
    "In Progress": "#52525b",
    "Done": "#ff7800",
  };
  const color = colorMap[entryName] || "#a1a1aa";

  return (
    <>
      <defs>
        <radialGradient
          id={`fillGradient-${props.index}`}
          cx={props.cx}
          cy={props.cy}
          r={props.outerRadius}
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor={color} stopOpacity={0} />
          <stop offset="100%" stopColor={color} stopOpacity={0.8} />
        </radialGradient>
      </defs>
      <Sector
        {...props}
        fill={`url(#fillGradient-${props.index})`}
        stroke={color}
        strokeWidth={1.5}
      />
    </>
  );
};

const emptySubscribe = () => () => { };
const clientSnapshot = true;
const serverSnapshot = false;

// Stable mount time to avoid hydration flicker and sync setState
let mountTime: number | null = null;
const getMountTime = () => {
  if (typeof window === 'undefined') return null;
  if (!mountTime) mountTime = Date.now();
  return mountTime;
};

interface TimelineAndEvolutionProps {
  project: any;
  timelineProgress: number;
  chartData: any[];
  completionPercentage: number;
}

function TimelineAndEvolution({
  project,
  timelineProgress,
  chartData,
  completionPercentage,
}: TimelineAndEvolutionProps) {
  return (
    <div className="grid gap-8 md:grid-cols-2">
      <Card className="group relative flex flex-col h-full overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm transition-all duration-300 hover:shadow-xl hover:border-primary/50 rounded-none">
        {/* SVG grid graphic */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.1]">
          <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="timeline-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#timeline-grid)" />
          </svg>
        </div>

        <CardHeader className="flex flex-row items-center justify-between gap-y-0 pb-2 relative z-10">
          <CardTitle className="text-sm font-semibold uppercase tracking-widest text-zinc-400">Project Timeline</CardTitle>
          <Clock className="size-4 text-zinc-400" />
        </CardHeader>
        <CardContent className="flex flex-col gap-y-6 pt-4 relative z-10">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-[9px] font-bold text-zinc-400 uppercase">Start Date</p>
              <p className="text-xl font-semibold font-mono tracking-tighter" suppressHydrationWarning>
                {project.dateStart ? new Date(project.dateStart).toLocaleDateString() : "TBD"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[9px] font-bold text-zinc-400 uppercase">Final Deadline</p>
              <p className="text-xl font-semibold font-mono tracking-tighter" suppressHydrationWarning>
                {project.dateEnd ? new Date(project.dateEnd).toLocaleDateString() : "TBD"}
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-y-2">
            <div className="flex justify-between text-[10px] font-semibold uppercase tracking-tighter">
              <span>Time Elapsed</span>
              <span>{timelineProgress}%</span>
            </div>
            <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-linear-to-r from-primary/80 to-primary shadow-[0_0_12px_rgba(var(--primary-rgb),0.3)] rounded-full transition-all duration-1000"
                style={{ width: `${timelineProgress}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="group relative flex flex-col h-full overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm transition-all duration-300 hover:shadow-xl hover:border-primary/50 rounded-none">
        {/* SVG grid graphic */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.1]">
          <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="evolution-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#evolution-grid)" />
          </svg>
        </div>

        <CardHeader className="relative z-10">
          <CardTitle className="text-sm font-semibold uppercase tracking-widest text-zinc-400">Work Evolution</CardTitle>
        </CardHeader>
        <CardContent className="p-0 h-[200px] w-full relative z-10">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" vertical={false} opacity={0.1} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10, fill: "currentColor", opacity: 0.5 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 10, fill: "currentColor", opacity: 0.5 }}
                axisLine={false}
                tickLine={false}
                domain={[0, 100]}
              />
              <Tooltip
                contentStyle={{ backgroundColor: 'black', border: 'none', color: 'white', fontSize: '12px', fontWeight: 'bold' }}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="var(--primary)"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorCount)"
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
        <div className="px-6 pb-6 text-center relative z-10">
          <p className="text-4xl font-semibold tracking-tighter text-secondary">{completionPercentage}%</p>
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Overall Completion</p>
        </div>
      </Card>
    </div>
  );
}

interface TaskStatsAndBreakdownProps {
  tasks: any[];
  taskStats: any[];
  tasksByStatus: { todo: any[]; in_progress: any[]; done: any[] };
  members: any[];
}

function TaskStatsAndBreakdown({
  tasks,
  taskStats,
  tasksByStatus,
  members,
}: TaskStatsAndBreakdownProps) {
  return (
    <div className="grid gap-8 md:grid-cols-3">
      <Card className="md:col-span-1 group relative flex flex-col h-full overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm transition-all duration-300 hover:shadow-xl hover:border-primary/50 rounded-none">
        {/* SVG grid graphic */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.1]">
          <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="task-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#task-grid)" />
          </svg>
        </div>

        <CardHeader className="relative z-10">
          <CardTitle className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">Task Distribution</CardTitle>
        </CardHeader>
        <CardContent className="h-[200px] relative z-10">
          {tasks.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={taskStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  shape={PieGradient}
                />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-[10px] text-zinc-400 font-bold uppercase">No Tasks</div>
          )}
        </CardContent>
      </Card>

      <div className="md:col-span-2 flex flex-col gap-y-4 justify-between">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold uppercase tracking-tight">Status breakdown</h3>
          <div className="flex flex-col gap-y-4">
            <div className="flex h-12 w-full border border-zinc-200 dark:border-zinc-800 overflow-hidden">
              <div
                className="h-full bg-zinc-400 dark:bg-zinc-600 transition-all"
                style={{ width: `${(tasksByStatus.todo.length / (tasks.length || 1)) * 100}%` }}
                title="To Do"
              />
              <div
                className="h-full bg-zinc-600 dark:bg-zinc-400 transition-all"
                style={{ width: `${(tasksByStatus.in_progress.length / (tasks.length || 1)) * 100}%` }}
                title="In Progress"
              />
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${(tasksByStatus.done.length / (tasks.length || 1)) * 100}%` }}
                title="Done"
              />
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="size-3 bg-zinc-400 dark:bg-zinc-600" />
                <span className="text-[10px] font-bold uppercase text-zinc-450 dark:text-zinc-400">To Do</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="size-3 bg-zinc-650 dark:bg-zinc-400" />
                <span className="text-[10px] font-bold uppercase text-zinc-450 dark:text-zinc-400">In Progress</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="size-3 bg-primary" />
                <span className="text-[10px] font-bold uppercase text-zinc-450 dark:text-zinc-400">Done</span>
              </div>
            </div>
          </div>
        </div>

        {/* Team Members List */}
        <div className="space-y-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
          <h4 className="text-[9px] font-semibold uppercase tracking-widest text-zinc-400">
            Enrolled Team Members ({members.length})
          </h4>
          <div className="flex flex-wrap gap-2.5">
            {members.length === 0 ? (
              <p className="text-xs text-zinc-400 font-bold uppercase italic">
                No members enrolled yet.
              </p>
            ) : (
              members.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/10 text-[10px] font-bold text-zinc-700 dark:text-zinc-300 rounded-none uppercase"
                >
                  <User className="size-3 text-zinc-500 dark:text-zinc-400" />
                  <span>{m.name || "Unknown"}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface SupervisorNotesEditorProps {
  teamId: number;
  projectId: number;
  initialNotes: string | null;
}

export function SupervisorNotesEditor({ teamId, projectId, initialNotes }: SupervisorNotesEditorProps) {
  const { refresh } = useRouter();
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [isSavingNotes, startSaveTransition] = useTransition();

  const initialNotesArray = useMemo(() => {
    try {
      if (initialNotes) {
        const parsed = JSON.parse(initialNotes);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      if (initialNotes) {
        return [{ id: "legacy", title: "General Notes", content: initialNotes }];
      }
    }
    return [
      { id: "1", title: "Stack Used", content: "React, Next.js, TailwindCSS, Drizzle ORM, PostgreSQL" },
      { id: "2", title: "Design Details", content: "Glassmorphic brutalist card styling with high-contrast UI borders" }
    ];
  }, [initialNotes]);

  const [notes, setNotes] = useState<any[]>(initialNotesArray);

  const handleAddSection = () => {
    if (!newSectionTitle.trim()) return;
    setNotes(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        title: newSectionTitle.trim(),
        content: ""
      }
    ]);
    setNewSectionTitle("");
  };

  const handleUpdateSectionContent = (id: string, text: string) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, content: text } : n));
  };

  const handleUpdateSectionTitle = (id: string, title: string) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, title } : n));
  };

  const handleDeleteSection = (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
  };

  const handleSaveNotes = () => {
    startSaveTransition(async () => {
      try {
        await saveTeamNotes(teamId, JSON.stringify(notes), projectId);
        toast.success("Teacher notes saved successfully!");
        refresh();
      } catch (err) {
        toast.error("Failed to save teacher notes.");
        console.error(err);
      }
    });
  };

  const isNotesChanged = JSON.stringify(notes) !== JSON.stringify(initialNotesArray);

  return (
    <Card className="group relative flex flex-col overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm transition-all duration-300 hover:shadow-xl hover:border-primary/50 rounded-none">
      {/* SVG grid graphic */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.1]">
        <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="notes-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#notes-grid)" />
        </svg>
      </div>

      <CardHeader className="border-b border-zinc-100 dark:border-zinc-800 py-3.5 px-6 relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <CardTitle className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
            Teacher Private Notes
          </CardTitle>
        </div>
        <Button
          onClick={handleSaveNotes}
          disabled={isSavingNotes || !isNotesChanged}
          className="h-12 sm:h-10 text-xs font-black bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-[4px_4px_0px_0px_rgba(var(--primary-rgb),0.2)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none uppercase tracking-wider rounded-none cursor-pointer flex items-center justify-center gap-1.5"
        >
          {isSavingNotes ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
          Save Notes
        </Button>
      </CardHeader>
      <CardContent className="p-6 pt-4 gap-y-4 relative z-10 flex flex-col">
        {/* New Section Maker */}
        <div className="flex flex-col sm:flex-row gap-4 p-4 border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/5 items-stretch sm:items-center justify-between">
          <div className="flex-1 max-w-md">
            <input
              type="text"
              value={newSectionTitle}
              onChange={(e) => setNewSectionTitle(e.target.value)}
              className="w-full text-xs font-bold uppercase border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-2.5 outline-none rounded-none focus:border-primary"
            />
          </div>
          <Button
            onClick={handleAddSection}
            disabled={!newSectionTitle.trim()}
            variant="outline"
            className="h-10 text-[10px] font-black border-2 border-zinc-900 dark:border-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-850 transition-all rounded-none uppercase cursor-pointer flex items-center justify-center gap-1"
          >
            <Plus className="size-3.5" />
            Add Section
          </Button>
        </div>

        {/* Sections List */}
        <div className="gap-y-6 flex flex-col">
          {notes.length === 0 ? (
            <p className="text-xs italic text-zinc-400 font-bold uppercase text-center py-6">No custom notes sections. Add one above!</p>
          ) : (
            notes.map((section) => (
              <div key={section.id} className="p-5 border border-zinc-200 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-900/5 relative flex flex-col gap-y-3">
                <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2">
                  <input
                    type="text"
                    value={section.title}
                    onChange={(e) => handleUpdateSectionTitle(section.id, e.target.value)}
                    className="text-xs font-black uppercase text-zinc-900 dark:text-zinc-100 bg-transparent border-b border-transparent hover:border-zinc-200 focus:border-primary focus:outline-none py-0.5 tracking-wider w-full max-w-xs"
                  />
                  <Button
                    onClick={() => handleDeleteSection(section.id)}
                    variant="ghost"
                    className="size-7 p-0 text-zinc-600 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer flex items-center justify-center rounded-none"
                    title="Delete this section"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
                <Textarea
                  rows={4}
                  value={section.content}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleUpdateSectionContent(section.id, e.target.value)}
                  className="border border-zinc-200 dark:border-zinc-800 focus-visible:ring-primary rounded-none p-3 resize-y bg-white dark:bg-zinc-950 text-xs font-mono font-medium leading-relaxed text-zinc-700 dark:text-zinc-300"
                />
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function SupervisorWorkspace({ project, team, members, tasks, livrables }: SupervisorWorkspaceProps) {
  const isClient = useSyncExternalStore(emptySubscribe, () => clientSnapshot, () => serverSnapshot);
  const now = useSyncExternalStore(emptySubscribe, getMountTime, () => null);

  const timelineProgress = useMemo(() => {
    if (!project.dateStart || !project.dateEnd || !now) return 0;
    const start = new Date(project.dateStart).getTime();
    const end = new Date(project.dateEnd).getTime();
    if (now < start) return 0;
    if (now > end) return 100;
    return Math.round(((now - start) / (end - start)) * 100);
  }, [project.dateStart, project.dateEnd, now]);

  const tasksByStatus = useMemo(() => ({
    todo: tasks.filter(t => t.status === 'todo'),
    in_progress: tasks.filter(t => t.status === 'in_progress'),
    done: tasks.filter(t => t.status === 'done'),
  }), [tasks]);

  const completionPercentage = useMemo(() => {
    if (tasks.length === 0) return 0;
    return Math.round((tasksByStatus.done.length / tasks.length) * 100);
  }, [tasks, tasksByStatus]);

  // Simulate historical data based on current completion for the chart
  const chartData = useMemo(() => [
    { label: 'Start', count: 0 },
    { label: 'Mid', count: Math.floor(completionPercentage / 2) },
    { label: 'Current', count: completionPercentage },
  ], [completionPercentage]);

  const taskStats = [
    { name: 'To Do', value: tasksByStatus.todo.length },
    { name: 'In Progress', value: tasksByStatus.in_progress.length },
    { name: 'Done', value: tasksByStatus.done.length },
  ].filter(s => s.value > 0);

  return (
    <div className="space-y-8 pb-12">
      {/* Back Link */}
      <div>
        <Link
          href={`/dashboard/professor/projects/${project.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-zinc-400 hover:text-primary transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          Back to Enrolled Teams
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-zinc-150 dark:border-zinc-800 pb-6 gap-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
            Project Space Supervisor View
          </span>
          <h1 className="text-4xl font-semibold tracking-tighter text-zinc-900 dark:text-zinc-100 uppercase mt-1">
            {team.name} <span className="text-zinc-400 font-medium">({project.name})</span>
          </h1>
        </div>
      </div>

      <div className="flex flex-col gap-y-6">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="w-full justify-start h-12 bg-transparent p-0 gap-8 border-b-2 border-zinc-100 dark:border-zinc-800 rounded-none overflow-x-auto no-scrollbar">
            <TabsTrigger value="overview" className="data-[state=active]:bg-transparent data-[state=active]:border-b-4 data-[state=active]:border-primary rounded-none h-full px-2 font-semibold uppercase text-xs tracking-widest gap-2">
              <LayoutDashboard className="size-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="kanban" className="data-[state=active]:bg-transparent data-[state=active]:border-b-4 data-[state=active]:border-primary rounded-none h-full px-2 font-semibold uppercase text-xs tracking-widest gap-2">
              <KanbanIcon className="size-4" />
              Tasks
            </TabsTrigger>
            <TabsTrigger value="deliverables" className="data-[state=active]:bg-transparent data-[state=active]:border-b-4 data-[state=active]:border-primary rounded-none h-full px-2 font-semibold uppercase text-xs tracking-widest gap-2">
              <FileUp className="size-4" />
              Deliverables
            </TabsTrigger>
            <TabsTrigger value="notes" className="data-[state=active]:bg-transparent data-[state=active]:border-b-4 data-[state=active]:border-primary rounded-none h-full px-2 font-semibold uppercase text-xs tracking-widest gap-2">
              <FileText className="size-4" />
              Notes
            </TabsTrigger>
          </TabsList>

          <div className="py-8">
            <TabsContent value="overview" className="mt-0 flex flex-col gap-y-8">
              <TimelineAndEvolution
                project={project}
                timelineProgress={timelineProgress}
                chartData={chartData}
                completionPercentage={completionPercentage}
              />

              <TaskStatsAndBreakdown
                tasks={tasks}
                taskStats={taskStats}
                tasksByStatus={tasksByStatus}
                members={members}
              />

              <SupervisorFeedbackCard
                key={`${team.id}-overview-${team.feedback}`}
                teamId={team.id}
                projectId={project.id}
                teamName={team.name}
                initialFeedback={team.feedback}
                type="overview"
              />
            </TabsContent>

            <TabsContent value="kanban" className="mt-0 flex flex-col gap-y-8">
              <ReadOnlyKanban
                initialTasks={tasks}
                members={members}
              />
              <SupervisorFeedbackCard
                key={`${team.id}-kanban-${team.feedback}`}
                teamId={team.id}
                projectId={project.id}
                teamName={team.name}
                initialFeedback={team.feedback}
                type="kanban"
              />
            </TabsContent>

            <TabsContent value="deliverables" className="mt-0 flex flex-col gap-y-8">
              <div className="space-y-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold uppercase tracking-tight">Student Deliverables ({livrables.length})</h3>
                </div>

                {livrables.length === 0 ? (
                  <div className="p-12 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-none bg-zinc-50/50 dark:bg-zinc-900/5 text-center">
                    <p className="text-sm text-zinc-400 font-bold uppercase italic tracking-wide">
                      No deliverables submitted by this team yet.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-6 max-w-4xl">
                    {livrables.map((deliv) => (
                      <DeliverableReviewer
                        key={deliv.id}
                        deliverableId={deliv.id}
                        projectId={project.id}
                        deliverableName={deliv.name}
                        deliverableSource={deliv.source}
                        initialStatus={deliv.status}
                        initialFeedback={deliv.feedback}
                      />
                    ))}
                  </div>
                )}
              </div>
              <SupervisorFeedbackCard
                key={`${team.id}-deliverables-${team.feedback}`}
                teamId={team.id}
                projectId={project.id}
                teamName={team.name}
                initialFeedback={team.feedback}
                type="deliverables"
              />
            </TabsContent>

            <TabsContent value="notes" className="mt-0 flex flex-col gap-y-8">
              <SupervisorNotesEditor
                key={team.id}
                teamId={team.id}
                projectId={project.id}
                initialNotes={team.notes}
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
