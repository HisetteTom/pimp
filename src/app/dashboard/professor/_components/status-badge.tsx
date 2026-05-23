import { Badge } from '@/components/ui/badge';

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  switch (status) {
    case 'proposed':
      return (
        <Badge
          variant="outline"
          className="rounded-none border-zinc-300 bg-zinc-50 text-[9px] font-black tracking-widest text-zinc-500 uppercase dark:bg-zinc-900/50"
        >
          Proposed
        </Badge>
      );
    case 'validated':
      return (
        <Badge
          variant="outline"
          className="rounded-none border-blue-500/30 bg-blue-500/5 text-[9px] font-black tracking-widest text-blue-600 uppercase"
        >
          Validated
        </Badge>
      );
    case 'ongoing':
      return (
        <Badge
          variant="outline"
          className="rounded-none border-emerald-500/30 bg-emerald-500/5 text-[9px] font-black tracking-widest text-emerald-600 uppercase"
        >
          Ongoing
        </Badge>
      );
    case 'late':
      return (
        <Badge
          variant="outline"
          className="rounded-none border-red-500/30 bg-red-500/5 text-[9px] font-black tracking-widest text-red-600 uppercase"
        >
          Late
        </Badge>
      );
    case 'delivered':
      return (
        <Badge
          variant="outline"
          className="rounded-none border-purple-500/30 bg-purple-500/5 text-[9px] font-black tracking-widest text-purple-600 uppercase"
        >
          Delivered
        </Badge>
      );
    case 'presented':
      return (
        <Badge
          variant="outline"
          className="rounded-none border-indigo-500/30 bg-indigo-500/5 text-[9px] font-black tracking-widest text-indigo-600 uppercase"
        >
          Presented
        </Badge>
      );
    case 'closed':
      return (
        <Badge
          variant="outline"
          className="rounded-none border-zinc-400 bg-zinc-100 text-[9px] font-black tracking-widest text-zinc-600 uppercase dark:bg-zinc-900"
        >
          Closed
        </Badge>
      );
    default:
      return (
        <Badge
          variant="outline"
          className="rounded-none text-[9px] font-black tracking-widest uppercase"
        >
          {status}
        </Badge>
      );
  }
}
