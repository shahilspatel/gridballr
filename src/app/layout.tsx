import type { Metadata, Viewport } from 'next'
import { JetBrains_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { GlobalSearch } from '@/components/search/global-search'
import { KeyboardShortcuts } from '@/components/ui/keyboard-shortcuts'
import { ScrollToTop } from '@/components/ui/scroll-to-top'
import { ToastProvider } from '@/components/ui/toast'
import './globals.css'

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  display: 'swap',
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  colorScheme: 'dark',
  themeColor: '#00f0ff',
}

export const metadata: Metadata = {
  metadataBase: new URL('https://gridballr.com'),
  title: {
    default: 'GridBallr — NFL Draft Intelligence Platform',
    template: '%s | GridBallr',
  },
  description:
    'Advanced NFL draft scouting, analytics, and prospect intelligence. Big boards, film breakdowns, mock draft simulator, and dynasty tools.',
  keywords: [
    'NFL Draft',
    'draft prospects',
    'mock draft',
    'scouting reports',
    'dynasty fantasy football',
    'NFL combine',
    'draft analytics',
  ],
  openGraph: {
    title: 'GridBallr — NFL Draft Intelligence Platform',
    description: 'Advanced NFL draft scouting, analytics, and prospect intelligence.',
    siteName: 'GridBallr',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'GridBallr — NFL Draft Intelligence Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GridBallr — NFL Draft Intelligence Platform',
    description: 'Advanced NFL draft scouting, analytics, and prospect intelligence.',
    images: ['/og-image.png'],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${jetbrainsMono.variable} dark`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: 'GridBallr',
              description:
                'Advanced NFL draft scouting, analytics, and prospect intelligence platform',
              url: 'https://gridballr.com',
              applicationCategory: 'Sports Analytics',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD',
                name: 'Free Tier',
              },
            }),
          }}
        />
      </head>
      <body className="flex min-h-screen flex-col bg-background font-mono text-foreground antialiased">
        <ToastProvider>
          <Navbar />
          <GlobalSearch />
          <KeyboardShortcuts />
          <ScrollToTop />
          <main className="flex-1 pt-14 pb-16 md:pb-0">{children}</main>
          <Footer />
        </ToastProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
