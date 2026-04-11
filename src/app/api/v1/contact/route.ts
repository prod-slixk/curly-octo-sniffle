import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import type { ApiResponse } from '@/types'

// ─────────────────────────────────────────────────────────────────────────────
// /api/v1/contact/route.ts
// Zod validation on all inputs. Rate limiting via Upstash.
// Email delivery via Resend. No stack traces to client. Ever.
// ─────────────────────────────────────────────────────────────────────────────

// ─── Zod Schema ───────────────────────────────────────────────────────────────
//  This is the single source of truth for contact form shape.
// Must stay in sync with ContactFormData in types/index.ts

const ContactSchema = z.object({
  name: z
    .string()
    .min(2,   { message: 'Name must be at least 2 characters.' })
    .max(100, { message: 'Name is too long.' })
    .trim(),

  phone: z
    .string()
    .max(20, { message: 'Phone number is too long.' })
    .optional()
    .or(z.literal('')),

  email: z
    .string()
    .email({ message: 'Please enter a valid email address.' })
    .max(255, { message: 'Email is too long.' })
    .trim(),

  message: z
    .string()
    .min(10,   { message: 'Message must be at least 10 characters.' })
    .max(2000, { message: 'Message is too long (max 2000 characters).' })
    .trim(),
})

// ─── Rate Limiting ────────────────────────────────────────────────────────────
//  Simple in-memory rate limit for dev/preview.
// Swap to Upstash Redis in production — see .env.example.
// Allows 3 submissions per IP per 10 minutes.

const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(ip: string): boolean {
  const now     = Date.now()
  const window  = 10 * 60 * 1000 // 10 minutes
  const limit   = 3

  const entry = rateLimitMap.get(ip)

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + window })
    return true
  }

  if (entry.count >= limit) return false

  entry.count++
  return true
}

// ─── Handler ──────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    // ── 1. Rate limit ──────────────────────────────────────────────────────
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
           ?? req.headers.get('x-real-ip')
           ?? 'unknown'

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { success: false, data: null, error: 'Too many submissions. Please try again later.' },
        { status: 429 }
      )
    }

    // ── 2. Parse body ──────────────────────────────────────────────────────
    let body: unknown
    try {
      body = await req.json()
    } catch {
      return NextResponse.json(
        { success: false, data: null, error: 'Invalid request body.' },
        { status: 400 }
      )
    }

    // ── 3. Validate with Zod ───────────────────────────────────────────────
    const parsed = ContactSchema.safeParse(body)

    if (!parsed.success) {
      const firstError = parsed.error.errors[0]?.message ?? 'Invalid form data.'
      return NextResponse.json(
        { success: false, data: null, error: firstError },
        { status: 422 }
      )
    }

    const { name, email, phone, message } = parsed.data

    // ── 4. Send email via Resend ───────────────────────────────────────────
    //  RESEND_API_KEY must be set in .env.local — never hardcoded.
    // If not set, we log and still return success (graceful degradation in dev).

    const resendKey = process.env.RESEND_API_KEY

    if (resendKey) {
      const emailRes = await fetch('https://api.resend.com/emails', {
        method:  'POST',
        headers: {
          'Authorization': `Bearer ${resendKey}`,
          'Content-Type':  'application/json',
        },
        body: JSON.stringify({
          from:    'Contact Form <onboarding@resend.dev>',
          to:      [process.env.CONTACT_EMAIL ?? 'Rollinmunchiesfamily@gmail.com'],
          subject: `New message from ${name} — Rollin' Munchies`,
          html: `
            <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
              <h2 style="color:#F97316">New Contact Form Submission</h2>
              <table style="width:100%;border-collapse:collapse">
                <tr><td style="padding:8px;font-weight:bold;color:#666">Name</td>
                    <td style="padding:8px">${name}</td></tr>
                <tr><td style="padding:8px;font-weight:bold;color:#666">Email</td>
                    <td style="padding:8px">${email}</td></tr>
                ${phone ? `<tr><td style="padding:8px;font-weight:bold;color:#666">Phone</td>
                    <td style="padding:8px">${phone}</td></tr>` : ''}
                <tr><td style="padding:8px;font-weight:bold;color:#666;vertical-align:top">Message</td>
                    <td style="padding:8px;white-space:pre-wrap">${message}</td></tr>
              </table>
            </div>
          `,
        }),
      })

      if (!emailRes.ok) {
        //  Log server-side, never expose details to client
        console.error('[contact] Resend error:', await emailRes.text())
        return NextResponse.json(
          { success: false, data: null, error: 'Failed to send message. Please call us directly.' },
          { status: 500 }
        )
      }
    } else {
      // Dev mode — log to console
      console.log('[contact] Dev mode — email would send:', { name, email, phone, message })
    }

    // ── 5. Success ─────────────────────────────────────────────────────────
    return NextResponse.json(
      { success: true, data: null, error: null },
      { status: 200 }
    )

  } catch (err) {
    //  Global catch — safe message only, no stack trace
    console.error('[contact] Unexpected error:', err)
    return NextResponse.json(
      { success: false, data: null, error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}

//  Reject non-POST methods cleanly
export async function GET(): Promise<NextResponse<ApiResponse>> {
  return NextResponse.json(
    { success: false, data: null, error: 'Method not allowed.' },
    { status: 405 }
  )
}