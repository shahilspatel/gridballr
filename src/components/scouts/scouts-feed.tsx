'use client'

import { useState } from 'react'
import { getPositionColor, getTierColor } from '@/lib/utils/format'

interface SampleReport {
  id: string
  scoutAlias: string
  scoutTheme: string
  playerName: string
  position: string
  school: string
  tier: string
  summary: string
  strengths: string[]
  weaknesses: string[]
  badges: string[]
  grade: number
  reactions: { fire: number; brain: number; cap: number }
  timestamp: string
}

const SAMPLE_REPORTS: SampleReport[] = [
  {
    id: '1',
    scoutAlias: 'GRID_SCOUT_01',
    scoutTheme: 'cyan',
    playerName: 'Shedeur Sanders',
    position: 'QB',
    school: 'Colorado',
    tier: 'ELITE',
    summary:
      "Most NFL-ready passer in this class. His ability to read defenses pre-snap and deliver the ball on time to the right spot is elite. Pocket movement is subtle but effective — he slides and delivers rather than bailing. The arm isn't a cannon but it's more than enough. This is a franchise QB.",
    strengths: ['Processing', 'Accuracy', 'Poise'],
    weaknesses: ['Deep ball power', 'Athleticism'],
    badges: ['FIELD_GENERAL', 'PLAY_MAKER'],
    grade: 9.2,
    reactions: { fire: 24, brain: 18, cap: 3 },
    timestamp: '2h ago',
  },
  {
    id: '2',
    scoutAlias: 'FILM_GRINDER_X',
    scoutTheme: 'green',
    playerName: 'Travis Hunter',
    position: 'CB',
    school: 'Colorado',
    tier: 'ELITE',
    summary:
      "Generational. I've watched every snap from both sides of the ball. His transitions from WR to CB are seamless — no drop-off in effort or technique. The ball skills are absurd on both sides. Only concern is long-term wear from playing both ways, but the talent is undeniable.",
    strengths: ['Two-way dominance', 'Ball skills', 'Instincts'],
    weaknesses: ['Durability risk', 'Slight frame'],
    badges: ['LOCKDOWN', 'BALL_HAWK', 'ROUTE_TECHNICIAN'],
    grade: 9.5,
    reactions: { fire: 42, brain: 31, cap: 1 },
    timestamp: '5h ago',
  },
  {
    id: '3',
    scoutAlias: 'EDGE_HUNTER_99',
    scoutTheme: 'red',
    playerName: 'Abdul Carter',
    position: 'EDGE',
    school: 'Penn State',
    tier: 'FRANCHISE',
    summary:
      "The athleticism is off the charts. When he converts speed to power it's violent. LB-to-EDGE transition has been seamless. His closing speed on QBs is reminiscent of prime Von Miller. Needs to add a counter move but the physical tools are top 5 in this class.",
    strengths: ['Explosiveness', 'Closing speed', 'Motor'],
    weaknesses: ['Counter moves', 'Run D consistency'],
    badges: ['SPEED_DEMON', 'PASS_RUSH_SPECIALIST'],
    grade: 8.8,
    reactions: { fire: 15, brain: 12, cap: 2 },
    timestamp: '1d ago',
  },
  {
    id: '4',
    scoutAlias: 'DYNASTY_NERD',
    scoutTheme: 'amber',
    playerName: 'Ashton Jeanty',
    position: 'RB',
    school: 'Boise State',
    tier: 'ALL_STAR',
    summary:
      "The vision is Barry Sanders-level. I don't say that lightly. He sees creases that don't exist yet and hits them at full speed. Contact balance is absurd for his size. The only knock is competition level — we need to see this against SEC fronts consistently.",
    strengths: ['Vision', 'Contact balance', 'Burst'],
    weaknesses: ['Competition level', 'Pass pro'],
    badges: ['PLAY_MAKER', 'SPEED_DEMON'],
    grade: 8.5,
    reactions: { fire: 28, brain: 9, cap: 5 },
    timestamp: '1d ago',
  },
]

export function ScoutsFeed() {
  const [activeFilter, setActiveFilter] = useState('RECENT')
  const [showForm, setShowForm] = useState(false)

  return (
    <div className="flex flex-col gap-4">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {['RECENT', 'POPULAR', 'DISCUSSED'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`px-3 py-1.5 text-[10px] font-medium tracking-wide transition-colors ${
                activeFilter === tab
                  ? 'bg-cyan/10 text-cyan border border-cyan/30'
                  : 'text-muted hover:text-foreground border border-transparent'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="border border-cyan bg-cyan/10 px-3 py-1.5 text-[10px] font-bold tracking-wider text-cyan transition-colors hover:bg-cyan/20"
        >
          + NEW_REPORT
        </button>
      </div>

      {/* Report form */}
      {showForm && <ReportForm onClose={() => setShowForm(false)} />}

      {/* Reports */}
      <div className="flex flex-col gap-3">
        {SAMPLE_REPORTS.map((report) => (
          <ReportCard key={report.id} report={report} />
        ))}
      </div>
    </div>
  )
}

function ReportCard({ report }: { report: SampleReport }) {
  const posColor = getPositionColor(report.position)
  const tierColor = getTierColor(report.tier)

  return (
    <div className="border border-border bg-surface transition-colors hover:border-border/80">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/50 px-4 py-2">
        <div className="flex items-center gap-2">
          <div
            className="h-2 w-2 rounded-full"
            style={{
              backgroundColor:
                report.scoutTheme === 'cyan'
                  ? '#00f0ff'
                  : report.scoutTheme === 'green'
                    ? '#00ff88'
                    : report.scoutTheme === 'red'
                      ? '#ff3b3b'
                      : '#ffb800',
            }}
          />
          <span className="text-[10px] font-bold text-foreground">{report.scoutAlias}</span>
          <span className="text-[9px] text-muted">{report.timestamp}</span>
        </div>
        <span
          className="border px-1.5 py-0.5 text-[9px] font-bold tracking-wider"
          style={{ color: tierColor, borderColor: tierColor }}
        >
          {report.tier.replace('_', ' ')}
        </span>
      </div>

      {/* Player info */}
      <div className="px-4 pt-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-foreground">{report.playerName}</span>
          <span
            className="border px-1.5 py-0.5 text-[9px] font-bold"
            style={{ color: posColor, borderColor: posColor }}
          >
            {report.position}
          </span>
          <span className="text-[10px] text-muted">{report.school}</span>
          <span className="ml-auto text-sm font-bold tabular-nums text-cyan">{report.grade}</span>
        </div>
      </div>

      {/* Summary */}
      <div className="px-4 py-3">
        <p className="text-[11px] leading-relaxed text-foreground/70">{report.summary}</p>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-1 px-4 pb-2">
        {report.badges.map((badge) => (
          <span
            key={badge}
            className="border border-cyan/20 bg-cyan/5 px-1.5 py-0.5 text-[8px] font-bold tracking-wider text-cyan"
          >
            {badge.replace('_', ' ')}
          </span>
        ))}
      </div>

      {/* Strengths/Weaknesses */}
      <div className="grid grid-cols-2 gap-2 px-4 pb-3">
        <div className="flex flex-wrap gap-1">
          {report.strengths.map((s) => (
            <span key={s} className="text-[9px] text-green">
              +{s}
            </span>
          ))}
        </div>
        <div className="flex flex-wrap gap-1">
          {report.weaknesses.map((w) => (
            <span key={w} className="text-[9px] text-red">
              -{w}
            </span>
          ))}
        </div>
      </div>

      {/* Reactions */}
      <div className="flex items-center gap-3 border-t border-border/50 px-4 py-2">
        {[
          { emoji: 'fire', label: 'FIRE', count: report.reactions.fire },
          { emoji: 'brain', label: 'BRAIN', count: report.reactions.brain },
          { emoji: 'cap', label: 'CAP', count: report.reactions.cap },
        ].map((r) => (
          <button
            key={r.label}
            className="flex items-center gap-1 text-[10px] text-muted transition-colors hover:text-foreground"
          >
            <span>{r.label}</span>
            <span className="tabular-nums text-foreground">{r.count}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

function ReportForm({ onClose }: { onClose: () => void }) {
  return (
    <div className="border border-cyan/30 bg-surface p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[10px] font-bold tracking-widest text-cyan">NEW_REPORT</span>
        <button onClick={onClose} className="text-[10px] text-muted hover:text-red">
          CLOSE
        </button>
      </div>
      <div className="flex flex-col gap-3">
        <select className="border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-cyan focus:outline-none">
          <option>Select prospect...</option>
          <option>Shedeur Sanders — QB</option>
          <option>Cam Ward — QB</option>
          <option>Travis Hunter — CB</option>
          <option>Tetairoa McMillan — WR</option>
          <option>Mason Graham — DL</option>
          <option>Abdul Carter — EDGE</option>
        </select>
        <div className="grid grid-cols-2 gap-3">
          <select className="border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-cyan focus:outline-none">
            <option>Tier...</option>
            <option>ELITE</option>
            <option>FRANCHISE</option>
            <option>ALL_STAR</option>
            <option>STARTER</option>
            <option>ROTATION</option>
            <option>DEPTH</option>
          </select>
          <input
            type="number"
            min="0"
            max="10"
            step="0.1"
            placeholder="Grade (0-10)"
            className="border border-border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted focus:border-cyan focus:outline-none"
          />
        </div>
        <textarea
          placeholder="Your scouting analysis..."
          rows={4}
          className="border border-border bg-background p-3 text-[11px] text-foreground placeholder:text-muted focus:border-cyan focus:outline-none"
        />
        <button className="border border-cyan bg-cyan/10 px-4 py-2 text-[10px] font-bold tracking-wider text-cyan transition-colors hover:bg-cyan/20">
          SUBMIT_REPORT
        </button>
      </div>
    </div>
  )
}
