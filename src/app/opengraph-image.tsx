import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'GridBallr — NFL Draft Intelligence Platform'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    <div
      style={{
        background: '#0a0a0f',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'monospace',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Grid lines background */}
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
        }}
      />

      {/* Glow effect */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,240,255,0.15) 0%, transparent 70%)',
          transform: 'translate(-50%, -50%)',
        }}
      />

      {/* Logo dot */}
      <div
        style={{
          width: 16,
          height: 16,
          borderRadius: '50%',
          background: '#00f0ff',
          boxShadow: '0 0 20px rgba(0,240,255,0.8)',
          marginBottom: 20,
          display: 'flex',
        }}
      />

      {/* Title */}
      <div
        style={{
          fontSize: 72,
          fontWeight: 800,
          color: '#00f0ff',
          letterSpacing: '0.1em',
          marginBottom: 16,
          textShadow: '0 0 40px rgba(0,240,255,0.5)',
          display: 'flex',
        }}
      >
        GRIDBALLR
      </div>

      {/* Subtitle */}
      <div
        style={{
          fontSize: 24,
          color: '#a1a1aa',
          letterSpacing: '0.2em',
          marginBottom: 40,
          display: 'flex',
        }}
      >
        NFL DRAFT INTELLIGENCE PLATFORM
      </div>

      {/* Feature pills */}
      <div style={{ display: 'flex', gap: 12 }}>
        {['BIG BOARD', 'MOCK DRAFT', 'FILM TERMINAL', 'DYNASTY TOOLS'].map((feature) => (
          <div
            key={feature}
            style={{
              border: '1px solid rgba(0,240,255,0.3)',
              padding: '8px 16px',
              fontSize: 14,
              color: '#00f0ff',
              letterSpacing: '0.15em',
              display: 'flex',
            }}
          >
            {feature}
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div
        style={{
          position: 'absolute',
          bottom: 30,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          fontSize: 14,
          color: '#71717a',
          letterSpacing: '0.1em',
        }}
      >
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: '#00ff88',
            display: 'flex',
          }}
        />
        gridballr.com // FREE TO USE
      </div>
    </div>,
    { ...size },
  )
}
