'use client'
import { createContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types'

const STORAGE_KEY = 'taskflow_user_id'

const FALLBACK_PROFILE: Profile = {
  id: '0a07190b-4f5c-44ba-8f89-eeff1396dba4',
  email: 'daniel@zekov.com',
  full_name: 'Daniel Mizrab',
  avatar_url: null,
  role: 'admin',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

interface AuthContextValue {
  user: Profile
  profile: Profile
  loading: boolean
  allProfiles: Profile[]
  switchUser: (id: string) => void
}

export const AuthContext = createContext<AuthContextValue>({
  user: FALLBACK_PROFILE,
  profile: FALLBACK_PROFILE,
  loading: false,
  allProfiles: [],
  switchUser: () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [allProfiles, setAllProfiles] = useState<Profile[]>([])
  const [currentId, setCurrentId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(STORAGE_KEY) ?? FALLBACK_PROFILE.id
    }
    return FALLBACK_PROFILE.id
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('profiles')
      .select('*')
      .order('full_name')
      .then(({ data }) => {
        if (data && data.length > 0) setAllProfiles(data as Profile[])
        setLoading(false)
      })
  }, [])

  const profile =
    allProfiles.find(p => p.id === currentId) ?? FALLBACK_PROFILE

  function switchUser(id: string) {
    localStorage.setItem(STORAGE_KEY, id)
    setCurrentId(id)
  }

  return (
    <AuthContext.Provider value={{ user: profile, profile, loading, allProfiles, switchUser }}>
      {children}
    </AuthContext.Provider>
  )
}
