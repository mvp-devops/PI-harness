import { cn } from '@/lib/utils'
import type { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes } from 'react'

const BASE =
  'w-full bg-white border border-neutral-200 rounded-lg text-sm text-neutral-900 placeholder:text-neutral-400 ' +
  'focus:outline-2 focus:outline-offset-0 focus:outline-accent-700 disabled:opacity-50 ' +
  'dark:bg-neutral-900 dark:text-neutral-100 dark:border-neutral-700 dark:placeholder:text-neutral-500'

export function Input({ className, ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(BASE, 'h-9 px-3', className)} {...rest} />
}

export function Textarea({
  className,
  rows = 5,
  ...rest
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(BASE, 'px-3 py-2 leading-relaxed', className)} rows={rows} {...rest} />
}

export function Select({ className, ...rest }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn(BASE, 'h-9 px-2.5', className)} {...rest} />
}
