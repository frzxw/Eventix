import { type LucideIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from '../ui/button';

interface StatusNoticeProps {
  icon?: LucideIcon;
  tone?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  actionDisabled?: boolean;
}

const toneTokens: Record<NonNullable<StatusNoticeProps['tone']>, {
  border: string;
  iconBg: string;
  iconColor: string;
  actionVariant: 'outline' | 'default';
}> = {
  info: {
    border: 'var(--border-glass)',
    iconBg: 'var(--surface-glass-hover)',
    iconColor: 'var(--primary-400)',
    actionVariant: 'outline',
  },
  success: {
    border: 'var(--success-border)',
    iconBg: 'var(--success-bg)',
    iconColor: 'var(--success)',
    actionVariant: 'outline',
  },
  warning: {
    border: 'var(--warning-border)',
    iconBg: 'var(--warning-bg)',
    iconColor: 'var(--warning)',
    actionVariant: 'outline',
  },
  error: {
    border: 'var(--error-border)',
    iconBg: 'var(--error-bg)',
    iconColor: 'var(--error)',
    actionVariant: 'default',
  },
};

const DEFAULT_ICON_BG = 'var(--surface-glass)';
const DEFAULT_ICON_COLOR = 'var(--primary-400)';

export function StatusNotice({
  icon: Icon,
  tone = 'info',
  title,
  description,
  actionLabel,
  onAction,
  actionDisabled,
}: StatusNoticeProps) {
  const tokens = toneTokens[tone];
  const iconBackground = Icon ? tokens.iconBg : DEFAULT_ICON_BG;
  const iconColor = Icon ? tokens.iconColor : DEFAULT_ICON_COLOR;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass rounded-3xl border px-6 py-6 sm:px-8"
      style={{ borderColor: tokens.border }}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-start gap-4">
          {Icon && (
            <div
              className="mt-0.5 flex h-12 w-12 items-center justify-center rounded-2xl"
              style={{ background: iconBackground, color: iconColor }}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
            </div>
          )}

          <div className="max-w-2xl space-y-1 text-left">
            {title && (
              <h3 className="text-base sm:text-lg" style={{ fontWeight: 'var(--font-weight-medium)', color: iconColor }}>
                {title}
              </h3>
            )}
            <p className="text-sm sm:text-base text-[var(--text-secondary)]">
              {description}
            </p>
          </div>
        </div>

        {actionLabel && onAction && (
          <div className="flex w-full flex-shrink-0 justify-end sm:w-auto">
            <Button
              className="rounded-full"
              onClick={onAction}
              disabled={actionDisabled}
              variant={tokens.actionVariant}
            >
              {actionLabel}
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
