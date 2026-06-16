'use client'
// Auth desactivado — usuario demo con rol admin
import type { Profile } from '@/types'

const DEMO_PROFILE: Profile = {
  id: '0a07190b-4f5c-44ba-8f89-eeff1396dba4',
  email: 'daniel@zekov.com',
  full_name: 'Daniel Mizrab',
  avatar_url: null,
  role: 'admin',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

export function useAuth() {
  return { user: DEMO_PROFILE, profile: DEMO_PROFILE, loading: false }
}
