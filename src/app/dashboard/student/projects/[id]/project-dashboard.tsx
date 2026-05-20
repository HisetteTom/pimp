"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LayoutDashboard, CheckSquare, FileUp, Kanban as KanbanIcon, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMemo, useState, useEffect, useSyncExternalStore } from "react";
import dynamic from 'next/dynamic';

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

interface ProjectDashboardProps {
  project: any;
  team: any;
  currentUser: any;
  tasks: any[];
  livrables: any[];
}

const COLORS = ['#000000', '#666666', '#cccccc'];

const emptySubscribe = () => () => {};
const clientSnapshot = true;
const serverSnapshot = false;

const FeedbackSlot = ({ title }: { title: string }) => (
  <div className="p-6 border-2 border-primary/20 bg-primary/5 rounded-none flex flex-col gap-y-2 mb-8">
    <h4 className="text-[10px] font-semibold uppercase tracking-widest text-primary">Teacher Feedback - {title}</h4>
    <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400 italic">No feedback from supervisor yet.</p>
  </div>
);

export function ProjectDashboard({ project, team, currentUser, tasks, livrables }: ProjectDashboardProps) {
  const isClient = useSyncExternalStore(emptySubscribe, () => clientSnapshot, () => serverSnapshot);
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
  }, []);

  const timelineProgress = useMemo(() => {
    if (!project.dateStart || !project.dateEnd || !now) return 0;
    const start = new Date(project.dateStart).getTime();
    const end = new Date(project.dateEnd).getTime();
    if (now < start) return 0;
    if (now > end) return 100;
    return Math.round(((now - start) / (end - start)) * 100);
  }, [project.dateStart, project.dateEnd, now]);

  const formattedLivrables = useMemo(() => {
    return livrables.map(l => ({
      ...l,
      formattedDate: isClient ? new Date(l.createdAt).toLocaleDateString() : '...'
    }));
  }, [livrables, isClient]);

  const tasksByStatus = useMemo(() => ({
    todo: tasks.filter(t => t.status === 'todo'),
    in_progress: tasks.filter(t => t.status === 'in_progress'),
    done: tasks.filter(t => t.status === 'done'),
  }), [tasks]);

  const completionPercentage = useMemo(() => {
    if (tasks.length === 0) return 0;
    return Math.round((tasksByStatus.done.length / tasks.length) * 100);
  }, [tasks, tasksByStatus]);

  const chartData = [
    { label: 'Week 1', count: 10 },
    { label: 'Week 2', count: 25 },
    { label: 'Week 3', count: 45 },
    { label: 'Week 4', count: completionPercentage },
  ];

  const taskStats = [
    { name: 'To Do', value: tasksByStatus.todo.length },
    { name: 'In Progress', value: tasksByStatus.in_progress.length },
    { name: 'Done', value: tasksByStatus.done.length },
  ].filter(s => s.value > 0);

  return (
    <div className="flex flex-col gap-y-6">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="w-full justify-start h-12 bg-transparent p-0 gap-8 border-b-2 border-zinc-100 dark:border-zinc-800 rounded-none">
          <TabsTrigger value="overview" className="data-[state=active]:bg-transparent data-[state=active]:border-b-4 data-[state=active]:border-primary rounded-none h-full px-2 font-semibold uppercase text-xs tracking-widest gap-2">
            <LayoutDashboard className="size-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="kanban" className="data-[state=active]:bg-transparent data-[state=active]:border-b-4 data-[state=active]:border-primary rounded-none h-full px-2 font-semibold uppercase text-xs tracking-widest gap-2">
            <KanbanIcon className="size-4" />
            Kanban
          </TabsTrigger>
          <TabsTrigger value="tasks" className="data-[state=active]:bg-transparent data-[state=active]:border-b-4 data-[state=active]:border-primary rounded-none h-full px-2 font-semibold uppercase text-xs tracking-widest gap-2">
            <CheckSquare className="size-4" />
            Tasks
          </TabsTrigger>
          <TabsTrigger value="deliverables" className="data-[state=active]:bg-transparent data-[state=active]:border-b-4 data-[state=active]:border-primary rounded-none h-full px-2 font-semibold uppercase text-xs tracking-widest gap-2">
            <FileUp className="size-4" />
            Deliverables
          </TabsTrigger>
        </TabsList>

        <div className="py-8">
          <TabsContent value="overview" className="mt-0 flex flex-col gap-y-8">
            <FeedbackSlot title="Overview" />

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
                      <p className="text-xl font-semibold font-mono tracking-tighter">{project.dateStart || "TBD"}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] font-bold text-zinc-400 uppercase">Final Deadline</p>
                      <p className="text-xl font-semibold font-mono tracking-tighter">{project.dateEnd || "TBD"}</p>
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
                             >
                                {taskStats.map((entry, index) => (
                                   <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                                ))}
                             </Pie>
                             <Tooltip />
                          </PieChart>
                       </ResponsiveContainer>
                     ) : (
                       <div className="h-full flex items-center justify-center text-[10px] text-zinc-400 font-bold uppercase">No Tasks</div>
                     )}
                  </CardContent>
               </Card>

               <div className="md:col-span-2 flex flex-col gap-y-4">
                  <h3 className="text-lg font-semibold uppercase tracking-tight">Recent Team Activity</h3>
                  <div className="border-2 border-zinc-100 dark:border-zinc-800 p-12 text-center bg-zinc-50/50 dark:bg-zinc-900/20">
                    <p className="text-zinc-400 font-medium italic">No activity yet. Start by creating a task!</p>
                  </div>
               </div>
            </div>
          </TabsContent>

          <TabsContent value="kanban" className="mt-0 flex flex-col gap-y-8">
             <FeedbackSlot title="Kanban" />
             <div className="flex flex-col items-center justify-center p-24 border-2 border-dashed border-zinc-200 dark:border-zinc-800 text-center gap-y-4">
                <KanbanIcon className="size-16 text-zinc-200" />
                <div>
                   <h3 className="text-2xl font-semibold uppercase tracking-tight">Kanban Board</h3>
                   <p className="text-zinc-500 font-medium italic">Feature coming soon. Drag and drop your tasks!</p>
                </div>
                <Button disabled className="font-semibold uppercase tracking-wider">Initialize Kanban</Button>
             </div>
          </TabsContent>

          <TabsContent value="tasks" className="mt-0 flex flex-col gap-y-8">
             <FeedbackSlot title="Tasks" />

             <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold uppercase tracking-tight">Team Tasks</h3>
                <Button className="font-semibold uppercase tracking-wider text-xs shadow-[4px_4px_0px_0px_rgba(var(--primary-rgb),0.2)]">
                  Add Task
                </Button>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {(['todo', 'in_progress', 'done'] as const).map(status => (
                  <div key={status} className="bg-zinc-50 dark:bg-zinc-900/50 p-4 border-2 border-zinc-100 dark:border-zinc-800">
                    <h4 className="font-semibold uppercase tracking-widest text-[10px] text-zinc-400 mb-4 flex justify-between">
                      {status.replace('_', ' ')}
                      <span className="bg-zinc-200 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-600">{tasksByStatus[status].length}</span>
                    </h4>
                    <div className="flex flex-col gap-y-4 min-h-[200px]">
                       {tasksByStatus[status].length > 0 ? (
                         tasksByStatus[status].map(task => (
                            <Card key={task.id} className="p-4 border-2 border-zinc-200 dark:border-zinc-800 shadow-none hover:border-primary/50 transition-colors bg-white dark:bg-zinc-950">
                               <p className="font-semibold uppercase text-xs tracking-tight mb-2">{task.name}</p>
                               <p className="text-[10px] text-zinc-500 line-clamp-2">{task.description}</p>
                            </Card>
                         ))
                       ) : (
                         <div className="p-4 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 border-dashed text-center">
                            <p className="text-[10px] text-zinc-400 font-medium italic">Empty</p>
                         </div>
                       )}
                    </div>
                  </div>
                ))}
             </div>
          </TabsContent>

          <TabsContent value="deliverables" className="mt-0 flex flex-col gap-y-8">
            <FeedbackSlot title="Deliverables" />

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
                      {formattedLivrables.length > 0 ? (
                        formattedLivrables.map(l => (
                          <tr key={l.id} className="border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                             <td className="p-4 font-bold uppercase">{l.name}</td>
                             <td className="p-4 font-mono text-xs" suppressHydrationWarning>
                                {l.formattedDate}
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
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
