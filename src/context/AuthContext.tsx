'use client'
import { createContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types'

export const STORAGE_USER = 'taskflow_user_id'
export const STORAGE_AUTH = 'taskflow_pin_ok'

const FALLBACK_PROFILE: Profile = {
  id: '',
  email: '',
  full_name: '',
  avatar_url: null,
  role: 'member',
  created_at: '',
  updated_at: '',
}

interface AuthContextValue {
  user: Profile
  profile: Profile
  loading: boolean
  isAuthenticated: boolean
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue>({
  user: FALLBACK_PROFILE,
  profile: FALLBACK_PROFILE,
  loading: true,
  isAuthenticated: false,
  logout: () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<Profile>(FALLBACK_PROFILE)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const userId = localStorage.getItem(STORAGE_USER)
    const pinOk = localStorage.getItem(STORAGE_AUTH)

    if (!userId || pinOk !== 'true') {
      setLoading(false)
      setIsAuthenticated(false)
      return
    }

    const supabase = createClient()
    supabase
      .from('profiles')
      .select('id, full_name, email, avatar_url, role, created_at, updated_at')
      .eq('id', userId)
      .single()
      .then(({ data }) => {
        if (data) {
          setProfile(data as Profile)
          setIsAuthenticated(true)
        } else {
          // ID inválido — limpiar sesión
          localStorage.removeItem(STORAGE_USER)
          localStorage.removeItem(STORAGE_AUTH)
          setIsAuthenticated(false)
        }
        setLoading(false)
      })
  }, [])

  function logout() {
    localStorage.removeItem(STORAGE_USER)
    localStorage.removeItem(STORAGE_AUTH)
    setIsAuthenticated(false)
    setProfile(FALLBACK_PROFILE)
    window.location.href = '/pin'
  }

  return (
    <AuthContext.Provider value={{ user: profile, profile, loading, isAuthenticated, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
