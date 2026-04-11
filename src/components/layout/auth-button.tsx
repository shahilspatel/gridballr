'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

// Auth-aware nav button: shows LOGIN when anonymous, shows alias + LOGOUT
// when signed in. Uses the Supabase client to check session state on mount.
// This is a client component because it depends on browser cookies.

export function AuthButton() {
  const router = useRouter()
  const [user, setUser] = useState<{ alias: string } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser({
          alias: data.user.user_metadata?.scout_alias ?? data.user.email?.split('@')[0] ?? 'SCOUT',
        })
      }
      setLoading(false)
    })
  }, [])

  if (loading) {
    return <span className="border border-border px-3 py-1 text-[11px] text-muted/50">...</span>
  }

  if (!user) {
    return (
      <Link
        href="/login"
        className="border border-border px-3 py-1 text-[11px] text-muted transition-colors hover:border-cyan hover:text-cyan"
      >
        LOGIN
      </Link>
    )
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <div className="flex items-center gap-2">
      <span className="hidden text-[10px] text-cyan sm:inline">{user.alias.toUpperCase()}</span>
      <button
        onClick={handleLogout}
        className="border border-border px-3 py-1 text-[11px] text-muted transition-colors hover:border-red hover:text-red"
      >
        LOGOUT
      </button>
    </div>
  )
}
