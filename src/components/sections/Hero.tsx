'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SITE_CONFIG, HOURS, NAV_LINKS } from '@/lib/constants'
import { cn, isOpenNow, formatHours } from '@/lib/utils'
import type { WithClassName } from '@/types'

// ─── Animation Variants ───────────────────────────────────────────────────────

const EASE_OUT = [0.25, 0.46, 0.45, 0.94] as const

const stagger = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE_OUT } },
}

const fadeIn = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { duration: 0.4 } },
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Hero({ className }: WithClassName) {
  const [mounted, setMounted] = useState(false)
  const [isOpen,  setIsOpen]  = useState(false)

  useEffect(() => {
    setMounted(true)
    setIsOpen(isOpenNow(HOURS))
  }, [])

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
      {/* — Noise grain overlay — */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-noise opacity-30 pointer-events-none z-10 mix-blend-overlay"
      />

      {/* — Dot grid texture — */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-grid-dots pointer-events-none z-0"
      />

      {/* — Ambient heat glow — rises from bottom like a forge — */}
      <div
        aria-hidden="true"
        className="absolute bottom-0 left-0 right-0 h-2/3
                   bg-brand-orange-glow pointer-events-none z-0 opacity-80"
      />

      {/* — Ticker tape — */}
      {/* min-h-[40px]: hard height reservation — locks the container so no font
          event (swap, FOUT, reflow) can change its height and shift content below.
          This is the CLS backstop independent of font-display strategy. */}
      <div
        className="relative z-20 w-full overflow-hidden min-h-[40px]
                   bg-brand-orange py-2 border-b-2 border-brand-orange-dark"
        aria-label="Announcement"
      >
        <div className="flex animate-ticker whitespace-nowrap will-change-transform">
          {[...Array(2)].map((_, i) => (
            <span key={i} className="flex items-center gap-8 px-8">
              {['No Seats. Just Good Eats.', 'Wild Wednesdays @ Liftking', 'Jamaican Jack Burger', 'Hot Honey Dawg', "Rollin' Fries", 'Electronic Payment: +$1 Fee'].map((item) => (
                <span key={item} className="flex items-center gap-3 font-display text-sm tracking-widest text-white">
                  <span aria-hidden="true">◆</span>
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
          className={cn(
            'font-display text-display-2xl text-white tracking-wide',
            'hover:text-brand-orange transition-colors duration-200',
            'focus-visible:outline-none focus-visible:ring-2',
            'focus-visible:ring-brand-orange focus-visible:ring-offset-2',
            'focus-visible:ring-offset-brand-charcoal'
          )}
          aria-label="Rollin' Munchies — home"
        >
          Rollin&apos; Munchies
        </a>

        {/* Nav links — hidden on mobile */}
        <ul className="hidden md:flex items-center gap-8" role="list">
          {NAV_LINKS.map(({ label, href }: { label: string; href: string }) => (
            <li key={href}>
              <a
                href={href}
                className="font-body text-sm font-medium tracking-wider uppercase
                           text-brand-cream-dim hover:text-brand-cream
                           transition-colors duration-200
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
            'px-4 py-2',
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
      <motion.div
        className="relative z-20 flex-1 flex flex-col items-center justify-center
                   text-center px-6 md:px-12 py-20 md:py-32"
        variants={stagger}
        initial="hidden"
        animate="show"
      >
        {/* Open/closed badge — stencil style */}
        <AnimatePresence>
          {mounted && (
            <motion.div
              variants={fadeIn}
              className={cn(
                'inline-flex items-center gap-2 mb-8',
                'px-4 py-1.5 border font-mono text-xs tracking-widest',
                isOpen
                  ? 'border-green-500/50 bg-green-500/10 text-green-400'
                  : 'border-red-500/50 bg-red-500/10 text-red-400'
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
                  OPEN NOW
                  {todayHours?.close && (
                    <span className="opacity-60 ml-1">
                      · UNTIL {formatHours(todayHours.close)}
                    </span>
                  )}
                </span>
              ) : (
                <span>
                  CLOSED
                  {todayHours && !todayHours.closed && todayHours.open && (
                    <span className="opacity-60 ml-1">
                      · OPENS {formatHours(todayHours.open)}
                    </span>
                  )}
                </span>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main headline */}
        <motion.h1
          variants={fadeUp}
          className="font-display text-display-2xl text-white leading-none tracking-wide"
        >
          <span className="block">No Seats.</span>
          <span className="block text-brand-orange">Just Good Eats.</span>
        </motion.h1>

        {/* Structural rule */}
        <motion.div
          variants={fadeUp}
          className="mt-6 w-12 h-px bg-brand-orange/40"
          aria-hidden="true"
        />

        {/* Subheadline */}
        <motion.p
          variants={fadeUp}
          className="mt-5 max-w-md font-body text-base md:text-lg
                     text-brand-cream-dim leading-relaxed"
        >
          Tarboro&apos;s boldest food truck — smashed burgers, loaded dogs,
          and fries that hit different. Roll up and eat.
        </motion.p>

        {/* Stats — tight credibility strip, primes the CTA above it */}
        <motion.div
          variants={fadeUp}
          className="mt-10 flex items-stretch justify-center gap-0
                     border border-brand-charcoal-border"
        >
          {HERO_STATS.map(({ value, label }, i) => (
            <div
              key={label}
              className={cn(
                'text-center px-7 py-3',
                i < HERO_STATS.length - 1 && 'border-r border-brand-charcoal-border'
              )}
            >
              <p className="font-display text-display-md text-brand-orange">{value}</p>
              <p className="font-mono text-xs text-brand-cream-dim tracking-widest uppercase mt-0.5">
                {label}
              </p>
            </div>
          ))}
        </motion.div>

        {/* CTA buttons */}
        <motion.div
          variants={fadeUp}
          className="mt-6 flex flex-col sm:flex-row items-center gap-3"
        >
          <a
            href="#menu"
            className={cn(
              'w-full sm:w-auto inline-flex items-center justify-center gap-2',
              'px-8 py-3.5',
              'bg-brand-orange text-white font-body font-semibold text-sm tracking-wider uppercase',
              'hover:bg-brand-orange-light active:bg-brand-orange-dark',
              'shadow-glow-orange',
              'transition-all duration-200',
              'focus-visible:outline-none focus-visible:ring-2',
              'focus-visible:ring-white focus-visible:ring-offset-2',
              'focus-visible:ring-offset-brand-charcoal'
            )}
          >
            See The Menu →
          </a>
          <a
            href="#find-us"
            className={cn(
              'w-full sm:w-auto inline-flex items-center justify-center gap-2',
              'px-8 py-3.5',
              'border border-brand-charcoal-border bg-transparent',
              'text-brand-cream font-body font-medium text-sm tracking-wider uppercase',
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
        </motion.div>
      </motion.div>

      {/* — Industrial scroll indicator — */}
      <motion.div
        className="relative z-20 flex justify-center pb-8"
        variants={fadeIn}
        initial="hidden"
        animate="show"
        transition={{ delay: 1.2 }}
        aria-hidden="true"
      >
        <div className="flex flex-col items-center gap-2">
          <span className="font-mono text-xs text-brand-cream-dim/40 tracking-widest">SCROLL</span>
          <div className="w-px h-10 bg-brand-charcoal-border relative overflow-hidden">
            <motion.div
              className="absolute top-0 left-0 w-full bg-brand-orange"
              animate={{ height: ['0%', '100%', '0%'], top: ['0%', '0%', '100%'] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
              style={{ height: '40%' }}
            />
          </div>
        </div>
      </motion.div>
    </section>
  )
}

// ─── Supporting Data ──────────────────────────────────────────────────────────

const HERO_STATS = [
  { value: '4.8★',       label: 'Rated'            },
  { value: "Since '20",  label: 'Est. in Tarboro'  },
  { value: '100%',       label: 'Real Flavor'       },
] as const

// ─── Inline Icons ─────────────────────────────────────────────────────────────

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
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    </svg>
  )
}
