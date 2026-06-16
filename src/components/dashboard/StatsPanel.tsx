'use client'
import { AlertTriangle, Ban, Users, TrendingUp } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { StatusBadge } from '@/components/ui/Badge'
import { formatDate, isOverdue } from '@/lib/utils'
import Link from 'next/link'
import type { Project, Task, Profile } from '@/types'

interface StatsPanelProps {
  projects: Project[]
  allTasks: Task[]
  members: Profile[]
}

export function StatsPanel({ projects, allTasks, members }: StatsPanelProps) {
  const overdueTasks = allTasks.filter(t => isOverdue(t.due_date) && t.status !== 'completed')
  const blockedTasks = allTasks.filter(t => t.status === 'blocked')
  const completedTasks = allTasks.filter(t => t.status === 'completed')
  const pct = allTasks.length > 0 ? Math.round((completedTasks.length / allTasks.length) * 100) : 0

  const tasksByAssignee = members.map(m => ({
    profile: m,
    total: allTasks.filter(t => t.assignee_id === m.id).length,
    completed: allTasks.filter(t => t.assignee_id === m.id && t.status === 'completed').length,
  })).filter(x => x.total > 0).sort((a, b) => b.total - a.total)

  const projectStats = projects.map(p => {
    const tasks = allTasks.filter(t => t.project_id === p.id)
    const done = tasks.filter(t => t.status === 'completed').length
    return { project: p, total: tasks.length, done, pct: tasks.length > 0 ? Math.round((done / tasks.length) * 100) : 0 }
  })

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Resumen general */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard
          icon={<AlertTriangle className="w-5 h-5" />}
          label="Vencidas"
          value={overdueTasks.length}
          color="text-red-600"
          bg="bg-red-50"
        />
        <StatCard
          icon={<Ban className="w-5 h-5" />}
          label="Bloqueadas"
          value={blockedTasks.length}
          color="text-orange-600"
          bg="bg-orange-50"
        />
        <StatCard
          icon={<TrendingUp className="w-5 h-5" />}
          label="% Completado"
          value={`${pct}%`}
          color="text-green-600"
          bg="bg-green-50"
        />
        <StatCard
          icon={<Users className="w-5 h-5" />}
          label="Total tareas"
          value={allTasks.length}
          color="text-blue-600"
          bg="bg-blue-50"
        />
      </div>

      {/* Tareas vencidas */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-500" />
          Tareas vencidas ({overdueTasks.length})
        </h3>
        {overdueTasks.length === 0 ? (
          <p className="text-sm text-gray-400">Sin tareas vencidas 🎉</p>
        ) : (
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {overdueTasks.slice(0, 8).map(task => (
              <div key={task.id} className="flex items-center justify-between gap-2 text-sm">
                <span className="text-gray-700 truncate flex-1">{task.name}</span>
                <span className="text-red-500 text-xs flex-shrink-0">{formatDate(task.due_date)}</span>
              </div>
            ))}
            {overdueTasks.length > 8 && (
              <p className="text-xs text-gray-400">+{overdueTasks.length - 8} más</p>
            )}
          </div>
        )}
      </div>

      {/* Tareas por responsable */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Users className="w-4 h-4 text-blue-500" />
          Por responsable
        </h3>
        {tasksByAssignee.length === 0 ? (
          <p className="text-sm text-gray-400">Sin asignaciones aún</p>
        ) : (
          <div className="space-y-3">
            {tasksByAssignee.map(({ profile, total, completed }) => (
              <div key={profile.id} className="flex items-center gap-3">
                <Avatar profile={profile} size="xs" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-700 font-medium truncate">{profile.full_name}</span>
                    <span className="text-gray-500 flex-shrink-0">{completed}/{total}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all"
                      style={{ width: `${total > 0 ? (completed / total) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* % por proyecto */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-green-500" />
          Avance por proyecto
        </h3>
        {projectStats.length === 0 ? (
          <p className="text-sm text-gray-400">Sin proyectos activos</p>
        ) : (
          <div className="space-y-3">
            {projectStats.map(({ project, total, done, pct }) => (
              <Link key={project.id} href={`/projects/${project.id}`} className="block hover:opacity-80 transition-opacity">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-gray-700 font-medium truncate">{project.name}</span>
                  <span className="text-gray-500 flex-shrink-0">{done}/{total} · {pct}%</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${pct}%`, backgroundColor: project.color }}
                  />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, color, bg }: {
  icon: React.ReactNode; label: string; value: string | number; color: string; bg: string
}) {
  return (
    <div className={`rounded-xl border border-gray-200 p-4 flex items-center gap-4 bg-white`}>
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${bg} ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className={`text-2xl font-bold ${color}`}>{value}</p>
      </div>
    </div>
  )
}
