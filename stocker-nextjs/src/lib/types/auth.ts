import { z } from 'zod'

// ============================================================================
// Request Schemas
// ============================================================================

export const CheckEmailRequestSchema = z.object({
  email: z.string().email('Geçerli bir e-posta adresi girin'),
})

export const LoginRequestSchema = z.object({
  email: z.string().email('Geçerli bir e-posta adresi girin'),
  password: z.string().min(1, 'Şifre zorunludur'),
  tenantCode: z.string().regex(/^[a-z0-9-]{3,20}$/, 'Geçersiz tenant kodu'),
  tenantSignature: z.string().optional(), // Optional for direct tenant subdomain login
  tenantTimestamp: z.number().int().positive().optional(), // Optional for direct tenant subdomain login
})

// ============================================================================
// Response Schemas
// ============================================================================

// Tenant info from check-email endpoint (no signature yet)
export const TenantInfoSchema = z.object({
  id: z.string().uuid(),
  code: z.string().regex(/^[a-z0-9-]{3,20}$/),
  name: z.string().min(1).max(100),
  domain: z.string().optional(),
  logoUrl: z.string().optional(),
})

// Tenant with security signature (after selection)
export const TenantSchema = z.object({
  id: z.string().uuid(),
  code: z.string().regex(/^[a-z0-9-]{3,20}$/),
  name: z.string().min(1).max(100),
  domain: z.string().optional(),
  logoUrl: z.string().optional(),
  signature: z.string(),
  timestamp: z.number().int().positive(),
  createdAt: z.string().datetime().optional(),
})

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  tenantId: z.string().uuid(),
})

export const CheckEmailResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    exists: z.boolean(),
    tenants: z.array(TenantInfoSchema).optional(),
  }).optional(),
  message: z.string().optional(),
})

export const LoginResponseSchema = z.object({
  success: z.boolean(),
  token: z.string().optional(),
  user: UserSchema.optional(),
  requires2FA: z.boolean().optional(),
  message: z.string().optional(),
})

export const ApiErrorResponseSchema = z.object({
  success: z.literal(false),
  message: z.string(),
  code: z.string().optional(),
  details: z.record(z.any()).optional(),
})

// ============================================================================
// Type Exports
// ============================================================================

export type CheckEmailRequest = z.infer<typeof CheckEmailRequestSchema>
export type LoginRequest = z.infer<typeof LoginRequestSchema>
export type TenantInfo = z.infer<typeof TenantInfoSchema>
export type Tenant = z.infer<typeof TenantSchema>
export type User = z.infer<typeof UserSchema>
export type CheckEmailResponse = z.infer<typeof CheckEmailResponseSchema>
export type LoginResponse = z.infer<typeof LoginResponseSchema>
export type ApiErrorResponse = z.infer<typeof ApiErrorResponseSchema>

// ============================================================================
// Login Step Type
// ============================================================================

export type LoginStep = 'email' | 'password' | '2fa'

// ============================================================================
// Validation Helpers
// ============================================================================

export function validateEmail(email: string): { valid: boolean; error?: string } {
  try {
    CheckEmailRequestSchema.parse({ email })
    return { valid: true }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { valid: false, error: error.errors[0].message }
    }
    return { valid: false, error: 'Geçersiz e-posta' }
  }
}

export function validateTenantCode(code: string): { valid: boolean; error?: string } {
  const pattern = /^[a-z0-9-]{3,20}$/
  if (!pattern.test(code)) {
    return { valid: false, error: 'Tenant kodu 3-20 karakter arası, sadece küçük harf, rakam ve tire içerebilir' }
  }
  return { valid: true }
}
