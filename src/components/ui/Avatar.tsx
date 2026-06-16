import { cn, getInitials } from '@/lib/utils'
import Image from 'next/image'
import type { Profile } from '@/types'

interface AvatarProps {
  profile?: Profile | null
  size?: 'xs' | 'sm' | 'md' | 'lg'
  className?: string
}

const COLORS = [
  'bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500',
  'bg-pink-500', 'bg-indigo-500', 'bg-teal-500', 'bg-red-500',
]

function colorForName(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return COLORS[Math.abs(hash) % COLORS.length]
}

export function Avatar({ profile, size = 'sm', className }: AvatarProps) {
  const sizes = { xs: 'w-6 h-6 text-xs', sm: 'w-8 h-8 text-sm', md: 'w-10 h-10 text-base', lg: 'w-12 h-12 text-lg' }
  const name = profile?.full_name ?? '?'
  const color = colorForName(name)

  if (profile?.avatar_url) {
    return (
      <Image
        src={profile.avatar_url}
        alt={name}
        width={40}
        height={40}
        className={cn('rounded-full object-cover', sizes[size], className)}
      />
    )
  }

  return (
    <div className={cn('rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0', color, sizes[size], className)}>
      {getInitials(name)}
    </div>
  )
}
