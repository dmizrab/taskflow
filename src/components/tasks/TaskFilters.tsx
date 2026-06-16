'use client'
import { Search, X } from 'lucide-react'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { STATUS_LABELS, PRIORITY_LABELS } from '@/lib/utils'
import type { TaskFilters, Profile, TaskStatus, TaskPriority } from '@/types'

interface TaskFiltersProps {
  filters: TaskFilters
  onChange: (filters: TaskFilters) => void
  members: Profile[]
}

export function TaskFiltersBar({ filters, onChange, members }: TaskFiltersProps) {
  const hasFilters = Object.entries(filters).some(([k, v]) => k !== 'search' && v && v !== 'all') || !!filters.search

  const statusOptions = [
    { value: 'all', label: 'Todos los estados' },
    ...(['pending', 'in_progress', 'blocked', 'completed'] as TaskStatus[]).map(s => ({ value: s, label: STATUS_LABELS[s] })),
  ]
  const priorityOptions = [
    { value: 'all', label: 'Todas las prioridades' },
    ...(['low', 'medium', 'high', 'urgent'] as TaskPriority[]).map(p => ({ value: p, label: PRIORITY_LABELS[p] })),
  ]
  const assigneeOptions = [
    { value: 'all', label: 'Todos los responsables' },
    ...members.map(m => ({ value: m.id, label: m.full_name })),
  ]
  const dueDateOptions = [
    { value: 'all', label: 'Cualquier fecha' },
    { value: 'overdue', label: 'Vencidas' },
    { value: 'today', label: 'Hoy' },
    { value: 'week', label: 'Esta semana' },
  ]

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Búsqueda */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={filters.search ?? ''}
          onChange={(e) => onChange({ ...filters, search: e.target.value || undefined })}
          placeholder="Buscar tareas..."
          className="pl-9 pr-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 w-48"
        />
      </div>

      <Select
        options={statusOptions}
        value={filters.status ?? 'all'}
        onChange={(e) => onChange({ ...filters, status: e.target.value as TaskStatus | 'all' })}
        className="w-40"
      />

      <Select
        options={priorityOptions}
        value={filters.priority ?? 'all'}
        onChange={(e) => onChange({ ...filters, priority: e.target.value as TaskPriority | 'all' })}
        className="w-44"
      />

      <Select
        options={assigneeOptions}
        value={filters.assignee_id ?? 'all'}
        onChange={(e) => onChange({ ...filters, assignee_id: e.target.value })}
        className="w-48"
      />

      <Select
        options={dueDateOptions}
        value={filters.due_date ?? 'all'}
        onChange={(e) => onChange({ ...filters, due_date: e.target.value as TaskFilters['due_date'] })}
        className="w-36"
      />

      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onChange({})}
          className="text-gray-500"
        >
          <X className="w-3.5 h-3.5" />
          Limpiar
        </Button>
      )}
    </div>
  )
}
