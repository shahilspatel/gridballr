'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const NAV_LINKS = [
  { href: '/', label: 'BOARD', shortLabel: 'BRD' },
  { href: '/stats', label: 'STATS', shortLabel: 'STS' },
  { href: '/compare', label: 'COMPARE', shortLabel: 'CMP' },
  { href: '/mock-draft', label: 'MOCK', shortLabel: 'MCK' },
  { href: '/galaxy', label: 'GALAXY', shortLabel: 'GLX' },
  { href: '/film-terminal', label: 'FILM', shortLabel: 'FLM' },
  { href: '/scouts', label: 'SCOUTS', shortLabel: 'SCT' },
  { href: '/my-board', label: 'MY_BOARD', shortLabel: 'MBD' },
  { href: '/dynasty', label: 'DYNASTY', shortLabel: 'DYN' },
  { href: '/lottery', label: 'LOTTERY', shortLabel: 'LOT' },
] as const

export function Navbar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
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

        {/* Status + Auth */}
        <div className="flex items-center gap-3">
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

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex flex-col gap-1 md:hidden"
            aria-label="Toggle menu"
          >
            <span
              className={`h-px w-4 bg-foreground transition-transform ${mobileOpen ? 'translate-y-[5px] rotate-45' : ''}`}
            />
            <span
              className={`h-px w-4 bg-foreground transition-opacity ${mobileOpen ? 'opacity-0' : ''}`}
            />
            <span
              className={`h-px w-4 bg-foreground transition-transform ${mobileOpen ? '-translate-y-[5px] -rotate-45' : ''}`}
            />
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="border-t border-border bg-background px-4 py-3 md:hidden">
          <div className="grid grid-cols-3 gap-2">
            {NAV_LINKS.map((link) => {
              const isActive = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`px-2 py-2 text-center text-[11px] font-medium tracking-wide transition-colors ${
                    isActive ? 'text-cyan glow' : 'text-muted hover:text-foreground'
                  }`}
                >
                  [{link.shortLabel}]
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </nav>
  )
}
