import { useEffect } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { HoldBadge } from '@/components/booking/HoldBadge';
import { QueueModal } from '@/components/booking/QueueModal';
import { useBookingStateMachine } from '@/lib/hooks/useBookingStateMachine';
import { formatSecondsToDuration } from '@/lib/utils';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';

export function QueuePage() {
  const { state, actions } = useBookingStateMachine();
  const navigate = useNavigate();

  useEffect(() => {
    if (state.stage === 'expired') {
      void actions.cancelQueue();
    }
  }, [state.stage, actions]);

  const queueActive = state.stage === 'in-queue';

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Queue</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="glass rounded-3xl border border-[var(--border-glass)] p-8"
      >
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-3xl sm:text-4xl" style={{ fontWeight: 'var(--font-weight-medium)' }}>
              Booking Queue Status
            </h1>
            <p className="text-[var(--text-secondary)] mt-2">
              We are reserving tickets for you. Keep this page open so we can notify you when your hold is ready.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-[var(--border-glass)] bg-[var(--surface-glass)] p-6">
              <p className="text-sm text-[var(--text-secondary)]">Current Stage</p>
              <p className="text-2xl mt-2" style={{ fontWeight: 'var(--font-weight-medium)' }}>
                {queueActive ? 'In Queue' : state.stage === 'ready-with-hold' ? 'Hold Ready' : state.stage === 'error' ? 'Error' : state.stage === 'expired' ? 'Hold Expired' : 'Idle'}
              </p>
              {queueActive && (
                <p className="text-sm text-[var(--text-tertiary)] mt-2">
                  Position {state.queuePosition ?? '...'} • ETA {formatSecondsToDuration(state.queueEtaSeconds ?? 0)}
                </p>
              )}
            </div>

            <div className="rounded-2xl border border-[var(--border-glass)] bg-[var(--surface-glass)] p-6">
              <p className="text-sm text-[var(--text-secondary)]">Correlation ID</p>
              <p className="text-sm mt-2" style={{ fontWeight: 'var(--font-weight-medium)' }}>{state.correlationId ?? 'Generating...'}</p>
              <p className="text-xs text-[var(--text-tertiary)] mt-3">
                Keep this ID handy when contacting support about your booking session.
              </p>
            </div>
          </div>

          {state.stage === 'ready-with-hold' && (
            <HoldBadge
              holdId={state.holdId}
              expiresAt={state.holdExpiresAt}
              onExtend={() => actions.extendHold()}
            />
          )}

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <Button variant="ghost" className="rounded-full" onClick={() => actions.cancelQueue()}>
              Cancel Queue
            </Button>
            {state.stage === 'ready-with-hold' && state.eventId && (
              <Button
                className="rounded-full"
                onClick={() => navigate(`/event/${state.eventId}/checkout`)}
              >
                Continue to checkout
              </Button>
            )}
          </div>
        </div>
      </motion.div>

      <QueueModal
        open={queueActive}
        stage={state.stage}
        queuePosition={state.queuePosition}
        etaSeconds={state.queueEtaSeconds}
        queueId={state.queueId}
        correlationId={state.correlationId}
        isRealtimeActive={state.isRealtimeActive}
        onCancel={() => actions.cancelQueue()}
        onContinue={state.eventId ? () => navigate(`/event/${state.eventId}/checkout`) : undefined}
      />
    </div>
  );
}
