import { TerminalHeader } from '@/components/layout/terminal-header'
import { TradeCalculator } from '@/components/dynasty/trade-calculator'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dynasty Trade Calculator',
  description:
    'Evaluate dynasty fantasy football trades with crowdsourced player values. Superflex and 1QB formats.',
}

export default function TradeCalculatorPage() {
  return (
    <div>
      <TerminalHeader
        title="TRADE_CALCULATOR"
        subtitle="Dynasty Trade Evaluation Engine"
        status="ACTIVE"
      />
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
        <TradeCalculator />
      </div>
    </div>
  )
}
