import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

// ─── cn() ─────────────────────────────────────────────────────────────────────
// MORTY: Use this everywhere conditional Tailwind classes are needed.
// Merges clsx logic with tailwind-merge to avoid class conflicts.
// Usage: cn('px-4 py-2', isActive && 'bg-brand-orange', className)

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

// ─── formatPhone() ────────────────────────────────────────────────────────────

export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 10) {
    return `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6)}`
  }
  return phone
}

// ─── formatHours() ────────────────────────────────────────────────────────────
// Converts '11:30' (24h) → '11:30 AM', '18:00' → '6:00 PM'

export function formatHours(time: string): string {
  const [hourStr, min] = time.split(':')
  const hour = parseInt(hourStr, 10)
  const period = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
  return `${displayHour}:${min} ${period}`
}

// ─── isOpenNow() ─────────────────────────────────────────────────────────────

export function isOpenNow(
  hours: { day: string; open: string | null; close: string | null; closed: boolean }[]
): boolean {
  const now = new Date()
  const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
  const today = hours.find(h => h.day === days[now.getDay()])

  if (!today || today.closed || !today.open || !today.close) return false

  const [openH, openM]   = today.open.split(':').map(Number)
  const [closeH, closeM] = today.close.split(':').map(Number)

  const nowMins   = now.getHours() * 60 + now.getMinutes()
  const openMins  = openH * 60 + openM
  const closeMins = closeH * 60 + closeM

  return nowMins >= openMins && nowMins < closeMins
}