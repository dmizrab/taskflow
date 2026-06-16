'use client'
import { useMemo } from 'react'
import { parseISO, format, isAfter, isBefore, isToday, startOfDay } from 'date-fns'
import { es } from 'date-fns/locale'
import { Clock, AlertCircle, CheckCircle2, Circle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar } from '@/components/ui/Avatar'
import type { Task } from '@/types'

interface TimelineViewProps {
  tasks: Task[]
  projectId: string
}

const STATUS_CONFIG = {
  pending: { label: 'Pendiente', icon: Circle, color: 'text-gray-400', bg: 'bg-gray-50 border-gray-200' },
  in_progress: { label: 'En proceso', icon: Clock, color: 'text-blue-500', bg: 'bg-blue-50 border-blue-200' },
  blocked: { label: 'Bloqueado', icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50 border-red-200' },
  completed: { label: 'Completado', icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-50 border-green-200' },
}

const PRIORITY_COLORS: Record<string, string> = {
  urgent: 'bg-red-100 text-red-700',
  high: 'bg-orange-100 text-orange-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-gray-100 text-gray-600',
}
const PRIORITY_LABELS: Record<string, string> = {
  urgent: 'Urgente', high: 'Alta', medium: 'Media', low: 'Baja',
}

export function TimelineView({ tasks }: TimelineViewProps) {
  const today = startOfDay(new Date())

  const { overdue, upcoming, done, noDueDate } = useMemo(() => {
    const sorted = [...tasks].sort((a, b) => {
      if (!a.due_date && !b.due_date) return 0
      if (!a.due_date) return 1
      if (!b.due_date) return -1
      return parseISO(a.due_date) < parseISO(b.due_date) ? -1 : 1
    })

    return {
      overdue: sorted.filter(t => t.due_date && isBefore(parseISO(t.due_date), today) && t.status !== 'completed'),
      upcoming: sorted.filter(t => t.due_date && (isToday(parseISO(t.due_date)) || isAfter(parseISO(t.due_date), today)) && t.status !== 'completed'),
      done: sorted.filter(t => t.status === 'completed'),
      noDueDate: sorted.filter(t => !t.due_date && t.status !== 'completed'),
    }
  }, [tasks, today])

  const groups = [
    { id: 'overdue', label: 'Vencidas', emoji: '🔴', tasks: overdue, accent: 'border-l-red-400' },
    { id: 'upcoming', label: 'Próximas', emoji: '📅', tasks: upcoming, accent: 'border-l-blue-400' },
    { id: 'noDueDate', label: 'Sin fecha', emoji: '📋', tasks: noDueDate, accent: 'border-l-gray-300' },
    { id: 'done', label: 'Completadas', emoji: '✅', tasks: done, accent: 'border-l-green-400' },
  ].filter(g => g.tasks.length > 0)

  if (tasks.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 flex flex-col items-center justify-center py-20 text-gray-400">
        <Clock className="w-10 h-10 mb-3 opacity-50" />
        <p className="text-sm">No hay tareas en este proyecto</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {groups.map(group => (
        <div key={group.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {/* Encabezado del grupo */}
          <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-100 bg-gray-50">
            <span className="text-base">{group.emoji}</span>
            <h3 className="text-sm font-semibold text-gray-700">{group.label}</h3>
            <span className="ml-1 text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full font-medium">
              {group.tasks.length}
            </span>
          </div>

          {/* Lista de tareas con línea de tiempo */}
          <div className="divide-y divide-gray-100">
            {group.tasks.map((task, idx) => {
              const cfg = STATUS_CONFIG[task.status]
              const Icon = cfg.icon
              const dueDateStr = task.due_date
                ? format(parseISO(task.due_date), "d 'de' MMM, yyyy", { locale: es })
                : null
              const startDateStr = task.start_date
                ? format(parseISO(task.start_date), "d 'de' MMM", { locale: es })
                : null

              return (
                <div
                  key={task.id}
                  className={cn(
                    'flex items-start gap-4 px-5 py-3.5 hover:bg-gray-50/60 transition-colors',
                    'border-l-4',
                    group.accent
                  )}
                >
                  {/* Icono de estado */}
                  <div className="flex-shrink-0 mt-0.5">
                    <Icon className={cn('w-4 h-4', cfg.color)} />
                  </div>

                  {/* Contenido principal */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={cn(
                        'text-sm font-medium',
                        task.status === 'completed' ? 'text-gray-400 line-through' : 'text-gray-900'
                      )}>
                        {task.name}
                      </p>
                      <span className={cn('text-xs px-2 py-0.5 rounded-full flex-shrink-0', PRIORITY_COLORS[task.priority])}>
                        {PRIORITY_LABELS[task.priority]}
                      </span>
                    </div>

                    {task.description && (
                      <p className="text-xs text-gray-400 mt-0.5 truncate">{task.description}</p>
                    )}

                    <div className="flex items-center gap-3 mt-1.5">
                      {task.assignee && (
                        <div className="flex items-center gap-1.5">
                          <Avatar profile={task.assignee} size="xs" />
                          <span className="text-xs text-gray-500">{task.assignee.full_name}</span>
                        </div>
                      )}
                      {(startDateStr || dueDateStr) && (
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <Clock className="w-3 h-3" />
                          {startDateStr && dueDateStr
                            ? `${startDateStr} → ${dueDateStr}`
                            : dueDateStr
                              ? `Vence: ${dueDateStr}`
                              : startDateStr}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
