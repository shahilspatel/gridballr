export function formatHeight(inches: number | null): string {
  if (!inches) return '—'
  const feet = Math.floor(inches / 12)
  const remaining = inches % 12
  return `${feet}'${remaining}"`
}

export function formatWeight(lbs: number | null): string {
  if (!lbs) return '—'
  return `${lbs} lbs`
}

export function formatTime(seconds: number | null): string {
  if (!seconds) return '—'
  return seconds.toFixed(2)
}

export function formatStat(value: number | null, decimals = 1): string {
  if (value === null || value === undefined) return '—'
  return value.toFixed(decimals)
}

export function formatPercent(value: number | null): string {
  if (value === null || value === undefined) return '—'
  return `${value.toFixed(1)}%`
}

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function getPositionColor(position: string): string {
  const colors: Record<string, string> = {
    QB: '#ff6b6b',
    RB: '#00ff88',
    WR: '#00f0ff',
    TE: '#ffd700',
    OT: '#a78bfa',
    IOL: '#a78bfa',
    DL: '#ff8c42',
    EDGE: '#ff3b3b',
    LB: '#ffb800',
    CB: '#4ecdc4',
    S: '#45b7d1',
  }
  return colors[position] ?? '#71717a'
}

export function getTierColor(tier: string): string {
  const colors: Record<string, string> = {
    ELITE: '#ffd700',
    FRANCHISE: '#00f0ff',
    ALL_STAR: '#a78bfa',
    STARTER: '#00ff88',
    ROTATION: '#ffb800',
    DEPTH: '#71717a',
  }
  return colors[tier] ?? '#71717a'
}
