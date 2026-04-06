import type { Metadata } from 'next'
import { JetBrains_Mono } from 'next/font/google'
import { Navbar } from '@/components/layout/navbar'
import './globals.css'

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
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
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GridBallr — NFL Draft Intelligence Platform',
    description: 'Advanced NFL draft scouting, analytics, and prospect intelligence.',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${jetbrainsMono.variable} dark`}>
      <body className="min-h-screen bg-background font-mono text-foreground antialiased">
        <Navbar />
        <main className="pt-14">{children}</main>
      </body>
    </html>
  )
}
