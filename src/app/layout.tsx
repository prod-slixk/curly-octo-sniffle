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
  // Font preloading is handled by next/font (Bebas Neue) and by the CSS
  // font-display:optional block window for local fonts (AbstractGroovy, SoulWave).
  // Manual ReactDOM.preload() calls were removed — they inject <link> nodes
  // into the React resource tree during the server pass, then reconcile
  // differently on the client, which triggers hydration error #418.
  //
  // data-gramm / data-gramm_editor: suppress Grammarly DOM attribute injection
  // on <body>. Grammarly adds data-gr-* attributes after hydration which React
  // then detects as a server/client mismatch — another #418 source.
  return (
    <html lang="en" className={`${bebasNeue.variable} ${inter.variable}`}>
      <body data-gramm="false" data-gramm_editor="false">{children}</body>
    </html>
  )
}