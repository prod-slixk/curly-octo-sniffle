import type { Metadata } from 'next'
import { Bebas_Neue, Inter } from 'next/font/google'
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
  return (
    <html lang="en" className={`${bebasNeue.variable} ${inter.variable}`}>
      {/*
        Preload local fonts before CSS is parsed so they have the best chance
        of arriving within the 100ms font-display:optional block window.
        AbstractGroovy (18 KB) is used in the ticker and hero headline — above the fold.
        SoulWave (68 KB) is used in section headings — critical for visual stability.
      */}
      <head>
        <link
          rel="preload"
          href="/fonts/aAbstractGroovy.ttf"
          as="font"
          type="font/truetype"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/SoulWave-Demo.ttf"
          as="font"
          type="font/truetype"
          crossOrigin="anonymous"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}