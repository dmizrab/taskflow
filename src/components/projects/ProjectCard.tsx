import Link from 'next/link'
import { MoreHorizontal, Users, CheckSquare } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import type { Project } from '@/types'

interface ProjectCardProps {
  project: Project
}

export function ProjectCard({ project }: ProjectCardProps) {
  const tasks = project.tasks ?? []
  const completed = tasks.filter(t => t.status === 'completed').length
  const total = tasks.length
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0
  const memberCount = project.members?.length ?? 0

  return (
    <Link href={`/projects/${project.id}`}>
      <div className="group bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all p-5 cursor-pointer">
        {/* Color bar */}
        <div
          className="w-full h-1.5 rounded-full mb-4"
          style={{ backgroundColor: project.color }}
        />

        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
              {project.name}
            </h3>
            {project.description && (
              <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{project.description}</p>
            )}
          </div>
        </div>

        {/* Progress */}
        {total > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span>{completed}/{total} tareas</span>
              <span className="font-medium">{pct}%</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${pct}%`, backgroundColor: project.color }}
              />
            </div>
          </div>
        )}

        {total === 0 && (
          <div className="mb-4 text-xs text-gray-400 flex items-center gap-1">
            <CheckSquare className="w-3.5 h-3.5" />
            Sin tareas todavía
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex -space-x-2">
            {(project.members ?? []).slice(0, 4).map((m) => (
              <Avatar key={m.user_id} profile={m.profile} size="xs" className="ring-2 ring-white" />
            ))}
            {memberCount > 4 && (
              <div className="w-6 h-6 rounded-full bg-gray-200 ring-2 ring-white flex items-center justify-center text-xs text-gray-600 font-medium">
                +{memberCount - 4}
              </div>
            )}
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Users className="w-3.5 h-3.5" />
            {memberCount}
          </div>
        </div>
      </div>
    </Link>
  )
}
