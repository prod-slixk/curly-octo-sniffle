'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SITE_CONFIG } from '@/lib/constants'
import { cn } from '@/lib/utils'

// ─────────────────────────────────────────────────────────────────────────────
// MobileStickyCTA.tsx
// MORTY: Mobile-only sticky bottom bar. Hidden on md+.
// Slides up after 80px scroll so it doesn't compete with the hero CTAs.
// Two actions: primary Call to Order (tel:), secondary See Menu (#menu).
// iOS safe-area-inset-bottom respected via inline style.
// ─────────────────────────────────────────────────────────────────────────────

const EASE_OUT = [0.25, 0.46, 0.45, 0.94] as const

export function MobileStickyCTA() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 80)
    onScroll()                                                  // check on mount
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="mobile-sticky-cta"
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0,      opacity: 1 }}
          exit={{    y: '100%', opacity: 0 }}
          transition={{ duration: 0.25, ease: EASE_OUT }}
          className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
          role="navigation"
          aria-label="Quick actions"
        >
          {/* Orange heat rail — mirrors footer accent */}
          <div
            aria-hidden="true"
            className="h-[2px] bg-gradient-to-r from-brand-orange/0 via-brand-orange to-brand-orange/0"
          />

          {/* Bar */}
          <div
            className={cn(
              'bg-brand-charcoal/95 backdrop-blur-nav',
              'border-t border-brand-charcoal-border',
              'px-4 py-3',
              'flex items-center gap-3'
            )}
          >
            {/* Primary: Call to Order */}
            <a
              href={`tel:${SITE_CONFIG.phone.replace(/\D/g, '')}`}
              className={cn(
                'flex-1 inline-flex items-center justify-center gap-2',
                'bg-brand-orange text-white',
                'font-body font-semibold text-sm tracking-wide',
                'py-3',
                'shadow-glow-sm',
                'active:bg-brand-orange-dark',
                'transition-colors duration-150',
                'focus-visible:outline-none focus-visible:ring-2',
                'focus-visible:ring-white focus-visible:ring-offset-2',
                'focus-visible:ring-offset-brand-charcoal'
              )}
              aria-label={`Call us at ${SITE_CONFIG.phone}`}
            >
              <PhoneIcon aria-hidden="true" />
              Call to Order
            </a>

            {/* Structural divider */}
            <div
              className="w-px h-8 bg-brand-charcoal-border shrink-0"
              aria-hidden="true"
            />

            {/* Secondary: See Menu */}
            <a
              href="#menu"
              className={cn(
                'flex-1 inline-flex items-center justify-center gap-1',
                'border border-brand-charcoal-border bg-transparent',
                'text-brand-cream font-body font-medium text-sm tracking-wide',
                'py-3',
                'hover:border-brand-orange/40',
                'active:bg-brand-charcoal-card',
                'transition-colors duration-150',
                'focus-visible:outline-none focus-visible:ring-2',
                'focus-visible:ring-brand-orange focus-visible:ring-offset-2',
                'focus-visible:ring-offset-brand-charcoal'
              )}
            >
              See Menu →
            </a>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ─── Icon ─────────────────────────────────────────────────────────────────────

function PhoneIcon({ ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      className="w-4 h-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
      />
    </svg>
  )
}
