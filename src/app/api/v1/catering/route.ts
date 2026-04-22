import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import type { ApiResponse } from '@/types'

// -----------------------------------------------------------------------------
// /api/v1/catering/route.ts
// Catering inquiry endpoint — high-ticket events, corporate, private bookings.
// On valid submission:
//   1. Validates + rate-limits
//   2. Sends rich email via Resend to Rollinmunchiesfamily@gmail.com
//   3. Sends SMS via Twilio to Hawk
// TERRY: No stack traces to client. Ever.
// -----------------------------------------------------------------------------

// --- Zod Schema ---

const BUDGET_RANGES = [
  'under-500',
  '500-1000',
  '1000-2500',
  '2500-5000',
  '5000-plus',
  'not-sure',
] as const

const BUDGET_LABELS: Record<typeof BUDGET_RANGES[number], string> = {
  'under-500':  'Under $500',
  '500-1000':   '$500 – $1,000',
  '1000-2500':  '$1,000 – $2,500',
  '2500-5000':  '$2,500 – $5,000',
  '5000-plus':  '$5,000+',
  'not-sure':   'Not sure yet',
}

const CateringSchema = z.object({
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

  email: z
    .string()
    .email({ message: 'Please enter a valid email address.' })
    .max(255)
    .trim(),

  eventDate: z
    .string()
    .min(1, { message: 'Please provide an event date.' })
    .max(50)
    .trim(),

  headcount: z
    .string()
    .min(1, { message: 'Please provide an approximate headcount.' })
    .max(50)
    .trim(),

  eventLocation: z
    .string()
    .min(2,   { message: 'Please provide the event location.' })
    .max(200, { message: 'Location is too long.'              })
    .trim(),

  budgetRange: z.enum(BUDGET_RANGES, {
    errorMap: () => ({ message: 'Please select a budget range.' }),
  }),

  notes: z
    .string()
    .max(1000, { message: 'Notes too long (max 1000 characters).' })
    .optional()
    .or(z.literal('')),
})

// --- Rate Limiting ---
// 3 catering inquiries per IP per hour — lower than pre-order, higher-intent form.

const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(ip: string): boolean {
  const now    = Date.now()
  const window = 60 * 60 * 1000 // 1 hour
  const limit  = 3

  const entry = rateLimitMap.get(ip)
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + window })
    return true
  }
  if (entry.count >= limit) return false
  entry.count++
  return true
}

// --- Handler ---

export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    // 1. Rate limit
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
           ?? req.headers.get('x-real-ip')
           ?? 'unknown'

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { success: false, data: null, error: 'Too many requests. Please call us directly to discuss your event.' },
        { status: 429 }
      )
    }

    // 2. Parse body
    let body: unknown
    try {
      body = await req.json()
    } catch {
      return NextResponse.json(
        { success: false, data: null, error: 'Invalid request.' },
        { status: 400 }
      )
    }

    // 3. Validate
    const parsed = CateringSchema.safeParse(body)
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? 'Invalid inquiry data.'
      return NextResponse.json(
        { success: false, data: null, error: firstError },
        { status: 422 }
      )
    }

    const { name, phone, email, eventDate, headcount, eventLocation, budgetRange, notes } = parsed.data
    const budgetLabel = BUDGET_LABELS[budgetRange]

    // 4. Send email via Resend
    const resendKey = process.env.RESEND_API_KEY

    if (resendKey) {
      const emailRes = await fetch('https://api.resend.com/emails', {
        method:  'POST',
        headers: {
          'Authorization': `Bearer ${resendKey}`,
          'Content-Type':  'application/json',
        },
        body: JSON.stringify({
          from:    'Catering Inquiry <onboarding@resend.dev>',
          to:      [process.env.CONTACT_EMAIL ?? 'Rollinmunchiesfamily@gmail.com'],
          subject: `🍽️ Catering Inquiry — ${name} | ${eventDate}`,
          html: `
            <div style="font-family:sans-serif;max-width:620px;margin:0 auto;background:#111;color:#f3f4f6;padding:24px;border-radius:4px">

              <div style="border-left:4px solid #F97316;padding-left:16px;margin-bottom:24px">
                <h2 style="color:#F97316;margin:0 0 4px">New Catering Inquiry</h2>
                <p style="margin:0;color:#9ca3af;font-size:13px">Submitted via rollinmunchies.com/catering</p>
              </div>

              <!-- Contact info -->
              <h3 style="color:#F97316;margin:0 0 8px;font-size:12px;text-transform:uppercase;letter-spacing:.08em">Contact</h3>
              <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
                <tr>
                  <td style="padding:6px 8px;color:#9ca3af;width:140px">Name</td>
                  <td style="padding:6px 8px;color:#f3f4f6;font-weight:bold">${name}</td>
                </tr>
                <tr style="background:#1a1a1a">
                  <td style="padding:6px 8px;color:#9ca3af">Phone</td>
                  <td style="padding:6px 8px;color:#f3f4f6">${phone}</td>
                </tr>
                <tr>
                  <td style="padding:6px 8px;color:#9ca3af">Email</td>
                  <td style="padding:6px 8px;color:#f3f4f6">${email}</td>
                </tr>
              </table>

              <!-- Event details -->
              <h3 style="color:#F97316;margin:0 0 8px;font-size:12px;text-transform:uppercase;letter-spacing:.08em">Event Details</h3>
              <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
                <tr>
                  <td style="padding:6px 8px;color:#9ca3af;width:140px">Date</td>
                  <td style="padding:6px 8px;color:#F97316;font-size:17px;font-weight:bold">${eventDate}</td>
                </tr>
                <tr style="background:#1a1a1a">
                  <td style="padding:6px 8px;color:#9ca3af">Headcount</td>
                  <td style="padding:6px 8px;color:#f3f4f6">${headcount} guests</td>
                </tr>
                <tr>
                  <td style="padding:6px 8px;color:#9ca3af">Location</td>
                  <td style="padding:6px 8px;color:#f3f4f6">${eventLocation}</td>
                </tr>
                <tr style="background:#1a1a1a">
                  <td style="padding:6px 8px;color:#9ca3af">Budget</td>
                  <td style="padding:6px 8px;color:#f3f4f6;font-weight:bold">${budgetLabel}</td>
                </tr>
              </table>

              ${notes ? `
              <div style="background:#1a1a1a;border-left:3px solid #F97316;padding:12px 16px;margin-bottom:20px">
                <p style="margin:0 0 4px;color:#9ca3af;font-size:12px;text-transform:uppercase;letter-spacing:.08em">Additional Notes</p>
                <p style="margin:0;color:#f3f4f6;white-space:pre-wrap">${notes}</p>
              </div>` : ''}

              <p style="color:#6b7280;font-size:12px;margin:24px 0 0;border-top:1px solid #333;padding-top:16px">
                Rollin' Munchies &middot; (252) 907-9660 &middot; Rollinmunchiesfamily@gmail.com
              </p>
            </div>
          `,
        }),
      })

      if (!emailRes.ok) {
        console.error('[catering] Resend error:', await emailRes.text())
        return NextResponse.json(
          { success: false, data: null, error: 'Failed to submit inquiry. Please call us directly at (252) 907-9660.' },
          { status: 500 }
        )
      }
    } else {
      console.log('[catering] Dev mode — email would send:', { name, phone, email, eventDate, headcount, eventLocation, budgetRange, notes })
    }

    // 5. Send SMS via Twilio
    const twilioSid   = process.env.TWILIO_ACCOUNT_SID
    const twilioToken = process.env.TWILIO_AUTH_TOKEN
    const twilioFrom  = process.env.TWILIO_FROM_NUMBER
    const twilioTo    = process.env.TWILIO_TO_NUMBER

    if (twilioSid && twilioToken && twilioFrom && twilioTo) {
      const smsBody = [
        `🍽️ CATERING INQUIRY — ${name}`,
        `Date: ${eventDate}`,
        `Guests: ${headcount} | Budget: ${budgetLabel}`,
        `Location: ${eventLocation}`,
        `Call: ${phone} | ${email}`,
      ].join('\n')

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
        // Non-fatal — email already sent
        console.error('[catering] Twilio SMS error:', await smsRes.text())
      }
    } else {
      console.log('[catering] Twilio not configured — SMS skipped.')
    }

    // 6. Success
    return NextResponse.json(
      { success: true, data: null, error: null },
      { status: 200 }
    )

  } catch (err) {
    console.error('[catering] Unexpected error:', err)
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
