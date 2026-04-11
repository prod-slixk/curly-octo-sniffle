// ─────────────────────────────────────────────────────────────────────────────
// types/index.ts — Shared TypeScript types across the entire project
// MORTY + TERRY: Both layers import from here. No type duplication anywhere.
// ─────────────────────────────────────────────────────────────────────────────

// ─── Site ─────────────────────────────────────────────────────────────────────

export interface SiteConfig {
  name:        string
  tagline:     string
  description: string
  phone:       string
  email:       string
  address: {
    street: string
    city:   string
    state:  string
    zip:    string
  }
}

// ─── Hours ────────────────────────────────────────────────────────────────────

export interface HoursEntry {
  day:    string
  open:   string | null  // '11:30' 24h format, null if closed
  close:  string | null
  closed: boolean
}

// ─── Location ─────────────────────────────────────────────────────────────────

export interface Coordinates {
  lat: number
  lng: number
}

export interface LocationEntry {
  id:          string
  label:       string
  address:     string
  description: string
  coordinates: Coordinates
  isPrimary:   boolean
}

// ─── Menu ─────────────────────────────────────────────────────────────────────

export type MenuCategoryId = 'burgers' | 'dogs' | 'sides'

export interface MenuCategory {
  id:          MenuCategoryId
  label:       string
  emoji:       string
  description: string
}

export interface MenuItem {
  id:          string
  name:        string
  category:    MenuCategoryId
  description: string
  isSignature: boolean
  isPopular:   boolean
  heatLevel:   0 | 1 | 2 | 3   // 0 = mild, 3 = hot
  addons?:     string[]
  tags:        string[]
}

// ─── Social ───────────────────────────────────────────────────────────────────

export type SocialIcon = 'facebook' | 'instagram' | 'tiktok'

export interface SocialLink {
  platform: string
  handle:   string
  url:      string
  icon:     SocialIcon
}

// ─── Contact Form ─────────────────────────────────────────────────────────────
// TERRY: These match the Zod schema in /api/v1/contact/route.ts exactly.
// If you change one, change both. They must stay in sync.

export interface ContactFormData {
  name:    string
  phone:   string
  email:   string
  message: string
}

export interface ContactFormState {
  status:  'idle' | 'loading' | 'success' | 'error'
  message: string | null
}

// ─── API Response Shape ───────────────────────────────────────────────────────
// TERRY: All API responses conform to this envelope. No naked returns.

export interface ApiResponse<T = null> {
  success: boolean
  data:    T | null
  error:   string | null
}

// ─── Utility ──────────────────────────────────────────────────────────────────

export type WithClassName = {
  className?: string
}

export type PropsWithClassName<T = Record<string, never>> = T & WithClassName