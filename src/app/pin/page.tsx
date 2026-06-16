'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { getInitials } from '@/lib/utils'
import { ShieldCheck, ArrowLeft, Delete } from 'lucide-react'
import type { Profile } from '@/types'

const STORAGE_USER = 'taskflow_user_id'
const STORAGE_AUTH = 'taskflow_pin_ok'

export default function PinPage() {
  const router = useRouter()
  const supabase = createClient()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [selected, setSelected] = useState<Profile | null>(null)
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Si ya tiene sesión activa, ir al dashboard
    const userId = localStorage.getItem(STORAGE_USER)
    const pinOk = localStorage.getItem(STORAGE_AUTH)
    if (userId && pinOk === 'true') {
      window.location.href = '/dashboard'
      return
    }
    supabase
      .from('profiles')
      .select('id, full_name, email, avatar_url, role, created_at, updated_at')
      .order('full_name')
      .then(({ data }) => {
        if (data) setProfiles(data as Profile[])
        setLoading(false)
      })
  }, [])

  const handleDigit = (d: string) => {
    if (pin.length >= 4) return
    const next = pin + d
    setPin(next)
    setError('')
    if (next.length === 4) verifyPin(next)
  }

  const handleDelete = () => {
    setPin(p => p.slice(0, -1))
    setError('')
  }

  const verifyPin = async (entered: string) => {
    if (!selected) return
    const { data } = await supabase
      .from('profiles')
      .select('pin')
      .eq('id', selected.id)
      .single()

    if (data?.pin === entered) {
      localStorage.setItem(STORAGE_USER, selected.id)
      localStorage.setItem(STORAGE_AUTH, 'true')
      window.location.href = '/dashboard'
    } else {
      setError('PIN incorrecto')
      setPin('')
    }
  }

  const DIGITS = [['1','2','3'],['4','5','6'],['7','8','9'],['','0','⌫']]

  const COLORS = [
    'bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500',
    'bg-pink-500', 'bg-teal-500', 'bg-red-500', 'bg-indigo-500',
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center text-white font-bold text-xl mx-auto mb-3">
            TF
          </div>
          <h1 className="text-white text-2xl font-bold">TaskFlow</h1>
          <p className="text-gray-500 text-sm mt-1">¿Quién eres?</p>
        </div>

        {!selected ? (
          /* Selección de usuario */
          <div className="grid grid-cols-2 gap-3">
            {profiles.map((p, i) => (
              <button
                key={p.id}
                onClick={() => { setSelected(p); setPin(''); setError('') }}
                className="flex items-center gap-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-blue-500 rounded-xl px-4 py-3 transition-all text-left"
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ${COLORS[i % COLORS.length]}`}>
                  {getInitials(p.full_name)}
                </div>
                <div className="min-w-0">
                  <p className="text-white text-sm font-medium truncate">{p.full_name}</p>
                  <p className="text-gray-500 text-xs capitalize">{p.role}</p>
                </div>
              </button>
            ))}
          </div>
        ) : (
          /* Teclado PIN */
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
            {/* Usuario seleccionado */}
            <div className="flex items-center gap-3 mb-6">
              <button onClick={() => { setSelected(null); setPin(''); setError('') }} className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors">
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ${COLORS[profiles.indexOf(selected) % COLORS.length]}`}>
                {getInitials(selected.full_name)}
              </div>
              <div>
                <p className="text-white font-semibold text-sm">{selected.full_name}</p>
                <p className="text-gray-500 text-xs">Ingresa tu PIN de 4 dígitos</p>
              </div>
            </div>

            {/* Puntos del PIN */}
            <div className="flex justify-center gap-4 mb-6">
              {[0,1,2,3].map(i => (
                <div
                  key={i}
                  className={`w-4 h-4 rounded-full border-2 transition-all ${
                    i < pin.length
                      ? 'bg-blue-500 border-blue-500'
                      : 'bg-transparent border-gray-600'
                  }`}
                />
              ))}
            </div>

            {/* Error */}
            {error && (
              <p className="text-center text-red-400 text-sm mb-4 font-medium">{error}</p>
            )}

            {/* Teclado numérico */}
            <div className="grid grid-cols-3 gap-3">
              {DIGITS.flat().map((d, i) => {
                if (d === '') return <div key={i} />
                if (d === '⌫') return (
                  <button
                    key={i}
                    onClick={handleDelete}
                    className="h-14 rounded-xl bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                  >
                    <Delete className="w-5 h-5" />
                  </button>
                )
                return (
                  <button
                    key={i}
                    onClick={() => handleDigit(d)}
                    className="h-14 rounded-xl bg-gray-800 hover:bg-blue-600 text-white font-semibold text-xl transition-colors"
                  >
                    {d}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        <p className="text-center text-gray-600 text-xs mt-8 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5" />
          Acceso protegido por PIN
        </p>
      </div>
    </div>
  )
}
