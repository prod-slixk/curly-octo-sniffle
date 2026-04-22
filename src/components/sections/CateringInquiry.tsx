'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SITE_CONFIG } from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { BudgetRange, CateringInquiryFormState } from '@/types'

// -----------------------------------------------------------------------------
// CateringInquiry.tsx
// High-ticket catering inquiry form — events, corporate, private bookings.
// Fields: name, phone, email, event date, headcount, location, budget, notes.
// Submits to /api/v1/catering → email + SMS to Hawk.
// MORTY: Premium feel — this is a high-intent conversion surface.
// -----------------------------------------------------------------------------

const EASE_OUT = [0.25, 0.46, 0.45, 0.94] as const

const BUDGET_OPTIONS: { value: BudgetRange; label: string; sub: string }[] = [
  { value: 'under-500',  label: 'Under $500',       sub: 'Small gatherings'     },
  { value: '500-1000',   label: '$500 – $1,000',    sub: 'Mid-size events'      },
  { value: '1000-2500',  label: '$1,000 – $2,500',  sub: 'Corporate lunches'    },
  { value: '2500-5000',  label: '$2,500 – $5,000',  sub: 'Large events'         },
  { value: '5000-plus',  label: '$5,000+',           sub: 'Full-scale catering'  },
  { value: 'not-sure',   label: "Not sure yet",      sub: "Let's talk numbers"   },
]

// -----------------------------------------------------------------------------

export function CateringInquiry() {
  const [name,          setName]          = useState('')
  const [phone,         setPhone]         = useState('')
  const [email,         setEmail]         = useState('')
  const [eventDate,     setEventDate]     = useState('')
  const [headcount,     setHeadcount]     = useState('')
  const [eventLocation, setEventLocation] = useState('')
  const [budgetRange,   setBudgetRange]   = useState<BudgetRange | ''>('')
  const [notes,         setNotes]         = useState('')

  const [formState, setFormState] = useState<CateringInquiryFormState>({ status: 'idle', message: null })

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()

    if (!budgetRange) {
      setFormState({ status: 'error', message: 'Please select a budget range.' })
      return
    }

    setFormState({ status: 'loading', message: null })

    try {
      const res = await fetch('/api/v1/catering', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          name, phone, email, eventDate, headcount,
          eventLocation, budgetRange, notes,
        }),
      })

      const json = await res.json()

      if (!res.ok || !json.success) {
        setFormState({ status: 'error', message: json.error ?? 'Something went wrong. Please call us directly.' })
        return
      }

      setFormState({ status: 'success', message: null })

    } catch {
      setFormState({
        status:  'error',
        message: `Submission failed. Please call us at ${SITE_CONFIG.phone}.`,
      })
    }
  }, [name, phone, email, eventDate, headcount, eventLocation, budgetRange, notes])

  // --- Success screen ---
  if (formState.status === 'success') {
    return (
      <section className="relative w-full min-h-screen flex items-center justify-center px-6 bg-brand-charcoal">
        <div
          aria-hidden="true"
          className="absolute top-0 left-0 right-0 h-px
                     bg-linear-to-r from-transparent via-brand-orange/30 to-transparent"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: EASE_OUT }}
          className="max-w-lg w-full text-center"
        >
          <div className="text-5xl mb-6" aria-hidden="true">🍽️</div>
          <h2 className="font-display text-display-lg text-white mb-4 leading-none">
            Inquiry Received
          </h2>
          <p className="font-body text-brand-cream-dim mb-2 leading-relaxed">
            We'll be in touch shortly to talk through your event.
            Expect a follow up by phone or email — usually within 24 hours.
          </p>
          <p className="font-mono text-sm text-brand-cream-dim/50 mb-8">
            Need it faster? Call us directly at{' '}
            <a href={`tel:${SITE_CONFIG.phone}`} className="text-brand-orange hover:underline">
              {SITE_CONFIG.phone}
            </a>
          </p>
          <button
            onClick={() => setFormState({ status: 'idle', message: null })}
            className={cn(
              'font-mono text-xs tracking-widest uppercase px-6 py-3',
              'bg-brand-orange text-white hover:bg-brand-orange/90 transition-colors duration-200',
            )}
          >
            Submit Another Inquiry
          </button>
        </motion.div>
      </section>
    )
  }

  return (
    <section className="relative w-full min-h-screen px-6 md:px-12 py-24 bg-brand-charcoal">
      <div
        aria-hidden="true"
        className="absolute top-0 left-0 right-0 h-px
                   bg-linear-to-r from-transparent via-brand-orange/30 to-transparent"
      />

      <div className="max-w-3xl mx-auto">

        {/* --- Header --- */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: EASE_OUT }}
          className="mb-14"
        >
          <p className="font-mono text-xs tracking-widest text-brand-orange uppercase mb-3 flex items-center gap-2">
            <span aria-hidden="true" className="text-brand-orange/50">◆</span>
            Events · Corporate · Private Bookings
          </p>
          <h1 className="font-display text-display-xl text-white leading-none">
            Catering
          </h1>
          <div className="mt-3 flex items-center gap-3">
            <div className="h-px w-8 bg-brand-orange/40" aria-hidden="true" />
            <p className="font-body text-brand-cream-dim text-base max-w-lg leading-relaxed">
              Bring Rollin' Munchies to your event. Fill this out and
              we'll reach out personally to build your package.
            </p>
          </div>

          {/* Trust signals */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: '📍', label: 'On-site setup',     sub: 'We come to you'         },
              { icon: '🍔', label: 'Full menu available', sub: 'Custom menus too'      },
              { icon: '📞', label: 'Direct line',          sub: 'No middleman, no BS'   },
            ].map(item => (
              <div
                key={item.label}
                className="flex items-start gap-3 p-4
                           border border-brand-charcoal-border bg-brand-charcoal-card"
              >
                <span className="text-xl" aria-hidden="true">{item.icon}</span>
                <div>
                  <p className="font-mono text-xs text-brand-cream tracking-wide">{item.label}</p>
                  <p className="font-body text-xs text-brand-cream-dim/50 mt-0.5">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* --- Form --- */}
        <form onSubmit={handleSubmit} noValidate className="space-y-6">

          {/* Contact info */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.05, ease: EASE_OUT }}
            className="bg-brand-charcoal-card border border-brand-charcoal-border p-6"
          >
            <h2 className="font-mono text-xs tracking-widest text-brand-orange uppercase mb-5">
              ◆ Your Contact Info
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <div className="flex flex-col gap-1.5">
                <label htmlFor="c-name" className="font-mono text-xs text-brand-cream-dim/70 tracking-wider uppercase">
                  Name *
                </label>
                <input
                  id="c-name"
                  type="text"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Your name"
                  className={inputCls}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="c-phone" className="font-mono text-xs text-brand-cream-dim/70 tracking-wider uppercase">
                  Phone *
                </label>
                <input
                  id="c-phone"
                  type="tel"
                  autoComplete="tel"
                  required
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="(252) 555-0100"
                  className={inputCls}
                />
              </div>

              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label htmlFor="c-email" className="font-mono text-xs text-brand-cream-dim/70 tracking-wider uppercase">
                  Email *
                </label>
                <input
                  id="c-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={inputCls}
                />
              </div>
            </div>
          </motion.div>

          {/* Event details */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1, ease: EASE_OUT }}
            className="bg-brand-charcoal-card border border-brand-charcoal-border p-6"
          >
            <h2 className="font-mono text-xs tracking-widest text-brand-orange uppercase mb-5">
              ◆ Event Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <div className="flex flex-col gap-1.5">
                <label htmlFor="c-date" className="font-mono text-xs text-brand-cream-dim/70 tracking-wider uppercase">
                  Event Date *
                </label>
                <input
                  id="c-date"
                  type="date"
                  required
                  value={eventDate}
                  onChange={e => setEventDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className={cn(inputCls, 'text-brand-cream-dim')}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="c-headcount" className="font-mono text-xs text-brand-cream-dim/70 tracking-wider uppercase">
                  Expected Headcount *
                </label>
                <input
                  id="c-headcount"
                  type="text"
                  required
                  value={headcount}
                  onChange={e => setHeadcount(e.target.value)}
                  placeholder="e.g. 50, 100-150, 200+"
                  className={inputCls}
                />
              </div>

              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label htmlFor="c-location" className="font-mono text-xs text-brand-cream-dim/70 tracking-wider uppercase">
                  Event Location *
                </label>
                <input
                  id="c-location"
                  type="text"
                  required
                  value={eventLocation}
                  onChange={e => setEventLocation(e.target.value)}
                  placeholder="Venue name and address"
                  className={inputCls}
                />
              </div>
            </div>
          </motion.div>

          {/* Budget range */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.15, ease: EASE_OUT }}
            className="bg-brand-charcoal-card border border-brand-charcoal-border p-6"
          >
            <h2 className="font-mono text-xs tracking-widest text-brand-orange uppercase mb-5">
              ◆ Approximate Budget *
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {BUDGET_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setBudgetRange(opt.value)}
                  className={cn(
                    'flex flex-col items-start gap-0.5 p-3 text-left',
                    'border transition-all duration-200',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange',
                    budgetRange === opt.value
                      ? 'border-brand-orange bg-brand-orange/10 text-white'
                      : 'border-brand-charcoal-border bg-brand-charcoal text-brand-cream-dim hover:border-brand-orange/40',
                  )}
                >
                  <span className="font-mono text-xs tracking-wide font-medium leading-snug">
                    {opt.label}
                  </span>
                  <span className={cn(
                    'font-body text-xs leading-snug',
                    budgetRange === opt.value ? 'text-brand-cream-dim' : 'text-brand-cream-dim/40',
                  )}>
                    {opt.sub}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Additional notes */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.2, ease: EASE_OUT }}
            className="bg-brand-charcoal-card border border-brand-charcoal-border p-6"
          >
            <h2 className="font-mono text-xs tracking-widest text-brand-orange uppercase mb-5">
              ◆ Additional Notes
            </h2>
            <textarea
              id="c-notes"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Tell us about your event — type of occasion, dietary needs, special requests, anything that helps us come prepared."
              rows={4}
              maxLength={1000}
              className={cn(inputCls, 'resize-none w-full')}
            />
            <p className="mt-1.5 font-mono text-xs text-brand-cream-dim/30 text-right">
              {notes.length}/1000
            </p>
          </motion.div>

          {/* Error */}
          <AnimatePresence>
            {formState.status === 'error' && formState.message && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                role="alert"
                className="border border-red-500/30 bg-red-500/10 px-4 py-3"
              >
                <p className="font-mono text-xs text-red-400 leading-relaxed">
                  {formState.message}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.25, ease: EASE_OUT }}
            className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center"
          >
            <button
              type="submit"
              disabled={formState.status === 'loading'}
              className={cn(
                'flex-1 px-8 py-4',
                'font-mono text-sm tracking-widest uppercase',
                'transition-all duration-200',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange',
                formState.status === 'loading'
                  ? 'bg-brand-orange/50 text-white/60 cursor-not-allowed'
                  : 'bg-brand-orange text-white hover:bg-brand-orange/90 active:scale-[0.99]',
              )}
            >
              {formState.status === 'loading' ? 'Sending Inquiry…' : 'Send Catering Inquiry →'}
            </button>

            <a
              href={`tel:${SITE_CONFIG.phone}`}
              className={cn(
                'px-6 py-4 text-center',
                'font-mono text-xs tracking-widest uppercase',
                'border border-brand-charcoal-border text-brand-cream-dim',
                'hover:border-brand-orange/40 hover:text-brand-cream',
                'transition-colors duration-200',
              )}
            >
              Or Call: {SITE_CONFIG.phone}
            </a>
          </motion.div>

          <p className="text-center font-mono text-xs text-brand-cream-dim/30 leading-relaxed">
            No commitment required. We follow up personally — usually within 24 hours.
          </p>

        </form>
      </div>
    </section>
  )
}

// --- Shared input class ---
const inputCls = cn(
  'bg-brand-charcoal border border-brand-charcoal-border',
  'px-4 py-3 font-body text-sm text-white placeholder:text-brand-cream-dim/30',
  'focus:outline-none focus:border-brand-orange/60 transition-colors duration-200',
)
