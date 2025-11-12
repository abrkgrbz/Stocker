import { NextRequest, NextResponse } from 'next/server'
import { LoginRequestSchema, LoginResponseSchema } from '@/lib/types/auth'
import { validateSignedTenant } from '@/lib/auth/hmac'
import { checkRateLimit, resetRateLimit, getClientIP, RATE_LIMITS } from '@/lib/auth/rate-limit'
import { getApiUrl, getCookieDomain } from '@/lib/env'

import logger from '../../../../lib/utils/logger';
/**
 * POST /api/auth/login
 *
 * Secure login endpoint with:
 * - Multi-layer rate limiting (email + IP)
 * - HMAC tenant validation
 * - Secure cookie handling
 * - Audit logging
 * - CORS proxy
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now()
  let auditData: Record<string, any> = {
    timestamp: new Date().toISOString(),
    ip: getClientIP(request),
    userAgent: request.headers.get('user-agent') || 'unknown'
  }

  try {
    // Parse and validate request
    const body = await request.json()
    const validationResult = LoginRequestSchema.safeParse(body)

    if (!validationResult.success) {
      auditData.event = 'login_invalid_request'
      auditData.errors = validationResult.error.errors
      await logAudit(auditData)

      return NextResponse.json(
        {
          success: false,
          message: 'Geçersiz istek formatı'
        },
        { status: 400 }
      )
    }

    const { email, password, tenantCode, tenantSignature, tenantTimestamp } = validationResult.data
    auditData.email = email
    auditData.tenantCode = tenantCode

    // Validate HMAC signature if provided (optional for direct tenant subdomain access)
    if (tenantSignature && tenantTimestamp) {
      const signatureValidation = validateSignedTenant({
        tenantCode,
        signature: tenantSignature,
        timestamp: tenantTimestamp
      })

      if (!signatureValidation.valid) {
        auditData.event = 'login_invalid_signature'
        auditData.signatureError = signatureValidation.error
        await logAudit(auditData)

        return NextResponse.json(
          {
            success: false,
            message: 'Güvenlik doğrulaması başarısız. Lütfen tekrar giriş yapın.'
          },
          { status: 403 }
        )
      }
    }

    // Rate limiting by email
    const emailRateLimit = await checkRateLimit(
      `login:email:${email}`,
      RATE_LIMITS.LOGIN
    )

    if (!emailRateLimit.allowed) {
      auditData.event = 'login_rate_limit_email'
      auditData.resetAt = emailRateLimit.resetAt
      await logAudit(auditData)

      return NextResponse.json(
        {
          success: false,
          message: `Çok fazla başarısız deneme. ${Math.ceil(emailRateLimit.retryAfter! / 60)} dakika sonra tekrar deneyin.`
        },
        {
          status: 429,
          headers: {
            'Retry-After': emailRateLimit.retryAfter?.toString() || '1800'
          }
        }
      )
    }

    // Rate limiting by IP
    const ipRateLimit = await checkRateLimit(
      `login:ip:${auditData.ip}`,
      RATE_LIMITS.LOGIN_IP
    )

    if (!ipRateLimit.allowed) {
      auditData.event = 'login_rate_limit_ip'
      auditData.resetAt = ipRateLimit.resetAt
      await logAudit(auditData)

      return NextResponse.json(
        {
          success: false,
          message: `Çok fazla deneme. ${Math.ceil(ipRateLimit.retryAfter! / 60)} dakika sonra tekrar deneyin.`
        },
        {
          status: 429,
          headers: {
            'Retry-After': ipRateLimit.retryAfter?.toString() || '1800'
          }
        }
      )
    }

    // Call tenant-specific backend API
    const apiUrl = getApiUrl(true)

    const backendResponse = await fetch(`${apiUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant-Code': tenantCode,
        'User-Agent': 'Stocker-NextJS/1.0'
      },
      body: JSON.stringify({ email, password })
    })

    const backendData = await backendResponse.json()

    logger.info('🔍 Backend response:', JSON.stringify(backendData, null, 2));
    logger.info('🍪 Backend Set-Cookie headers:', backendResponse.headers.get('set-cookie'));

    // Validate backend response
    const responseValidation = LoginResponseSchema.safeParse(backendData)

    if (!responseValidation.success) {
      logger.error('❌ Invalid login response:', responseValidation.error);
      logger.error('📋 Backend data:', backendData);
      auditData.event = 'login_invalid_backend_response'
      await logAudit(auditData)

      return NextResponse.json(
        {
          success: false,
          message: 'Sunucu yanıtı geçersiz'
        },
        { status: 500 }
      )
    }

    const loginResult = responseValidation.data
    const loginData = loginResult.data

    // Handle failed login
    if (!loginResult.success) {
      auditData.event = 'login_failed'
      auditData.reason = loginResult.message // Log actual reason for audit
      auditData.duration = Date.now() - startTime
      await logAudit(auditData)

      // Timing attack protection: add constant-time delay to prevent email enumeration
      // Make all failed login attempts take approximately the same time
      const minResponseTime = 300 // milliseconds
      const elapsed = Date.now() - startTime
      const delay = Math.max(0, minResponseTime - elapsed)
      
      if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay))
      }

      // Return standardized error message to prevent information leakage
      // Don't reveal if email exists, password wrong, account locked, etc.
      return NextResponse.json(
        {
          success: false,
          message: 'E-posta veya şifre hatalı. Lütfen tekrar deneyin.'
        },
        { status: 401 } // Use 401 instead of backend status
      )
    }

    // Successful login - reset rate limits
    await resetRateLimit(`login:email:${email}`)

    auditData.event = 'login_success'
    auditData.userId = loginData?.user?.id
    auditData.requires2FA = loginData?.requires2FA
    auditData.duration = Date.now() - startTime
    await logAudit(auditData)

    // Create response with secure cookies
    logger.info('✅ Login successful! Token:', loginData?.accessToken ? 'EXISTS' : 'MISSING');
    logger.info('👤 User:', loginData?.user?.id);

    const response = NextResponse.json(loginResult, {
      status: 200
    })

    // Cookie domain for cross-subdomain access
    const isDevelopment = process.env.NODE_ENV === 'development'
    const cookieDomain = getCookieDomain()

    logger.info('🍪 Cookie domain:', cookieDomain);
    logger.info('🔒 Is development:', isDevelopment);

    // Forward cookies from backend response (access_token, refresh_token)
    const backendCookies = backendResponse.headers.get('set-cookie')
    if (backendCookies) {
      logger.info('🍪 Forwarding backend cookies:', backendCookies);
      // Parse and set each cookie from backend
      const cookies = backendCookies.split(',').map(c => c.trim())
      cookies.forEach(cookie => {
        const [cookiePart] = cookie.split(';')
        const [name, value] = cookiePart.split('=')
        if (name && value && (name === 'access_token' || name === 'refresh_token')) {
          logger.info(`🍪 Setting ${name} cookie from backend`);
          response.cookies.set(name, value, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            domain: cookieDomain,
            maxAge: name === 'access_token' ? 60 * 60 : 60 * 60 * 24 * 7, // 1h for access, 7d for refresh
            path: '/'
          })
        }
      })
    } else {
      logger.warn('⚠️ No Set-Cookie header from backend');
    }

    // Set tenant cookie for SSR
    response.cookies.set('tenant-code', tenantCode, {
      httpOnly: false, // Readable by client
      secure: !isDevelopment,
      sameSite: isDevelopment ? 'lax' : 'none', // 'none' for cross-subdomain in production
      domain: cookieDomain,
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/'
    })

    return response
  } catch (error) {
    logger.error('Login route error:', error);

    auditData.event = 'login_error'
    auditData.error = error instanceof Error ? error.message : 'Unknown error'
    auditData.duration = Date.now() - startTime
    await logAudit(auditData)

    return NextResponse.json(
      {
        success: false,
        message: 'Bir hata oluştu. Lütfen tekrar deneyin.'
      },
      { status: 500 }
    )
  }
}

/**
 * Log audit event
 * TODO: Implement proper audit logging (database, log aggregation service)
 */
async function logAudit(data: Record<string, any>): Promise<void> {
  // For now, just console log in development
  if (process.env.NODE_ENV === 'development') {
    logger.info('[AUDIT]', JSON.stringify(data, null, 2));
  }

  // TODO: Send to audit logging service
  // - Store in database
  // - Send to log aggregation (e.g., Elasticsearch, Datadog)
  // - Alert on suspicious patterns
}
