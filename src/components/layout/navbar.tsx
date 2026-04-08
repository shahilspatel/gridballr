'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const NAV_LINKS = [
  { href: '/', label: 'BOARD', shortLabel: 'BOARD' },
  { href: '/stats', label: 'STATS', shortLabel: 'STATS' },
  { href: '/compare', label: 'COMPARE', shortLabel: 'COMPARE' },
  { href: '/mock-draft', label: 'MOCK', shortLabel: 'MOCK' },
  { href: '/galaxy', label: 'GALAXY', shortLabel: 'GALAXY' },
  { href: '/film-terminal', label: 'FILM', shortLabel: 'FILM' },
  { href: '/scouts', label: 'SCOUTS', shortLabel: 'SCOUTS' },
  { href: '/my-board', label: 'MY_BOARD', shortLabel: 'MY BOARD' },
  { href: '/dynasty', label: 'DYNASTY', shortLabel: 'DYNASTY' },
] as const

// Primary items shown directly in the bottom bar (max 5 for thumb reach)
const BOTTOM_NAV_PRIMARY = NAV_LINKS.slice(0, 4)
// Overflow items shown in the expandable tray
const BOTTOM_NAV_OVERFLOW = NAV_LINKS.slice(4)

export function Navbar() {
  const pathname = usePathname()
  const [moreOpen, setMoreOpen] = useState(false)

  return (
    <>
      {/* Top bar — always visible */}
      <nav className="fixed top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-cyan shadow-[0_0_8px_var(--cyan)]" />
              <span className="text-sm font-bold tracking-wider text-cyan glow">GRIDBALLR</span>
            </div>
            <span className="hidden text-[10px] text-muted sm:inline">v0.1.0</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((link) => {
              const isActive = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-2.5 py-1.5 text-[11px] font-medium tracking-wide transition-colors ${
                    isActive ? 'text-cyan glow' : 'text-muted hover:text-foreground'
                  }`}
                >
                  [{link.label}]
                </Link>
              )
            })}
          </div>

          {/* Search + Status + Auth */}
          <div className="flex items-center gap-3">
            <SearchTrigger />
            <div className="hidden items-center gap-1.5 text-[10px] text-muted lg:flex">
              <div className="h-1.5 w-1.5 rounded-full bg-green" />
              <span>SYS_ONLINE</span>
            </div>
            <Link
              href="/login"
              className="border border-border px-3 py-1 text-[11px] text-muted transition-colors hover:border-cyan hover:text-cyan"
            >
              LOGIN
            </Link>
          </div>
        </div>
      </nav>

      {/* Mobile bottom nav — fixed bottom bar */}
      <div className="fixed bottom-0 z-50 w-full md:hidden">
        {/* Overflow tray */}
        {moreOpen && (
          <div className="border-t border-border bg-background/98 backdrop-blur-sm px-4 py-3">
            <div className="grid grid-cols-3 gap-1">
              {BOTTOM_NAV_OVERFLOW.map((link) => {
                const isActive =
                  link.href === '/' ? pathname === '/' : pathname.startsWith(link.href)
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMoreOpen(false)}
                    className={`px-2 py-2.5 text-center text-[10px] font-medium tracking-wide transition-colors ${
                      isActive
                        ? 'text-cyan bg-cyan/5 border border-cyan/20'
                        : 'text-muted hover:text-foreground border border-transparent'
                    }`}
                  >
                    {link.shortLabel}
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        {/* Primary bottom bar */}
        <div className="border-t border-border bg-background/98 backdrop-blur-sm">
          <div className="flex items-stretch">
            {BOTTOM_NAV_PRIMARY.map((link) => {
              const isActive = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMoreOpen(false)}
                  className={`flex-1 py-3 text-center text-[10px] font-medium tracking-wide transition-colors ${
                    isActive ? 'text-cyan' : 'text-muted'
                  }`}
                >
                  {isActive && (
                    <div className="mx-auto mb-1 h-0.5 w-4 bg-cyan shadow-[0_0_6px_var(--cyan)]" />
                  )}
                  {link.shortLabel}
                </Link>
              )
            })}
            {/* More button */}
            <button
              onClick={() => setMoreOpen(!moreOpen)}
              className={`flex-1 py-3 text-center text-[10px] font-medium tracking-wide transition-colors ${
                moreOpen ? 'text-cyan' : 'text-muted'
              }`}
            >
              {moreOpen && (
                <div className="mx-auto mb-1 h-0.5 w-4 bg-cyan shadow-[0_0_6px_var(--cyan)]" />
              )}
              MORE
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

function SearchTrigger() {
  const openSearch = () => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))
  }

  return (
    <button
      onClick={openSearch}
      className="hidden items-center gap-2 border border-border px-2.5 py-1 text-[10px] text-muted transition-colors hover:border-cyan hover:text-cyan sm:flex"
      aria-label="Search prospects"
    >
      <span>SEARCH</span>
      <kbd className="border border-border/50 px-1 py-px text-[8px]">⌘K</kbd>
    </button>
  )
}
