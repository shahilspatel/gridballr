import { Suspense } from 'react'
import { TerminalHeader } from '@/components/layout/terminal-header'
import { LoginForm } from '@/components/auth/login-form'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Login — Access Your Scouting Dashboard',
  description:
    'Log in to GridBallr to access your custom draft boards, scouting reports, and premium NFL draft intelligence tools.',
}

export default function LoginPage() {
  return (
    <div>
      <TerminalHeader title="AUTH_GATEWAY" status="AWAITING_INPUT" />
      <div className="mx-auto max-w-sm px-4 py-12 sm:px-6">
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}
