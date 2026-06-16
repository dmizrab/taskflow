'use client'
import { useMemo, useState } from 'react'
import { addDays, differenceInDays, format, startOfDay, parseISO, isToday, addMonths, subMonths, startOfMonth, endOfMonth } from 'date-fns'
import { es } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { StatusBadge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { useUpdateTask } from '@/hooks/useTasks'
import { cn, STATUS_COLORS } from '@/lib/utils'
import type { Task } from '@/types'

interface GanttViewProps {
  tasks: Task[]
  projectId: string
}

const STATUS_BAR: Record<string, string> = {
  pending: 'bg-gray-400',
  in_progress: 'bg-blue-500',
  blocked: 'bg-red-500',
  completed: 'bg-green-500',
}

export function GanttView({ tasks }: GanttViewProps) {
  const [baseDate, setBaseDate] = useState(() => startOfMonth(new Date()))
  const updateTask = useUpdateTask()

  const DAYS = 30
  const days = Array.from({ length: DAYS }, (_, i) => addDays(baseDate, i))
  const weeks: { label: string; start: number; count: number }[] = []
  let weekStart = 0
  days.forEach((d, i) => {
    if (i === 0 || d.getDay() === 1) {
      if (i > 0) weeks[weeks.length - 1].count = i - weekStart
      weeks.push({ label: format(d, "'Sem' d MMM", { locale: es }), start: i, count: 0 })
      weekStart = i
    }
    if (i === DAYS - 1) weeks[weeks.length - 1].count = DAYS - weekStart
  })

  const tasksWithDates = tasks.filter(t => t.due_date)

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Controles de navegación */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
        <button onClick={() => setBaseDate(d => subMonths(d, 1))} className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors">
          <ChevronLeft className="w-4 h-4 text-gray-600" />
        </button>
        <span className="text-sm font-semibold text-gray-700">
          {format(baseDate, 'MMMM yyyy', { locale: es })} — {format(addDays(baseDate, DAYS - 1), 'MMMM yyyy', { locale: es })}
        </span>
        <button onClick={() => setBaseDate(d => addMonths(d, 1))} className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors">
          <ChevronRight className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      <div className="overflow-x-auto">
        <div style={{ minWidth: `${200 + DAYS * 36}px` }}>
          {/* Header días */}
          <div className="flex border-b border-gray-200">
            <div className="w-48 flex-shrink-0 px-4 py-2 text-xs font-semibold text-gray-500 bg-gray-50 border-r border-gray-200">
              TAREA
            </div>
            <div className="flex-1 flex">
              {days.map((d, i) => (
                <div
                  key={i}
                  className={cn(
                    'w-9 flex-shrink-0 text-center py-2 border-r border-gray-100 text-xs',
                    isToday(d) ? 'bg-blue-50 text-blue-600 font-bold' : 'text-gray-400',
                    d.getDay() === 0 || d.getDay() === 6 ? 'bg-gray-50' : ''
                  )}
                >
                  <div>{format(d, 'd')}</div>
                  <div className="text-gray-300">{format(d, 'EEE', { locale: es }).slice(0, 2)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Filas de tareas */}
          {tasksWithDates.length === 0 && (
            <div className="text-center py-12 text-gray-400 text-sm">
              Las tareas necesitan fecha límite para aparecer en el Gantt
            </div>
          )}

          {tasksWithDates.map(task => {
            const start = task.start_date ? parseISO(task.start_date) : parseISO(task.due_date!)
            const end = parseISO(task.due_date!)
            const startOffset = differenceInDays(start, baseDate)
            const duration = Math.max(1, differenceInDays(end, start) + 1)
            const clampedStart = Math.max(0, startOffset)
            const clampedEnd = Math.min(DAYS, startOffset + duration)
            const visible = clampedEnd > 0 && clampedStart < DAYS

            return (
              <div key={task.id} className="flex border-b border-gray-100 hover:bg-gray-50/50 group">
                {/* Nombre */}
                <div className="w-48 flex-shrink-0 px-3 py-2.5 border-r border-gray-200 flex items-center gap-2">
                  <Avatar profile={task.assignee} size="xs" />
                  <span className="text-xs text-gray-800 truncate" title={task.name}>{task.name}</span>
                </div>

                {/* Barra Gantt */}
                <div className="flex-1 flex relative items-center" style={{ height: '40px' }}>
                  {days.map((d, i) => (
                    <div
                      key={i}
                      className={cn(
                        'w-9 h-full flex-shrink-0 border-r border-gray-100',
                        isToday(d) ? 'bg-blue-50/40' : '',
                        d.getDay() === 0 || d.getDay() === 6 ? 'bg-gray-50/60' : ''
                      )}
                    />
                  ))}

                  {visible && (
                    <div
                      className={cn(
                        'absolute h-6 rounded-full flex items-center px-2 text-white text-xs font-medium shadow-sm',
                        STATUS_BAR[task.status]
                      )}
                      style={{
                        left: `${clampedStart * 36 + 2}px`,
                        width: `${Math.max(1, clampedEnd - clampedStart) * 36 - 4}px`,
                      }}
                      title={`${task.name}: ${format(start, 'd MMM', { locale: es })} → ${format(end, 'd MMM', { locale: es })}`}
                    >
                      <span className="truncate">{task.name}</span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Leyenda */}
      <div className="flex items-center gap-4 px-4 py-2 border-t border-gray-100 bg-gray-50">
        {[
          { color: 'bg-gray-400', label: 'Pendiente' },
          { color: 'bg-blue-500', label: 'En proceso' },
          { color: 'bg-red-500', label: 'Bloqueado' },
          { color: 'bg-green-500', label: 'Completado' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5 text-xs text-gray-500">
            <div className={cn('w-3 h-3 rounded-full', color)} />
            {label}
          </div>
        ))}
      </div>
    </div>
  )
}
