'use client'
import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { useCreateTask } from '@/hooks/useTasks'
import type { Profile, TaskStatus, TaskPriority } from '@/types'
import { STATUS_LABELS, PRIORITY_LABELS } from '@/lib/utils'

interface CreateTaskModalProps {
  projectId: string
  members: Profile[]
  open: boolean
  onClose: () => void
}

export function CreateTaskModal({ projectId, members, open, onClose }: CreateTaskModalProps) {
  const createTask = useCreateTask()
  const [form, setForm] = useState({
    name: '',
    description: '',
    assignee_id: '',
    status: 'pending' as TaskStatus,
    priority: 'medium' as TaskPriority,
    due_date: '',
    target_count: '',
  })
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) { setError('El nombre es requerido'); return }

    await createTask.mutateAsync({
      project_id: projectId,
      name: form.name.trim(),
      description: form.description || null,
      assignee_id: form.assignee_id || null,
      status: form.status,
      priority: form.priority,
      due_date: form.due_date || null,
      target_count: form.target_count ? parseInt(form.target_count) : null,
      done_count: 0,
    })
    onClose()
  }

  const statusOptions = (['pending', 'in_progress', 'blocked', 'completed'] as TaskStatus[])
    .map(s => ({ value: s, label: STATUS_LABELS[s] }))
  const priorityOptions = (['low', 'medium', 'high', 'urgent'] as TaskPriority[])
    .map(p => ({ value: p, label: PRIORITY_LABELS[p] }))
  const memberOptions = [
    { value: '', label: 'Sin asignar' },
    ...members.map(m => ({ value: m.id, label: m.full_name })),
  ]

  return (
    <Modal open={open} onClose={onClose} title="Nueva tarea">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nombre de la tarea *"
          value={form.name}
          onChange={(e) => { setForm(f => ({ ...f, name: e.target.value })); setError('') }}
          error={error}
          placeholder="Ej: Diseñar pantalla de login"
          autoFocus
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
            rows={3}
            placeholder="Descripción opcional..."
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Responsable"
            options={memberOptions}
            value={form.assignee_id}
            onChange={(e) => setForm(f => ({ ...f, assignee_id: e.target.value }))}
          />
          <Input
            label="Fecha límite"
            type="date"
            value={form.due_date}
            onChange={(e) => setForm(f => ({ ...f, due_date: e.target.value }))}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Estado"
            options={statusOptions}
            value={form.status}
            onChange={(e) => setForm(f => ({ ...f, status: e.target.value as TaskStatus }))}
          />
          <Select
            label="Prioridad"
            options={priorityOptions}
            value={form.priority}
            onChange={(e) => setForm(f => ({ ...f, priority: e.target.value as TaskPriority }))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Meta de unidades <span className="text-gray-400 font-normal">(opcional)</span></label>
          <input
            type="number"
            min="0"
            value={form.target_count}
            onChange={(e) => setForm(f => ({ ...f, target_count: e.target.value }))}
            placeholder="Ej: 50 depósitos, 200 llamadas..."
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" loading={createTask.isPending}>Crear tarea</Button>
        </div>
      </form>
    </Modal>
  )
}
