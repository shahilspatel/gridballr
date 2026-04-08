import type { MetadataRoute } from 'next'
import { SEED_PLAYERS } from '@/lib/data/seed-prospects'
import { SEED_PLAYERS_2026 } from '@/lib/data/seed-prospects-2026'
import { AVAILABLE_YEARS } from '@/lib/data/draft-history'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://gridballr.com'

  const staticPages = [
    '',
    '/stats',
    '/compare',
    '/mock-draft',
    '/film-terminal',
    '/galaxy',
    '/scouts',
    '/my-board',
    '/dynasty',
    '/dynasty/calculator',
    '/pricing',
    '/login',
    '/signup',
    '/terms',
    '/privacy',
  ].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: path === '' ? 1 : 0.8,
  }))

  const playerPages = [...SEED_PLAYERS_2026, ...SEED_PLAYERS].map((player) => ({
    url: `${baseUrl}/players/${player.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }))

  const draftHistoryPages = AVAILABLE_YEARS.map((year) => ({
    url: `${baseUrl}/draft-history/${year}`,
    lastModified: new Date(),
    changeFrequency: 'yearly' as const,
    priority: 0.6,
  }))

  return [...staticPages, ...playerPages, ...draftHistoryPages]
}
