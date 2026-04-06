'use client'

import { useState } from 'react'
import { NFL_TEAMS } from '@/types'

const DRAFT_ORDER_2026 = [
  { pick: 1, team: 'NYG', record: '3-14' },
  { pick: 2, team: 'CLE', record: '3-14' },
  { pick: 3, team: 'NE', record: '4-13' },
  { pick: 4, team: 'TEN', record: '4-13' },
  { pick: 5, team: 'JAX', record: '4-13' },
  { pick: 6, team: 'LV', record: '4-13' },
  { pick: 7, team: 'CAR', record: '5-12' },
  { pick: 8, team: 'NYJ', record: '5-12' },
  { pick: 9, team: 'CHI', record: '5-12' },
  { pick: 10, team: 'NO', record: '5-12' },
  { pick: 11, team: 'SF', record: '6-11' },
  { pick: 12, team: 'DAL', record: '6-11' },
  { pick: 13, team: 'MIA', record: '6-11' },
  { pick: 14, team: 'IND', record: '7-10' },
  { pick: 15, team: 'ATL', record: '8-9' },
  { pick: 16, team: 'ARI', record: '8-9' },
  { pick: 17, team: 'CIN', record: '8-9' },
  { pick: 18, team: 'SEA', record: '8-9' },
  { pick: 19, team: 'TB', record: '9-8' },
  { pick: 20, team: 'DEN', record: '9-8' },
  { pick: 21, team: 'LAC', record: '10-7' },
  { pick: 22, team: 'PIT', record: '10-7' },
  { pick: 23, team: 'LAR', record: '10-7' },
  { pick: 24, team: 'GB', record: '10-7' },
  { pick: 25, team: 'HOU', record: '10-7' },
  { pick: 26, team: 'BAL', record: '11-6' },
  { pick: 27, team: 'MIN', record: '11-6' },
  { pick: 28, team: 'WAS', record: '12-5' },
  { pick: 29, team: 'PHI', record: '12-5' },
  { pick: 30, team: 'BUF', record: '13-4' },
  { pick: 31, team: 'DET', record: '14-3' },
  { pick: 32, team: 'KC', record: '15-2' },
]

export function LotterySimulator() {
  const [order, setOrder] = useState(DRAFT_ORDER_2026)
  const [simulated, setSimulated] = useState(false)

  function simulate() {
    const shuffled = [...order]
    // Shuffle top 5 picks randomly (simplified lottery)
    for (let i = 4; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    // Reassign pick numbers
    const reordered = shuffled.map((item, idx) => ({
      ...item,
      pick: idx + 1,
    }))
    setOrder(reordered)
    setSimulated(true)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="text-[10px] text-muted">
          {simulated ? (
            <span className="text-green">SIMULATION_COMPLETE</span>
          ) : (
            <span>AWAITING_SIMULATION</span>
          )}
        </div>
        <button
          onClick={simulate}
          className="border border-cyan bg-cyan/10 px-4 py-2 text-xs font-bold tracking-wider text-cyan transition-colors hover:bg-cyan/20"
        >
          {simulated ? 'RE-ROLL' : 'SIMULATE'}
        </button>
      </div>

      <div className="border border-border bg-surface">
        <div className="border-b border-border bg-surface-2 px-4 py-2">
          <div className="grid grid-cols-[3rem_4rem_1fr_4rem] text-[10px] font-bold tracking-widest text-muted">
            <span>PICK</span>
            <span>TEAM</span>
            <span></span>
            <span className="text-right">RECORD</span>
          </div>
        </div>
        <div className="divide-y divide-border/50">
          {order.map((item) => (
            <div
              key={`${item.team}-${item.pick}`}
              className={`grid grid-cols-[3rem_4rem_1fr_4rem] items-center px-4 py-2.5 transition-colors hover:bg-surface-2 ${
                item.pick <= 5 ? 'bg-cyan/5' : ''
              }`}
            >
              <span
                className={`text-sm font-bold tabular-nums ${
                  item.pick <= 5 ? 'text-cyan' : 'text-muted'
                }`}
              >
                {String(item.pick).padStart(2, '0')}
              </span>
              <span className="text-xs font-bold text-foreground">{item.team}</span>
              <div className="h-px flex-1 bg-border/30" />
              <span className="text-right text-[10px] tabular-nums text-muted">{item.record}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
