"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LayoutDashboard, CheckSquare, FileUp, Kanban as KanbanIcon, Clock, Trash2, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMemo, useState, useEffect, useSyncExternalStore } from "react";
import dynamic from 'next/dynamic';
import { TaskDialog } from "./task-dialog";
import { KanbanBoard } from "./kanban-board";
import { deleteTask } from "../../actions";
import { toast } from "sonner";

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

interface ProjectDashboardProps {
  project: any;
  team: any;
  currentUser: any;
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

const emptySubscribe = () => () => {};
const clientSnapshot = true;
const serverSnapshot = false;

// Stable mount time to avoid hydration flicker and sync setState
let mountTime: number | null = null;
const getMountTime = () => {
  if (typeof window === 'undefined') return null;
  if (!mountTime) mountTime = Date.now();
  return mountTime;
};

const FeedbackSlot = ({ title }: { title: string }) => (
  <div className="p-6 border-2 border-primary/20 bg-primary/5 rounded-none flex flex-col gap-y-2 mt-[-16px]">
    <h4 className="text-[10px] font-semibold uppercase tracking-widest text-primary">Teacher Feedback - {title}</h4>
    <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400 italic">No feedback from supervisor yet.</p>
  </div>
);

function ClientDate({ date }: { date: string | Date }) {
  const isClient = useSyncExternalStore(emptySubscribe, () => true, () => false);
  return <span suppressHydrationWarning>{isClient ? new Date(date).toLocaleDateString() : "..."}</span>;
}

export function ProjectDashboard({ project, team, currentUser, tasks, livrables }: ProjectDashboardProps) {
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

  const handleDeleteTask = async (taskId: number) => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    try {
      await deleteTask(taskId, project.id);
      toast.success("Task deleted");
    } catch (error) {
      toast.error("Failed to delete task");
    }
  };

  return (
    <div className="flex flex-col gap-y-6">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="w-full justify-start h-12 bg-transparent p-0 gap-8 border-b-2 border-zinc-100 dark:border-zinc-800 rounded-none overflow-x-auto no-scrollbar">
          <TabsTrigger value="overview" className="data-[state=active]:bg-transparent data-[state=active]:border-b-4 data-[state=active]:border-primary rounded-none h-full px-2 font-semibold uppercase text-xs tracking-widest gap-2">
            <LayoutDashboard className="size-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="kanban" className="data-[state=active]:bg-transparent data-[state=active]:border-b-4 data-[state=active]:border-primary rounded-none h-full px-2 font-semibold uppercase text-xs tracking-widest gap-2">
            <KanbanIcon className="size-4" />
            Kanban
          </TabsTrigger>
          <TabsTrigger value="deliverables" className="data-[state=active]:bg-transparent data-[state=active]:border-b-4 data-[state=active]:border-primary rounded-none h-full px-2 font-semibold uppercase text-xs tracking-widest gap-2">
            <FileUp className="size-4" />
            Deliverables
          </TabsTrigger>
        </TabsList>

        <div className="py-8">
          <TabsContent value="overview" className="mt-0 flex flex-col gap-y-8">
            <div className="grid gap-8 md:grid-cols-2">
              <Card className="border-2 border-zinc-200 dark:border-zinc-800 shadow-none">
                <CardHeader className="flex flex-row items-center justify-between gap-y-0 pb-2">
                  <CardTitle className="text-sm font-semibold uppercase tracking-widest text-zinc-400">Project Timeline</CardTitle>
                  <Clock className="size-4 text-zinc-400" />
                </CardHeader>
                <CardContent className="flex flex-col gap-y-6 pt-4">
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
                    <div className="h-4 w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                      <div 
                        className="h-full bg-primary transition-all duration-1000" 
                        style={{ width: `${timelineProgress}%` }} 
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-zinc-200 dark:border-zinc-800 shadow-none overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-sm font-semibold uppercase tracking-widest text-zinc-400">Work Evolution</CardTitle>
                </CardHeader>
                <CardContent className="p-0 h-[200px] w-full">
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
                <div className="px-6 pb-6 text-center">
                   <p className="text-4xl font-semibold tracking-tighter text-secondary">{completionPercentage}%</p>
                   <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Overall Completion</p>
                </div>
              </Card>
            </div>
            
            <div className="grid gap-8 md:grid-cols-3">
               <Card className="md:col-span-1 border-2 border-zinc-100 dark:border-zinc-800 shadow-none">
                  <CardHeader>
                     <CardTitle className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">Task Distribution</CardTitle>
                  </CardHeader>
                  <CardContent className="h-[200px]">
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

               <div className="md:col-span-2 flex flex-col gap-y-4">
                  <h3 className="text-lg font-semibold uppercase tracking-tight">Status breakdown</h3>
                  <div className="flex flex-col gap-y-4">
                    <div className="flex h-12 w-full border-2 border-zinc-100 dark:border-zinc-800 overflow-hidden">
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
                          <span className="text-[10px] font-bold uppercase text-zinc-400">To Do</span>
                       </div>
                       <div className="flex items-center gap-2">
                          <div className="size-3 bg-zinc-600 dark:bg-zinc-400" />
                          <span className="text-[10px] font-bold uppercase text-zinc-400">In Progress</span>
                       </div>
                       <div className="flex items-center gap-2">
                          <div className="size-3 bg-primary" />
                          <span className="text-[10px] font-bold uppercase text-zinc-400">Done</span>
                       </div>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-col gap-y-4">
                    <h4 className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">Latest Tasks</h4>
                    <div className="flex flex-col gap-y-2">
                      {tasks.slice(0, 3).map(t => (
                        <div key={t.id} className="flex items-center justify-between p-3 border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                           <span className="text-xs font-semibold uppercase">{t.name}</span>
                           <Badge variant="outline" className="text-[8px] uppercase">{t.status.replace('_', ' ')}</Badge>
                        </div>
                      ))}
                      {tasks.length === 0 && <p className="text-xs italic text-zinc-400">No tasks yet.</p>}
                    </div>
                  </div>
               </div>
            </div>
            <FeedbackSlot title="Overview" />
          </TabsContent>

          <TabsContent value="kanban" className="mt-0 flex flex-col gap-y-8">
             <KanbanBoard 
               key={tasks.length === 0 ? "empty" : tasks.map(t => `${t.id}-${t.status}-${t.name}-${t.assigneeId}-${t.assignees || ""}-${t.priority}-${t.deadline}-${t.description}`).join(',')} 
               initialTasks={tasks} 
               projectId={project.id} 
               members={team.members} 
               teamId={team.id}
             />
             <FeedbackSlot title="Kanban" />
          </TabsContent>

          <TabsContent value="deliverables" className="mt-0 flex flex-col gap-y-8">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold uppercase tracking-tight">Files & Deliverables</h3>
                <Button className="font-semibold uppercase tracking-wider text-xs shadow-[4px_4px_0px_0px_rgba(var(--primary-rgb),0.2)]">
                  Upload File
                </Button>
             </div>
             <div className="border-2 border-zinc-100 dark:border-zinc-800 overflow-hidden">
                <table className="w-full text-left text-sm">
                   <thead className="bg-zinc-50 dark:bg-zinc-900/50 border-b-2 border-zinc-100 dark:border-zinc-800">
                      <tr>
                         <th className="p-4 font-semibold uppercase text-[10px] tracking-widest text-zinc-400">File Name</th>
                         <th className="p-4 font-semibold uppercase text-[10px] tracking-widest text-zinc-400">Date</th>
                      </tr>
                   </thead>
                   <tbody>
                      {livrables.length > 0 ? (
                        livrables.map(l => (
                          <tr key={l.id} className="border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                             <td className="p-4 font-bold uppercase">{l.name}</td>
                             <td className="p-4 font-mono text-xs">
                                <ClientDate date={l.createdAt} />
                             </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                           <td colSpan={2} className="p-12 text-center text-zinc-400 font-medium italic">
                              No files uploaded yet.
                           </td>
                        </tr>
                      )}
                   </tbody>
                </table>
             </div>
             <FeedbackSlot title="Deliverables" />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
