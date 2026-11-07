import { cn } from '@/lib/utils'

/** Thin neutral progress bar with a single accent fill. */
export function ProgressBar({
  value,
  className,
  ariaLabel = 'Progress',
}: {
  value: number
  className?: string
  ariaLabel?: string
}) {
  const clamped = Math.min(100, Math.max(0, Math.round(value)))
  return (
    <div
      className={cn('h-1.5 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700', className)}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={ariaLabel}
    >
      <div
        className="h-full rounded-full bg-accent-700 transition-[width] duration-500 dark:bg-accent-600"
        style={{ width: `${clamped}%` }}
      />
    </div>
  )
}
