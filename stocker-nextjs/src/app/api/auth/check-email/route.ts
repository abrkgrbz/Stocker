import { NextRequest, NextResponse } from 'next/server'
import { CheckEmailRequestSchema, CheckEmailResponseSchema } from '@/lib/types/auth'
import { generateTenantSignature } from '@/lib/auth/hmac'
import { checkRateLimit, getClientIP, RATE_LIMITS } from '@/lib/auth/rate-limit'
import { env, getApiUrl } from '@/lib/env'

/**
 * POST /api/auth/check-email
 *
 * Proxy endpoint for email checking with:
 * - Rate limiting
 * - HMAC signature generation for tenant response
 * - CORS handling
 * - Error sanitization
 */
export async function POST(request: NextRequest) {
  try {
    // Parse and validate request
    const body = await request.json()
    const validationResult = CheckEmailRequestSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Geçersiz e-posta formatı',
          errors: validationResult.error.errors
        },
        { status: 400 }
      )
    }

    const { email } = validationResult.data

    // Rate limiting by IP
    const clientIP = getClientIP(request)
    const rateLimitResult = await checkRateLimit(
      `email-check:${clientIP}`,
      RATE_LIMITS.EMAIL_CHECK
    )

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: `Çok fazla deneme. ${rateLimitResult.retryAfter} saniye sonra tekrar deneyin.`
        },
        {
          status: 429,
          headers: {
            'Retry-After': rateLimitResult.retryAfter?.toString() || '60',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(rateLimitResult.resetAt).toISOString()
          }
        }
      )
    }

    // Call backend API
    const apiUrl = getApiUrl(true) // server-side
    const backendResponse = await fetch(`${apiUrl}/api/public/check-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Stocker-NextJS/1.0'
      },
      body: JSON.stringify({ email })
    })

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text()
      console.error('Backend check-email error:', errorText)

      return NextResponse.json(
        {
          success: false,
          message: 'E-posta kontrol edilirken bir hata oluştu'
        },
        { status: 500 }
      )
    }

    const backendData = await backendResponse.json()

    // Backend already provides HMAC signature with timestamp (in seconds)
    // We don't need to regenerate - just pass through the backend signature
    // Backend returns: { success, data: { exists, tenant: { ..., signature, timestamp } } }

    // Validate response schema
    const responseValidation = CheckEmailResponseSchema.safeParse(backendData)

    if (!responseValidation.success) {
      console.error('Invalid backend response:', responseValidation.error)
      return NextResponse.json(
        {
          success: false,
          message: 'Sunucu yanıtı geçersiz'
        },
        { status: 500 }
      )
    }

    // Return response with rate limit headers
    return NextResponse.json(responseValidation.data, {
      headers: {
        'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
        'X-RateLimit-Reset': new Date(rateLimitResult.resetAt).toISOString()
      }
    })
  } catch (error) {
    console.error('Check-email route error:', error)

    return NextResponse.json(
      {
        success: false,
        message: 'Bir hata oluştu. Lütfen tekrar deneyin.'
      },
      { status: 500 }
    )
  }
}
