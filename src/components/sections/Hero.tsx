'use client'

import { useEffect, useState } from 'react'
import { SITE_CONFIG, HOURS, NAV_LINKS } from '@/lib/constants'
import { cn, isOpenNow, formatHours } from '@/lib/utils'
import type { WithClassName } from '@/types'



export function Hero({ className }: WithClassName) {
  const [mounted, setMounted]   = useState(false)
  const [isOpen,  setIsOpen]    = useState(false)

  useEffect(() => {
    setMounted(true)
    setIsOpen(isOpenNow(HOURS))
  }, [])

  // Today's hours for the status bar
  const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
  const todayHours = HOURS.find(h => h.day === days[new Date().getDay()])

  return (
    <section
      id="home"
      className={cn(
        'relative min-h-screen w-full flex flex-col',
        'bg-brand-charcoal overflow-hidden',
        className
      )}
    >
      {/* — Noise texture overlay — */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-noise opacity-40 pointer-events-none z-10"
      />

      {/* — Ambient glow — */}
      <div
        aria-hidden="true"
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2
                   w-[600px] h-[600px] rounded-full
                   bg-brand-orange-glow blur-[120px] opacity-60 pointer-events-none z-0"
      />

      {/* — Ticker tape — */}
      <div
        className="relative z-20 w-full overflow-hidden
                   bg-brand-orange py-2 border-b border-brand-orange-dark"
        aria-label="Announcement"
      >
        <div className="flex animate-ticker whitespace-nowrap">
          {/* Doubled for seamless loop */}
          {[...Array(2)].map((_, i) => (
            <span key={i} className="flex items-center gap-8 px-8">
              {['No Seats. Just Good Eats.', 'Wild Wednesdays @ Liftking', 'Jamaican Jack Burger', 'Hot Honey Dawg', "Rollin' Fries"].map((item) => (
                <span key={item} className="flex items-center gap-3 font-display text-sm tracking-widest text-white">
                  <span aria-hidden="true">✦</span>
                  {item.toUpperCase()}
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* — Navbar — */}
      <nav
        className={cn(
          'relative z-30 w-full flex items-center justify-between',
          'px-6 md:px-12 py-5',
          'border-b border-brand-charcoal-border/60',
          'bg-brand-charcoal/80 backdrop-blur-nav'
        )}
        aria-label="Main navigation"
      >
        {/* Logo */}
        <a
          href="#home"
          style={{ fontFamily: 'var(--font-bebas), Bebas Neue, Impact, sans-serif' }}
          className={cn(
            'text-display-2xl text-white',
            'hover:text-brand-orange transition-colors duration-200',
            'focus-visible:outline-none focus-visible:ring-2',
            'focus-visible:ring-brand-orange focus-visible:ring-offset-2',
            'focus-visible:ring-offset-brand-charcoal'
          )}
          aria-label="Rollin' Munchies — home"
        >
          Rollin Munchies
        </a>

        {/* Nav links — hidden on mobile, shown md+ */}
        <ul className="hidden md:flex items-center gap-8" role="list">
          {NAV_LINKS.map(({ label, href }: { label: string; href: string }) => (
            <li key={href}>
              <a
                href={href}
                className="font-body text-sm font-medium text-brand-cream-dim
                           hover:text-brand-cream transition-colors duration-200
                           focus-visible:outline-none focus-visible:ring-2
                           focus-visible:ring-brand-orange rounded-sm"
              >
                {label}
              </a>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <a
          href={`tel:${SITE_CONFIG.phone.replace(/\D/g, '')}`}
          className={cn(
            'inline-flex items-center gap-2 font-body text-sm font-semibold',
            'px-4 py-2 rounded-chip',
            'bg-brand-orange text-white',
            'hover:bg-brand-orange-light active:bg-brand-orange-dark',
            'transition-colors duration-150',
            'focus-visible:outline-none focus-visible:ring-2',
            'focus-visible:ring-white focus-visible:ring-offset-2',
            'focus-visible:ring-offset-brand-charcoal',
            'shadow-glow-sm'
          )}
          aria-label={`Call us at ${SITE_CONFIG.phone}`}
        >
          <PhoneIcon aria-hidden="true" />
          <span className="hidden sm:inline">{SITE_CONFIG.phone}</span>
          <span className="sm:hidden">Call Us</span>
        </a>
      </nav>

      {/* — Hero Content — */}
      <div className="relative z-20 flex-1 flex flex-col items-center justify-center
                      text-center px-6 md:px-12 py-20 md:py-32">

        {/* Open/closed badge */}
        {mounted && (
          <div
            className={cn(
              'inline-flex items-center gap-2 mb-8',
              'px-4 py-1.5 rounded-full border font-mono text-xs tracking-widest',
              'animate-fade-in',
              isOpen
                ? 'border-green-500/40 bg-green-500/10 text-green-400'
                : 'border-red-500/40 bg-red-500/10 text-red-400'
            )}
            role="status"
            aria-live="polite"
          >
            <span
              className={cn(
                'w-1.5 h-1.5 rounded-full',
                isOpen ? 'bg-green-400 animate-pulse' : 'bg-red-400'
              )}
              aria-hidden="true"
            />
            {isOpen ? (
              <span>
                Open Now
                {todayHours?.close && (
                  <span className="opacity-60 ml-1">
                    · Until {formatHours(todayHours.close)}
                  </span>
                )}
              </span>
            ) : (
              <span>
                Closed
                {todayHours && !todayHours.closed && todayHours.open && (
                  <span className="opacity-60 ml-1">
                    · Opens {formatHours(todayHours.open)}
                  </span>
                )}
              </span>
            )}
          </div>
        )}

        {/* Main headline */}
        <h1
          style={{ fontFamily: 'var(--font-bebas), Bebas Neue, Impact, sans-serif' }}
          className={cn(
            'text-display-2xl text-white',
            'leading-none tracking-wide',
            'animate-fade-up',
            '[animation-delay:100ms] opacity-0 [animation-fill-mode:forwards]'
          )}
        >
          <span className="block">No Seats.</span>
          <span className="block text-brand-orange">Just Good Eats.</span>
        </h1>

        {/* Subheadline */}
        <p
          className={cn(
            'mt-6 max-w-md font-body text-base md:text-lg',
            'text-brand-cream-dim leading-relaxed',
            'animate-fade-up',
            '[animation-delay:250ms] opacity-0 [animation-fill-mode:forwards]'
          )}
        >
          Tarboros boldest food truck smashed burgers, loaded dogs,
          and fries that hit different. Roll up and eat.
        </p>

        {/* CTA buttons */}
        <div
          className={cn(
            'mt-10 flex flex-col sm:flex-row items-center gap-4',
            'animate-fade-up',
            '[animation-delay:400ms] opacity-0 [animation-fill-mode:forwards]'
          )}
        >
          <a
            href="#menu"
            className={cn(
              'w-full sm:w-auto inline-flex items-center justify-center gap-2',
              'px-8 py-3.5 rounded-chip',
              'bg-brand-orange text-white font-body font-semibold text-base',
              'hover:bg-brand-orange-light active:bg-brand-orange-dark',
              'shadow-glow-orange hover:shadow-glow-orange',
              'transition-all duration-200',
              'focus-visible:outline-none focus-visible:ring-2',
              'focus-visible:ring-white focus-visible:ring-offset-2',
              'focus-visible:ring-offset-brand-charcoal'
            )}
          >
            See The Menu
          </a>
          <a
            href="#find-us"
            className={cn(
              'w-full sm:w-auto inline-flex items-center justify-center gap-2',
              'px-8 py-3.5 rounded-chip',
              'border border-brand-charcoal-border bg-transparent',
              'text-brand-cream font-body font-medium text-base',
              'hover:bg-brand-charcoal-card hover:border-brand-orange/40',
              'transition-all duration-200',
              'focus-visible:outline-none focus-visible:ring-2',
              'focus-visible:ring-brand-orange focus-visible:ring-offset-2',
              'focus-visible:ring-offset-brand-charcoal'
            )}
          >
            <PinIcon aria-hidden="true" />
            Find Us
          </a>
        </div>

        {/* Stats strip */}
        <div
          className={cn(
            'mt-20 flex flex-wrap items-center justify-center gap-x-12 gap-y-6',
            'animate-fade-up',
            '[animation-delay:550ms] opacity-0 [animation-fill-mode:forwards]'
          )}
        >
          {HERO_STATS.map(({ value, label }) => (
            <div key={label} className="text-center">
              <p className="font-display text-display-md text-brand-orange">{value}</p>
              <p className="font-mono text-xs text-brand-cream-dim tracking-widest uppercase mt-1">
                {label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* — Scroll indicator — */}
      <div
        className="relative z-20 flex justify-center pb-8 animate-fade-in
                   [animation-delay:800ms] opacity-0 [animation-fill-mode:forwards]"
        aria-hidden="true"
      >
        <div className="flex flex-col items-center gap-1">
          <span className="font-mono text-xs text-brand-cream-dim/50 tracking-widest">SCROLL</span>
          <ChevronDownIcon className="text-brand-orange/60 animate-bounce" />
        </div>
      </div>
    </section>
  )
}

// ─── Supporting Data ──────────────────────────────────────────────────────────

const HERO_STATS = [
  { value: '4.8★',    label: 'Rated'         },
  { value: 'Since \'20', label: 'Est. in Tarboro' },
  { value: '100%',    label: 'Real Flavor'   },
] as const

// ─── Inline Icons ─────────────────────────────────────────────────────────────
// MORTY: Inline SVGs keep bundle small — no icon lib dependency for 3 icons.

function PhoneIcon({ className }: WithClassName) {
  return (
    <svg className={cn('w-4 h-4', className)} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
      />
    </svg>
  )
}

function PinIcon({ className }: WithClassName) {
  return (
    <svg className={cn('w-4 h-4', className)} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
      />
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
      />
    </svg>
  )
}

function ChevronDownIcon({ className }: WithClassName) {
  return (
    <svg className={cn('w-5 h-5', className)} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
  )
}