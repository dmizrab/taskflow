'use client'
import { useProjects } from '@/hooks/useProjects'
import { StatsPanel } from '@/components/dashboard/StatsPanel'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase/client'
import { useQuery } from '@tanstack/react-query'
import type { Profile, Task } from '@/types'
import { Loader2 } from 'lucide-react'

export default function DashboardPage() {
  const { profile } = useAuth()
  const supabase = createClient()
  const { data: projects = [], isLoading: loadingProjects } = useProjects()

  const { data: members = [] } = useQuery({
    queryKey: ['members-all'],
    queryFn: async () => {
      const { data, error } = await supabase.from('profiles').select('*').order('full_name')
      if (error) throw error
      return data as Profile[]
    },
  })

  const { data: allTasks = [], isLoading: loadingTasks } = useQuery({
    queryKey: ['tasks-all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*, assignee:profiles!tasks_assignee_id_fkey(id, full_name, email, avatar_url, role)')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as Task[]
    },
  })

  if (loadingProjects || loadingTasks) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Hola, {profile?.full_name?.split(' ')[0] ?? 'equipo'} 👋
        </h1>
        <p className="text-gray-500 mt-1">Resumen general de todos los proyectos</p>
      </div>
      <StatsPanel projects={projects} allTasks={allTasks} members={members} />
    </div>
  )
}
