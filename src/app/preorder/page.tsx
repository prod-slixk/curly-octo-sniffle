import type { Metadata } from 'next'
import { PreOrder } from '@/components/sections/PreOrder'
import { SITE_CONFIG } from '@/lib/constants'

// ─────────────────────────────────────────────────────────────────────────────
// /preorder — Pre-Order page
// Standalone page. Uses shared layout from app/layout.tsx (header/footer).
// ─────────────────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title:       `Pre-Order | ${SITE_CONFIG.name}`,
  description: `Call-ahead pre-orders for ${SITE_CONFIG.name} in Tarboro, NC. Pick your items and we'll have your order ready at pickup.`,
  openGraph: {
    title:       `Pre-Order | ${SITE_CONFIG.name}`,
    description: 'Place a call-ahead pre-order for pickup. No payment required.',
    type:        'website',
  },
}

export default function PreOrderPage() {
  return <PreOrder />
}
