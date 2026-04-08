'use client'

import { useState, useMemo } from 'react'
import {
  DYNASTY_ROOKIE_VALUES,
  ESTABLISHED_PLAYER_VALUES,
  PICK_VALUES,
  type DynastyPlayerValue,
} from '@/lib/data/dynasty-values'

type TradeAsset = {
  id: string
  name: string
  value: number
  type: 'player' | 'pick'
  position?: string
}

const ALL_PLAYERS = [...ESTABLISHED_PLAYER_VALUES, ...DYNASTY_ROOKIE_VALUES]
const ALL_PICKS = Object.entries(PICK_VALUES).map(([pick, value]) => ({
  id: `pick-${pick}`,
  name: `2025 ${pick}`,
  value,
  type: 'pick' as const,
}))

export function TradeCalculator() {
  const [sideA, setSideA] = useState<TradeAsset[]>([])
  const [sideB, setSideB] = useState<TradeAsset[]>([])
  const [searchA, setSearchA] = useState('')
  const [searchB, setSearchB] = useState('')

  const totalA = sideA.reduce((sum, a) => sum + a.value, 0)
  const totalB = sideB.reduce((sum, a) => sum + a.value, 0)
  const diff = totalA - totalB
  const verdict = Math.abs(diff) < 500 ? 'FAIR' : diff > 0 ? 'SIDE A WINS' : 'SIDE B WINS'
  const verdictColor = Math.abs(diff) < 500 ? 'text-green' : 'text-amber'

  function addToSide(side: 'A' | 'B', asset: TradeAsset) {
    if (side === 'A') {
      if (!sideA.find((a) => a.id === asset.id)) {
        setSideA([...sideA, asset])
      }
    } else {
      if (!sideB.find((a) => a.id === asset.id)) {
        setSideB([...sideB, asset])
      }
    }
  }

  function removeFromSide(side: 'A' | 'B', id: string) {
    if (side === 'A') setSideA(sideA.filter((a) => a.id !== id))
    else setSideB(sideB.filter((a) => a.id !== id))
  }

  function getFilteredAssets(search: string): TradeAsset[] {
    const q = search.toLowerCase()
    const players: TradeAsset[] = ALL_PLAYERS.filter((p) => p.name.toLowerCase().includes(q)).map(
      (p) => ({
        id: p.slug,
        name: p.name,
        value: p.value,
        type: 'player',
        position: p.position,
      }),
    )
    const picks: TradeAsset[] = ALL_PICKS.filter((p) => p.name.toLowerCase().includes(q))
    return [...players, ...picks].slice(0, 10)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Verdict */}
      <div className="border border-border bg-surface p-4 text-center">
        <div className="text-[10px] text-muted">TRADE_ANALYSIS</div>
        <div className={`mt-1 text-lg font-bold ${verdictColor}`}>
          {sideA.length > 0 || sideB.length > 0 ? verdict : 'ADD ASSETS TO EVALUATE'}
        </div>
        {(sideA.length > 0 || sideB.length > 0) && (
          <div className="mt-1 text-[10px] text-muted">
            DIFFERENCE: <span className="text-cyan">{Math.abs(diff).toLocaleString()}</span> PTS
          </div>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Side A */}
        <TradeSide
          label="SIDE_A"
          assets={sideA}
          total={totalA}
          search={searchA}
          onSearchChange={setSearchA}
          onAdd={(asset) => addToSide('A', asset)}
          onRemove={(id) => removeFromSide('A', id)}
          getFiltered={getFilteredAssets}
        />

        {/* Side B */}
        <TradeSide
          label="SIDE_B"
          assets={sideB}
          total={totalB}
          search={searchB}
          onSearchChange={setSearchB}
          onAdd={(asset) => addToSide('B', asset)}
          onRemove={(id) => removeFromSide('B', id)}
          getFiltered={getFilteredAssets}
        />
      </div>

      {/* Value bar comparison */}
      {(sideA.length > 0 || sideB.length > 0) && (
        <div className="border border-border bg-surface p-4">
          <div className="mb-2 text-[10px] font-bold tracking-widest text-cyan">
            VALUE_COMPARISON
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <span className="w-16 text-[10px] text-muted">SIDE A</span>
              <div className="flex-1 bg-surface-2">
                <div
                  className="h-4 bg-cyan/30 transition-all"
                  style={{
                    width: `${Math.min(100, (totalA / Math.max(totalA, totalB, 1)) * 100)}%`,
                  }}
                />
              </div>
              <span className="w-16 text-right text-xs font-bold tabular-nums text-foreground">
                {totalA.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-16 text-[10px] text-muted">SIDE B</span>
              <div className="flex-1 bg-surface-2">
                <div
                  className="h-4 bg-green/30 transition-all"
                  style={{
                    width: `${Math.min(100, (totalB / Math.max(totalA, totalB, 1)) * 100)}%`,
                  }}
                />
              </div>
              <span className="w-16 text-right text-xs font-bold tabular-nums text-foreground">
                {totalB.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function TradeSide({
  label,
  assets,
  total,
  search,
  onSearchChange,
  onAdd,
  onRemove,
  getFiltered,
}: {
  label: string
  assets: TradeAsset[]
  total: number
  search: string
  onSearchChange: (s: string) => void
  onAdd: (asset: TradeAsset) => void
  onRemove: (id: string) => void
  getFiltered: (search: string) => TradeAsset[]
}) {
  const [showDropdown, setShowDropdown] = useState(false)
  const filtered = search.length >= 2 ? getFiltered(search) : []

  return (
    <div className="border border-border bg-surface">
      <div className="flex items-center justify-between border-b border-border bg-surface-2 px-3 py-2">
        <span className="text-[10px] font-bold tracking-widest text-cyan">{label}</span>
        <span className="text-[10px] tabular-nums text-muted">{total.toLocaleString()} PTS</span>
      </div>

      {/* Search */}
      <div className="relative border-b border-border p-2">
        <input
          type="text"
          placeholder="Search player or pick..."
          value={search}
          onChange={(e) => {
            onSearchChange(e.target.value)
            setShowDropdown(true)
          }}
          onFocus={() => setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
          className="w-full border border-border bg-background px-2 py-1.5 text-[11px] text-foreground placeholder:text-muted focus:border-cyan focus:outline-none"
        />
        {showDropdown && filtered.length > 0 && (
          <div className="absolute left-2 right-2 top-full z-10 max-h-48 overflow-y-auto border border-border bg-background shadow-lg">
            {filtered.map((asset) => (
              <button
                key={asset.id}
                onMouseDown={() => {
                  onAdd(asset)
                  onSearchChange('')
                  setShowDropdown(false)
                }}
                className="flex w-full items-center justify-between px-2 py-1.5 text-left transition-colors hover:bg-surface"
              >
                <div className="flex items-center gap-2">
                  {asset.position && (
                    <span className="text-[9px] font-bold text-cyan">{asset.position}</span>
                  )}
                  <span className="text-[11px] text-foreground">{asset.name}</span>
                </div>
                <span className="text-[9px] tabular-nums text-muted">
                  {asset.value.toLocaleString()}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Assets */}
      <div className="min-h-[120px]">
        {assets.length === 0 ? (
          <div className="flex h-[120px] items-center justify-center">
            <span className="text-[10px] text-muted">ADD PLAYERS OR PICKS</span>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {assets.map((asset) => (
              <div key={asset.id} className="flex items-center justify-between px-3 py-2">
                <div className="flex items-center gap-2">
                  {asset.position && (
                    <span className="text-[9px] font-bold text-cyan">{asset.position}</span>
                  )}
                  <span className="text-xs text-foreground">{asset.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] tabular-nums text-muted">
                    {asset.value.toLocaleString()}
                  </span>
                  <button
                    onClick={() => onRemove(asset.id)}
                    className="text-[10px] text-red hover:text-red/80"
                  >
                    X
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
