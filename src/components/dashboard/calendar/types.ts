export interface Task {
  id: number;
  name: string;
  description: string | null;
  status: string;
  priority: string;
  deadline: Date | string | null;
  assigneeId: string | null;
  assignees?: string | null;
  inProgressAt?: Date | string | null;
  completedAt?: Date | string | null;
  createdAt?: Date | string | null;
}

export interface CalendarEventProps {
  id: string;
  title: string;
  type: 'boundary' | 'checkpoint' | 'task';
  date?: string;
  notes?: string;
  description?: string;
  task?: Task;
}

export interface Checkpoint {
  id: number;
  title: string;
  dueDate: Date | string;
  projectId: number;
}

export interface CheckpointNote {
  id: number;
  checkpointId: number;
  teamId: number;
  notes: string | null;
}
