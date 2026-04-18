'use client'

import { motion } from 'framer-motion'
import { SITE_CONFIG, SOCIAL_LINKS, NAV_LINKS } from '@/lib/constants'
import { cn } from '@/lib/utils'

// ─────────────────────────────────────────────────────────────────────────────
// Footer.tsx
// MORTY: Industrial structural footer.
// Three-column grid with ruled dividers. Stacked on mobile.
// Orange top rail with heat glow. Stamped copyright strip.
// ─────────────────────────────────────────────────────────────────────────────

const EASE_OUT = [0.25, 0.46, 0.45, 0.94] as const

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer
      className="relative w-full bg-brand-charcoal border-t-2 border-brand-charcoal-border"
      aria-label="Site footer"
    >
      {/* — Orange heat rail — */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-0 right-0 h-[2px]
                   bg-gradient-to-r from-brand-orange/0 via-brand-orange to-brand-orange/0"
      />

      {/* — Footer content — */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.55, ease: EASE_OUT }}
        className="max-w-5xl mx-auto px-6 md:px-12 py-14"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-brand-charcoal-border">

          {/* — Col 1: Brand — */}
          <div className="flex flex-col items-center text-center gap-4 pb-10 md:pb-0 md:pr-8">
            <a
              href="#home"
              className="font-display text-2xl text-white tracking-wider
                         hover:text-brand-orange transition-colors duration-200
                         focus-visible:outline-none focus-visible:ring-2
                         focus-visible:ring-brand-orange"
              aria-label="Rollin' Munchies — back to top"
            >
              Rollin&apos; Munchies
            </a>
            <p className="font-mono text-xs text-brand-cream-dim/50 tracking-widest uppercase leading-relaxed">
              No Seats. Just Good Eats.<br />
              Tarboro, NC · Est. 2020
            </p>
            {/* Social icons */}
            <div className="flex items-center justify-center gap-2 mt-1">
              {SOCIAL_LINKS.map(link => (
                <a
                  key={link.platform}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    'w-8 h-8 flex items-center justify-center',
                    'bg-brand-charcoal-card border border-brand-charcoal-border',
                    'text-brand-cream-dim/60',
                    'hover:border-brand-orange/40 hover:text-brand-orange',
                    'transition-all duration-200',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange'
                  )}
                  aria-label={`Follow us on ${link.platform}`}
                >
                  <SocialIcon platform={link.icon} />
                </a>
              ))}
            </div>
          </div>

          {/* — Col 2: Nav — */}
          <div className="flex flex-col items-center text-center gap-3 py-10 md:py-0 md:px-8">
            <p className="font-mono text-xs tracking-widest text-brand-orange uppercase mb-1">
              ◆ Quick Links
            </p>
            <nav aria-label="Footer navigation">
              <ul className="flex flex-col items-center gap-2" role="list">
                {[{ label: 'Home', href: '#home' }, ...NAV_LINKS].map(({ label, href }) => (
                  <li key={href}>
                    <a
                      href={href}
                      className="font-mono text-xs tracking-wider uppercase text-brand-cream-dim
                                 hover:text-brand-cream
                                 inline-flex items-center gap-1.5
                                 transition-all duration-150
                                 focus-visible:outline-none focus-visible:ring-2
                                 focus-visible:ring-brand-orange"
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* — Col 3: Contact — */}
          <div className="flex flex-col items-center text-center gap-3 pt-10 md:pt-0 md:pl-8">
            <p className="font-mono text-xs tracking-widest text-brand-orange uppercase mb-1">
              ◆ Contact
            </p>
            <div className="flex flex-col items-center gap-3">
              <a
                href={`tel:${SITE_CONFIG.phone.replace(/\D/g, '')}`}
                className="flex items-center gap-2 group"
                aria-label={`Call ${SITE_CONFIG.phone}`}
              >
                <PhoneIcon className="text-brand-orange/60 group-hover:text-brand-orange transition-colors" />
                <span className="font-mono text-xs tracking-wider text-brand-cream-dim
                                 group-hover:text-brand-cream transition-colors">
                  {SITE_CONFIG.phone}
                </span>
              </a>
              <a
                href={`mailto:${SITE_CONFIG.email}`}
                className="flex items-center gap-2 group"
                aria-label={`Email ${SITE_CONFIG.email}`}
              >
                <MailIcon className="text-brand-orange/60 group-hover:text-brand-orange transition-colors flex-shrink-0" />
                <span className="font-body text-sm text-brand-cream-dim
                                 group-hover:text-brand-cream transition-colors">
                  {SITE_CONFIG.email}
                </span>
              </a>
            </div>
          </div>
        </div>
      </motion.div>

      {/* — Stamped copyright strip — */}
      <div className="border-t border-brand-charcoal-border">
        <div className="max-w-5xl mx-auto px-6 md:px-12 py-4
                        flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-mono text-xs text-brand-cream-dim/30 tracking-wider">
            © {year} Rollin&apos; Munchies LLC · Tarboro, NC
          </p>
          <p className="font-mono text-xs text-brand-cream-dim/20 tracking-widest uppercase">
            #noseatsjustgoodeats
          </p>
        </div>
      </div>
    </footer>
  )
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg className={cn('w-3.5 h-3.5', className)} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
      />
    </svg>
  )
}

function MailIcon({ className }: { className?: string }) {
  return (
    <svg className={cn('w-3.5 h-3.5', className)} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
      />
    </svg>
  )
}

function SocialIcon({ platform }: { platform: string }) {
  if (platform === 'facebook') {
    return (
      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    )
  }
  if (platform === 'instagram') {
    return (
      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
      </svg>
    )
  }
  return null
}
