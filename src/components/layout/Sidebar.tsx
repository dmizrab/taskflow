'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, FolderOpen, LogOut } from 'lucide-react'
import { cn, getInitials } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'

const COLORS = [
  'bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500',
  'bg-pink-500', 'bg-teal-500', 'bg-red-500', 'bg-indigo-500',
]

function colorForName(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return COLORS[Math.abs(hash) % COLORS.length]
}

export function Sidebar() {
  const pathname = usePathname()
  const { profile, logout } = useAuth()

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

      {/* Usuario + salir */}
      <div className="border-t border-gray-700/50 p-3 space-y-1">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0', colorForName(profile?.full_name ?? ''))}>
            {getInitials(profile?.full_name ?? '?')}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-white truncate">{profile?.full_name}</p>
            <p className="text-xs text-gray-500 capitalize">{profile?.role}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg text-gray-500 hover:text-white hover:bg-gray-800 transition-colors text-sm"
        >
          <LogOut className="w-4 h-4" />
          Cambiar usuario
        </button>
      </div>
    </aside>
  )
}
