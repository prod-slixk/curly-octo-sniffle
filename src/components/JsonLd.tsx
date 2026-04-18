// ─────────────────────────────────────────────────────────────────────────────
// JsonLd.tsx — Server Component
//
// Injects FoodEstablishment JSON-LD into <head> via Next.js App Router's
// native script hoisting. No 'use client' — runs at build/request time,
// zero client JS cost.
//
// Data is derived entirely from constants so it stays in sync automatically:
// edit HOURS or SITE_CONFIG in constants.ts and the schema updates for free.
//
// Google uses this payload to populate:
//   • Knowledge Panel (name, hours, phone, address)
//   • Maps listings (geo, openingHoursSpecification)
//   • "food trucks near me" local pack (servesCuisine, priceRange, areaServed)
// ─────────────────────────────────────────────────────────────────────────────

import { SITE_CONFIG, HOURS, SOCIAL_LINKS, LOCATIONS } from '@/lib/constants'

export function JsonLd() {
  const { name, description, phone, email, address } = SITE_CONFIG
  const primary = LOCATIONS.find(l => l.isPrimary)

  // E.164 phone — required by schema.org telephone property
  const phoneE164 = `+1${phone.replace(/\D/g, '')}`

  // Derive siteUrl from env so staging and prod get the right canonical.
  // Set NEXT_PUBLIC_SITE_URL in Vercel project settings.
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://rollinmunchies.com'

  // ── openingHoursSpecification ──────────────────────────────────────────────
  // Group open days by their time slot (e.g. Tue–Fri share 11:30–18:00) so we
  // emit one spec per slot with an array of dayOfWeek URIs rather than one
  // spec per day. Schema.org and Google both accept this consolidated form.
  const timeSlots = new Map<string, string[]>()
  HOURS.filter(h => !h.closed).forEach(h => {
    const key = `${h.open}|${h.close}`
    if (!timeSlots.has(key)) timeSlots.set(key, [])
    timeSlots.get(key)!.push(h.day)
  })

  const openingHoursSpecification = Array.from(timeSlots.entries()).map(
    ([key, days]) => {
      const [opens, closes] = key.split('|')
      return {
        '@type':     'OpeningHoursSpecification',
        dayOfWeek:   days.map(day => `https://schema.org/${day}`),
        opens,
        closes,
      }
    }
  )

  // ── Schema object ──────────────────────────────────────────────────────────
  const schema = {
    '@context': 'https://schema.org',
    '@type':    'FoodEstablishment',

    name,
    description,
    url:       siteUrl,
    telephone: phoneE164,
    email,

    address: {
      '@type':         'PostalAddress',
      streetAddress:   address.street,
      addressLocality: address.city,
      addressRegion:   address.state,
      postalCode:      address.zip,
      addressCountry:  'US',
    },

    // Geographic coordinates — powers Maps placement and proximity ranking
    ...(primary?.coordinates && {
      geo: {
        '@type':    'GeoCoordinates',
        latitude:   primary.coordinates.lat,
        longitude:  primary.coordinates.lng,
      },
    }),

    // hasMap lets Google surface a direct Maps link in the Knowledge Panel
    hasMap: `https://maps.google.com/maps?q=${encodeURIComponent(
      `${address.street}, ${address.city}, ${address.state} ${address.zip}`
    )}`,

    servesCuisine:   ['American', 'Burgers', 'Hot Dogs', 'Wings'],
    priceRange:      '$',   // $ = under $10/person avg; accurate for this menu
    paymentAccepted: 'Cash, Credit Card',
    currenciesAccepted: 'USD',

    openingHoursSpecification,

    // sameAs wires social profiles to the Knowledge Panel entity graph
    sameAs: SOCIAL_LINKS.map(l => l.url),

    foundingDate: '2020',

    areaServed: {
      '@type':         'City',
      name:            address.city,
      addressRegion:   address.state,
      addressCountry:  'US',
    },
  }

  return (
    <script
      type="application/ld+json"
      // JSON.stringify is safe here — data sourced entirely from our own
      // constants, never from user input.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
