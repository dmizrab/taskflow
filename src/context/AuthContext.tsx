'use client'
import { createContext, useEffect, useReducer } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types'

export const STORAGE_USER = 'taskflow_user_id'
export const STORAGE_AUTH = 'taskflow_pin_ok'

interface AuthState {
  profile: Profile | null
  loading: boolean
  isAuthenticated: boolean
}

type AuthAction =
  | { type: 'LOADED'; profile: Profile }
  | { type: 'UNAUTHENTICATED' }

function reducer(_: AuthState, action: AuthAction): AuthState {
  if (action.type === 'LOADED') {
    return { profile: action.profile, loading: false, isAuthenticated: true }
  }
  return { profile: null, loading: false, isAuthenticated: false }
}

const EMPTY_PROFILE: Profile = {
  id: '', email: '', full_name: '', avatar_url: null,
  role: 'member', created_at: '', updated_at: '',
}

interface AuthContextValue {
  user: Profile
  profile: Profile
  loading: boolean
  isAuthenticated: boolean
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue>({
  user: EMPTY_PROFILE,
  profile: EMPTY_PROFILE,
  loading: true,
  isAuthenticated: false,
  logout: () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    profile: null,
    loading: true,
    isAuthenticated: false,
  })

  useEffect(() => {
    const userId = localStorage.getItem(STORAGE_USER)
    const pinOk = localStorage.getItem(STORAGE_AUTH)

    if (!userId || pinOk !== 'true') {
      dispatch({ type: 'UNAUTHENTICATED' })
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
          dispatch({ type: 'LOADED', profile: data as Profile })
        } else {
          localStorage.removeItem(STORAGE_USER)
          localStorage.removeItem(STORAGE_AUTH)
          dispatch({ type: 'UNAUTHENTICATED' })
        }
      })
  }, [])

  function logout() {
    localStorage.removeItem(STORAGE_USER)
    localStorage.removeItem(STORAGE_AUTH)
    dispatch({ type: 'UNAUTHENTICATED' })
    window.location.href = '/pin'
  }

  const profile = state.profile ?? EMPTY_PROFILE

  return (
    <AuthContext.Provider value={{
      user: profile,
      profile,
      loading: state.loading,
      isAuthenticated: state.isAuthenticated,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  )
}
