import { TerminalHeader } from '@/components/layout/terminal-header'
import { LotterySimulator } from '@/components/draft/lottery-simulator'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Lottery Simulator — NFL Draft Order',
  description: 'Simulate the NFL draft order with trade scenarios and lottery odds.',
}

export default function LotteryPage() {
  return (
    <div>
      <TerminalHeader
        title="LOTTERY_SIMULATOR"
        subtitle="Draft Order Simulation"
        status="SIMULATION_READY"
      />
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        <LotterySimulator />
      </div>
    </div>
  )
}
