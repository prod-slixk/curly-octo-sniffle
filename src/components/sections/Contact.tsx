'use client'

import { useState } from 'react'
import { SITE_CONFIG, SOCIAL_LINKS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { ContactFormData, ContactFormState, WithClassName } from '@/types'

// ─────────────────────────────────────────────────────────────────────────────
// Contact.tsx
// MORTY: Full contact section — form + social links + quick info strip.
// All 4 form states handled: idle, loading, success, error.
// TERRY HANDOFF → POST /api/v1/contact
// ─────────────────────────────────────────────────────────────────────────────

const INITIAL_FORM: ContactFormData = {
  name:    '',
  phone:   '',
  email:   '',
  message: '',
}

const INITIAL_STATE: ContactFormState = {
  status:  'idle',
  message: null,
}

export function Contact({ className }: WithClassName) {
  const [form,      setForm]      = useState<ContactFormData>(INITIAL_FORM)
  const [formState, setFormState] = useState<ContactFormState>(INITIAL_STATE)

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault()

    // Basic client-side guard — TERRY validates server-side too
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setFormState({ status: 'error', message: 'Please fill in all required fields.' })
      return
    }

    setFormState({ status: 'loading', message: null })

    try {
      const res = await fetch('/api/v1/contact', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        setFormState({
          status:  'error',
          message: data.error ?? 'Something went wrong. Try calling us directly.',
        })
        return
      }

      setFormState({
        status:  'success',
        message: "Message sent! We'll get back to you soon.",
      })
      setForm(INITIAL_FORM)

    } catch {
      setFormState({
        status:  'error',
        message: 'Network error. Try calling us at ' + SITE_CONFIG.phone,
      })
    }
  }

  const isLoading = formState.status === 'loading'
  const isSuccess = formState.status === 'success'

  return (
    <section
      id="contact"
      className={cn(
        'relative w-full py-24 px-6 md:px-12',
        'bg-brand-charcoal-surface',
        className
      )}
    >
      <div className="max-w-5xl mx-auto">

        {/* — Section header — */}
        <div className="mb-12">
          <p className="font-mono text-xs tracking-widest text-brand-orange uppercase mb-3">
            ✦ Hit Us Up
          </p>
          <h2
            className="font-display text-display-xl text-white leading-none"
            style={{ fontFamily: '"Bebas Neue", Impact, sans-serif' }}
          >
            Get In Touch
          </h2>
          <p className="mt-3 font-body text-brand-cream-dim text-base max-w-md">
            Questions, catering inquiries, or just want to say what's good — we're listening.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">

          {/* — Form — 3/5 width on desktop — */}
          <div className="lg:col-span-3">
            {isSuccess ? (
              // ─── Success state ───────────────────────────────────────────
              <div className="flex flex-col items-center justify-center text-center
                              py-16 px-8 bg-brand-charcoal-card border border-green-500/20
                              rounded-card animate-fade-in">
                <div className="w-14 h-14 rounded-full bg-green-500/10 border border-green-500/30
                                flex items-center justify-center mb-5 text-2xl"
                  aria-hidden="true"
                >
                  ✓
                </div>
                <h3
                  className="font-display text-2xl text-white mb-2"
                  style={{ fontFamily: '"Bebas Neue", Impact, sans-serif' }}
                >
                  Message Sent
                </h3>
                <p className="font-body text-sm text-brand-cream-dim mb-6">
                  {formState.message}
                </p>
                <button
                  onClick={() => setFormState(INITIAL_STATE)}
                  className={cn(
                    'font-body text-sm font-medium px-6 py-2 rounded-chip',
                    'border border-brand-charcoal-border text-brand-cream-dim',
                    'hover:border-brand-orange/40 hover:text-brand-cream',
                    'transition-all duration-200',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange'
                  )}
                >
                  Send Another
                </button>
              </div>
            ) : (
              // ─── Form — idle / loading / error ───────────────────────────
              <div className="bg-brand-charcoal-card border border-brand-charcoal-border rounded-card p-6 md:p-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <FormField
                    label="Name"
                    required
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Your name"
                    value={form.name}
                    onChange={handleChange}
                    disabled={isLoading}
                    autoComplete="name"
                  />
                  <FormField
                    label="Phone"
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="(252) 555-0000"
                    value={form.phone}
                    onChange={handleChange}
                    disabled={isLoading}
                    autoComplete="tel"
                  />
                </div>

                <div className="mb-4">
                  <FormField
                    label="Email"
                    required
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={handleChange}
                    disabled={isLoading}
                    autoComplete="email"
                  />
                </div>

                <div className="mb-6">
                  <label
                    htmlFor="message"
                    className="block font-mono text-xs tracking-wider text-brand-cream-dim uppercase mb-2"
                  >
                    Message <span className="text-brand-orange" aria-hidden="true">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    required
                    placeholder="What's on your mind? Catering, questions, feedback..."
                    value={form.message}
                    onChange={handleChange}
                    disabled={isLoading}
                    aria-required="true"
                    className={cn(
                      'w-full px-4 py-3 rounded-chip resize-none',
                      'bg-brand-charcoal border border-brand-charcoal-border',
                      'font-body text-sm text-brand-cream placeholder:text-brand-cream-dim/40',
                      'focus:outline-none focus:border-brand-orange/50 focus:ring-1 focus:ring-brand-orange/30',
                      'transition-colors duration-150',
                      'disabled:opacity-50 disabled:cursor-not-allowed'
                    )}
                  />
                </div>

                {/* Error message */}
                {formState.status === 'error' && formState.message && (
                  <div
                    className="mb-4 px-4 py-3 rounded-chip bg-red-500/10 border border-red-500/20
                               font-body text-sm text-red-400"
                    role="alert"
                    aria-live="polite"
                  >
                    {formState.message}
                  </div>
                )}

                {/* Submit button */}
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className={cn(
                    'w-full flex items-center justify-center gap-2',
                    'px-6 py-3.5 rounded-chip',
                    'font-body font-semibold text-base',
                    'bg-brand-orange text-white',
                    'hover:bg-brand-orange-light active:bg-brand-orange-dark',
                    'shadow-glow-sm hover:shadow-glow-orange',
                    'transition-all duration-200',
                    'focus-visible:outline-none focus-visible:ring-2',
                    'focus-visible:ring-white focus-visible:ring-offset-2',
                    'focus-visible:ring-offset-brand-charcoal-card',
                    'disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none'
                  )}
                  aria-label={isLoading ? 'Sending message...' : 'Send message'}
                >
                  {isLoading ? (
                    <>
                      <SpinnerIcon aria-hidden="true" />
                      Sending...
                    </>
                  ) : (
                    'Send Message'
                  )}
                </button>
              </div>
            )}
          </div>

          {/* — Right sidebar — 2/5 width on desktop — */}
          <div className="lg:col-span-2 flex flex-col gap-5">

            {/* Quick contact */}
            <div className="bg-brand-charcoal-card border border-brand-charcoal-border rounded-card p-5">
              <p className="font-mono text-xs tracking-widest text-brand-orange uppercase mb-4">
                Direct Contact
              </p>
              <div className="flex flex-col gap-4">
                <a
                  href={`tel:${SITE_CONFIG.phone.replace(/\D/g, '')}`}
                  className="flex items-center gap-3 group"
                >
                  <div className="w-9 h-9 rounded-chip bg-brand-orange/10 border border-brand-orange/20
                                  flex items-center justify-center flex-shrink-0 text-brand-orange">
                    <PhoneIcon />
                  </div>
                  <div>
                    <p className="font-mono text-xs text-brand-cream-dim/60 uppercase tracking-wider">
                      Call Us
                    </p>
                    <p className="font-body text-sm font-medium text-brand-cream
                                  group-hover:text-brand-orange transition-colors">
                      {SITE_CONFIG.phone}
                    </p>
                  </div>
                </a>

                <a
                  href={`mailto:${SITE_CONFIG.email}`}
                  className="flex items-center gap-3 group"
                >
                  <div className="w-9 h-9 rounded-chip bg-brand-charcoal border border-brand-charcoal-border
                                  flex items-center justify-center flex-shrink-0 text-brand-cream-dim">
                    <MailIcon />
                  </div>
                  <div className="min-w-0">
                    <p className="font-mono text-xs text-brand-cream-dim/60 uppercase tracking-wider">
                      Email
                    </p>
                    <p className="font-body text-sm text-brand-cream-dim truncate
                                  group-hover:text-brand-cream transition-colors">
                      {SITE_CONFIG.email}
                    </p>
                  </div>
                </a>
              </div>
            </div>

            {/* Social links */}
            <div className="bg-brand-charcoal-card border border-brand-charcoal-border rounded-card p-5">
              <p className="font-mono text-xs tracking-widest text-brand-orange uppercase mb-4">
                Follow The Truck
              </p>
              <div className="flex flex-col gap-3">
                {SOCIAL_LINKS.map(link => (
                  <a
                    key={link.platform}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 group"
                    aria-label={`Follow us on ${link.platform}`}
                  >
                    <div className="w-9 h-9 rounded-chip bg-brand-charcoal border border-brand-charcoal-border
                                    flex items-center justify-center flex-shrink-0
                                    group-hover:border-brand-orange/30 transition-colors">
                      <SocialIcon platform={link.icon} />
                    </div>
                    <div>
                      <p className="font-body text-sm font-medium text-brand-cream-dim
                                    group-hover:text-brand-cream transition-colors">
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

            {/* Tagline card */}
            <div className="bg-brand-orange/5 border border-brand-orange/15 rounded-card p-5 text-center">
              <p
                className="font-display text-2xl text-brand-orange"
                style={{ fontFamily: '"Bebas Neue", Impact, sans-serif' }}
              >
                No Seats.
              </p>
              <p
                className="font-display text-2xl text-white"
                style={{ fontFamily: '"Bebas Neue", Impact, sans-serif' }}
              >
                Just Good Eats.
              </p>
              <p className="font-mono text-xs text-brand-cream-dim/50 mt-2 tracking-widest">
                EST. TARBORO NC · 2020
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Form Field ───────────────────────────────────────────────────────────────

interface FormFieldProps {
  label:        string
  id:           string
  name:         string
  type:         string
  placeholder:  string
  value:        string
  onChange:     (e: React.ChangeEvent<HTMLInputElement>) => void
  disabled:     boolean
  required?:    boolean
  autoComplete?: string
}

function FormField({
  label, id, name, type, placeholder,
  value, onChange, disabled, required, autoComplete
}: FormFieldProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block font-mono text-xs tracking-wider text-brand-cream-dim uppercase mb-2"
      >
        {label}
        {required && (
          <span className="text-brand-orange ml-1" aria-hidden="true">*</span>
        )}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        autoComplete={autoComplete}
        aria-required={required}
        className={cn(
          'w-full px-4 py-3 rounded-chip',
          'bg-brand-charcoal border border-brand-charcoal-border',
          'font-body text-sm text-brand-cream placeholder:text-brand-cream-dim/40',
          'focus:outline-none focus:border-brand-orange/50 focus:ring-1 focus:ring-brand-orange/30',
          'transition-colors duration-150',
          'disabled:opacity-50 disabled:cursor-not-allowed'
        )}
      />
    </div>
  )
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function SpinnerIcon({ className }: WithClassName) {
  return (
    <svg
      className={cn('w-4 h-4 animate-spin', className)}
      fill="none" viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

function PhoneIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
      />
    </svg>
  )
}

function MailIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
      />
    </svg>
  )
}

function SocialIcon({ platform }: { platform: string }) {
  if (platform === 'facebook') {
    return (
      <svg className="w-4 h-4 text-brand-cream-dim" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    )
  }
  if (platform === 'instagram') {
    return (
      <svg className="w-4 h-4 text-brand-cream-dim" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
      </svg>
    )
  }
  return null
}