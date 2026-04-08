'use client'

import { useState, useEffect } from 'react'

export function ScrollToTop() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setShow(window.scrollY > 500)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (!show) return null

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-20 left-4 z-50 border border-border bg-surface/90 p-2.5 text-muted shadow-lg backdrop-blur-sm transition-all hover:border-cyan hover:text-cyan md:bottom-4"
      aria-label="Scroll to top"
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M7 12V2M2 6l5-4 5 4" />
      </svg>
    </button>
  )
}
