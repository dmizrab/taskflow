'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import type { Project } from '@/types'
import toast from 'react-hot-toast'

export function useProjects() {
  const supabase = createClient()
  return useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          owner:profiles!projects_owner_id_fkey(id, full_name, email, avatar_url, role),
          members:project_members(
            user_id, role,
            profile:profiles(id, full_name, email, avatar_url, role)
          )
        `)
        .eq('is_archived', false)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as Project[]
    },
  })
}

export function useProject(id: string) {
  const supabase = createClient()
  return useQuery({
    queryKey: ['projects', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          owner:profiles!projects_owner_id_fkey(id, full_name, email, avatar_url, role),
          members:project_members(
            user_id, role,
            profile:profiles(id, full_name, email, avatar_url, role)
          )
        `)
        .eq('id', id)
        .single()

      if (error) throw error
      return data as Project
    },
    enabled: !!id,
  })
}

export function useCreateProject() {
  const supabase = createClient()
  const qc = useQueryClient()
  const { profile } = useAuth()
  return useMutation({
    mutationFn: async (values: { name: string; description?: string; color?: string }) => {
      const { data, error } = await supabase
        .from('projects')
        .insert({ ...values, owner_id: profile.id })
        .select()
        .single()
      if (error) throw error

      await supabase.from('project_members').insert({
        project_id: data.id,
        user_id: profile.id,
        role: 'admin',
      })

      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects'] })
      toast.success('Proyecto creado')
    },
    onError: (err: Error) => toast.error(err.message),
  })
}

export function useUpdateProject() {
  const supabase = createClient()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...values }: Partial<Project> & { id: string }) => {
      const { data, error } = await supabase
        .from('projects')
        .update(values)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['projects'] })
      qc.invalidateQueries({ queryKey: ['projects', data.id] })
      toast.success('Proyecto actualizado')
    },
    onError: (err: Error) => toast.error(err.message),
  })
}

export function useDeleteProject() {
  const supabase = createClient()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('projects').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects'] })
      toast.success('Proyecto eliminado')
    },
    onError: (err: Error) => toast.error(err.message),
  })
}
