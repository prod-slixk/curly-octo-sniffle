'use client'

import { useState } from 'react'
import { MENU_ITEMS, MENU_CATEGORIES } from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { MenuItem, MenuCategoryId, WithClassName } from '@/types'

// ─────────────────────────────────────────────────────────────────────────────
// MenuGrid.tsx
// MORTY: Bento-style menu grid with category tab filter.
// Signature items get larger cards. Heat level indicators on spicy items.
// Staggered fade-in on card render. Mobile-first grid.
// ─────────────────────────────────────────────────────────────────────────────

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
      {/* — Section header — */}
      <div className="max-w-5xl mx-auto">
        <div className="mb-12">
          <p className="font-mono text-xs tracking-widest text-brand-orange uppercase mb-3">
            ✦ What We're Serving
          </p>
          <h2
            className="font-display text-display-xl text-white leading-none"
            style={{ fontFamily: '"Bebas Neue", Impact, sans-serif' }}
          >
            The Menu
          </h2>
          <p className="mt-3 font-body text-brand-cream-dim text-base max-w-md">
            Bold flavors, no frills. Everything made to order — roll up and pick your weapon.
          </p>
        </div>

        {/* — Category tabs — */}
        <div
          className="flex flex-wrap gap-2 mb-10"
          role="tablist"
          aria-label="Menu categories"
        >
          {/* All tab */}
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
        </div>

        {/* — Bento grid — */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-fr">
          {filtered.map((item, index) => (
            <MenuCard
              key={item.id}
              item={item}
              index={index}
            />
          ))}
        </div>

        {/* — Bottom note — */}
        <p className="mt-10 text-center font-mono text-xs text-brand-cream-dim/50 tracking-wider">
          Menu items & availability may vary by location · Follow us on Facebook for daily specials
        </p>
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
        'inline-flex items-center gap-2 px-4 py-2 rounded-chip',
        'font-body text-sm font-medium transition-all duration-200',
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
  item:  MenuItem
  index: number
}

function MenuCard({ item, index }: MenuCardProps) {
  return (
    <article
      className={cn(
        'group relative flex flex-col',
        'bg-brand-charcoal-card border border-brand-charcoal-border rounded-card',
        'p-5 overflow-hidden',
        'hover:border-brand-orange/30 hover:shadow-card-hover',
        'transition-all duration-300',
        'animate-fade-up opacity-0',
        // Staggered delay by index — max 6 steps
        index === 0 && '[animation-delay:0ms]',
        index === 1 && '[animation-delay:60ms]',
        index === 2 && '[animation-delay:120ms]',
        index === 3 && '[animation-delay:180ms]',
        index === 4 && '[animation-delay:240ms]',
        index >= 5  && '[animation-delay:300ms]',
        // Signature items span 2 cols on lg
        item.isSignature && 'lg:col-span-1',
      )}
      style={{ animationFillMode: 'forwards' }}
    >
      {/* — Hover glow edge — */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-0 right-0 h-px
                   bg-gradient-to-r from-transparent via-brand-orange/40 to-transparent
                   opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      />

      {/* — Card top row — */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex flex-wrap gap-1.5">
          {/* Signature badge */}
          {item.isSignature && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-chip
                             bg-brand-orange/15 border border-brand-orange/30
                             font-mono text-xs text-brand-orange tracking-wide">
              ✦ Signature
            </span>
          )}
          {/* Popular badge */}
          {item.isPopular && !item.isSignature && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-chip
                             bg-brand-charcoal border border-brand-charcoal-border
                             font-mono text-xs text-brand-cream-dim tracking-wide">
              Popular
            </span>
          )}
        </div>

        {/* Heat indicator */}
        {item.heatLevel > 0 && (
          <HeatIndicator level={item.heatLevel} />
        )}
      </div>

      {/* — Item name — */}
      <h3
        className="font-display text-2xl text-white leading-tight mb-2 group-hover:text-brand-orange transition-colors duration-200"
        style={{ fontFamily: '"Bebas Neue", Impact, sans-serif' }}
      >
        {item.name}
      </h3>

      {/* — Description — */}
      <p className="font-body text-sm text-brand-cream-dim leading-relaxed flex-1">
        {item.description}
      </p>

      {/* — Addons — */}
      {item.addons && item.addons.length > 0 && (
        <div className="mt-4 pt-4 border-t border-brand-charcoal-border">
          <p className="font-mono text-xs text-brand-orange/70 tracking-wider uppercase mb-2">
            Add-ons
          </p>
          <div className="flex flex-wrap gap-1.5">
            {item.addons.map(addon => (
              <span
                key={addon}
                className="font-mono text-xs text-brand-cream-dim/70
                           px-2 py-0.5 rounded-chip
                           bg-brand-charcoal border border-brand-charcoal-border"
              >
                {addon}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* — Category chip — */}
      <div className="mt-4 flex items-center justify-between">
        <span className="font-mono text-xs text-brand-cream-dim/40 tracking-widest uppercase">
          {MENU_CATEGORIES.find(c => c.id === item.category)?.emoji}{' '}
          {MENU_CATEGORIES.find(c => c.id === item.category)?.label}
        </span>
      </div>
    </article>
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
          className={cn(
            'text-sm transition-opacity',
            i <= level ? 'opacity-100' : 'opacity-20'
          )}
          aria-hidden="true"
        >
          🌶
        </span>
      ))}
    </div>
  )
}