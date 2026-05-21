"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createTask } from "../../actions";
import { toast } from "sonner";
import { Plus, Check } from "lucide-react";

interface TaskDialogProps {
  projectId: number;
  teamId: number;
  members: any[];
  trigger?: React.ReactNode;
  defaultStatus?: string;
}

export function TaskDialog({ projectId, teamId, members, trigger, defaultStatus }: TaskDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const priority = formData.get("priority") as string;
    const deadlineStr = formData.get("deadline") as string;

    const assigneeId = selectedAssignees.length > 0 ? selectedAssignees[0] : undefined;
    const assignees = selectedAssignees.join(",");

    try {
      await createTask({
        name,
        description,
        priority,
        status: defaultStatus,
        deadline: deadlineStr ? new Date(deadlineStr) : undefined,
        teamId,
        assigneeId,
        assignees: assignees || undefined,
        projectId,
      });
      toast.success("Task created");
      setOpen(false);
      setSelectedAssignees([]);
      setLoading(false);
    } catch (error) {
      toast.error("Failed to create task");
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) {
        setSelectedAssignees([]);
      }
    }}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="font-semibold uppercase tracking-wider text-xs shadow-[4px_4px_0px_0px_rgba(var(--primary-rgb),0.2)]">
            <Plus className="size-4 mr-2" />
            Add Task
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="uppercase tracking-tighter">New Team Task</DialogTitle>
            <DialogDescription>
              Assign work to your team and set deadlines.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-xs uppercase font-bold text-zinc-400">Task Name</Label>
              <Input id="name" name="name" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description" className="text-xs uppercase font-bold text-zinc-400">Description</Label>
              <Textarea id="description" name="description" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="priority" className="text-xs uppercase font-bold text-zinc-400">Priority</Label>
                <Select name="priority" defaultValue="medium">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="deadline" className="text-xs uppercase font-bold text-zinc-400">Deadline</Label>
                <Input id="deadline" name="deadline" type="date" />
              </div>
            </div>
            <div className="grid gap-2">
              <Label className="text-xs uppercase font-bold text-zinc-400">Assign To Team Members</Label>
              <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-2 max-h-[160px] overflow-y-auto space-y-1 bg-zinc-50/50 dark:bg-zinc-900/50">
                {members.map((member) => {
                  const isAssigned = selectedAssignees.includes(member.id);
                  return (
                    <button
                      key={member.id}
                      type="button"
                      onClick={() => {
                        setSelectedAssignees(prev =>
                          prev.includes(member.id)
                            ? prev.filter(id => id !== member.id)
                            : [...prev, member.id]
                        );
                      }}
                      className={`w-full flex items-center justify-between p-2 rounded transition-all text-left group ${isAssigned
                          ? "bg-primary/10 text-primary border-2 border-primary/20"
                          : "hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-transparent"
                        }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`size-6 rounded-full flex items-center justify-center text-[10px] font-bold uppercase transition-all ${isAssigned
                            ? "bg-primary text-primary-foreground scale-105"
                            : "bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300"
                          }`}>
                          {member.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                        </div>
                        <span className="text-xs font-semibold">{member.name}</span>
                      </div>
                      <div className={`size-4 rounded border flex items-center justify-center transition-all ${isAssigned
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-zinc-300 dark:border-zinc-600 group-hover:border-zinc-400"
                        }`}>
                        {isAssigned && <Check className="size-2.5 stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
                {members.length === 0 && (
                  <p className="text-xs italic text-zinc-400 text-center py-4">No team members available.</p>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading} className="w-full font-bold uppercase">
              {loading ? "Creating..." : "Create Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
