'use client'

import { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MENU_ITEMS,
  MENU_CATEGORIES,
  PICKUP_SLOTS,
  SITE_CONFIG,
} from '@/lib/constants'
import { cn } from '@/lib/utils'
import type {
  MenuCategoryId,
  PreOrderItem,
  PreOrderFormState,
} from '@/types'

// ─────────────────────────────────────────────────────────────────────────────
// PreOrder.tsx
// MORTY: Full-menu pre-order form. No payment — call-ahead notify only.
//   - Category tabs (same pattern as MenuGrid)
//   - Qty stepper per item (+/− buttons)
//   - Wangz get a flavor dropdown when qty > 0
//   - Floating order summary appears when items are selected
//   - Submits to /api/v1/preorder → email + SMS to Hawk
// ─────────────────────────────────────────────────────────────────────────────

const EASE_OUT = [0.25, 0.46, 0.45, 0.94] as const

const sectionReveal = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE_OUT } },
}

// ─── Items grouped by category ───────────────────────────────────────────────
const ITEMS_BY_CAT = new Map(
  MENU_CATEGORIES.map(cat => [
    cat.id,
    MENU_ITEMS.filter(i => i.category === cat.id),
  ])
)

// ─── Component ────────────────────────────────────────────────────────────────

export function PreOrder() {
  // — Form fields —
  const [name,         setName]         = useState('')
  const [phone,        setPhone]        = useState('')
  const [pickupTime,   setPickupTime]   = useState<string>('')
  const [instructions, setInstructions] = useState('')

  // — Order state: itemId → quantity —
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  // — Wangz flavors: itemId → flavor string —
  const [flavors,    setFlavors]    = useState<Record<string, string>>({})

  // — Active category tab —
  const [activeCategory, setActiveCategory] = useState<MenuCategoryId>('burgers')

  // — Form submission —
  const [formState, setFormState] = useState<PreOrderFormState>({ status: 'idle', message: null })

  // ── Derived: ordered items ─────────────────────────────────────────────────
  const orderedItems = useMemo<PreOrderItem[]>(() => {
    return MENU_ITEMS
      .filter(item => (quantities[item.id] ?? 0) > 0)
      .map(item => ({
        itemId:   item.id,
        itemName: item.name,
        quantity: quantities[item.id]!,
        ...(item.category === 'wangz' && flavors[item.id]
          ? { flavor: flavors[item.id] }
          : {}),
      }))
  }, [quantities, flavors])

  const totalQty = useMemo(
    () => orderedItems.reduce((sum, i) => sum + i.quantity, 0),
    [orderedItems]
  )

  // ── Qty helpers ───────────────────────────────────────────────────────────
  const increment = useCallback((itemId: string) => {
    setQuantities(prev => ({ ...prev, [itemId]: Math.min((prev[itemId] ?? 0) + 1, 20) }))
  }, [])

  const decrement = useCallback((itemId: string) => {
    setQuantities(prev => {
      const next = (prev[itemId] ?? 0) - 1
      if (next <= 0) {
        const { [itemId]: _, ...rest } = prev
        // Also clear flavor if removing wangz
        setFlavors(f => { const { [itemId]: __, ...fRest } = f; return fRest })
        return rest
      }
      return { ...prev, [itemId]: next }
    })
  }, [])

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()

    if (orderedItems.length === 0) {
      setFormState({ status: 'error', message: 'Please add at least one item to your order.' })
      return
    }
    if (!pickupTime) {
      setFormState({ status: 'error', message: 'Please select a pickup time.' })
      return
    }

    setFormState({ status: 'loading', message: null })

    try {
      const res = await fetch('/api/v1/preorder', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ name, phone, pickupTime, items: orderedItems, instructions }),
      })

      const json = await res.json()

      if (!res.ok || !json.success) {
        setFormState({ status: 'error', message: json.error ?? 'Something went wrong. Please call us directly.' })
        return
      }

      setFormState({ status: 'success', message: null })
      // Reset form
      setName(''); setPhone(''); setPickupTime(''); setInstructions('')
      setQuantities({}); setFlavors({})

    } catch {
      setFormState({
        status:  'error',
        message: `Order failed. Please call us at ${SITE_CONFIG.phone}.`,
      })
    }
  }, [name, phone, pickupTime, orderedItems, instructions])

  // ── Success screen ────────────────────────────────────────────────────────
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
          className="max-w-md w-full text-center"
        >
          <div className="text-5xl mb-6" aria-hidden="true">🔥</div>
          <h2 className="font-display text-display-lg text-white mb-4 leading-none">
            Order Received!
          </h2>
          <p className="font-body text-brand-cream-dim mb-2">
            Hawk's been notified. We'll have your order ready at pickup.
          </p>
          <p className="font-mono text-sm text-brand-cream-dim/50 mb-8">
            Questions? Call us at{' '}
            <a href={`tel:${SITE_CONFIG.phone}`} className="text-brand-orange hover:underline">
              {SITE_CONFIG.phone}
            </a>
          </p>
          <button
            onClick={() => setFormState({ status: 'idle', message: null })}
            className={cn(
              'font-mono text-xs tracking-widest uppercase px-6 py-3',
              'bg-brand-orange text-white',
              'hover:bg-brand-orange/90 transition-colors duration-200',
            )}
          >
            Place Another Order
          </button>
        </motion.div>
      </section>
    )
  }

  const currentItems = ITEMS_BY_CAT.get(activeCategory) ?? []

  return (
    <section className="relative w-full min-h-screen px-6 md:px-12 py-24 bg-brand-charcoal">
      <div
        aria-hidden="true"
        className="absolute top-0 left-0 right-0 h-px
                   bg-linear-to-r from-transparent via-brand-orange/30 to-transparent"
      />

      <div className="max-w-5xl mx-auto">

        {/* — Header — */}
        <motion.div
          variants={sectionReveal}
          initial="hidden"
          animate="show"
          className="mb-12"
        >
          <p className="font-mono text-xs tracking-widest text-brand-orange uppercase mb-3 flex items-center gap-2">
            <span aria-hidden="true" className="text-brand-orange/50">◆</span>
            Call-Ahead · No Payment Required
          </p>
          <h1 className="font-display text-display-xl text-white leading-none">
            Pre-Order
          </h1>
          <div className="mt-3 flex items-center gap-3">
            <div className="h-px w-8 bg-brand-orange/40" aria-hidden="true" />
            <p className="font-body text-brand-cream-dim text-base max-w-md">
              Pick your items, choose a pickup time, and we'll have it ready.
              We'll call you to confirm — no card needed.
            </p>
          </div>
        </motion.div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* ── Left / Main ──────────────────────────────────────────── */}
            <div className="lg:col-span-2 space-y-8">

              {/* — Customer info — */}
              <div className="bg-brand-charcoal-card border border-brand-charcoal-border p-6">
                <h2 className="font-mono text-xs tracking-widest text-brand-orange uppercase mb-5">
                  ◆ Your Info
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                  {/* Name */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="name" className="font-mono text-xs text-brand-cream-dim/70 tracking-wider uppercase">
                      Name *
                    </label>
                    <input
                      id="name"
                      type="text"
                      autoComplete="name"
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Your name"
                      className={cn(
                        'bg-brand-charcoal border border-brand-charcoal-border',
                        'px-4 py-3 font-body text-sm text-white placeholder:text-brand-cream-dim/30',
                        'focus:outline-none focus:border-brand-orange/60 transition-colors duration-200',
                      )}
                    />
                  </div>

                  {/* Phone */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="phone" className="font-mono text-xs text-brand-cream-dim/70 tracking-wider uppercase">
                      Phone *
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      autoComplete="tel"
                      required
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="(252) 555-0100"
                      className={cn(
                        'bg-brand-charcoal border border-brand-charcoal-border',
                        'px-4 py-3 font-body text-sm text-white placeholder:text-brand-cream-dim/30',
                        'focus:outline-none focus:border-brand-orange/60 transition-colors duration-200',
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* — Pickup time — */}
              <div className="bg-brand-charcoal-card border border-brand-charcoal-border p-6">
                <h2 className="font-mono text-xs tracking-widest text-brand-orange uppercase mb-5">
                  ◆ Pickup Time
                </h2>
                <div className="flex flex-wrap gap-2">
                  {PICKUP_SLOTS.map(slot => (
                    <button
                      key={slot.value}
                      type="button"
                      onClick={() => setPickupTime(slot.value)}
                      className={cn(
                        'px-4 py-2 font-mono text-xs tracking-wider uppercase',
                        'transition-all duration-200',
                        'focus-visible:outline-none focus-visible:ring-2',
                        'focus-visible:ring-brand-orange focus-visible:ring-offset-2',
                        'focus-visible:ring-offset-brand-charcoal-card',
                        pickupTime === slot.value
                          ? 'bg-brand-orange text-white shadow-glow-sm'
                          : 'bg-brand-charcoal text-brand-cream-dim border border-brand-charcoal-border hover:border-brand-orange/40 hover:text-brand-cream',
                      )}
                    >
                      {slot.label}
                    </button>
                  ))}
                </div>
                {!pickupTime && formState.status === 'error' && (
                  <p className="mt-2 font-mono text-xs text-red-400">Select a pickup time.</p>
                )}
              </div>

              {/* — Menu — */}
              <div className="bg-brand-charcoal-card border border-brand-charcoal-border p-6">
                <h2 className="font-mono text-xs tracking-widest text-brand-orange uppercase mb-5">
                  ◆ Build Your Order
                </h2>

                {/* Category tabs */}
                <div
                  className="flex flex-wrap gap-2 mb-6"
                  role="tablist"
                  aria-label="Menu categories"
                >
                  {MENU_CATEGORIES.map(cat => {
                    const catQty = (ITEMS_BY_CAT.get(cat.id) ?? [])
                      .reduce((sum, item) => sum + (quantities[item.id] ?? 0), 0)
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        role="tab"
                        aria-selected={activeCategory === cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        className={cn(
                          'inline-flex items-center gap-2 px-4 py-2',
                          'font-mono text-xs tracking-wider uppercase',
                          'transition-all duration-200',
                          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange',
                          activeCategory === cat.id
                            ? 'bg-brand-orange text-white'
                            : 'bg-brand-charcoal text-brand-cream-dim border border-brand-charcoal-border hover:border-brand-orange/40',
                        )}
                      >
                        <span aria-hidden="true">{cat.emoji}</span>
                        {cat.label}
                        {catQty > 0 && (
                          <span
                            aria-label={`${catQty} selected`}
                            className={cn(
                              'inline-flex items-center justify-center min-w-[18px] h-[18px] px-1',
                              'font-mono text-[10px] tabular-nums leading-none',
                              activeCategory === cat.id
                                ? 'bg-white/20 text-white'
                                : 'bg-brand-orange/20 text-brand-orange border border-brand-orange/30',
                            )}
                          >
                            {catQty}
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>

                {/* Item rows */}
                <motion.div
                  key={activeCategory}
                  role="tabpanel"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-2"
                >
                  {currentItems.map(item => {
                    const qty        = quantities[item.id] ?? 0
                    const isWangz    = item.category === 'wangz'
                    const flavorVal  = flavors[item.id] ?? ''

                    return (
                      <div
                        key={item.id}
                        className={cn(
                          'flex flex-col gap-2 p-3',
                          'border transition-colors duration-200',
                          qty > 0
                            ? 'border-brand-orange/40 bg-brand-orange/5'
                            : 'border-brand-charcoal-border bg-brand-charcoal',
                        )}
                      >
                        <div className="flex items-center justify-between gap-4">

                          {/* Item info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-body text-sm text-white font-medium leading-snug">
                                {item.name}
                              </span>
                              {item.isSignature && (
                                <span className="font-mono text-[10px] text-brand-orange border border-brand-orange/30 px-1.5 py-0.5 tracking-widest">
                                  SIG
                                </span>
                              )}
                              {item.heatLevel > 0 && (
                                <span aria-label={`Heat level ${item.heatLevel}`} className="text-xs">
                                  {'🌶'.repeat(item.heatLevel)}
                                </span>
                              )}
                            </div>
                            <p className="font-mono text-xs text-brand-cream-dim/50 mt-0.5 truncate">
                              {item.description}
                            </p>
                          </div>

                          {/* Price + qty stepper */}
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="font-display text-lg text-brand-orange leading-none">
                              ${item.price}
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => decrement(item.id)}
                                disabled={qty === 0}
                                aria-label={`Remove one ${item.name}`}
                                className={cn(
                                  'w-8 h-8 flex items-center justify-center',
                                  'font-mono text-sm',
                                  'border transition-colors duration-150',
                                  'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-orange',
                                  qty === 0
                                    ? 'border-brand-charcoal-border text-brand-cream-dim/20 cursor-not-allowed'
                                    : 'border-brand-orange/50 text-brand-orange hover:bg-brand-orange/10',
                                )}
                              >
                                −
                              </button>
                              <span
                                className={cn(
                                  'w-8 text-center font-mono text-sm tabular-nums',
                                  qty > 0 ? 'text-white' : 'text-brand-cream-dim/30',
                                )}
                                aria-live="polite"
                                aria-label={`Quantity: ${qty}`}
                              >
                                {qty}
                              </span>
                              <button
                                type="button"
                                onClick={() => increment(item.id)}
                                aria-label={`Add one ${item.name}`}
                                className={cn(
                                  'w-8 h-8 flex items-center justify-center',
                                  'font-mono text-sm',
                                  'border border-brand-charcoal-border transition-colors duration-150',
                                  'hover:border-brand-orange/50 hover:text-brand-orange text-brand-cream-dim',
                                  'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-orange',
                                )}
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Wangz flavor picker — appears when qty > 0 */}
                        <AnimatePresence>
                          {isWangz && qty > 0 && item.flavors && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="pt-2 border-t border-brand-orange/20">
                                <label
                                  htmlFor={`flavor-${item.id}`}
                                  className="font-mono text-xs text-brand-orange/70 tracking-widest uppercase block mb-1.5"
                                >
                                  Pick Your Flava *
                                </label>
                                <select
                                  id={`flavor-${item.id}`}
                                  value={flavorVal}
                                  onChange={e => setFlavors(prev => ({ ...prev, [item.id]: e.target.value }))}
                                  className={cn(
                                    'w-full bg-brand-charcoal border border-brand-charcoal-border',
                                    'px-3 py-2 font-body text-sm text-white',
                                    'focus:outline-none focus:border-brand-orange/60',
                                    !flavorVal && 'text-brand-cream-dim/50',
                                  )}
                                >
                                  <option value="" disabled>Select a flavor…</option>
                                  {item.flavors.map(f => (
                                    <option key={f} value={f}>{f}</option>
                                  ))}
                                </select>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )
                  })}
                </motion.div>
              </div>

              {/* — Special instructions — */}
              <div className="bg-brand-charcoal-card border border-brand-charcoal-border p-6">
                <h2 className="font-mono text-xs tracking-widest text-brand-orange uppercase mb-5">
                  ◆ Special Instructions
                </h2>
                <textarea
                  id="instructions"
                  value={instructions}
                  onChange={e => setInstructions(e.target.value)}
                  placeholder="Allergies, substitutions, etc. (optional)"
                  rows={3}
                  maxLength={500}
                  className={cn(
                    'w-full bg-brand-charcoal border border-brand-charcoal-border',
                    'px-4 py-3 font-body text-sm text-white placeholder:text-brand-cream-dim/30',
                    'focus:outline-none focus:border-brand-orange/60 transition-colors duration-200',
                    'resize-none',
                  )}
                />
                <p className="mt-1.5 font-mono text-xs text-brand-cream-dim/30 text-right">
                  {instructions.length}/500
                </p>
              </div>
            </div>

            {/* ── Right / Order Summary ─────────────────────────────────── */}
            <div className="lg:col-span-1">
              <div className="sticky top-6 space-y-4">

                {/* Summary card */}
                <div className="bg-brand-charcoal-card border border-brand-charcoal-border p-6">
                  <h2 className="font-mono text-xs tracking-widest text-brand-orange uppercase mb-5">
                    ◆ Your Order
                  </h2>

                  {orderedItems.length === 0 ? (
                    <p className="font-body text-sm text-brand-cream-dim/40 text-center py-4">
                      No items added yet.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {orderedItems.map(item => (
                        <div key={item.itemId} className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-body text-sm text-white leading-snug truncate">
                              {item.itemName}
                            </p>
                            {item.flavor && (
                              <p className="font-mono text-xs text-brand-cream-dim/50 truncate">
                                {item.flavor}
                              </p>
                            )}
                          </div>
                          <span className="font-mono text-sm text-brand-orange shrink-0">
                            ×{item.quantity}
                          </span>
                        </div>
                      ))}

                      <div className="pt-3 border-t border-brand-charcoal-border mt-3 flex items-center justify-between">
                        <span className="font-mono text-xs text-brand-cream-dim/50 uppercase tracking-wider">
                          Total Items
                        </span>
                        <span className="font-display text-xl text-white">
                          {totalQty}
                        </span>
                      </div>
                    </div>
                  )}

                  {pickupTime && (
                    <div className="mt-4 pt-4 border-t border-brand-charcoal-border">
                      <p className="font-mono text-xs text-brand-cream-dim/50 uppercase tracking-wider mb-1">
                        Pickup Time
                      </p>
                      <p className="font-display text-xl text-brand-orange">
                        {PICKUP_SLOTS.find(s => s.value === pickupTime)?.label ?? pickupTime}
                      </p>
                    </div>
                  )}
                </div>

                {/* Error message */}
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
                <button
                  type="submit"
                  disabled={formState.status === 'loading'}
                  className={cn(
                    'w-full px-6 py-4',
                    'font-mono text-sm tracking-widest uppercase',
                    'transition-all duration-200',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange',
                    formState.status === 'loading'
                      ? 'bg-brand-orange/50 text-white/60 cursor-not-allowed'
                      : 'bg-brand-orange text-white hover:bg-brand-orange/90 active:scale-[0.99]',
                  )}
                >
                  {formState.status === 'loading' ? 'Sending Order…' : 'Place Pre-Order →'}
                </button>

                <p className="font-mono text-xs text-brand-cream-dim/30 text-center leading-relaxed">
                  No payment collected. We'll call to confirm.
                </p>

                {/* Direct call fallback */}
                <a
                  href={`tel:${SITE_CONFIG.phone}`}
                  className={cn(
                    'block w-full px-6 py-3 text-center',
                    'font-mono text-xs tracking-widest uppercase',
                    'border border-brand-charcoal-border text-brand-cream-dim',
                    'hover:border-brand-orange/40 hover:text-brand-cream',
                    'transition-colors duration-200',
                  )}
                >
                  Or Call: {SITE_CONFIG.phone}
                </a>
              </div>
            </div>

          </div>
        </form>
      </div>
    </section>
  )
}
