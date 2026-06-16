import { cn } from '@/lib/utils'
import {
  STATUS_COLORS, STATUS_LABELS, STATUS_DOT,
  PRIORITY_COLORS, PRIORITY_LABELS, PRIORITY_DOT,
} from '@/lib/utils'
import type { TaskStatus, TaskPriority } from '@/types'

export function StatusBadge({ status }: { status: TaskStatus }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium', STATUS_COLORS[status])}>
      <span className={cn('w-1.5 h-1.5 rounded-full', STATUS_DOT[status])} />
      {STATUS_LABELS[status]}
    </span>
  )
}

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium', PRIORITY_COLORS[priority])}>
      <span className={cn('w-1.5 h-1.5 rounded-full', PRIORITY_DOT[priority])} />
      {PRIORITY_LABELS[priority]}
    </span>
  )
}
