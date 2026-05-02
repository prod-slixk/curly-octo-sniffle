import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import type { ApiResponse } from '@/types'

// ─────────────────────────────────────────────────────────────────────────────
// /api/v1/preorder/route.ts
// Pre-order notification endpoint — no payment, call-ahead only.
// On valid submission:
//   1. Validates + rate-limits
//   2. Sends email via Resend to Rollinmunchiesfamily@gmail.com
//   3. Sends SMS via Twilio to the owner's number
// TERRY: No stack traces to client. Ever. Log server-side, return safe messages.
// ─────────────────────────────────────────────────────────────────────────────

// ─── Zod Schema ───────────────────────────────────────────────────────────────

const PreOrderItemSchema = z.object({
  itemId:   z.string().min(1),
  itemName: z.string().min(1).max(120),
  quantity: z.number().int().min(1).max(20),
  flavor:   z.string().max(60).optional(),
})

const PreOrderSchema = z.object({
  name: z
    .string()
    .min(2,   { message: 'Name must be at least 2 characters.' })
    .max(100, { message: 'Name is too long.'                   })
    .trim(),

  phone: z
    .string()
    .min(7,  { message: 'Please enter a valid phone number.' })
    .max(20, { message: 'Phone number is too long.'          })
    .trim(),

  pickupTime: z
    .string()
    .min(1, { message: 'Please select a pickup time.' }),

  items: z
    .array(PreOrderItemSchema)
    .min(1, { message: 'Please add at least one item to your order.' })
    .max(30),

  instructions: z
    .string()
    .max(500, { message: 'Special instructions too long (max 500 characters).' })
    .optional()
    .or(z.literal('')),
})

// ─── Rate Limiting ────────────────────────────────────────────────────────────
// In-memory for dev/preview. Swap to Upstash Redis in production.
// 5 pre-orders per IP per 30 minutes.

const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(ip: string): boolean {
  const now    = Date.now()
  const window = 30 * 60 * 1000 // 30 minutes
  const limit  = 5

  const entry = rateLimitMap.get(ip)

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + window })
    return true
  }

  if (entry.count >= limit) return false
  entry.count++
  return true
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatPickupTime(value: string): string {
  if (value === 'asap') return 'ASAP'
  const [h, m] = value.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const hour   = h > 12 ? h - 12 : h === 0 ? 12 : h
  return `${hour}:${String(m).padStart(2, '0')} ${period}`
}

function formatItemsForEmail(items: z.infer<typeof PreOrderItemSchema>[]): string {
  return items
    .map(i => {
      const flavorNote = i.flavor ? ` <span style="color:#9ca3af">(${i.flavor})</span>` : ''
      return `
        <tr>
          <td style="padding:6px 8px;color:#f3f4f6">${i.itemName}${flavorNote}</td>
          <td style="padding:6px 8px;text-align:center;color:#F97316;font-weight:bold">×${i.quantity}</td>
        </tr>`
    })
    .join('')
}

function formatItemsForSms(items: z.infer<typeof PreOrderItemSchema>[]): string {
  return items
    .map(i => {
      const flav = i.flavor ? ` (${i.flavor})` : ''
      return `${i.quantity}x ${i.itemName}${flav}`
    })
    .join(', ')
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
        { success: false, data: null, error: 'Too many pre-orders from this device. Please call us directly.' },
        { status: 429 }
      )
    }

    // ── 2. Parse body ──────────────────────────────────────────────────────
    let body: unknown
    try {
      body = await req.json()
    } catch {
      return NextResponse.json(
        { success: false, data: null, error: 'Invalid request.' },
        { status: 400 }
      )
    }

    // ── 3. Validate ────────────────────────────────────────────────────────
    const parsed = PreOrderSchema.safeParse(body)

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? 'Invalid order data.'
      return NextResponse.json(
        { success: false, data: null, error: firstError },
        { status: 422 }
      )
    }

    const { name, phone, pickupTime, items, instructions } = parsed.data
    const pickupLabel   = formatPickupTime(pickupTime)
    const totalItems    = items.reduce((sum, i) => sum + i.quantity, 0)
    const itemsHtmlRows = formatItemsForEmail(items)
    const itemsSmsText  = formatItemsForSms(items)

    // ── 4. Send email via Resend ───────────────────────────────────────────
    const resendKey = process.env.RESEND_API_KEY

    if (resendKey) {
      const emailRes = await fetch('https://api.resend.com/emails', {
        method:  'POST',
        headers: {
          'Authorization': `Bearer ${resendKey}`,
          'Content-Type':  'application/json',
        },
        body: JSON.stringify({
          from:    'Pre-Order <onboarding@resend.dev>',
          to:      [process.env.CONTACT_EMAIL ?? 'Rollinmunchiesfamily@gmail.com'],
          subject: `🔔 Pre-Order — ${name} @ ${pickupLabel}`,
          html: `
            <div style="font-family:sans-serif;max-width:620px;margin:0 auto;background:#111;color:#f3f4f6;padding:24px;border-radius:4px">

              <div style="border-left:4px solid #F97316;padding-left:16px;margin-bottom:24px">
                <h2 style="color:#F97316;margin:0 0 4px">New Pre-Order</h2>
                <p style="margin:0;color:#9ca3af;font-size:13px">Submitted via rollínmunchies.com</p>
              </div>

              <!-- Customer info -->
              <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
                <tr>
                  <td style="padding:6px 8px;color:#9ca3af;width:120px">Name</td>
                  <td style="padding:6px 8px;color:#f3f4f6;font-weight:bold">${name}</td>
                </tr>
                <tr style="background:#1a1a1a">
                  <td style="padding:6px 8px;color:#9ca3af">Phone</td>
                  <td style="padding:6px 8px;color:#f3f4f6">${phone}</td>
                </tr>
                <tr>
                  <td style="padding:6px 8px;color:#9ca3af">Pickup Time</td>
                  <td style="padding:6px 8px;color:#F97316;font-size:18px;font-weight:bold">${pickupLabel}</td>
                </tr>
                <tr style="background:#1a1a1a">
                  <td style="padding:6px 8px;color:#9ca3af">Total Items</td>
                  <td style="padding:6px 8px;color:#f3f4f6">${totalItems} item${totalItems !== 1 ? 's' : ''}</td>
                </tr>
              </table>

              <!-- Items -->
              <h3 style="color:#F97316;margin:0 0 8px;font-size:13px;text-transform:uppercase;letter-spacing:.08em">Order</h3>
              <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
                <thead>
                  <tr style="background:#1a1a1a">
                    <th style="padding:6px 8px;text-align:left;color:#9ca3af;font-size:12px;font-weight:normal">Item</th>
                    <th style="padding:6px 8px;text-align:center;color:#9ca3af;font-size:12px;font-weight:normal;width:60px">Qty</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtmlRows}
                </tbody>
              </table>

              ${instructions ? `
              <!-- Special instructions -->
              <div style="background:#1a1a1a;border-left:3px solid #F97316;padding:12px 16px;margin-bottom:20px">
                <p style="margin:0 0 4px;color:#9ca3af;font-size:12px;text-transform:uppercase;letter-spacing:.08em">Special Instructions</p>
                <p style="margin:0;color:#f3f4f6;white-space:pre-wrap">${instructions}</p>
              </div>` : ''}

              <p style="color:#6b7280;font-size:12px;margin:24px 0 0;border-top:1px solid #333;padding-top:16px">
                Rollin' Munchies · (252) 907-9660 · No payment collected — call-ahead only
              </p>
            </div>
          `,
        }),
      })

      if (!emailRes.ok) {
        console.error('[preorder] Resend error:', await emailRes.text())
        return NextResponse.json(
          { success: false, data: null, error: 'Failed to submit order. Please call us directly at (252) 907-9660.' },
          { status: 500 }
        )
      }
    } else {
      // Dev mode — log to console
      console.log('[preorder] Dev mode — email would send:', { name, phone, pickupLabel, items, instructions })
    }

    // ── 5. Send SMS via Twilio ─────────────────────────────────────────────
    // TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER, TWILIO_TO_NUMBER
    // must be set in .env.local. Gracefully skipped if missing.

    const twilioSid   = process.env.TWILIO_ACCOUNT_SID
    const twilioToken = process.env.TWILIO_AUTH_TOKEN
    const twilioFrom  = process.env.TWILIO_FROM_NUMBER
    const twilioTo    = process.env.TWILIO_TO_NUMBER

    if (twilioSid && twilioToken && twilioFrom && twilioTo) {
      const smsBody = [
        `🔔 PRE-ORDER — ${name}`,
        `Pickup: ${pickupLabel}`,
        `Order: ${itemsSmsText}`,
        instructions ? `Notes: ${instructions.slice(0, 120)}` : null,
        `Call back: ${phone}`,
      ].filter(Boolean).join('\n')

      const credentials = Buffer.from(`${twilioSid}:${twilioToken}`).toString('base64')

      const smsRes = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`,
        {
          method:  'POST',
          headers: {
            'Authorization': `Basic ${credentials}`,
            'Content-Type':  'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            From: twilioFrom,
            To:   twilioTo,
            Body: smsBody,
          }).toString(),
        }
      )

      if (!smsRes.ok) {
        // SMS failure is non-fatal — email already sent, log and continue
        console.error('[preorder] Twilio SMS error:', await smsRes.text())
      }
    } else {
      console.log('[preorder] Twilio not configured — SMS skipped.')
    }

    // ── 6. Success ─────────────────────────────────────────────────────────
    return NextResponse.json(
      { success: true, data: null, error: null },
      { status: 200 }
    )

  } catch (err) {
    console.error('[preorder] Unexpected error:', err)
    return NextResponse.json(
      { success: false, data: null, error: 'Something went wrong. Please call us at (252) 907-9660.' },
      { status: 500 }
    )
  }
}

export async function GET(): Promise<NextResponse<ApiResponse>> {
  return NextResponse.json(
    { success: false, data: null, error: 'Method not allowed.' },
    { status: 405 }
  )
}
