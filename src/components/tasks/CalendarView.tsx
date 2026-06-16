'use client'
import { useState } from 'react'
import { addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, format, isSameMonth, isSameDay, isToday, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Task } from '@/types'

interface CalendarViewProps {
  tasks: Task[]
  projectId: string
}

const STATUS_DOT: Record<string, string> = {
  pending: 'bg-gray-400',
  in_progress: 'bg-blue-500',
  blocked: 'bg-red-500',
  completed: 'bg-green-500',
}

export function CalendarView({ tasks }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })

  const weeks: Date[][] = []
  let day = calStart
  while (day <= calEnd) {
    const week: Date[] = []
    for (let i = 0; i < 7; i++) {
      week.push(day)
      day = addDays(day, 1)
    }
    weeks.push(week)
  }

  const tasksByDate = tasks.reduce((acc, task) => {
    if (task.due_date) {
      const key = task.due_date.split('T')[0]
      if (!acc[key]) acc[key] = []
      acc[key].push(task)
    }
    return acc
  }, {} as Record<string, Task[]>)

  const selectedTasks = selectedDay
    ? (tasksByDate[format(selectedDay, 'yyyy-MM-dd')] ?? [])
    : []

  const dayNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Navegación */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
        <button onClick={() => setCurrentMonth(m => subMonths(m, 1))} className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors">
          <ChevronLeft className="w-4 h-4 text-gray-600" />
        </button>
        <span className="text-sm font-semibold text-gray-700 capitalize">
          {format(currentMonth, 'MMMM yyyy', { locale: es })}
        </span>
        <button onClick={() => setCurrentMonth(m => addMonths(m, 1))} className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors">
          <ChevronRight className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
        {dayNames.map(d => (
          <div key={d} className="text-center text-xs font-semibold text-gray-500 py-2">{d}</div>
        ))}
      </div>

      {/* Grid de días */}
      <div className="grid grid-cols-7">
        {weeks.flat().map((day, idx) => {
          const key = format(day, 'yyyy-MM-dd')
          const dayTasks = tasksByDate[key] ?? []
          const isCurrentMonth = isSameMonth(day, currentMonth)
          const isSel = selectedDay && isSameDay(day, selectedDay)
          const isTodayDay = isToday(day)
          const maxShow = 2

          return (
            <div
              key={idx}
              onClick={() => setSelectedDay(isSel ? null : day)}
              className={cn(
                'min-h-[88px] p-1.5 border-b border-r border-gray-100 cursor-pointer transition-colors',
                !isCurrentMonth ? 'bg-gray-50/60' : 'hover:bg-blue-50/30',
                isSel ? 'bg-blue-50 ring-2 ring-blue-400 ring-inset' : ''
              )}
            >
              <div className={cn(
                'text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full mb-1',
                isTodayDay ? 'bg-blue-600 text-white' : isCurrentMonth ? 'text-gray-700' : 'text-gray-300'
              )}>
                {format(day, 'd')}
              </div>

              <div className="space-y-0.5">
                {dayTasks.slice(0, maxShow).map(task => (
                  <div
                    key={task.id}
                    className={cn(
                      'text-xs px-1.5 py-0.5 rounded text-white truncate',
                      STATUS_DOT[task.status]
                    )}
                    title={task.name}
                  >
                    {task.name}
                  </div>
                ))}
                {dayTasks.length > maxShow && (
                  <div className="text-xs text-gray-400 px-1">+{dayTasks.length - maxShow} más</div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Panel de tareas del día seleccionado */}
      {selectedDay && (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <p className="text-sm font-semibold text-gray-700 mb-3 capitalize">
            {format(selectedDay, "EEEE d 'de' MMMM", { locale: es })}
            <span className="ml-2 text-gray-400 font-normal">({selectedTasks.length} tareas)</span>
          </p>
          {selectedTasks.length === 0 ? (
            <p className="text-sm text-gray-400">Sin tareas para este día</p>
          ) : (
            <div className="space-y-2">
              {selectedTasks.map(task => (
                <div key={task.id} className="flex items-center gap-3 bg-white rounded-lg px-3 py-2 border border-gray-200">
                  <div className={cn('w-2 h-2 rounded-full flex-shrink-0', STATUS_DOT[task.status])} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{task.name}</p>
                    {task.assignee && (
                      <p className="text-xs text-gray-400">{task.assignee.full_name}</p>
                    )}
                  </div>
                  <span className={cn(
                    'text-xs px-2 py-0.5 rounded-full',
                    task.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                    task.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                    task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-600'
                  )}>
                    {task.priority === 'urgent' ? 'Urgente' : task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Media' : 'Baja'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
