import { useMemo } from 'react';
import { motion } from 'motion/react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Clock, Loader2, Signal, Users } from 'lucide-react';
import type { BookingStage } from '@/lib/hooks/useBookingStateMachine';
import { formatSecondsToDuration } from '@/lib/utils';
import { Link } from 'react-router-dom';

export type QueueModalProps = {
  open: boolean;
  stage: BookingStage;
  queuePosition?: number;
  etaSeconds?: number;
  queueId?: string;
  correlationId?: string;
  isRealtimeActive?: boolean;
  onCancel: () => void;
  onContinue?: () => void;
  queueStatusUrl?: string;
};

export function QueueModal({
  open,
  stage,
  queuePosition,
  etaSeconds,
  queueId,
  correlationId,
  isRealtimeActive,
  onCancel,
  onContinue,
  queueStatusUrl,
}: QueueModalProps) {
  const heading = stage === 'ready-with-hold' ? 'Your spot is ready' : 'You are in the Eventix queue';
  const queueMessage = useMemo(() => {
    if (stage === 'ready-with-hold') {
      return 'Hold acquired. You can continue to checkout.';
    }
    const parts: string[] = [];
    if (typeof queuePosition === 'number') {
      parts.push(`Current position ${queuePosition}`);
    }
    if (typeof etaSeconds === 'number') {
      parts.push(`Estimated wait ${formatSecondsToDuration(Math.max(etaSeconds, 0))}`);
    }
    return parts.join(' • ') || 'Estimating your position...';
  }, [stage, queuePosition, etaSeconds]);

  return (
    <Dialog open={open} onOpenChange={() => undefined}>
      <DialogContent className="glass max-w-lg border-[var(--border-glass)]" aria-live="polite" aria-busy={stage === 'in-queue'}>
        <DialogHeader>
          <DialogTitle className="text-2xl" style={{ fontWeight: 'var(--font-weight-medium)' }}>
            {heading}
          </DialogTitle>
          <DialogDescription className="text-sm text-[var(--text-secondary)]">
            {queueMessage}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          <div className="rounded-3xl border border-[var(--border-glass)] bg-[var(--surface-glass)] p-4">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-[var(--primary-500)]" aria-hidden="true" />
              <div>
                <p className="text-sm text-[var(--text-secondary)]">Queue ID</p>
                <p className="text-sm" style={{ fontWeight: 'var(--font-weight-medium)' }}>{queueId || 'Pending assignment'}</p>
              </div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border border-[var(--border-glass)] bg-[var(--surface-glass)] p-4"
          >
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-[var(--accent-500)]" aria-hidden="true" />
              <div>
                <p className="text-sm text-[var(--text-secondary)]">Estimated wait</p>
                <p className="text-lg" style={{ fontWeight: 'var(--font-weight-medium)' }}>
                  {stage === 'ready-with-hold' ? 'Ready now' : formatSecondsToDuration(Math.max(etaSeconds ?? 0, 0))}
                </p>
              </div>
            </div>
            {typeof queuePosition === 'number' && stage === 'in-queue' && (
              <p className="mt-3 text-xs text-[var(--text-tertiary)]">You are currently number {queuePosition} in line.</p>
            )}
          </motion.div>

          <div className="flex items-center gap-2 rounded-3xl border border-[var(--border-glass)] bg-[var(--surface-glass)] px-4 py-3 text-sm text-[var(--text-secondary)]">
            <Signal className={`w-4 h-4 ${isRealtimeActive ? 'text-[var(--success)]' : 'text-[var(--warning)]'}`} aria-hidden="true" />
            <span>{isRealtimeActive ? 'Live updates from Azure Web PubSub' : 'Using secure polling fallback'}</span>
          </div>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="text-xs text-[var(--text-tertiary)]" aria-live="polite">
            {correlationId ? `Correlation: ${correlationId}` : 'Preparing correlation id...'}
          </div>
          <div className="flex items-center gap-3">
            {queueStatusUrl && stage === 'in-queue' && (
              <Button variant="outline" className="rounded-full" asChild>
                <Link to={queueStatusUrl}>
                  View queue page
                </Link>
              </Button>
            )}
            <Button variant="ghost" className="rounded-full" onClick={onCancel}>
              Cancel and leave queue
            </Button>
            {stage === 'ready-with-hold' ? (
              <Button className="rounded-full" onClick={onContinue}>
                Continue to checkout
              </Button>
            ) : (
              <Button className="rounded-full" disabled>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Waiting
              </Button>
            )}
          </div>
        </div>

        <div className="sr-only" aria-live="assertive">
          {stage === 'ready-with-hold'
            ? 'Queue complete. Hold acquired. You may continue to checkout.'
            : `Queue position ${queuePosition ?? 'calculating'}, estimated wait ${formatSecondsToDuration(Math.max(etaSeconds ?? 0, 0))}`}
        </div>
      </DialogContent>
    </Dialog>
  );
}
