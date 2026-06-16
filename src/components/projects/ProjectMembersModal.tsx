'use client'
import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { createClient } from '@/lib/supabase/client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ROLE_LABELS } from '@/lib/utils'
import { UserPlus, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Profile, UserRole } from '@/types'

interface ProjectMembersModalProps {
  projectId: string
  projectName: string
  open: boolean
  onClose: () => void
}

export function ProjectMembersModal({ projectId, projectName, open, onClose }: ProjectMembersModalProps) {
  const supabase = createClient()
  const qc = useQueryClient()
  const [selectedUser, setSelectedUser] = useState('')
  const [selectedRole, setSelectedRole] = useState<UserRole>('member')

  // Miembros actuales del proyecto
  const { data: members = [], isLoading } = useQuery({
    queryKey: ['project-members-modal', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_members')
        .select('*, profile:profiles(id, full_name, email, avatar_url, role)')
        .eq('project_id', projectId)
      if (error) throw error
      return data
    },
    enabled: open,
  })

  // Todos los usuarios disponibles
  const { data: allUsers = [] } = useQuery({
    queryKey: ['all-users'],
    queryFn: async () => {
      const { data, error } = await supabase.from('profiles').select('*').order('full_name')
      if (error) throw error
      return data as Profile[]
    },
  })

  const memberIds = members.map((m: { user_id: string }) => m.user_id)
  const availableUsers = allUsers.filter(u => !memberIds.includes(u.id))

  const addMember = useMutation({
    mutationFn: async () => {
      if (!selectedUser) throw new Error('Selecciona un usuario')
      const { error } = await supabase
        .from('project_members')
        .insert({ project_id: projectId, user_id: selectedUser, role: selectedRole })
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['project-members-modal', projectId] })
      qc.invalidateQueries({ queryKey: ['project-members', projectId] })
      qc.invalidateQueries({ queryKey: ['projects'] })
      setSelectedUser('')
      toast.success('Miembro agregado')
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const removeMember = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from('project_members')
        .delete()
        .eq('project_id', projectId)
        .eq('user_id', userId)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['project-members-modal', projectId] })
      qc.invalidateQueries({ queryKey: ['project-members', projectId] })
      qc.invalidateQueries({ queryKey: ['projects'] })
      toast.success('Miembro removido')
    },
    onError: (err: Error) => toast.error(err.message),
  })

  return (
    <Modal open={open} onClose={onClose} title={`Miembros — ${projectName}`} size="md">
      <div className="space-y-5">
        {/* Agregar miembro */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <p className="text-sm font-medium text-gray-700">Agregar persona al proyecto</p>
          <div className="flex gap-2">
            <select
              value={selectedUser}
              onChange={e => setSelectedUser(e.target.value)}
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Seleccionar persona...</option>
              {availableUsers.map(u => (
                <option key={u.id} value={u.id}>{u.full_name} — {u.email}</option>
              ))}
            </select>
            <select
              value={selectedRole}
              onChange={e => setSelectedRole(e.target.value as UserRole)}
              className="w-32 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="member">Miembro</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <Button
            size="sm"
            onClick={() => addMember.mutate()}
            loading={addMember.isPending}
            disabled={!selectedUser}
          >
            <UserPlus className="w-4 h-4" />
            Agregar
          </Button>
        </div>

        {/* Lista de miembros actuales */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-3">
            Miembros con acceso ({members.length})
          </p>
          {isLoading ? (
            <p className="text-sm text-gray-400">Cargando...</p>
          ) : (
            <div className="space-y-2">
              {members.map((m: { user_id: string; role: UserRole; profile: Profile }) => (
                <div key={m.user_id} className="flex items-center justify-between p-2.5 rounded-lg border border-gray-100 hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <Avatar profile={m.profile} size="sm" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{m.profile?.full_name}</p>
                      <p className="text-xs text-gray-400">{m.profile?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                      {ROLE_LABELS[m.role]}
                    </span>
                    <button
                      onClick={() => removeMember.mutate(m.user_id)}
                      className="p-1 text-gray-300 hover:text-red-500 transition-colors"
                      title="Remover del proyecto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}
