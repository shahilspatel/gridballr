'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') ?? '/'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    router.push(redirect)
    router.refresh()
  }

  const handleGoogleLogin = async () => {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?redirect=${redirect}`,
      },
    })
  }

  return (
    <div className="border border-border bg-surface p-6">
      <div className="mb-6 flex flex-col gap-1">
        <span className="text-xs font-bold tracking-widest text-cyan glow">LOGIN</span>
        <span className="text-[10px] text-muted">ACCESS_GRIDBALLR // SCOUTING_PLATFORM</span>
      </div>

      {error && (
        <div className="mb-4 border border-red/30 bg-red/5 px-3 py-2 text-[11px] text-red">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold tracking-widest text-muted">EMAIL</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="scout@gridballr.com"
            className="border border-border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted focus:border-cyan focus:outline-none"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold tracking-widest text-muted">PASSWORD</label>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="border border-border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted focus:border-cyan focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="border border-cyan bg-cyan/10 px-4 py-2.5 text-[11px] font-bold tracking-wider text-cyan transition-colors hover:bg-cyan/20 disabled:opacity-50"
        >
          {loading ? 'AUTHENTICATING...' : 'AUTHENTICATE'}
        </button>
      </form>

      <div className="mt-4 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="h-px flex-1 bg-border" />
          <span className="text-[9px] text-muted">OR</span>
          <div className="h-px flex-1 bg-border" />
        </div>
        <button
          onClick={handleGoogleLogin}
          className="border border-border px-4 py-2 text-[11px] font-medium text-muted transition-colors hover:border-foreground hover:text-foreground"
        >
          CONTINUE WITH GOOGLE
        </button>
      </div>

      <div className="mt-4 text-center text-[10px] text-muted">
        NO ACCOUNT?{' '}
        <a href="/signup" className="text-cyan hover:underline">
          CREATE_ONE
        </a>
      </div>
    </div>
  )
}
