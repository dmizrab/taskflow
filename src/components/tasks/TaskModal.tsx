'use client'
import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { StatusBadge, PriorityBadge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { useTask, useUpdateTask, useAddComment } from '@/hooks/useTasks'
import { formatDate, isOverdue, STATUS_LABELS, PRIORITY_LABELS } from '@/lib/utils'
import { Clock, Send, History } from 'lucide-react'
import type { Task, Profile, TaskStatus, TaskPriority } from '@/types'

interface TaskModalProps {
  task: Task
  members: Profile[]
  open: boolean
  onClose: () => void
  canEdit: boolean
}

const HISTORY_FIELD_LABELS: Record<string, string> = {
  status: 'Estado',
  priority: 'Prioridad',
  assignee_id: 'Responsable',
  due_date: 'Fecha límite',
}

export function TaskModal({ task: initialTask, members, open, onClose, canEdit }: TaskModalProps) {
  const { data: task = initialTask } = useTask(initialTask.id)
  const updateTask = useUpdateTask()
  const addComment = useAddComment()
  const [comment, setComment] = useState('')
  const [activeTab, setActiveTab] = useState<'details' | 'history'>('details')

  const handleUpdate = (field: keyof Task, value: unknown) => {
    updateTask.mutate({ id: task.id, [field]: value })
  }

  const handleComment = async () => {
    if (!comment.trim()) return
    await addComment.mutateAsync({ taskId: task.id, content: comment.trim() })
    setComment('')
  }

  const statusOptions = ['pending', 'in_progress', 'blocked', 'completed'] as TaskStatus[]
  const priorityOptions = ['low', 'medium', 'high', 'urgent'] as TaskPriority[]

  return (
    <Modal open={open} onClose={onClose} title={task.name} size="xl">
      <div className="grid grid-cols-3 gap-6">
        {/* Contenido principal */}
        <div className="col-span-2 space-y-5">
          {/* Descripción */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Descripción</label>
            {canEdit ? (
              <textarea
                defaultValue={task.description ?? ''}
                rows={4}
                placeholder="Agrega una descripción..."
                onBlur={(e) => {
                  if (e.target.value !== task.description) {
                    handleUpdate('description', e.target.value || null)
                  }
                }}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
              />
            ) : (
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {task.description || <span className="text-gray-400">Sin descripción</span>}
              </p>
            )}
          </div>

          {/* Tabs */}
          <div>
            <div className="flex gap-4 border-b border-gray-200 mb-4">
              {(['details', 'history'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab === 'details' ? 'Comentarios' : 'Historial'}
                </button>
              ))}
            </div>

            {activeTab === 'details' && (
              <div className="space-y-4">
                {/* Comentarios */}
                {(task.comments ?? []).map((c) => (
                  <div key={c.id} className="flex gap-3">
                    <Avatar profile={c.user} size="xs" className="mt-0.5 flex-shrink-0" />
                    <div className="flex-1 bg-gray-50 rounded-lg px-3 py-2">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-gray-700">{c.user?.full_name}</span>
                        <span className="text-xs text-gray-400">{formatDate(c.created_at, 'dd MMM, HH:mm')}</span>
                      </div>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{c.content}</p>
                    </div>
                  </div>
                ))}
                {(task.comments ?? []).length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-4">Sin comentarios aún</p>
                )}

                {/* Input comentario */}
                <div className="flex gap-2 pt-2">
                  <input
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Escribe un comentario..."
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleComment() } }}
                  />
                  <Button size="sm" onClick={handleComment} loading={addComment.isPending} disabled={!comment.trim()}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div className="space-y-3">
                {(task.history ?? []).length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-4">Sin historial</p>
                )}
                {(task.history ?? []).map((h) => (
                  <div key={h.id} className="flex items-start gap-3 text-sm">
                    <History className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-gray-700">
                        <span className="font-medium">{h.user?.full_name ?? 'Sistema'}</span>
                        {' cambió '}
                        <span className="font-medium">{HISTORY_FIELD_LABELS[h.field] ?? h.field}</span>
                        {h.old_value && (
                          <span className="text-gray-500"> de &ldquo;{h.old_value}&rdquo;</span>
                        )}
                        {h.new_value && (
                          <span> a <span className="text-blue-600">&ldquo;{h.new_value}&rdquo;</span></span>
                        )}
                      </span>
                      <p className="text-xs text-gray-400 mt-0.5">{formatDate(h.created_at, 'dd MMM yyyy, HH:mm')}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar de propiedades */}
        <div className="space-y-5">
          {/* Estado */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Estado</label>
            {canEdit ? (
              <select
                value={task.status}
                onChange={(e) => handleUpdate('status', e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {statusOptions.map(s => (
                  <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                ))}
              </select>
            ) : (
              <StatusBadge status={task.status} />
            )}
          </div>

          {/* Prioridad */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Prioridad</label>
            {canEdit ? (
              <select
                value={task.priority}
                onChange={(e) => handleUpdate('priority', e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {priorityOptions.map(p => (
                  <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>
                ))}
              </select>
            ) : (
              <PriorityBadge priority={task.priority} />
            )}
          </div>

          {/* Responsable */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Responsable</label>
            {canEdit ? (
              <select
                value={task.assignee_id ?? ''}
                onChange={(e) => handleUpdate('assignee_id', e.target.value || null)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Sin asignar</option>
                {members.map(m => (
                  <option key={m.id} value={m.id}>{m.full_name}</option>
                ))}
              </select>
            ) : (
              task.assignee ? (
                <div className="flex items-center gap-2">
                  <Avatar profile={task.assignee} size="xs" />
                  <span className="text-sm text-gray-700">{task.assignee.full_name}</span>
                </div>
              ) : (
                <span className="text-sm text-gray-400">Sin asignar</span>
              )
            )}
          </div>

          {/* Fecha límite */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Fecha límite</label>
            {canEdit ? (
              <input
                type="date"
                value={task.due_date ?? ''}
                onChange={(e) => handleUpdate('due_date', e.target.value || null)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            ) : (
              <div className={`flex items-center gap-1.5 text-sm ${isOverdue(task.due_date) ? 'text-red-600' : 'text-gray-700'}`}>
                <Clock className="w-4 h-4" />
                {formatDate(task.due_date)}
                {isOverdue(task.due_date) && task.status !== 'completed' && (
                  <span className="text-xs text-red-500 font-medium">(Vencida)</span>
                )}
              </div>
            )}
          </div>

          {/* Metadatos */}
          <div className="pt-3 border-t border-gray-100 space-y-2 text-xs text-gray-400">
            <div>Creada por: <span className="text-gray-600">{task.creator?.full_name ?? '—'}</span></div>
            <div>Creada: <span className="text-gray-600">{formatDate(task.created_at)}</span></div>
            <div>Actualizada: <span className="text-gray-600">{formatDate(task.updated_at)}</span></div>
          </div>
        </div>
      </div>
    </Modal>
  )
}
