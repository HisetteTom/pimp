"use client";

import { useState, useReducer, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { createProject } from "./actions";
import { Loader2, Plus, Calendar, Users, FileText, Trash } from "lucide-react";

const initialFormState = {
  name: "",
  description: "",
  dateStart: "",
  dateEnd: "",
  maxGroups: "8",
  maxMembersPerGroup: "5",
};

type FormAction =
  | { type: "SET_FIELD"; field: string; value: string }
  | { type: "RESET" };

function formReducer(state: typeof initialFormState, action: FormAction) {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };
    case "RESET":
      return initialFormState;
    default:
      return state;
  }
}

export function CreateProjectDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { refresh } = useRouter();
  const [formState, dispatch] = useReducer(formReducer, initialFormState);
  const [checkpoints, setCheckpoints] = useState<{ id: string; title: string; dueDate: string }[]>([]);

  const addCheckpoint = () => {
    setCheckpoints(prev => [...prev, { id: crypto.randomUUID(), title: "", dueDate: "" }]);
  };

  const removeCheckpoint = (id: string) => {
    setCheckpoints(prev => prev.filter((cp) => cp.id !== id));
  };

  const updateCheckpointField = (id: string, field: "title" | "dueDate", value: string) => {
    setCheckpoints(prev => prev.map((cp) => cp.id === id ? { ...cp, [field]: value } : cp));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formState.name.trim()) {
      toast.error("Project name is required");
      return;
    }

    startTransition(async () => {
      try {
        await createProject({
          name: formState.name,
          description: formState.description,
          dateStart: formState.dateStart || undefined,
          dateEnd: formState.dateEnd || undefined,
          maxGroups: parseInt(formState.maxGroups) || 8,
          maxMembersPerGroup: parseInt(formState.maxMembersPerGroup) || 5,
          checkpoints: checkpoints.reduce<{ title: string; dueDate: string }[]>((acc, cp) => {
            if (cp.title.trim() !== "" && cp.dueDate !== "") {
              acc.push({ title: cp.title, dueDate: cp.dueDate });
            }
            return acc;
          }, []),
        });

        toast.success("Project created successfully");
        setIsOpen(false);
        dispatch({ type: "RESET" });
        setCheckpoints([]);
        refresh();
      } catch (err) {
        toast.error("Failed to create project");
        console.error(err);
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="unstyled"
          className="h-11 px-6 font-black uppercase tracking-wider border-transparent bg-purple-600 hover:bg-purple-700 dark:hover:bg-purple-700 text-white hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(168,85,247,0.2)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none flex items-center gap-2 cursor-pointer focus-visible:border-purple-500 focus-visible:ring-3 focus-visible:ring-purple-500/50"
        >
          <Plus className="size-4" />
          Create New Project
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto border-2 border-zinc-200 dark:border-zinc-800 bg-card p-6 shadow-2xl rounded-none">
        <DialogHeader className="border-b border-zinc-100 dark:border-zinc-800 pb-4">
          <DialogTitle className="text-2xl font-black uppercase tracking-tight text-zinc-900 dark:text-zinc-100">
            Create Project Proposal
          </DialogTitle>
          <DialogDescription className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
            Submit a new project that students can enroll in.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-[11px] font-black uppercase tracking-widest text-zinc-500">
              Project Name <span className="text-purple-500">*</span>
            </Label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 size-4 text-zinc-400" />
              <Input
                id="name"
                type="text"
                className="pl-10 h-11 border-2 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 focus-visible:border-purple-500 focus-visible:ring-3 focus-visible:ring-purple-500/50 transition-colors rounded-none"
                value={formState.name}
                onChange={(e) => dispatch({ type: "SET_FIELD", field: "name", value: e.target.value })}
                required
                disabled={isPending}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-[11px] font-black uppercase tracking-widest text-zinc-500">
              Description
            </Label>
            <Textarea
              id="description"
              rows={4}
              className="border-2 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 focus-visible:border-purple-500 focus-visible:ring-3 focus-visible:ring-purple-500/50 transition-colors rounded-none p-3 resize-none"
              value={formState.description}
              onChange={(e) => dispatch({ type: "SET_FIELD", field: "description", value: e.target.value })}
              disabled={isPending}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dateStart" className="text-[11px] font-black uppercase tracking-widest text-zinc-500">
                Start Date
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 size-4 text-zinc-400" />
                <Input
                  id="dateStart"
                  type="date"
                  className="pl-10 h-11 border-2 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 focus-visible:border-purple-500 focus-visible:ring-3 focus-visible:ring-purple-500/50 transition-colors rounded-none"
                  value={formState.dateStart}
                  onChange={(e) => dispatch({ type: "SET_FIELD", field: "dateStart", value: e.target.value })}
                  disabled={isPending}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateEnd" className="text-[11px] font-black uppercase tracking-widest text-zinc-500">
                End Date
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 size-4 text-zinc-400" />
                <Input
                  id="dateEnd"
                  type="date"
                  className="pl-10 h-11 border-2 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 focus-visible:border-purple-500 focus-visible:ring-3 focus-visible:ring-purple-500/50 transition-colors rounded-none"
                  value={formState.dateEnd}
                  onChange={(e) => dispatch({ type: "SET_FIELD", field: "dateEnd", value: e.target.value })}
                  disabled={isPending}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="maxGroups" className="text-[11px] font-black uppercase tracking-widest text-zinc-500">
                Max Teams
              </Label>
              <div className="relative">
                <Users className="absolute left-3 top-3 size-4 text-zinc-400" />
                <Input
                  id="maxGroups"
                  type="number"
                  min="1"
                  max="50"
                  className="pl-10 h-11 border-2 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 focus-visible:border-purple-500 focus-visible:ring-3 focus-visible:ring-purple-500/50 transition-colors rounded-none"
                  value={formState.maxGroups}
                  onChange={(e) => dispatch({ type: "SET_FIELD", field: "maxGroups", value: e.target.value })}
                  required
                  disabled={isPending}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxMembersPerGroup" className="text-[11px] font-black uppercase tracking-widest text-zinc-500">
                Max Members/Team
              </Label>
              <div className="relative">
                <Users className="absolute left-3 top-3 size-4 text-zinc-400" />
                <Input
                  id="maxMembersPerGroup"
                  type="number"
                  min="1"
                  max="20"
                  className="pl-10 h-11 border-2 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 focus-visible:border-purple-500 focus-visible:ring-3 focus-visible:ring-purple-500/50 transition-colors rounded-none"
                  value={formState.maxMembersPerGroup}
                  onChange={(e) => dispatch({ type: "SET_FIELD", field: "maxMembersPerGroup", value: e.target.value })}
                  required
                  disabled={isPending}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <Label className="text-[11px] font-black uppercase tracking-widest text-zinc-500">
                Project Checkpoints (Meetings/Deadlines)
              </Label>
              <Button
                type="button"
                variant="unstyled"
                size="sm"
                onClick={addCheckpoint}
                className="h-8 px-3 border-2 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 font-black uppercase text-[10px] tracking-wider rounded-none cursor-pointer flex items-center gap-1.5"
                disabled={isPending}
              >
                <Plus className="size-3.5" />
                Add Checkpoint
              </Button>
            </div>

            {checkpoints.length === 0 ? (
              <p className="text-[10px] font-bold text-zinc-400 uppercase italic">
                No checkpoints added yet. These can also be managed inside the project workspace.
              </p>
            ) : (
              <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                {checkpoints.map((cp) => (
                  <div key={cp.id} className="flex gap-2 items-center">
                    <Input
                      type="text"
                      className="h-10 border-2 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 focus-visible:border-purple-500 focus-visible:ring-3 focus-visible:ring-purple-500/50 transition-colors rounded-none text-xs"
                      value={cp.title}
                      onChange={(e) => updateCheckpointField(cp.id, "title", e.target.value)}
                      required
                      disabled={isPending}
                    />
                    <Input
                      type="date"
                      className="h-10 w-40 border-2 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 focus-visible:border-purple-500 focus-visible:ring-3 focus-visible:ring-purple-500/50 transition-colors rounded-none text-xs"
                      value={cp.dueDate}
                      onChange={(e) => updateCheckpointField(cp.id, "dueDate", e.target.value)}
                      required
                      disabled={isPending}
                    />
                    <Button
                      type="button"
                      variant="unstyled"
                      size="icon"
                      onClick={() => removeCheckpoint(cp.id)}
                      className="size-10 text-red-500 hover:bg-red-50 dark:hover:bg-red-950 border-2 border-zinc-200 dark:border-zinc-800 rounded-none cursor-pointer shrink-0 flex items-center justify-center"
                      disabled={isPending}
                    >
                      <Trash className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <DialogClose asChild>
              <Button
                type="button"
                variant="unstyled"
                className="h-11 px-5 border-2 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 font-bold uppercase tracking-wider rounded-none cursor-pointer flex items-center justify-center"
                disabled={isPending}
              >
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              variant="unstyled"
              className="h-11 px-6 border-transparent bg-purple-600 hover:bg-purple-700 dark:hover:bg-purple-700 text-white hover:text-white font-black uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(168,85,247,0.2)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none flex items-center gap-2 rounded-none cursor-pointer focus-visible:border-purple-500 focus-visible:ring-3 focus-visible:ring-purple-500/50"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Creating…
                </>
              ) : (
                "Create Project"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
