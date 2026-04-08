import { ImageResponse } from 'next/og'
import { SEED_PLAYERS } from '@/lib/data/seed-prospects'
import { SEED_PLAYERS_2026 } from '@/lib/data/seed-prospects-2026'

export const runtime = 'edge'
export const alt = 'GridBallr Player Profile'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const ALL_PROSPECTS = [...SEED_PLAYERS_2026, ...SEED_PLAYERS]

const TIER_COLORS: Record<string, string> = {
  ELITE: '#ffd700',
  FRANCHISE: '#00f0ff',
  ALL_STAR: '#a78bfa',
  STARTER: '#00ff88',
  ROTATION: '#ffb800',
  DEPTH: '#71717a',
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const player = ALL_PROSPECTS.find((p) => p.slug === slug)

  if (!player) {
    return new ImageResponse(
      <div
        style={{
          background: '#0a0a0f',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#a1a1aa',
          fontSize: 32,
          fontFamily: 'monospace',
        }}
      >
        Player Not Found
      </div>,
      { ...size },
    )
  }

  const tierColor = TIER_COLORS[player.tier ?? 'DEPTH'] ?? '#71717a'

  return new ImageResponse(
    <div
      style={{
        background: '#0a0a0f',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        padding: 60,
        fontFamily: 'monospace',
        position: 'relative',
      }}
    >
      {/* Grid background */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage:
            'linear-gradient(rgba(0,240,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,240,255,0.03) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          display: 'flex',
        }}
      />

      {/* Top bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 40,
        }}
      >
        <div
          style={{
            width: 12,
            height: 12,
            borderRadius: '50%',
            background: '#00f0ff',
            boxShadow: '0 0 12px rgba(0,240,255,0.8)',
            display: 'flex',
          }}
        />
        <span style={{ color: '#00f0ff', fontSize: 18, letterSpacing: '0.15em', display: 'flex' }}>
          GRIDBALLR
        </span>
        <span style={{ color: '#52525b', fontSize: 18, display: 'flex' }}>// PLAYER_PROFILE</span>
      </div>

      {/* Rank */}
      <div
        style={{
          fontSize: 120,
          fontWeight: 800,
          color: '#1a1a2e',
          position: 'absolute',
          right: 60,
          top: 40,
          display: 'flex',
          letterSpacing: '-0.05em',
        }}
      >
        #{String(player.big_board_rank ?? 0).padStart(2, '0')}
      </div>

      {/* Player name */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 12 }}>
        <span style={{ fontSize: 56, fontWeight: 800, color: '#fafafa', display: 'flex' }}>
          {player.first_name} {player.last_name}
        </span>
      </div>

      {/* Position + School */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
        <span
          style={{
            border: `2px solid ${tierColor}`,
            color: tierColor,
            padding: '6px 14px',
            fontSize: 20,
            fontWeight: 700,
            letterSpacing: '0.1em',
            display: 'flex',
          }}
        >
          {player.position}
        </span>
        <span style={{ color: '#a1a1aa', fontSize: 22, display: 'flex' }}>{player.school}</span>
        {player.conference && (
          <span style={{ color: '#52525b', fontSize: 22, display: 'flex' }}>
            | {player.conference}
          </span>
        )}
      </div>

      {/* Tier badge */}
      <div style={{ display: 'flex', marginBottom: 24 }}>
        <span
          style={{
            border: `1px solid ${tierColor}40`,
            background: `${tierColor}10`,
            color: tierColor,
            padding: '8px 16px',
            fontSize: 16,
            fontWeight: 700,
            letterSpacing: '0.15em',
            display: 'flex',
          }}
        >
          {player.tier}
        </span>
      </div>

      {/* Comp */}
      {player.player_comp && (
        <div style={{ display: 'flex', gap: 8, fontSize: 18 }}>
          <span style={{ color: '#00f0ff80', display: 'flex' }}>COMP:</span>
          <span style={{ color: '#a1a1aa', display: 'flex' }}>{player.player_comp}</span>
        </div>
      )}

      {/* Bottom bar */}
      <div
        style={{
          position: 'absolute',
          bottom: 40,
          left: 60,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          fontSize: 14,
          color: '#52525b',
          letterSpacing: '0.1em',
        }}
      >
        gridballr.com // {player.draft_year} DRAFT CLASS
      </div>
    </div>,
    { ...size },
  )
}
