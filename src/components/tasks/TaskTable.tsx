'use client'
import { useState } from 'react'
import { Plus, Trash2, MessageSquare, Paperclip } from 'lucide-react'
import { StatusBadge, PriorityBadge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { TaskModal } from './TaskModal'
import { CreateTaskModal } from './CreateTaskModal'
import { useUpdateTask, useDeleteTask } from '@/hooks/useTasks'
import { formatDate, isOverdue, isDueToday, STATUS_LABELS, PRIORITY_LABELS, cn } from '@/lib/utils'
import type { Task, Profile, TaskStatus, TaskPriority, TaskFilters } from '@/types'

interface TaskTableProps {
  tasks: Task[]
  projectId: string
  members: Profile[]
  filters: TaskFilters
  currentUserId: string
  userRole: string
}

export function TaskTable({ tasks, projectId, members, filters, currentUserId, userRole }: TaskTableProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingCell, setEditingCell] = useState<{ taskId: string; field: string } | null>(null)
  const updateTask = useUpdateTask()
  const deleteTask = useDeleteTask()

  const canEdit = userRole === 'admin' || userRole === 'manager'

  const handleStatusChange = (task: Task, status: TaskStatus) => {
    updateTask.mutate({ id: task.id, status })
    setEditingCell(null)
  }

  const handlePriorityChange = (task: Task, priority: TaskPriority) => {
    updateTask.mutate({ id: task.id, priority })
    setEditingCell(null)
  }

  const handleAssigneeChange = (task: Task, assigneeId: string) => {
    updateTask.mutate({ id: task.id, assignee_id: assigneeId || null })
    setEditingCell(null)
  }

  const handleNameEdit = (task: Task, name: string) => {
    if (name.trim() && name !== task.name) {
      updateTask.mutate({ id: task.id, name: name.trim() })
    }
    setEditingCell(null)
  }

  const handleDueDateChange = (task: Task, date: string) => {
    updateTask.mutate({ id: task.id, due_date: date || null })
    setEditingCell(null)
  }

  const isEditing = (taskId: string, field: string) =>
    editingCell?.taskId === taskId && editingCell?.field === field

  if (tasks.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-gray-300 text-6xl mb-4">📋</div>
        <p className="text-gray-500 font-medium mb-1">No hay tareas</p>
        <p className="text-gray-400 text-sm mb-4">
          {Object.values(filters).some(v => v && v !== 'all')
            ? 'Intenta cambiar los filtros'
            : 'Crea la primera tarea del proyecto'}
        </p>
        {canEdit && (
          <Button size="sm" onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4" /> Nueva tarea
          </Button>
        )}
      </div>
    )
  }

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3 font-medium text-gray-600 min-w-[280px]">Tarea</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600 w-36">Responsable</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600 w-36">Estado</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600 w-28">Prioridad</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600 w-32">Fecha límite</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600 w-16">Info</th>
              <th className="w-10 px-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {tasks.map((task) => {
              const overdue = isOverdue(task.due_date) && task.status !== 'completed'
              const today = isDueToday(task.due_date)

              return (
                <tr key={task.id} className="group hover:bg-blue-50/30 transition-colors">
                  {/* Nombre */}
                  <td className="px-4 py-3">
                    {isEditing(task.id, 'name') ? (
                      <input
                        autoFocus
                        defaultValue={task.name}
                        className="w-full rounded-md border border-blue-400 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        onBlur={(e) => handleNameEdit(task, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleNameEdit(task, e.currentTarget.value)
                          if (e.key === 'Escape') setEditingCell(null)
                        }}
                      />
                    ) : (
                      <div
                        className={cn(
                          'cursor-pointer hover:text-blue-600 font-medium text-gray-900 truncate max-w-xs',
                          task.status === 'completed' && 'line-through text-gray-400'
                        )}
                        onClick={() => setSelectedTask(task)}
                        onDoubleClick={() => canEdit && setEditingCell({ taskId: task.id, field: 'name' })}
                      >
                        {task.name}
                      </div>
                    )}
                  </td>

                  {/* Responsable */}
                  <td className="px-4 py-3">
                    {isEditing(task.id, 'assignee') ? (
                      <select
                        autoFocus
                        defaultValue={task.assignee_id ?? ''}
                        className="w-full rounded-md border border-blue-400 px-2 py-1 text-xs focus:outline-none"
                        onBlur={(e) => handleAssigneeChange(task, e.target.value)}
                        onChange={(e) => handleAssigneeChange(task, e.target.value)}
                      >
                        <option value="">Sin asignar</option>
                        {members.map((m) => (
                          <option key={m.id} value={m.id}>{m.full_name}</option>
                        ))}
                      </select>
                    ) : (
                      <div
                        className={cn('flex items-center gap-2 cursor-pointer', canEdit && 'hover:opacity-80')}
                        onClick={() => canEdit && setEditingCell({ taskId: task.id, field: 'assignee' })}
                      >
                        {task.assignee ? (
                          <>
                            <Avatar profile={task.assignee} size="xs" />
                            <span className="text-gray-700 text-xs truncate">{task.assignee.full_name}</span>
                          </>
                        ) : (
                          <span className="text-gray-400 text-xs">Sin asignar</span>
                        )}
                      </div>
                    )}
                  </td>

                  {/* Estado */}
                  <td className="px-4 py-3">
                    {isEditing(task.id, 'status') ? (
                      <select
                        autoFocus
                        defaultValue={task.status}
                        className="w-full rounded-md border border-blue-400 px-2 py-1 text-xs focus:outline-none"
                        onBlur={(e) => handleStatusChange(task, e.target.value as TaskStatus)}
                        onChange={(e) => handleStatusChange(task, e.target.value as TaskStatus)}
                      >
                        {(['pending', 'in_progress', 'blocked', 'completed'] as TaskStatus[]).map(s => (
                          <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                        ))}
                      </select>
                    ) : (
                      <div
                        className={cn('cursor-pointer', canEdit && 'hover:opacity-80')}
                        onClick={() => canEdit && setEditingCell({ taskId: task.id, field: 'status' })}
                      >
                        <StatusBadge status={task.status} />
                      </div>
                    )}
                  </td>

                  {/* Prioridad */}
                  <td className="px-4 py-3">
                    {isEditing(task.id, 'priority') ? (
                      <select
                        autoFocus
                        defaultValue={task.priority}
                        className="w-full rounded-md border border-blue-400 px-2 py-1 text-xs focus:outline-none"
                        onBlur={(e) => handlePriorityChange(task, e.target.value as TaskPriority)}
                        onChange={(e) => handlePriorityChange(task, e.target.value as TaskPriority)}
                      >
                        {(['low', 'medium', 'high', 'urgent'] as TaskPriority[]).map(p => (
                          <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>
                        ))}
                      </select>
                    ) : (
                      <div
                        className={cn('cursor-pointer', canEdit && 'hover:opacity-80')}
                        onClick={() => canEdit && setEditingCell({ taskId: task.id, field: 'priority' })}
                      >
                        <PriorityBadge priority={task.priority} />
                      </div>
                    )}
                  </td>

                  {/* Fecha */}
                  <td className="px-4 py-3">
                    {isEditing(task.id, 'due_date') ? (
                      <input
                        autoFocus
                        type="date"
                        defaultValue={task.due_date ?? ''}
                        className="w-full rounded-md border border-blue-400 px-2 py-1 text-xs focus:outline-none"
                        onBlur={(e) => handleDueDateChange(task, e.target.value)}
                        onChange={(e) => handleDueDateChange(task, e.target.value)}
                      />
                    ) : (
                      <div
                        className={cn(
                          'text-xs cursor-pointer',
                          canEdit && 'hover:text-blue-600',
                          overdue && 'text-red-600 font-semibold',
                          today && 'text-orange-600 font-semibold',
                          !overdue && !today && 'text-gray-500'
                        )}
                        onClick={() => canEdit && setEditingCell({ taskId: task.id, field: 'due_date' })}
                      >
                        {task.due_date ? (
                          <>
                            {formatDate(task.due_date)}
                            {overdue && <span className="ml-1 text-red-500">⚠</span>}
                            {today && <span className="ml-1">📅</span>}
                          </>
                        ) : (
                          <span className="text-gray-300">Sin fecha</span>
                        )}
                      </div>
                    )}
                  </td>

                  {/* Info */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 text-gray-400">
                      {(task.comments?.length ?? 0) > 0 && (
                        <span className="flex items-center gap-0.5 text-xs">
                          <MessageSquare className="w-3 h-3" />
                          {task.comments!.length}
                        </span>
                      )}
                      {(task.attachments?.length ?? 0) > 0 && (
                        <span className="flex items-center gap-0.5 text-xs">
                          <Paperclip className="w-3 h-3" />
                          {task.attachments!.length}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Acciones */}
                  <td className="px-2 py-3">
                    {canEdit && (
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          className="p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                          onClick={() => {
                            if (confirm('¿Eliminar esta tarea?')) {
                              deleteTask.mutate({ id: task.id, projectId })
                            }
                          }}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {/* Row para agregar tarea */}
        {canEdit && (
          <div
            className="flex items-center gap-2 px-4 py-3 border-t border-gray-100 text-gray-400 hover:text-blue-600 hover:bg-blue-50/30 cursor-pointer transition-colors"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm">Agregar tarea</span>
          </div>
        )}
      </div>

      {/* Modal detalle de tarea */}
      {selectedTask && (
        <TaskModal
          task={selectedTask}
          members={members}
          open={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          canEdit={canEdit || selectedTask.assignee_id === currentUserId}
        />
      )}

      {/* Modal crear tarea */}
      {showCreateModal && (
        <CreateTaskModal
          projectId={projectId}
          members={members}
          open={showCreateModal}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </>
  )
}
