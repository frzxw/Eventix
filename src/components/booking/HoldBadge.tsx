import { useEffect, useMemo, useState } from 'react';
import { Clock, RefreshCw } from 'lucide-react';
import { Button } from '../ui/button';

export type HoldBadgeProps = {
  holdId?: string;
  expiresAt?: string;
  onExtend?: () => Promise<void> | void;
  isExtending?: boolean;
  className?: string;
};

const formatRemaining = (msRemaining: number) => {
  const seconds = Math.max(0, Math.floor(msRemaining / 1000));
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export function HoldBadge({ holdId, expiresAt, onExtend, isExtending, className }: HoldBadgeProps) {
  const [remainingMs, setRemainingMs] = useState(() => {
    if (!expiresAt) return 0;
    return new Date(expiresAt).getTime() - Date.now();
  });

  useEffect(() => {
    if (!expiresAt) {
      setRemainingMs(0);
      return;
    }

    const updateRemaining = () => {
      setRemainingMs(new Date(expiresAt).getTime() - Date.now());
    };

    updateRemaining();
    const interval = setInterval(updateRemaining, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  const countdownLabel = useMemo(() => formatRemaining(remainingMs), [remainingMs]);
  const expiresSoon = remainingMs < 60000;

  if (!holdId || !expiresAt) {
    return null;
  }

  return (
    <div
      className={`glass flex items-center gap-3 rounded-full border border-[var(--border-glass)] px-4 py-2 transition-all duration-300 ${
        expiresSoon ? 'shadow-[var(--warning)]/30 border-[var(--warning)]/40' : ''
      } ${className ?? ''}`.trim()}
      aria-live="polite"
      aria-label={`Active hold ${holdId}, expires in ${countdownLabel}`}
    >
      <Clock className="w-4 h-4 text-[var(--primary-500)]" aria-hidden="true" />
      <div>
        <p className="text-xs text-[var(--text-tertiary)]">Hold ID</p>
        <p className="text-sm" style={{ fontWeight: 'var(--font-weight-medium)' }}>{holdId}</p>
      </div>
      <div className="h-8 w-px bg-[var(--border-default)]" aria-hidden="true" />
      <div>
        <p className="text-xs text-[var(--text-tertiary)]">Expires in</p>
        <p className={`text-sm ${expiresSoon ? 'text-[var(--warning)]' : ''}`} style={{ fontWeight: 'var(--font-weight-medium)' }}>
          {countdownLabel}
        </p>
      </div>
      {onExtend && (
        <Button
          size="sm"
          variant="ghost"
          className="ml-3 rounded-full px-3"
          onClick={() => onExtend()}
          disabled={Boolean(isExtending)}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isExtending ? 'animate-spin' : ''}`} aria-hidden="true" />
          Extend
        </Button>
      )}
      <span className="sr-only" aria-live="assertive">
        Hold {holdId} expires in {countdownLabel}
      </span>
    </div>
  );
}
