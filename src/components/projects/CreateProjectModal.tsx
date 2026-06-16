'use client'
import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useCreateProject } from '@/hooks/useProjects'

interface CreateProjectModalProps {
  open: boolean
  onClose: () => void
}

const COLORS = [
  '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b',
  '#ef4444', '#06b6d4', '#ec4899', '#6366f1',
]

export function CreateProjectModal({ open, onClose }: CreateProjectModalProps) {
  const createProject = useCreateProject()
  const [form, setForm] = useState({ name: '', description: '', color: '#3b82f6' })
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) { setError('El nombre es requerido'); return }
    await createProject.mutateAsync(form)
    onClose()
    setForm({ name: '', description: '', color: '#3b82f6' })
  }

  return (
    <Modal open={open} onClose={onClose} title="Nuevo proyecto">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nombre del proyecto *"
          value={form.name}
          onChange={(e) => { setForm(f => ({ ...f, name: e.target.value })); setError('') }}
          error={error}
          placeholder="Ej: Lanzamiento Q3"
          autoFocus
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
            rows={2}
            placeholder="Descripción opcional..."
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
          <div className="flex gap-2 flex-wrap">
            {COLORS.map(color => (
              <button
                key={color}
                type="button"
                onClick={() => setForm(f => ({ ...f, color }))}
                className={`w-8 h-8 rounded-full transition-transform hover:scale-110 ${
                  form.color === color ? 'ring-2 ring-offset-2 ring-gray-600 scale-110' : ''
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" loading={createProject.isPending}>Crear proyecto</Button>
        </div>
      </form>
    </Modal>
  )
}
