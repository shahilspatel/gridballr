import { TerminalHeader } from '@/components/layout/terminal-header'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Login',
}

export default function LoginPage() {
  return (
    <div>
      <TerminalHeader title="AUTH_GATEWAY" status="AWAITING_INPUT" />
      <div className="mx-auto max-w-sm px-4 py-12 sm:px-6">
        <div className="border border-border bg-surface p-6">
          <div className="mb-6 flex flex-col gap-1">
            <span className="text-xs font-bold tracking-widest text-cyan glow">LOGIN</span>
            <span className="text-[10px] text-muted">ACCESS_GRIDBALLR // SCOUTING_PLATFORM</span>
          </div>

          <form className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold tracking-widest text-muted">EMAIL</label>
              <input
                type="email"
                placeholder="scout@gridballr.com"
                className="border border-border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted focus:border-cyan focus:outline-none"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold tracking-widest text-muted">PASSWORD</label>
              <input
                type="password"
                placeholder="••••••••"
                className="border border-border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted focus:border-cyan focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="border border-cyan bg-cyan/10 px-4 py-2.5 text-[11px] font-bold tracking-wider text-cyan transition-colors hover:bg-cyan/20"
            >
              AUTHENTICATE
            </button>
          </form>

          <div className="mt-4 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div className="h-px flex-1 bg-border" />
              <span className="text-[9px] text-muted">OR</span>
              <div className="h-px flex-1 bg-border" />
            </div>
            <button className="border border-border px-4 py-2 text-[11px] font-medium text-muted transition-colors hover:border-foreground hover:text-foreground">
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
      </div>
    </div>
  )
}
