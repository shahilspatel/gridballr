import { TerminalHeader } from '@/components/layout/terminal-header'
import { SignupForm } from '@/components/auth/signup-form'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign Up — Join GridBallr',
  description:
    'Create your free GridBallr account. Access the Big Board, Stat Matrix, Compare Engine, Mock Draft Simulator, and more.',
}

export default function SignupPage() {
  return (
    <div>
      <TerminalHeader title="AUTH_GATEWAY" status="CREATE_ACCOUNT" />
      <div className="mx-auto max-w-sm px-4 py-12 sm:px-6">
        <SignupForm />
      </div>
    </div>
  )
}
