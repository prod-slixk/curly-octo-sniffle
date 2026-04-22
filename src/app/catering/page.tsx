import type { Metadata } from 'next'
import { CateringInquiry } from '@/components/sections/CateringInquiry'
import { SITE_CONFIG } from '@/lib/constants'

// -----------------------------------------------------------------------------
// /catering — Catering Inquiry page
// High-ticket conversion surface: events, corporate, private bookings.
// -----------------------------------------------------------------------------

export const metadata: Metadata = {
  title:       `Catering | ${SITE_CONFIG.name}`,
  description: `Book ${SITE_CONFIG.name} for your next event. Corporate lunches, private parties, large gatherings — we come to you. Serving Tarboro, NC and surrounding areas.`,
  openGraph: {
    title:       `Catering | ${SITE_CONFIG.name}`,
    description: 'Book us for your event. Corporate, private, and large-scale catering in Tarboro, NC.',
    type:        'website',
  },
}

export default function CateringPage() {
  return <CateringInquiry />
}
