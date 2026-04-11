'use client'

import { HOURS, LOCATIONS, RECURRING_EVENTS, SITE_CONFIG } from '@/lib/constants'
import { cn, formatHours, isOpenNow } from '@/lib/utils'
import type { WithClassName } from '@/types'

// ─────────────────────────────────────────────────────────────────────────────
// FindUs.tsx
// MORTY: Two-column layout on desktop — hours + locations left, map right.
// Live day highlighting on hours table. Stacked on mobile.
// No API key needed — Google Maps static embed iframe.
// ─────────────────────────────────────────────────────────────────────────────

export function FindUs({ className }: WithClassName) {
  const today = new Date().getDay() // 0 = Sunday
  const days  = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
  const todayName = days[today]
  const openNow = isOpenNow(HOURS)

  return (
    <section
      id="find-us"
      className={cn(
        'relative w-full py-24 px-6 md:px-12',
        'bg-brand-charcoal',
        className
      )}
    >
      <div className="max-w-5xl mx-auto">

        {/* — Section header — */}
        <div className="mb-12">
          <p className="font-mono text-xs tracking-widest text-brand-orange uppercase mb-3">
            ✦ Come Find Us
          </p>
          <h2
            className="font-display text-display-xl text-white leading-none"
            style={{ fontFamily: '"Bebas Neue", Impact, sans-serif' }}
          >
            Find Us
          </h2>
          <p className="mt-3 font-body text-brand-cream-dim text-base max-w-md">
            We move around — here's where to catch us. Follow us on Facebook for real-time location updates.
          </p>
        </div>

        {/* — Main grid — */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* — Left column — */}
          <div className="flex flex-col gap-6">

            {/* Hours card */}
            <div className="bg-brand-charcoal-card border border-brand-charcoal-border rounded-card p-6">
              <div className="flex items-center justify-between mb-5">
                <h3
                  className="font-display text-xl text-white"
                  style={{ fontFamily: '"Bebas Neue", Impact, sans-serif' }}
                >
                  Hours
                </h3>
                {/* Live status pill */}
                <span
                  className={cn(
                    'inline-flex items-center gap-1.5 px-3 py-1 rounded-full',
                    'font-mono text-xs tracking-wider',
                    openNow
                      ? 'bg-green-500/10 border border-green-500/30 text-green-400'
                      : 'bg-red-500/10 border border-red-500/30 text-red-400'
                  )}
                  role="status"
                >
                  <span
                    className={cn(
                      'w-1.5 h-1.5 rounded-full',
                      openNow ? 'bg-green-400 animate-pulse' : 'bg-red-400'
                    )}
                    aria-hidden="true"
                  />
                  {openNow ? 'Open Now' : 'Closed'}
                </span>
              </div>

              {/* Hours table */}
              <ul className="space-y-2" role="list" aria-label="Weekly hours">
                {HOURS.map(entry => {
                  const isToday = entry.day === todayName
                  return (
                    <li
                      key={entry.day}
                      className={cn(
                        'flex items-center justify-between',
                        'px-3 py-2 rounded-chip',
                        'transition-colors duration-150',
                        isToday
                          ? 'bg-brand-orange/10 border border-brand-orange/20'
                          : 'border border-transparent'
                      )}
                    >
                      <span
                        className={cn(
                          'font-body text-sm font-medium',
                          isToday ? 'text-brand-orange' : 'text-brand-cream-dim'
                        )}
                      >
                        {isToday && (
                          <span className="font-mono text-xs mr-1.5 opacity-70">→</span>
                        )}
                        {entry.day}
                      </span>
                      <span
                        className={cn(
                          'font-mono text-xs tracking-wide',
                          entry.closed
                            ? 'text-brand-cream-dim/30'
                            : isToday
                              ? 'text-brand-cream'
                              : 'text-brand-cream-dim'
                        )}
                      >
                        {entry.closed
                          ? 'Closed'
                          : `${formatHours(entry.open!)} – ${formatHours(entry.close!)}`
                        }
                      </span>
                    </li>
                  )
                })}
              </ul>
            </div>

            {/* Location cards */}
            <div className="flex flex-col gap-3">
              <h3
                className="font-display text-xl text-white"
                style={{ fontFamily: '"Bebas Neue", Impact, sans-serif' }}
              >
                Locations
              </h3>
              {LOCATIONS.map(loc => (
                <a
                  key={loc.id}
                  href={`https://maps.google.com/?q=${encodeURIComponent(loc.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    'group flex items-start gap-4',
                    'bg-brand-charcoal-card border rounded-card p-4',
                    'hover:border-brand-orange/30 transition-all duration-200',
                    loc.isPrimary
                      ? 'border-brand-orange/20'
                      : 'border-brand-charcoal-border'
                  )}
                  aria-label={`Get directions to ${loc.label}`}
                >
                  <div
                    className={cn(
                      'flex-shrink-0 w-9 h-9 rounded-chip flex items-center justify-center mt-0.5',
                      loc.isPrimary
                        ? 'bg-brand-orange/15 text-brand-orange'
                        : 'bg-brand-charcoal border border-brand-charcoal-border text-brand-cream-dim'
                    )}
                    aria-hidden="true"
                  >
                    <PinIcon />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-body text-sm font-semibold text-brand-cream">
                        {loc.label}
                      </p>
                      {loc.isPrimary && (
                        <span className="font-mono text-xs text-brand-orange/70 tracking-wide">
                          Primary
                        </span>
                      )}
                    </div>
                    <p className="font-mono text-xs text-brand-cream-dim truncate">
                      {loc.address}
                    </p>
                    <p className="font-body text-xs text-brand-cream-dim/60 mt-1">
                      {loc.description}
                    </p>
                  </div>
                  <ExternalLinkIcon
                    className="flex-shrink-0 text-brand-cream-dim/30 group-hover:text-brand-orange/60 transition-colors mt-1"
                  />
                </a>
              ))}
            </div>

            {/* Wild Wednesdays event card */}
            {RECURRING_EVENTS.map(event => (
              <div
                key={event.id}
                className="bg-brand-orange/5 border border-brand-orange/20 rounded-card p-5"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg" aria-hidden="true">🚗</span>
                  <p className="font-mono text-xs tracking-widest text-brand-orange uppercase">
                    Recurring Event
                  </p>
                </div>
                <h4
                  className="font-display text-xl text-white mb-1"
                  style={{ fontFamily: '"Bebas Neue", Impact, sans-serif' }}
                >
                  {event.name}
                </h4>
                <p className="font-body text-sm text-brand-cream-dim mb-2">
                  {event.description}
                </p>
                <p className="font-mono text-xs text-brand-cream-dim/60">
                  📍 {event.venue}
                </p>
              </div>
            ))}
          </div>

          {/* — Right column: Map — */}
          <div className="flex flex-col gap-4">
            <h3
              className="font-display text-xl text-white"
              style={{ fontFamily: '"Bebas Neue", Impact, sans-serif' }}
            >
              Map
            </h3>
            <div className="relative rounded-card overflow-hidden border border-brand-charcoal-border aspect-[4/3] lg:aspect-auto lg:flex-1 lg:min-h-[480px]">
              {/* Map iframe — no API key needed for embed */}
              <iframe
                title="Rollin' Munchies location map"
                src={`https://maps.google.com/maps?q=${encodeURIComponent(SITE_CONFIG.address.street + ', ' + SITE_CONFIG.address.city + ', ' + SITE_CONFIG.address.state)}&output=embed&z=15`}
                width="100%"
                height="100%"
                className="absolute inset-0 w-full h-full grayscale contrast-[1.1] opacity-90"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                aria-label="Map showing Rollin' Munchies location in Tarboro, NC"
              />
              {/* Overlay tint to match dark theme */}
              <div
                aria-hidden="true"
                className="absolute inset-0 pointer-events-none
                           bg-brand-orange/5 mix-blend-multiply"
              />
            </div>

            {/* Quick contact strip */}
            <div className="bg-brand-charcoal-card border border-brand-charcoal-border rounded-card p-4">
              <p className="font-mono text-xs text-brand-cream-dim/50 tracking-widest uppercase mb-3">
                Get In Touch
              </p>
              <div className="flex flex-col gap-2">
                <a
                  href={`tel:${SITE_CONFIG.phone.replace(/\D/g, '')}`}
                  className="flex items-center gap-3 group"
                  aria-label={`Call ${SITE_CONFIG.phone}`}
                >
                  <span className="text-brand-orange" aria-hidden="true">
                    <PhoneIcon />
                  </span>
                  <span className="font-body text-sm text-brand-cream group-hover:text-brand-orange transition-colors">
                    {SITE_CONFIG.phone}
                  </span>
                </a>
                <a
                  href={`mailto:${SITE_CONFIG.email}`}
                  className="flex items-center gap-3 group"
                  aria-label={`Email ${SITE_CONFIG.email}`}
                >
                  <span className="text-brand-orange" aria-hidden="true">
                    <MailIcon />
                  </span>
                  <span className="font-body text-sm text-brand-cream-dim group-hover:text-brand-orange transition-colors truncate">
                    {SITE_CONFIG.email}
                  </span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Inline Icons ─────────────────────────────────────────────────────────────

function PinIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    </svg>
  )
}

function ExternalLinkIcon({ className }: { className?: string }) {
  return (
    <svg className={cn('w-4 h-4', className)} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
    </svg>
  )
}

function PhoneIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
    </svg>
  )
}

function MailIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    </svg>
  )
}