'use client'
import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Plus, ArrowLeft, Loader2, Trash2 } from 'lucide-react'
import { useProject, useDeleteProject } from '@/hooks/useProjects'
import { useTasks } from '@/hooks/useTasks'
import { TaskTable } from '@/components/tasks/TaskTable'
import { TaskFiltersBar } from '@/components/tasks/TaskFilters'
import { CreateTaskModal } from '@/components/tasks/CreateTaskModal'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase/client'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import type { TaskFilters, Profile } from '@/types'

const supabase = createClient()

export default function ProjectPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string
  const { profile } = useAuth()
  const [filters, setFilters] = useState<TaskFilters>({})
  const [showCreate, setShowCreate] = useState(false)

  const { data: project, isLoading: loadingProject } = useProject(projectId)
  const { data: tasks = [], isLoading: loadingTasks } = useTasks(projectId, filters)
  const deleteProject = useDeleteProject()

  // Cargar miembros del proyecto
  const { data: projectMembers = [] } = useQuery({
    queryKey: ['project-members', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_members')
        .select('*, profile:profiles(*)')
        .eq('project_id', projectId)
      if (error) throw error
      return data.map((m: { profile: Profile }) => m.profile) as Profile[]
    },
    enabled: !!projectId,
  })

  const userRole = profile?.role ?? 'member'
  const canEdit = userRole === 'admin' || userRole === 'manager'
  const canDelete = userRole === 'admin' || project?.owner_id === profile?.id

  // Estadísticas rápidas
  const allTasks = tasks
  const stats = {
    total: allTasks.length,
    completed: allTasks.filter(t => t.status === 'completed').length,
    blocked: allTasks.filter(t => t.status === 'blocked').length,
    in_progress: allTasks.filter(t => t.status === 'in_progress').length,
  }
  const pct = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0

  if (loadingProject) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    )
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <p className="text-gray-500">Proyecto no encontrado</p>
        <Button variant="secondary" onClick={() => router.push('/projects')}>
          <ArrowLeft className="w-4 h-4" /> Volver a proyectos
        </Button>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-start gap-4">
          <Link href="/projects" className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors mt-0.5">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: project.color }} />
              <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
            </div>
            {project.description && (
              <p className="text-gray-500 text-sm">{project.description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {canEdit && (
            <Button onClick={() => setShowCreate(true)}>
              <Plus className="w-4 h-4" />
              Nueva tarea
            </Button>
          )}
          {canDelete && (
            <Button
              variant="ghost"
              size="sm"
              className="text-red-500 hover:text-red-600 hover:bg-red-50"
              onClick={() => {
                if (confirm(`¿Eliminar el proyecto "${project.name}"? Esto eliminará todas sus tareas.`)) {
                  deleteProject.mutate(project.id)
                  router.push('/projects')
                }
              }}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Stats rápidas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total', value: stats.total, color: 'text-gray-700', bg: 'bg-gray-50' },
          { label: 'En proceso', value: stats.in_progress, color: 'text-blue-700', bg: 'bg-blue-50' },
          { label: 'Bloqueadas', value: stats.blocked, color: 'text-red-700', bg: 'bg-red-50' },
          { label: `Completado ${pct}%`, value: stats.completed, color: 'text-green-700', bg: 'bg-green-50' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl border border-gray-200 px-4 py-3 ${s.bg}`}>
            <p className="text-xs text-gray-500">{s.label}</p>
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Barra de progreso */}
      {stats.total > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
            <span>Progreso del proyecto</span>
            <span className="font-medium">{pct}% completado</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${pct}%`, backgroundColor: project.color }}
            />
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="mb-4">
        <TaskFiltersBar filters={filters} onChange={setFilters} members={projectMembers} />
      </div>

      {/* Tabla de tareas */}
      {loadingTasks ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
        </div>
      ) : (
        <TaskTable
          tasks={tasks}
          projectId={projectId}
          members={projectMembers}
          filters={filters}
          currentUserId={profile?.id ?? ''}
          userRole={userRole}
        />
      )}

      <CreateTaskModal
        projectId={projectId}
        members={projectMembers}
        open={showCreate}
        onClose={() => setShowCreate(false)}
      />
    </div>
  )
}
