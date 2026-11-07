import { create } from 'zustand'
import { cn } from '@/lib/utils'
import { CircleCheck, Info, XCircle } from 'lucide-react'

export type ToastKind = 'info' | 'success' | 'error'

export interface ToastItem {
  id: number
  kind: ToastKind
  message: string
}

interface ToastState {
  toasts: ToastItem[]
  push: (kind: ToastKind, message: string) => void
  dismiss: (id: number) => void
}

let nextId = 1

/** Global toast store; host renders items in the bottom-right corner. */
export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],
  push: (kind, message) => {
    const id = nextId++
    set({ toasts: [...get().toasts, { id, kind, message }] })
    window.setTimeout(() => get().dismiss(id), 5000)
  },
  dismiss: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),
}))

/** Convenience helper for non-React code (API layer, etc.). */
export function toast(kind: ToastKind, message: string) {
  useToastStore.getState().push(kind, message)
}

const KIND_STYLE: Record<ToastKind, string> = {
  info: 'border-neutral-200 dark:border-neutral-700',
  success: 'border-accent-200 dark:border-accent-800',
  error: 'border-red-300 dark:border-red-900',
}

const KIND_ICON: Record<ToastKind, React.ReactNode> = {
  info: <Info className="mt-0.5 size-4 shrink-0 text-neutral-400" aria-hidden="true" />,
  success: <CircleCheck className="mt-0.5 size-4 shrink-0 text-accent-700 dark:text-accent-300" />,
  error: <XCircle className="mt-0.5 size-4 shrink-0 text-red-600 dark:text-red-400" />,
}

export function ToastHost() {
  const { toasts, dismiss } = useToastStore()
  if (toasts.length === 0) return null
  return (
    <div
      className="fixed right-4 bottom-4 z-[60] flex w-80 flex-col gap-2"
      role="status"
      aria-live="polite"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            'flex items-start gap-2 rounded-xl border bg-white p-3 text-sm shadow-md',
            'text-neutral-700 dark:bg-neutral-900 dark:text-neutral-200',
            KIND_STYLE[t.kind],
          )}
        >
          {KIND_ICON[t.kind]}
          <span className="flex-1">{t.message}</span>
          <button
            className="rounded p-0.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
            onClick={() => dismiss(t.id)}
            aria-label="Dismiss notification"
          >
            <XCircle className="size-4" />
          </button>
        </div>
      ))}
    </div>
  )
}
