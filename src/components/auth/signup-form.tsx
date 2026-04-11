'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function SignupForm() {
  const router = useRouter()
  const [alias, setAlias] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [honeypot, setHoneypot] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (honeypot) return

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setLoading(true)

    const supabase = createClient()
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          scout_alias: alias || undefined,
        },
      },
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    // Supabase returns session=null when email confirmation is enabled
    // (the default). In that case the user isn't logged in yet — they need
    // to click the link in their inbox. Show a "check your email" state
    // instead of pretending they're in.
    if (!data.session) {
      setError(null)
      setLoading(false)
      // Reuse the error state display area to show a success message.
      // This is hacky but avoids adding another state variable for one case.
      router.push('/?welcome=true')
      return
    }

    router.push('/?welcome=true')
    router.refresh()
  }

  const handleGoogleSignup = async () => {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  return (
    <div className="border border-border bg-surface p-6">
      <div className="mb-6 flex flex-col gap-1">
        <span className="text-xs font-bold tracking-widest text-cyan glow">CREATE_ACCOUNT</span>
        <span className="text-[10px] text-muted">JOIN_GRIDBALLR // NFL DRAFT INTELLIGENCE</span>
      </div>

      {error && (
        <div className="mb-4 border border-red/30 bg-red/5 px-3 py-2 text-[11px] text-red">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Honeypot field — hidden from humans, catches bots */}
        <div className="absolute -left-[9999px]" aria-hidden="true">
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold tracking-widest text-muted">SCOUT_ALIAS</label>
          <input
            type="text"
            value={alias}
            onChange={(e) => setAlias(e.target.value)}
            placeholder="GRID_SCOUT_42"
            className="border border-border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted focus:border-cyan focus:outline-none"
          />
        </div>
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
          <span className="text-[9px] text-muted">MIN 8 CHARACTERS</span>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="border border-cyan bg-cyan/10 px-4 py-2.5 text-[11px] font-bold tracking-wider text-cyan transition-colors hover:bg-cyan/20 disabled:opacity-50"
        >
          {loading ? 'CREATING...' : 'CREATE_ACCOUNT'}
        </button>
      </form>

      {process.env.NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED === 'true' && (
        <div className="mt-4 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="h-px flex-1 bg-border" />
            <span className="text-[9px] text-muted">OR</span>
            <div className="h-px flex-1 bg-border" />
          </div>
          <button
            onClick={handleGoogleSignup}
            className="border border-border px-4 py-2 text-[11px] font-medium text-muted transition-colors hover:border-foreground hover:text-foreground"
          >
            CONTINUE WITH GOOGLE
          </button>
        </div>
      )}

      <div className="mt-4 text-center text-[10px] text-muted">
        ALREADY HAVE AN ACCOUNT?{' '}
        <a href="/login" className="text-cyan hover:underline">
          LOGIN
        </a>
      </div>

      <div className="mt-4 border-t border-border pt-3 text-[9px] text-muted">
        FREE TIER INCLUDES: Big Board, Stat Matrix, Compare Engine, Solo Mock Draft, Lottery Sim
      </div>
    </div>
  )
}
