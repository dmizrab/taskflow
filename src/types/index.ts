export type UserRole = 'admin' | 'manager' | 'member'
export type TaskStatus = 'pending' | 'in_progress' | 'blocked' | 'completed'
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'

export interface Profile {
  id: string
  email: string
  full_name: string
  avatar_url: string | null
  role: UserRole
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  name: string
  description: string | null
  color: string
  owner_id: string
  is_archived: boolean
  created_at: string
  updated_at: string
  owner?: Profile
  members?: ProjectMember[]
  tasks?: Task[]
}

export interface ProjectMember {
  project_id: string
  user_id: string
  role: UserRole
  created_at: string
  profile?: Profile
}

export interface Task {
  id: string
  project_id: string
  name: string
  description: string | null
  assignee_id: string | null
  status: TaskStatus
  priority: TaskPriority
  due_date: string | null
  position: number
  created_by: string
  created_at: string
  updated_at: string
  assignee?: Profile
  creator?: Profile
  comments?: Comment[]
  attachments?: TaskAttachment[]
  history?: TaskHistory[]
}

export interface Comment {
  id: string
  task_id: string
  user_id: string
  content: string
  created_at: string
  updated_at: string
  user?: Profile
}

export interface TaskAttachment {
  id: string
  task_id: string
  user_id: string
  file_name: string
  file_url: string
  file_size: number | null
  file_type: string | null
  created_at: string
}

export interface TaskHistory {
  id: string
  task_id: string
  user_id: string
  field: string
  old_value: string | null
  new_value: string | null
  created_at: string
  user?: Profile
}

// Filtros
export interface TaskFilters {
  status?: TaskStatus | 'all'
  priority?: TaskPriority | 'all'
  assignee_id?: string | 'all'
  due_date?: 'overdue' | 'today' | 'week' | 'all'
  search?: string
}

// Stats para el dashboard
export interface ProjectStats {
  total: number
  completed: number
  in_progress: number
  blocked: number
  pending: number
  overdue: number
  completion_percentage: number
}

export interface DashboardStats {
  total_projects: number
  total_tasks: number
  overdue_tasks: Task[]
  blocked_tasks: Task[]
  tasks_by_assignee: { profile: Profile; count: number }[]
  projects_stats: { project: Project; stats: ProjectStats }[]
}
