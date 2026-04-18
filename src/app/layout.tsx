import type { Metadata } from 'next'
import { Bebas_Neue, Inter } from 'next/font/google'
import ReactDOM from 'react-dom'
import './globals.css'
import { SITE_CONFIG } from '@/lib/constants'

// ─── Google Fonts ─────────────────────────────────────────────────────────────
// Bebas Neue: fallback in the display font cascade (AbstractGroovy → Bebas Neue → Impact).
// 'optional' — no swap after 100ms block window, eliminating the double-shift
// that would occur if AbstractGroovy misses its window and Bebas Neue loads later.
const bebasNeue = Bebas_Neue({
  weight:   '400',
  subsets:  ['latin'],
  variable: '--font-bebas-neue',
  display:  'optional',
})

// Inter: body copy. Swap is acceptable here — Inter is a system-adjacent font
// (very similar metrics to ui-sans-serif) so the visual shift is negligible.
const inter = Inter({
  subsets:  ['latin'],
  variable: '--font-inter',
  display:  'swap',
})

export const metadata: Metadata = {
  title:       `${SITE_CONFIG.name} | ${SITE_CONFIG.tagline}`,
  description: SITE_CONFIG.description,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // ReactDOM.preload() (React 19) hoists <link rel="preload"> into <head>
  // without a manual <head> node — avoids the hydration mismatch that an
  // explicit <head> tag causes in Next.js App Router. Correct MIME type for
  // TTF is 'font/ttf', not 'font/truetype'.
  ReactDOM.preload('/fonts/aAbstractGroovy.ttf', { as: 'font', type: 'font/ttf', crossOrigin: 'anonymous' })
  ReactDOM.preload('/fonts/SoulWave-Demo.ttf',   { as: 'font', type: 'font/ttf', crossOrigin: 'anonymous' })

  return (
    <html lang="en" className={`${bebasNeue.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  )
}