'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const SHORTCUTS = [
  { key: '⌘K', label: 'Search prospects', action: 'search' },
  { key: '?', label: 'Show shortcuts', action: 'help' },
  { key: 'B', label: 'Go to Big Board', href: '/' },
  { key: 'S', label: 'Go to Stat Matrix', href: '/stats' },
  { key: 'C', label: 'Go to Compare', href: '/compare' },
  { key: 'M', label: 'Go to Mock Draft', href: '/mock-draft' },
  { key: 'D', label: 'Go to Dynasty', href: '/dynasty' },
  { key: 'L', label: 'Go to Lottery', href: '/lottery' },
] as const

export function KeyboardShortcuts() {
  const router = useRouter()
  const [showPanel, setShowPanel] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if user is typing in an input
      const target = e.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT'
      )
        return

      if (e.key === '?') {
        e.preventDefault()
        setShowPanel((prev) => !prev)
        return
      }

      if (e.key === 'Escape') {
        setShowPanel(false)
        return
      }

      // Navigation shortcuts (only when not in input and no modifier keys)
      if (e.metaKey || e.ctrlKey || e.altKey) return

      const shortcut = SHORTCUTS.find(
        (s) => 'href' in s && s.key.toLowerCase() === e.key.toLowerCase(),
      )
      if (shortcut && 'href' in shortcut) {
        e.preventDefault()
        setShowPanel(false)
        router.push(shortcut.href)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [router])

  if (!showPanel) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={() => setShowPanel(false)}
      />
      <div className="relative w-full max-w-sm mx-4 border border-border bg-surface shadow-2xl shadow-cyan/5">
        <div className="border-b border-border px-4 py-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold tracking-widest text-cyan">KEYBOARD_SHORTCUTS</span>
            <kbd className="border border-border px-1.5 py-0.5 text-[9px] text-muted">ESC</kbd>
          </div>
        </div>
        <div className="divide-y divide-border/30">
          {SHORTCUTS.map((shortcut) => (
            <div key={shortcut.key} className="flex items-center justify-between px-4 py-2.5">
              <span className="text-[11px] text-foreground/70">{shortcut.label}</span>
              <kbd className="border border-border bg-background px-2 py-0.5 text-[10px] font-bold text-cyan">
                {shortcut.key}
              </kbd>
            </div>
          ))}
        </div>
        <div className="border-t border-border px-4 py-2 text-[9px] text-muted">
          Press <span className="text-cyan">?</span> anywhere to toggle this panel
        </div>
      </div>
    </div>
  )
}
