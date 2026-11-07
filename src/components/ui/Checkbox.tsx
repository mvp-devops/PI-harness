import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'
import type { InputHTMLAttributes } from 'react'

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  checked: boolean
  onCheckedChange?: (checked: boolean) => void
  label?: string
}

export function Checkbox({ checked, onCheckedChange, label, className, ...rest }: CheckboxProps) {
  return (
    <label className={cn('inline-flex cursor-pointer items-center gap-2 text-sm', className)}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onCheckedChange?.(e.target.checked)}
        className="peer sr-only"
        {...rest}
      />
      <span
        aria-hidden="true"
        className={cn(
          'flex size-4 items-center justify-center rounded border transition-colors',
          'peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent-700',
          checked
            ? 'border-accent-700 bg-accent-700 text-white dark:border-accent-600 dark:bg-accent-600'
            : 'border-neutral-300 bg-white dark:border-neutral-600 dark:bg-neutral-900',
        )}
      >
        {checked && <Check className="size-3" strokeWidth={3} />}
      </span>
      {label && <span className="text-neutral-700 dark:text-neutral-300">{label}</span>}
    </label>
  )
}
