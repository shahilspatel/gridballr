import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pricing — GridBallr Pro Access',
  description:
    'Upgrade to GridBallr Pro for $12/month or $80/year. Unlock advanced analytics, Film Terminal, multiplayer mock drafts, dynasty tools, and more.',
}

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
