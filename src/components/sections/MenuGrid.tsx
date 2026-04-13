'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { MENU_ITEMS, MENU_CATEGORIES } from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { MenuItem, MenuCategoryId, WithClassName } from '@/types'

// ─────────────────────────────────────────────────────────────────────────────
// MenuGrid.tsx
// MORTY: True bento grid — featured items (signature + high heat) span 2 cols.
// Framer Motion scroll reveal with stagger. Card hover lift.
// Industrial aesthetic: sharp corners, heavy borders, structural spacing.
// ─────────────────────────────────────────────────────────────────────────────

const EASE_OUT = [0.25, 0.46, 0.45, 0.94] as const

const cardContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
}

const cardReveal = {
  hidden: { opacity: 0, y: 12 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE_OUT } },
}

const sectionReveal = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0,  transition: { duration: 0.55, ease: EASE_OUT } },
}

// Items that get the wide bento treatment: signature + high heat
const isFeatured = (item: MenuItem) => item.isSignature && item.heatLevel >= 2

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

      <div className="max-w-5xl mx-auto">

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
          {/* Industrial ruled line */}
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

        {/* — Bento grid — featured items span 2 cols on desktop — */}
        <motion.div
          key={activeCategory} // re-trigger animation on filter change
          variants={cardContainer}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-fr"
        >
          {filtered.map((item) => (
            <motion.div
              key={item.id}
              variants={cardReveal}
              className={cn(
                // Featured items get wide bento treatment on desktop
                isFeatured(item) && 'lg:col-span-2'
              )}
            >
              <MenuCard item={item} />
            </motion.div>
          ))}
        </motion.div>

        {/* — Bottom note — */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mt-10 text-center font-mono text-xs text-brand-cream-dim/40 tracking-wider"
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
        'hover:shadow-card-hover',
        // Orange left-edge accent on hover via border-left
        'hover:border-l-brand-orange/60',
      )}
    >
      {/* — Hover top glow line — */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-0 right-0 h-[2px]
                   bg-gradient-to-r from-brand-orange/0 via-brand-orange/50 to-brand-orange/0
                   opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      />

      {/* — Card top row — */}
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

      {/* — Item name — */}
      <h3 className="font-display text-2xl text-white leading-tight mb-2
                     group-hover:text-brand-orange transition-colors duration-200">
        {item.name}
      </h3>

      {/* — Description — */}
      <p className="font-body text-sm text-brand-cream-dim leading-relaxed flex-1">
        {item.description}
      </p>

      {/* — Addons — */}
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

      {/* — Category label — */}
      <div className="mt-4 pt-3 border-t border-brand-charcoal-border/50 flex items-center justify-between">
        <span className="font-mono text-xs text-brand-cream-dim/40 tracking-widest uppercase">
          {MENU_CATEGORIES.find(c => c.id === item.category)?.emoji}{' '}
          {MENU_CATEGORIES.find(c => c.id === item.category)?.label}
        </span>
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
