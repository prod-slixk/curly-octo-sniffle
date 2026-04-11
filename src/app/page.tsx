import { Hero } from '@/components/sections/Hero'
import { MenuGrid } from '@/components/sections/MenuGrid'
import { FindUs } from '@/components/sections/FindUs'
import { Contact } from '@/components/sections/Contact'
import { Footer } from '@/components/layout/Footer'

export default function Home() {
  return (
    <main>
      <Hero />
      <MenuGrid />
      <FindUs />
      <Contact />
      <Footer />
    </main>
  )
}