'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, FolderOpen, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { Avatar } from '@/components/ui/Avatar'
import { useState, useRef, useEffect } from 'react'

export function Sidebar() {
  const pathname = usePathname()
  const { profile, allProfiles, switchUser } = useAuth()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const links = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/projects', label: 'Proyectos', icon: FolderOpen },
  ]

  return (
    <aside className="w-60 bg-gray-900 flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-700/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
            TF
          </div>
          <span className="text-white font-semibold text-lg">TaskFlow</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
                active
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              )}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Selector de usuario */}
      <div className="border-t border-gray-700/50 p-3" ref={ref}>
        <button
          onClick={() => setOpen(o => !o)}
          className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-gray-800 transition-colors"
        >
          <Avatar profile={profile} size="sm" />
          <div className="flex-1 text-left min-w-0">
            <p className="text-sm font-medium text-white truncate">{profile?.full_name}</p>
            <p className="text-xs text-gray-500 truncate">{profile?.role}</p>
          </div>
          <ChevronDown className={cn('w-4 h-4 text-gray-500 flex-shrink-0 transition-transform', open && 'rotate-180')} />
        </button>

        {open && allProfiles.length > 0 && (
          <div className="mt-1 bg-gray-800 rounded-lg border border-gray-700 overflow-hidden shadow-xl">
            <p className="text-xs text-gray-500 px-3 pt-2 pb-1">Cambiar usuario</p>
            {allProfiles.map(p => (
              <button
                key={p.id}
                onClick={() => { switchUser(p.id); setOpen(false) }}
                className={cn(
                  'w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-gray-700 transition-colors',
                  profile?.id === p.id ? 'bg-gray-700/50' : ''
                )}
              >
                <Avatar profile={p} size="xs" />
                <div className="min-w-0">
                  <p className="text-sm text-white truncate">{p.full_name}</p>
                  <p className="text-xs text-gray-500 truncate">{p.role}</p>
                </div>
                {profile?.id === p.id && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </aside>
  )
}
