'use client'

import { motion } from 'framer-motion'
import { HOURS, LOCATIONS, RECURRING_EVENTS, SITE_CONFIG, SOCIAL_LINKS } from '@/lib/constants'
import { cn, formatHours, isOpenNow, getNextOpenTime } from '@/lib/utils'
import type { WithClassName } from '@/types'

// ─────────────────────────────────────────────────────────────────────────────
// FindUs.tsx
// MORTY: Two-column layout — hours + locations left, map right.
// Framer Motion scroll reveals. Live day highlighting on hours table.
// Industrial: structural grid lines, sharp corners, data-plate aesthetics.
// ─────────────────────────────────────────────────────────────────────────────

const EASE_OUT = [0.25, 0.46, 0.45, 0.94] as const

const revealLeft = {
  hidden: { opacity: 0, x: -16 },
  show:   { opacity: 1, x: 0, transition: { duration: 0.55, ease: EASE_OUT } },
}

const revealRight = {
  hidden: { opacity: 0, x: 16 },
  show:   { opacity: 1, x: 0, transition: { duration: 0.55, ease: EASE_OUT, delay: 0.1 } },
}

const revealUp = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0,  transition: { duration: 0.55, ease: EASE_OUT } },
}

// ─── Component ────────────────────────────────────────────────────────────────

export function FindUs({ className }: WithClassName) {
  const today     = new Date().getDay()
  const days      = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
  const todayName = days[today]
  const openNow   = isOpenNow(HOURS)
  const nextOpen  = openNow ? null : getNextOpenTime(HOURS)

  return (
    <section
      id="find-us"
      className={cn(
        'relative w-full py-24 px-6 md:px-12',
        'bg-brand-charcoal',
        className
      )}
    >
      {/* Structural top accent */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-0 right-0 h-px
                   bg-gradient-to-r from-transparent via-brand-charcoal-border to-transparent"
      />

      <div className="max-w-5xl mx-auto">

        {/* — Section header — */}
        <motion.div
          variants={revealUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          className="mb-12"
        >
          <p className="font-mono text-xs tracking-widest text-brand-orange uppercase mb-3 flex items-center gap-2">
            <span aria-hidden="true" className="text-brand-orange/50">◆</span>
            Come Find Us
          </p>
          <h2 className="font-display text-display-xl text-white leading-none">
            Find Us
          </h2>
          <div className="mt-3 flex items-center gap-3">
            <div className="h-px w-8 bg-brand-orange/40" aria-hidden="true" />
            <p className="font-body text-brand-cream-dim text-base max-w-md">
              We move around. Follow us on Facebook for real-time location updates.
            </p>
          </div>
        </motion.div>

        {/* — Main grid — */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* — Left column — */}
          <motion.div
            variants={revealLeft}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-60px' }}
            className="flex flex-col gap-6"
          >

            {/* Hours card */}
            <div className="bg-brand-charcoal-card border border-brand-charcoal-border p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-display text-xl text-white tracking-wide">
                  Hours
                </h3>
                {/* Live status — stencil pill */}
                <span
                  className={cn(
                    'inline-flex flex-col items-end gap-0.5 px-3 py-1.5',
                    'border',
                    openNow
                      ? 'bg-green-500/10 border-green-500/30'
                      : 'bg-red-500/10 border-red-500/30'
                  )}
                  role="status"
                >
                  {/* Row 1: dot + status word */}
                  <span
                    className={cn(
                      'inline-flex items-center gap-1.5',
                      'font-mono text-xs tracking-widest uppercase',
                      openNow ? 'text-green-400' : 'text-red-400'
                    )}
                  >
                    <span
                      className={cn(
                        'w-1.5 h-1.5 rounded-full flex-shrink-0',
                        openNow ? 'bg-green-400 animate-pulse' : 'bg-red-400'
                      )}
                      aria-hidden="true"
                    />
                    {openNow ? 'Open Now' : 'Closed'}
                  </span>
                  {/* Row 2: next open time (only when closed) */}
                  {!openNow && nextOpen && (
                    <span className="font-mono text-[10px] tracking-wide text-red-400/60 normal-case">
                      Opens {nextOpen.label} · {nextOpen.time}
                    </span>
                  )}
                </span>
              </div>

              {/* Hours table */}
              <ul className="divide-y divide-brand-charcoal-border/50" role="list" aria-label="Weekly hours">
                {HOURS.map(entry => {
                  const isToday = entry.day === todayName
                  return (
                    <li
                      key={entry.day}
                      className={cn(
                        'flex items-center justify-between',
                        'px-3 py-2.5',
                        'transition-colors duration-150',
                        isToday
                          ? 'bg-brand-orange/8 border-l-2 border-l-brand-orange -mx-3 px-3'
                          : ''
                      )}
                    >
                      <span
                        className={cn(
                          'font-mono text-xs tracking-wider uppercase',
                          isToday ? 'text-brand-orange' : 'text-brand-cream-dim'
                        )}
                      >
                        {isToday && (
                          <span className="mr-2 opacity-70" aria-hidden="true">→</span>
                        )}
                        {entry.day.slice(0, 3)}
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
                          ? '— Closed —'
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
              <h3 className="font-display text-xl text-white tracking-wide">
                Locations
              </h3>
              {LOCATIONS.map(loc => (
                <motion.a
                  key={loc.id}
                  href={`https://maps.google.com/?q=${encodeURIComponent(loc.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ x: 3, transition: { duration: 0.15, ease: 'easeOut' } }}
                  className={cn(
                    'group flex items-start gap-4',
                    'bg-brand-charcoal-card border p-4',
                    'transition-colors duration-200',
                    loc.isPrimary
                      ? 'border-brand-orange/25 hover:border-brand-orange/50'
                      : 'border-brand-charcoal-border hover:border-brand-charcoal-border/80'
                  )}
                  aria-label={`Get directions to ${loc.label}`}
                >
                  <div
                    className={cn(
                      'flex-shrink-0 w-8 h-8 flex items-center justify-center mt-0.5',
                      loc.isPrimary
                        ? 'bg-brand-orange/15 text-brand-orange border border-brand-orange/30'
                        : 'bg-brand-charcoal border border-brand-charcoal-border text-brand-cream-dim'
                    )}
                    aria-hidden="true"
                  >
                    <PinIcon />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-mono text-xs font-semibold text-brand-cream tracking-wider uppercase">
                        {loc.label}
                      </p>
                      {loc.isPrimary && (
                        <span className="font-mono text-xs text-brand-orange/70 tracking-widest">
                          PRIMARY
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
                </motion.a>
              ))}
            </div>

            {/* Wild Wednesdays */}
            {RECURRING_EVENTS.map(event => (
              <div
                key={event.id}
                className="bg-brand-orange/5 border border-brand-orange/20 p-5"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg" aria-hidden="true">🚗</span>
                  <p className="font-mono text-xs tracking-widest text-brand-orange uppercase">
                    ◆ Recurring Event
                  </p>
                </div>
                <h4 className="font-display text-xl text-white mb-1 tracking-wide">
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
          </motion.div>

          {/* — Right column: Map — */}
          <motion.div
            variants={revealRight}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-60px' }}
            className="flex flex-col gap-4"
          >
            <h3 className="font-display text-xl text-white tracking-wide">
              Map
            </h3>

            {/* Map with industrial frame */}
            <div className="relative aspect-[4/3] lg:aspect-auto lg:flex-1 lg:min-h-[480px]">
              {/* Corner decorations — industrial frame */}
              {(['tl','tr','bl','br'] as const).map(corner => (
                <div
                  key={corner}
                  aria-hidden="true"
                  className={cn(
                    'absolute w-4 h-4 z-10 pointer-events-none',
                    corner === 'tl' && 'top-0 left-0 border-t-2 border-l-2 border-brand-orange/60',
                    corner === 'tr' && 'top-0 right-0 border-t-2 border-r-2 border-brand-orange/60',
                    corner === 'bl' && 'bottom-0 left-0 border-b-2 border-l-2 border-brand-orange/60',
                    corner === 'br' && 'bottom-0 right-0 border-b-2 border-r-2 border-brand-orange/60',
                  )}
                />
              ))}
              <div className="absolute inset-1 border border-brand-charcoal-border overflow-hidden">
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
                {/* Dark tint overlay */}
                <div
                  aria-hidden="true"
                  className="absolute inset-0 pointer-events-none bg-brand-orange/5 mix-blend-multiply"
                />
              </div>
            </div>

            {/* Live location updates — logistics, not contact */}
            <div className="bg-brand-charcoal-card border border-brand-charcoal-border p-4">
              <p className="font-mono text-xs text-brand-cream-dim/50 tracking-widest uppercase mb-3">
                ◆ Live Location Updates
              </p>
              <p className="font-body text-sm text-brand-cream-dim mb-4">
                We move around — follow us to know where we&apos;re parked today.
              </p>
              <div className="flex flex-col gap-2">
                {SOCIAL_LINKS.map(link => (
                  <a
                    key={link.platform}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 group"
                    aria-label={`Follow ${SITE_CONFIG.name} on ${link.platform} for live location updates`}
                  >
                    <div className={cn(
                      'w-8 h-8 flex items-center justify-center flex-shrink-0',
                      'bg-brand-charcoal border border-brand-charcoal-border',
                      'group-hover:border-brand-orange/30 transition-colors'
                    )}>
                      <SocialIcon platform={link.icon} />
                    </div>
                    <div>
                      <p className="font-mono text-xs font-medium text-brand-cream group-hover:text-brand-orange transition-colors tracking-wide uppercase">
                        {link.platform}
                      </p>
                      <p className="font-mono text-xs text-brand-cream-dim/40">
                        @{link.handle}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

// ─── Icons ────────────────────────────────────────────────────────────────────

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

function SocialIcon({ platform }: { platform: string }) {
  if (platform === 'facebook') {
    return (
      <svg className="w-3.5 h-3.5 text-brand-cream-dim" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    )
  }
  if (platform === 'instagram') {
    return (
      <svg className="w-3.5 h-3.5 text-brand-cream-dim" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
      </svg>
    )
  }
  return null
}
