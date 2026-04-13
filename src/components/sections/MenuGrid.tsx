'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { MENU_ITEMS, MENU_CATEGORIES, CONDIMENTS_FREE, CONDIMENTS_EXTRAS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { MenuItem, MenuCategoryId, WithClassName } from '@/types'

// ─────────────────────────────────────────────────────────────────────────────
// MenuGrid.tsx
// MORTY: Full real menu — burgers, dogs, wangz (21 flavas), specialty fries.
// Wangz get a dedicated card layout with flavor chip scroll.
// Every card shows price. Industrial aesthetic throughout.
// ─────────────────────────────────────────────────────────────────────────────

const EASE_OUT = [0.25, 0.46, 0.45, 0.94] as const

const cardContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05, delayChildren: 0.04 } },
}

const cardReveal = {
  hidden: { opacity: 0, y: 12 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE_OUT } },
}

const sectionReveal = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0,  transition: { duration: 0.55, ease: EASE_OUT } },
}

// Featured items get the wide bento col-span on desktop
const isFeatured = (item: MenuItem): boolean =>
  (item.isSignature && item.heatLevel >= 2) ||
  (item.category === 'wangz' && item.isSignature)

// ─── Component ────────────────────────────────────────────────────────────────

export function MenuGrid({ className }: WithClassName) {
  const [activeCategory, setActiveCategory] = useState<MenuCategoryId | 'all'>('all')

  const filtered = activeCategory === 'all'
    ? MENU_ITEMS
    : MENU_ITEMS.filter(item => item.category === activeCategory)

  return (
    <section
      id="menu"
      className={cn(
        'relative w-full py-24 px-6 md:px-12',
        'bg-brand-charcoal-surface',
        className
      )}
    >
      {/* Structural top accent */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-0 right-0 h-px
                   bg-gradient-to-r from-transparent via-brand-orange/30 to-transparent"
      />

      <div className="max-w-6xl mx-auto">

        {/* — Section header — */}
        <motion.div
          variants={sectionReveal}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          className="mb-12"
        >
          <p className="font-mono text-xs tracking-widest text-brand-orange uppercase mb-3 flex items-center gap-2">
            <span aria-hidden="true" className="text-brand-orange/50">◆</span>
            What We&apos;re Serving
          </p>
          <h2 className="font-display text-display-xl text-white leading-none">
            The Menu
          </h2>
          <div className="mt-3 flex items-center gap-3">
            <div className="h-px w-8 bg-brand-orange/40" aria-hidden="true" />
            <p className="font-body text-brand-cream-dim text-base max-w-md">
              Bold flavors, no frills. Everything made to order.
            </p>
          </div>
        </motion.div>

        {/* — Category tabs — */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.4 }}
          className="flex flex-wrap gap-2 mb-10"
          role="tablist"
          aria-label="Menu categories"
        >
          <CategoryTab
            label="All"
            emoji="🔥"
            isActive={activeCategory === 'all'}
            onClick={() => setActiveCategory('all')}
          />
          {MENU_CATEGORIES.map(cat => (
            <CategoryTab
              key={cat.id}
              label={cat.label}
              emoji={cat.emoji}
              isActive={activeCategory === cat.id}
              onClick={() => setActiveCategory(cat.id)}
            />
          ))}
        </motion.div>

        {/* — Bento grid — */}
        <motion.div
          key={activeCategory}
          variants={cardContainer}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-fr"
        >
          {filtered.map((item) => (
            <motion.div
              key={item.id}
              variants={cardReveal}
              className={cn(isFeatured(item) && 'lg:col-span-2')}
            >
              {item.category === 'wangz'
                ? <WangzCard item={item} />
                : <MenuCard item={item} />
              }
            </motion.div>
          ))}
        </motion.div>

        {/* — Condiments + surcharge note — */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mt-12 border border-brand-charcoal-border bg-brand-charcoal-card p-5"
        >
          <div className="flex flex-col md:flex-row md:items-start gap-6">

            {/* Free condiments */}
            <div className="flex-1">
              <p className="font-mono text-xs tracking-widest text-brand-orange uppercase mb-3">
                ◆ Condiments — On Us
              </p>
              <div className="flex flex-wrap gap-1.5">
                {CONDIMENTS_FREE.map(c => (
                  <span
                    key={c}
                    className="font-mono text-xs text-brand-cream-dim/70
                               px-2 py-0.5
                               bg-brand-charcoal border border-brand-charcoal-border"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>

            {/* $1 add-ons */}
            <div className="flex-shrink-0">
              <p className="font-mono text-xs tracking-widest text-brand-orange uppercase mb-3">
                + Add-Ons
              </p>
              <div className="flex flex-wrap gap-1.5">
                {CONDIMENTS_EXTRAS.map(e => (
                  <span
                    key={e.name}
                    className="font-mono text-xs text-brand-cream-dim
                               px-2 py-0.5
                               bg-brand-charcoal border border-brand-orange/25"
                  >
                    {e.name} <span className="text-brand-orange">${e.price}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Surcharge note */}
            <div className="flex-shrink-0 self-end md:self-start">
              <p className="font-mono text-xs text-brand-cream-dim/40 tracking-wider leading-relaxed max-w-[220px]">
                Electronic payment: +$1 surcharge
              </p>
            </div>
          </div>
        </motion.div>

        {/* Bottom note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mt-6 text-center font-mono text-xs text-brand-cream-dim/40 tracking-wider"
        >
          Menu items & availability may vary · Follow us on Facebook for daily specials
        </motion.p>
      </div>
    </section>
  )
}

// ─── Category Tab ─────────────────────────────────────────────────────────────

interface CategoryTabProps {
  label:    string
  emoji:    string
  isActive: boolean
  onClick:  () => void
}

function CategoryTab({ label, emoji, isActive, onClick }: CategoryTabProps) {
  return (
    <button
      role="tab"
      aria-selected={isActive}
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-2 px-4 py-2',
        'font-mono text-xs tracking-wider uppercase',
        'transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2',
        'focus-visible:ring-brand-orange focus-visible:ring-offset-2',
        'focus-visible:ring-offset-brand-charcoal-surface',
        isActive
          ? 'bg-brand-orange text-white shadow-glow-sm'
          : 'bg-brand-charcoal-card text-brand-cream-dim border border-brand-charcoal-border hover:border-brand-orange/40 hover:text-brand-cream'
      )}
    >
      <span aria-hidden="true">{emoji}</span>
      {label}
    </button>
  )
}

// ─── Menu Card ────────────────────────────────────────────────────────────────

interface MenuCardProps {
  item: MenuItem
}

function MenuCard({ item }: MenuCardProps) {
  return (
    <motion.article
      whileHover={{ y: -3, transition: { duration: 0.2, ease: 'easeOut' } }}
      className={cn(
        'group relative flex flex-col h-full',
        'bg-brand-charcoal-card border border-brand-charcoal-border',
        'p-5 overflow-hidden',
        'transition-shadow duration-300',
        'hover:shadow-card-hover hover:border-l-brand-orange/60',
      )}
    >
      {/* Hover top glow */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-0 right-0 h-[2px]
                   bg-gradient-to-r from-brand-orange/0 via-brand-orange/50 to-brand-orange/0
                   opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      />

      {/* Top row — badges + heat */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex flex-wrap gap-1.5">
          {item.isSignature && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5
                             bg-brand-orange/15 border border-brand-orange/30
                             font-mono text-xs text-brand-orange tracking-widest">
              ◆ SIGNATURE
            </span>
          )}
          {item.isPopular && !item.isSignature && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5
                             bg-brand-charcoal border border-brand-charcoal-border
                             font-mono text-xs text-brand-cream-dim tracking-widest">
              POPULAR
            </span>
          )}
        </div>
        {item.heatLevel > 0 && <HeatIndicator level={item.heatLevel} />}
      </div>

      {/* Name */}
      <h3 className="font-display text-2xl text-white leading-tight mb-2
                     group-hover:text-brand-orange transition-colors duration-200">
        {item.name}
      </h3>

      {/* Description */}
      <p className="font-body text-sm text-brand-cream-dim leading-relaxed flex-1">
        {item.description}
      </p>

      {/* Add-ons */}
      {item.addons && item.addons.length > 0 && (
        <div className="mt-4 pt-4 border-t border-brand-charcoal-border">
          <p className="font-mono text-xs text-brand-orange/70 tracking-widest uppercase mb-2">
            Add-ons
          </p>
          <div className="flex flex-wrap gap-1.5">
            {item.addons.map(addon => (
              <span
                key={addon}
                className="font-mono text-xs text-brand-cream-dim/70
                           px-2 py-0.5
                           bg-brand-charcoal border border-brand-charcoal-border"
              >
                {addon}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Bottom row — category label + price */}
      <div className="mt-4 pt-3 border-t border-brand-charcoal-border/50 flex items-center justify-between">
        <span className="font-mono text-xs text-brand-cream-dim/40 tracking-widest uppercase">
          {MENU_CATEGORIES.find(c => c.id === item.category)?.emoji}{' '}
          {MENU_CATEGORIES.find(c => c.id === item.category)?.label}
        </span>
        <span className="font-display text-xl text-brand-orange leading-none">
          ${item.price}
        </span>
      </div>
    </motion.article>
  )
}

// ─── Wangz Card ───────────────────────────────────────────────────────────────
// Special card for the wangz category. Shows price + size prominently,
// then renders all 21 flavors as chip tags. Industrial flavor-forward layout.

function WangzCard({ item }: MenuCardProps) {
  return (
    <motion.article
      whileHover={{ y: -3, transition: { duration: 0.2, ease: 'easeOut' } }}
      className={cn(
        'group relative flex flex-col h-full',
        'bg-brand-charcoal-card border border-brand-charcoal-border',
        'p-5 overflow-hidden',
        'transition-shadow duration-300',
        'hover:shadow-card-hover hover:border-l-brand-orange/60',
      )}
    >
      {/* Hover top glow */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-0 right-0 h-[2px]
                   bg-gradient-to-r from-brand-orange/0 via-brand-orange/60 to-brand-orange/0
                   opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      />

      {/* Top: size + price */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          {item.isSignature && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 mb-2
                             bg-brand-orange/15 border border-brand-orange/30
                             font-mono text-xs text-brand-orange tracking-widest">
              ◆ BESTSELLER
            </span>
          )}
          <h3 className="font-display text-3xl text-white leading-tight
                         group-hover:text-brand-orange transition-colors duration-200">
            {item.name}
          </h3>
          <p className="font-body text-sm text-brand-cream-dim/70 mt-1">
            {item.description}
          </p>
        </div>
        <div className="flex-shrink-0 text-right">
          <span className="font-display text-4xl text-brand-orange leading-none">
            ${item.price}
          </span>
        </div>
      </div>

      {/* Flavors label */}
      <p className="font-mono text-xs tracking-widest text-brand-orange/60 uppercase mb-2">
        ◆ Pick Your Flava
      </p>

      {/* Flavor chips */}
      {item.flavors && (
        <div className="flex flex-wrap gap-1.5">
          {item.flavors.map(flava => (
            <span
              key={flava}
              className="font-mono text-xs text-brand-cream-dim/80
                         px-2 py-0.5
                         bg-brand-charcoal border border-brand-charcoal-border
                         hover:border-brand-orange/40 hover:text-brand-cream
                         transition-colors duration-150"
            >
              {flava}
            </span>
          ))}
        </div>
      )}

      {/* Bottom — sauce upsell note */}
      <div className="mt-4 pt-3 border-t border-brand-charcoal-border/50">
        <p className="font-mono text-xs text-brand-cream-dim/35 tracking-wider">
          🍗 Wangz · Add extra sauce to anything for $1
        </p>
      </div>
    </motion.article>
  )
}

// ─── Heat Indicator ───────────────────────────────────────────────────────────

interface HeatIndicatorProps {
  level: 0 | 1 | 2 | 3
}

function HeatIndicator({ level }: HeatIndicatorProps) {
  const labels = ['', 'Mild Heat', 'Medium Heat', 'Hot'] as const

  return (
    <div
      className="flex items-center gap-0.5"
      aria-label={`Heat level: ${labels[level]}`}
      title={labels[level]}
    >
      {[1, 2, 3].map(i => (
        <span
          key={i}
          className={cn('text-sm transition-opacity', i <= level ? 'opacity-100' : 'opacity-20')}
          aria-hidden="true"
        >
          🌶
        </span>
      ))}
    </div>
  )
}
