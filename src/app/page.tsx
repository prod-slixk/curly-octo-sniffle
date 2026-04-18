import { Hero } from '@/components/sections/Hero'
import { MenuGrid } from '@/components/sections/MenuGrid'
import { FindUs } from '@/components/sections/FindUs'
import { Contact } from '@/components/sections/Contact'
import { Footer } from '@/components/layout/Footer'
import { MobileStickyCTA } from '@/components/layout/MobileStickyCTA'
import { JsonLd } from '@/components/JsonLd'

export default function Home() {
  return (
    <>
      {/* JSON-LD structured data — hoisted to <head> by Next.js App Router.
          Powers Google Knowledge Panel, Maps listing, and local pack results. */}
      <JsonLd />

      {/* pb-20 md:pb-0 — reserves space for the sticky CTA bar on mobile
          so footer content isn't clipped behind it */}
      <main className="pb-20 md:pb-0">
        <Hero />
        <MenuGrid />
        <FindUs />
        <Contact />
        <Footer />
        <MobileStickyCTA />
      </main>
    </>
  )
}