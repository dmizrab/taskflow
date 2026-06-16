'use client'
import { useState } from 'react'
import { Plus, Loader2, FolderOpen } from 'lucide-react'
import { useProjects } from '@/hooks/useProjects'
import { ProjectCard } from '@/components/projects/ProjectCard'
import { CreateProjectModal } from '@/components/projects/CreateProjectModal'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/hooks/useAuth'

export default function ProjectsPage() {
  const { data: projects = [], isLoading } = useProjects()
  const { profile } = useAuth()
  const [showCreate, setShowCreate] = useState(false)
  const canCreate = profile?.role === 'admin' || profile?.role === 'manager'

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Proyectos</h1>
          <p className="text-gray-500 mt-0.5">{projects.length} proyecto{projects.length !== 1 ? 's' : ''} activo{projects.length !== 1 ? 's' : ''}</p>
        </div>
        {canCreate && (
          <Button onClick={() => setShowCreate(true)}>
            <Plus className="w-4 h-4" />
            Nuevo proyecto
          </Button>
        )}
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-20">
          <FolderOpen className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h2 className="text-lg font-medium text-gray-500 mb-1">Sin proyectos</h2>
          <p className="text-gray-400 text-sm mb-4">
            {canCreate ? 'Crea tu primer proyecto para comenzar' : 'Aún no tienes proyectos asignados'}
          </p>
          {canCreate && (
            <Button onClick={() => setShowCreate(true)}>
              <Plus className="w-4 h-4" /> Crear primer proyecto
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}

      <CreateProjectModal open={showCreate} onClose={() => setShowCreate(false)} />
    </div>
  )
}
