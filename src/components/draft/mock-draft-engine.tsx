'use client'

import { useState, useCallback } from 'react'
import type { Player } from '@/types'
import { SEED_PLAYERS } from '@/lib/data/seed-prospects'
import { NFL_TEAM_DATA, positionMatchesNeed } from '@/lib/data/nfl-teams'
import { getPositionColor } from '@/lib/utils/format'

interface DraftPick {
  pickNumber: number
  team: string
  teamName: string
  player: Player | null
  isUser: boolean
}

type DraftPhase = 'setup' | 'drafting' | 'complete'

export function MockDraftEngine() {
  const [phase, setPhase] = useState<DraftPhase>('setup')
  const [userTeam, setUserTeam] = useState('NYG')
  const [picks, setPicks] = useState<DraftPick[]>([])
  const [currentPick, setCurrentPick] = useState(0)
  const [availablePlayers, setAvailablePlayers] = useState<Player[]>([])

  const initDraft = useCallback(() => {
    const allPlayers = (SEED_PLAYERS as Player[]).sort(
      (a, b) => (a.big_board_rank ?? 999) - (b.big_board_rank ?? 999),
    )
    setAvailablePlayers(allPlayers)

    const draftPicks: DraftPick[] = NFL_TEAM_DATA.map((team, i) => ({
      pickNumber: i + 1,
      team: team.abbr,
      teamName: team.name,
      player: null,
      isUser: team.abbr === userTeam,
    }))
    setPicks(draftPicks)
    setCurrentPick(0)
    setPhase('drafting')

    // Auto-pick until user's turn
    autoPickUntilUser(draftPicks, allPlayers, 0)
  }, [userTeam])

  function autoPickUntilUser(currentPicks: DraftPick[], available: Player[], startIdx: number) {
    const newPicks = [...currentPicks]
    let remaining = [...available]
    let idx = startIdx

    while (idx < newPicks.length && !newPicks[idx].isUser) {
      const team = NFL_TEAM_DATA.find((t) => t.abbr === newPicks[idx].team)!
      const pick = aiSelectPlayer(remaining, team.needs)
      if (pick) {
        newPicks[idx] = { ...newPicks[idx], player: pick }
        remaining = remaining.filter((p) => p.slug !== pick.slug)
      }
      idx++
    }

    setPicks(newPicks)
    setAvailablePlayers(remaining)
    setCurrentPick(idx)

    if (idx >= newPicks.length) {
      setPhase('complete')
    }
  }

  function aiSelectPlayer(available: Player[], needs: string[]): Player | null {
    if (available.length === 0) return null

    // Find best available player that matches a need
    for (const need of needs) {
      const match = available.find((p) => positionMatchesNeed(p.position, need))
      if (match) return match
    }
    // BPA fallback
    return available[0]
  }

  function userPick(player: Player) {
    const newPicks = [...picks]
    newPicks[currentPick] = { ...newPicks[currentPick], player }
    const remaining = availablePlayers.filter((p) => p.slug !== player.slug)

    setPicks(newPicks)
    setAvailablePlayers(remaining)

    const nextIdx = currentPick + 1
    if (nextIdx >= newPicks.length) {
      setPicks(newPicks)
      setPhase('complete')
    } else {
      autoPickUntilUser(newPicks, remaining, nextIdx)
    }
  }

  function resetDraft() {
    setPhase('setup')
    setPicks([])
    setCurrentPick(0)
    setAvailablePlayers([])
  }

  if (phase === 'setup') {
    return (
      <div className="flex flex-col gap-6">
        <div className="border border-border bg-surface p-6">
          <h2 className="mb-4 text-xs font-bold tracking-widest text-cyan">DRAFT_CONFIGURATION</h2>
          <div className="flex flex-col gap-4">
            <div>
              <label className="mb-1 block text-[10px] font-bold tracking-widest text-muted">
                SELECT YOUR TEAM
              </label>
              <select
                value={userTeam}
                onChange={(e) => setUserTeam(e.target.value)}
                className="w-full border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-cyan focus:outline-none sm:w-80"
              >
                {NFL_TEAM_DATA.map((team) => (
                  <option key={team.abbr} value={team.abbr}>
                    #{NFL_TEAM_DATA.indexOf(team) + 1} — {team.city} {team.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="text-[10px] text-muted">
              <span className="text-cyan">MODE:</span> SOLO // 1 ROUND // 32 PICKS // BPA + NEED AI
            </div>
            <button
              onClick={initDraft}
              className="w-fit border border-cyan bg-cyan/10 px-6 py-2.5 text-xs font-bold tracking-wider text-cyan transition-colors hover:bg-cyan/20"
            >
              START_DRAFT
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (phase === 'complete') {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[10px]">
            <div className="h-1.5 w-1.5 rounded-full bg-green" />
            <span className="text-green">DRAFT_COMPLETE</span>
          </div>
          <button
            onClick={resetDraft}
            className="border border-border px-4 py-1.5 text-[10px] font-bold text-muted transition-colors hover:border-cyan hover:text-cyan"
          >
            NEW_DRAFT
          </button>
        </div>
        <DraftResults picks={picks} userTeam={userTeam} />
      </div>
    )
  }

  // Drafting phase
  const isUserPick = picks[currentPick]?.isUser

  return (
    <div className="flex flex-col gap-4">
      {/* Status bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-[10px]">
          <span className="text-muted">
            PICK: <span className="text-cyan">{currentPick + 1}/32</span>
          </span>
          <span className="text-muted">
            TEAM: <span className="text-foreground">{picks[currentPick]?.team}</span>
          </span>
          {isUserPick && (
            <span className="border border-green/30 bg-green/10 px-2 py-0.5 text-green">
              YOUR PICK
            </span>
          )}
        </div>
        <button
          onClick={resetDraft}
          className="border border-border px-3 py-1 text-[10px] text-muted hover:border-red hover:text-red"
        >
          RESET
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        {/* Draft board */}
        <div className="border border-border bg-surface">
          <div className="border-b border-border bg-surface-2 px-4 py-2">
            <span className="text-[10px] font-bold tracking-widest text-cyan">DRAFT_BOARD</span>
          </div>
          <div className="max-h-[500px] overflow-y-auto">
            {picks.map((pick, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 border-b border-border/50 px-4 py-2 ${
                  i === currentPick ? 'bg-cyan/5' : ''
                } ${pick.isUser ? 'border-l-2 border-l-green' : ''}`}
              >
                <span className="w-8 text-xs font-bold tabular-nums text-muted">
                  {String(pick.pickNumber).padStart(2, '0')}
                </span>
                <span className="w-12 text-xs font-bold text-foreground">{pick.team}</span>
                {pick.player ? (
                  <div className="flex items-center gap-2">
                    <span
                      className="text-[10px] font-bold"
                      style={{
                        color: getPositionColor(pick.player.position),
                      }}
                    >
                      {pick.player.position}
                    </span>
                    <span className="text-xs text-foreground">
                      {pick.player.first_name} {pick.player.last_name}
                    </span>
                    <span className="text-[10px] text-muted">{pick.player.school}</span>
                  </div>
                ) : i === currentPick ? (
                  <span className="text-[10px] text-amber animate-pulse">ON THE CLOCK...</span>
                ) : (
                  <span className="text-[10px] text-muted">—</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Available players (only show when it's user's pick) */}
        {isUserPick && (
          <div className="border border-border bg-surface">
            <div className="border-b border-border bg-surface-2 px-4 py-2">
              <span className="text-[10px] font-bold tracking-widest text-green">
                AVAILABLE_PROSPECTS
              </span>
            </div>
            <div className="max-h-[500px] overflow-y-auto">
              {availablePlayers.map((player) => (
                <button
                  key={player.slug}
                  onClick={() => userPick(player)}
                  className="flex w-full items-center gap-2 border-b border-border/50 px-3 py-2 text-left transition-colors hover:bg-cyan/5"
                >
                  <span className="w-6 text-[10px] font-bold tabular-nums text-muted">
                    {player.big_board_rank}
                  </span>
                  <span
                    className="w-10 text-[10px] font-bold"
                    style={{ color: getPositionColor(player.position) }}
                  >
                    {player.position}
                  </span>
                  <div className="flex flex-col">
                    <span className="text-xs text-foreground">
                      {player.first_name} {player.last_name}
                    </span>
                    <span className="text-[9px] text-muted">{player.school}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function DraftResults({ picks, userTeam }: { picks: DraftPick[]; userTeam: string }) {
  return (
    <div className="border border-border bg-surface">
      <div className="border-b border-border bg-surface-2 px-4 py-2">
        <span className="text-[10px] font-bold tracking-widest text-cyan">FINAL_RESULTS</span>
      </div>
      <div className="divide-y divide-border/50">
        {picks.map((pick) => (
          <div
            key={pick.pickNumber}
            className={`flex items-center gap-3 px-4 py-2.5 ${
              pick.team === userTeam ? 'bg-green/5 border-l-2 border-l-green' : ''
            }`}
          >
            <span className="w-8 text-xs font-bold tabular-nums text-muted">
              {String(pick.pickNumber).padStart(2, '0')}
            </span>
            <span className="w-12 text-xs font-bold text-foreground">{pick.team}</span>
            {pick.player && (
              <>
                <span
                  className="w-12 text-[10px] font-bold"
                  style={{ color: getPositionColor(pick.player.position) }}
                >
                  {pick.player.position}
                </span>
                <span className="text-xs text-foreground">
                  {pick.player.first_name} {pick.player.last_name}
                </span>
                <span className="text-[10px] text-muted">{pick.player.school}</span>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
