"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateTask, deleteTask } from "../../actions";
import { toast } from "sonner";
import { Trash2, Check } from "lucide-react";

interface Task {
  id: number;
  name: string;
  description: string | null;
  status: string;
  priority: string;
  deadline: string | null;
  assigneeId: string | null;
  assignees: string | null;
}

interface TaskDetailDialogProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  members: any[];
  projectId: number;
}

export function TaskDetailDialog({ task, open, onOpenChange, members, projectId }: TaskDetailDialogProps) {
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>(() => {
    if (!task || !task.assignees) return [];
    return task.assignees.split(",").filter(Boolean);
  });

  if (!task) return null;

  // Format date to YYYY-MM-DD for input type="date"
  const formattedDeadline = task.deadline 
    ? new Date(task.deadline).toISOString().split('T')[0] 
    : "";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const priority = formData.get("priority") as string;
    const deadlineStr = formData.get("deadline") as string;

    const assigneeId = selectedAssignees.length > 0 ? selectedAssignees[0] : null;
    const assignees = selectedAssignees.join(",");

    try {
      await updateTask({
        id: task.id,
        name,
        description: description || null,
        priority,
        deadline: deadlineStr ? new Date(deadlineStr) : null,
        assigneeId,
        assignees: assignees || null,
        projectId,
      });
      toast.success("Task updated");
      onOpenChange(false);
      setLoading(false);
    } catch (error) {
      toast.error("Failed to update task");
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this task?")) return;
    setDeleting(true);

    try {
      await deleteTask(task.id, projectId);
      toast.success("Task deleted");
      onOpenChange(false);
      setDeleting(false);
    } catch (error) {
      toast.error("Failed to delete task");
      setDeleting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle className="uppercase tracking-tighter text-lg font-bold">
              Task Details
            </DialogTitle>
            <DialogDescription>
              View and edit task details, assignment, and priority.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="detail-name" className="text-xs uppercase font-bold text-zinc-400">
                Task Name
              </Label>
              <Input
                id="detail-name"
                name="name"
                defaultValue={task.name}
                required
                className="font-semibold"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="detail-description" className="text-xs uppercase font-bold text-zinc-400">
                Description
              </Label>
              <Textarea
                id="detail-description"
                name="description"
                defaultValue={task.description || ""}
                placeholder="No description provided..."
                rows={3}
                className="text-xs leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="detail-priority" className="text-xs uppercase font-bold text-zinc-400">
                  Priority
                </Label>
                <Select name="priority" defaultValue={task.priority}>
                  <SelectTrigger id="detail-priority">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="detail-deadline" className="text-xs uppercase font-bold text-zinc-400">
                  Deadline
                </Label>
                <Input
                  id="detail-deadline"
                  name="deadline"
                  type="date"
                  defaultValue={formattedDeadline}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label className="text-xs uppercase font-bold text-zinc-400">
                Assigned Team Members
              </Label>
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
                      className={`w-full flex items-center justify-between p-2 rounded transition-all text-left group ${
                        isAssigned 
                          ? "bg-primary/10 text-primary border-2 border-primary/20" 
                          : "hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`size-6 rounded-full flex items-center justify-center text-[10px] font-bold uppercase transition-all ${
                          isAssigned 
                            ? "bg-primary text-primary-foreground scale-105" 
                            : "bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300"
                        }`}>
                          {member.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                        </div>
                        <span className="text-xs font-semibold">{member.name}</span>
                      </div>
                      <div className={`size-4 rounded border flex items-center justify-center transition-all ${
                        isAssigned 
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

          <DialogFooter className="flex items-center justify-between gap-2 border-t pt-4 border-zinc-100 dark:border-zinc-800">
            <Button
              type="button"
              variant="ghost"
              onClick={handleDelete}
              disabled={deleting || loading}
              className="text-destructive hover:bg-destructive/10 font-bold uppercase tracking-wider text-xs p-2"
            >
              <Trash2 className="size-4 mr-1.5" />
              Delete
            </Button>
            <div className="flex gap-2 ml-auto">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading || deleting}
                className="font-bold uppercase tracking-wider text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || deleting}
                className="font-bold uppercase tracking-wider text-xs shadow-[4px_4px_0px_0px_rgba(var(--primary-rgb),0.2)]"
              >
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
