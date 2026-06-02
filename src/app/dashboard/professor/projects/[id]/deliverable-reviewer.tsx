'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { validateDeliverable } from '../../actions';
import { Loader2, ExternalLink, CheckSquare, XCircle, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useTranslations } from 'next-intl';

interface DeliverableReviewerProps {
  deliverableId: number;
  projectId: number;
  deliverableName: string;
  deliverableSource?: string | null;
  initialStatus: string;
  initialFeedback?: string | null;
  readOnly?: boolean;
}

function getStatusBadge(s: string, t: (key: string) => string) {
  switch (s) {
    case 'approved':
      return (
        <Badge className="rounded-none bg-emerald-500 text-[9px] font-black tracking-wider text-white uppercase hover:bg-emerald-600">
          {t('statusApproved')}
        </Badge>
      );
    case 'rejected':
      return (
        <Badge className="rounded-none bg-red-500 text-[9px] font-black tracking-wider text-white uppercase hover:bg-red-600">
          {t('statusRejected')}
        </Badge>
      );
    default:
      return (
        <Badge className="rounded-none bg-amber-500 text-[9px] font-black tracking-wider text-white uppercase hover:bg-amber-600">
          {t('statusPending')}
        </Badge>
      );
  }
}

export function DeliverableReviewer({
  deliverableId,
  projectId,
  deliverableName,
  deliverableSource = '',
  initialStatus,
  initialFeedback = '',
  readOnly = false,
}: DeliverableReviewerProps) {
  const t = useTranslations('ProfessorDeliverableReviewer');
  const [isPending, startTransition] = useTransition();
  const { refresh } = useRouter();

  const [status, setStatus] = useState(initialStatus || 'pending');
  const [feedback, setFeedback] = useState(initialFeedback || '');

  const handleValidate = (newStatus: string) => {
    startTransition(async () => {
      try {
        await validateDeliverable(deliverableId, newStatus, feedback, projectId);
        setStatus(newStatus);
        const statusLabel =
          newStatus === 'approved'
            ? t('statusApproved')
            : newStatus === 'rejected'
              ? t('statusRejected')
              : t('statusPending');
        toast.success(t('markedStatus', { name: deliverableName, status: statusLabel }));
        refresh();
      } catch (err) {
        toast.error(t('errorUpdate'));
        console.error(err);
      }
    });
  };

  return (
    <div className="space-y-4 border border-zinc-200 bg-zinc-50/50 p-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.02)] transition-colors hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900/20 dark:hover:border-zinc-700">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h4 className="flex items-center gap-1.5 text-xs font-semibold tracking-tight text-zinc-800 uppercase dark:text-zinc-200">
            {deliverableName}
            {getStatusBadge(status, t)}
          </h4>
          {deliverableSource && (
            <a
              href={`/api/deliverables/download/${deliverableId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold text-purple-600 uppercase underline decoration-2 underline-offset-2 hover:text-purple-700"
            >
              <ExternalLink className="size-3" />
              {t('downloadResource')}
            </a>
          )}
        </div>
      </div>

      <div className="space-y-3 pt-1">
        <div className="space-y-1.5">
          <Label
            htmlFor={`deliv-feed-${deliverableId}`}
            className="text-[9px] font-black tracking-widest text-zinc-400 uppercase"
          >
            {t('feedbackLabel')}
          </Label>
          <Textarea
            id={`deliv-feed-${deliverableId}`}
            rows={2}
            className="bg-card resize-none rounded-none border-2 border-zinc-200 p-2 text-xs transition-colors hover:border-zinc-300 focus-visible:ring-purple-500 dark:border-zinc-800 dark:hover:border-zinc-700"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            disabled={isPending || readOnly}
          />
        </div>

        {!readOnly && (
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="unstyled"
              size="sm"
              onClick={() => handleValidate('approved')}
              disabled={isPending}
              className="flex h-8 cursor-pointer items-center gap-1 rounded-none border-transparent bg-emerald-600 text-[10px] font-black tracking-wider text-white uppercase shadow-[2px_2px_0px_0px_rgba(16,185,129,0.2)] hover:bg-emerald-700 hover:text-white active:translate-x-[1px] active:translate-y-[1px] active:shadow-none dark:hover:bg-emerald-700"
            >
              {isPending && status === 'approved' ? (
                <Loader2 className="size-3 animate-spin" />
              ) : (
                <CheckSquare className="size-3" />
              )}
              {t('btnApprove')}
            </Button>

            <Button
              type="button"
              variant="unstyled"
              size="sm"
              onClick={() => handleValidate('rejected')}
              disabled={isPending}
              className="flex h-8 cursor-pointer items-center gap-1 rounded-none border-transparent bg-red-600 text-[10px] font-black tracking-wider text-white uppercase shadow-[2px_2px_0px_0px_rgba(239,68,68,0.2)] hover:bg-red-700 hover:text-white active:translate-x-[1px] active:translate-y-[1px] active:shadow-none dark:hover:bg-red-700"
            >
              {isPending && status === 'rejected' ? (
                <Loader2 className="size-3 animate-spin" />
              ) : (
                <XCircle className="size-3" />
              )}
              {t('btnReject')}
            </Button>

            {status !== 'pending' && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => handleValidate('pending')}
                disabled={isPending}
                className="flex h-8 cursor-pointer items-center gap-1 rounded-none border-2 border-zinc-200 text-[10px] font-bold tracking-wider text-zinc-600 uppercase hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-900"
              >
                {isPending && status === 'pending' ? (
                  <Loader2 className="size-3 animate-spin" />
                ) : (
                  <AlertCircle className="size-3" />
                )}
                {t('btnReset')}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
