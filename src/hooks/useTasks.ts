'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import type { Task, TaskFilters } from '@/types'
import toast from 'react-hot-toast'
import { isAfter, parseISO } from 'date-fns'

const TASK_SELECT = `
  *,
  assignee:profiles!tasks_assignee_id_fkey(id, full_name, email, avatar_url, role),
  creator:profiles!tasks_created_by_fkey(id, full_name, email, avatar_url, role),
  comments(id, content, created_at, user:profiles(id, full_name, avatar_url)),
  attachments:task_attachments(id, file_name, file_url, file_size, file_type, created_at)
`

export function useTasks(projectId: string, filters?: TaskFilters) {
  const supabase = createClient()
  return useQuery({
    queryKey: ['tasks', projectId, filters],
    queryFn: async () => {
      let query = supabase
        .from('tasks')
        .select(TASK_SELECT)
        .eq('project_id', projectId)
        .order('position', { ascending: true })

      if (filters?.status && filters.status !== 'all') query = query.eq('status', filters.status)
      if (filters?.priority && filters.priority !== 'all') query = query.eq('priority', filters.priority)
      if (filters?.assignee_id && filters.assignee_id !== 'all') query = query.eq('assignee_id', filters.assignee_id)
      if (filters?.search) query = query.ilike('name', `%${filters.search}%`)

      const { data, error } = await query
      if (error) throw error

      let tasks = data as Task[]
      if (filters?.due_date === 'overdue') {
        tasks = tasks.filter(t => t.due_date && isAfter(new Date(), parseISO(t.due_date)) && t.status !== 'completed')
      } else if (filters?.due_date === 'today') {
        const today = new Date().toISOString().split('T')[0]
        tasks = tasks.filter(t => t.due_date === today)
      }
      return tasks
    },
    enabled: !!projectId,
  })
}

export function useTask(id: string) {
  const supabase = createClient()
  return useQuery({
    queryKey: ['tasks', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          ${TASK_SELECT},
          history:task_history(
            id, field, old_value, new_value, created_at,
            user:profiles(id, full_name, avatar_url)
          )
        `)
        .eq('id', id)
        .single()
      if (error) throw error
      return data as Task
    },
    enabled: !!id,
  })
}

export function useCreateTask() {
  const supabase = createClient()
  const qc = useQueryClient()
  const { profile } = useAuth()
  return useMutation({
    mutationFn: async (values: Partial<Task> & { project_id: string; name: string }) => {
      const { count } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .eq('project_id', values.project_id)

      const { data, error } = await supabase
        .from('tasks')
        .insert({ ...values, created_by: profile.id, position: count ?? 0 })
        .select(TASK_SELECT)
        .single()
      if (error) throw error
      return data as Task
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['tasks', data.project_id] })
      toast.success('Tarea creada')
    },
    onError: (err: Error) => toast.error(err.message),
  })
}

export function useUpdateTask() {
  const supabase = createClient()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...values }: Partial<Task> & { id: string }) => {
      const { data, error } = await supabase
        .from('tasks')
        .update(values)
        .eq('id', id)
        .select(TASK_SELECT)
        .single()
      if (error) throw error
      return data as Task
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['tasks', data.project_id] })
      qc.invalidateQueries({ queryKey: ['tasks', data.id] })
    },
    onError: (err: Error) => toast.error(err.message),
  })
}

export function useDeleteTask() {
  const supabase = createClient()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, projectId }: { id: string; projectId: string }) => {
      const { error } = await supabase.from('tasks').delete().eq('id', id)
      if (error) throw error
      return projectId
    },
    onSuccess: (projectId) => {
      qc.invalidateQueries({ queryKey: ['tasks', projectId] })
      toast.success('Tarea eliminada')
    },
    onError: (err: Error) => toast.error(err.message),
  })
}

export function useAddComment() {
  const supabase = createClient()
  const qc = useQueryClient()
  const { profile } = useAuth()
  return useMutation({
    mutationFn: async ({ taskId, content }: { taskId: string; content: string }) => {
      const { data, error } = await supabase
        .from('comments')
        .insert({ task_id: taskId, user_id: profile.id, content })
        .select('*, user:profiles(id, full_name, avatar_url)')
        .single()
      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['tasks', data.task_id] })
    },
    onError: (err: Error) => toast.error(err.message),
  })
}
