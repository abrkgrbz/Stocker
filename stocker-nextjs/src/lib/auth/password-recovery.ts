'use client';

import crypto from 'crypto';

/**
 * Password Recovery Token Data
 */
export interface RecoveryTokenData {
  token: string;
  expiresAt: Date;
  userId: string;
}

/**
 * Password Strength Result
 */
export interface PasswordStrength {
  score: number; // 0-4 (very weak to very strong)
  feedback: string[];
  strength: 'very-weak' | 'weak' | 'medium' | 'strong' | 'very-strong';
  color: string;
}

/**
 * Generate a secure password recovery token
 * @param userId - User ID for token association
 * @param expiryHours - Token validity in hours (default: 1 hour)
 * @returns Recovery token data
 */
export function generateRecoveryToken(
  userId: string,
  expiryHours: number = 1
): RecoveryTokenData {
  // Generate cryptographically secure random token
  const tokenBytes = crypto.randomBytes(32);
  const token = tokenBytes.toString('base64url'); // URL-safe base64

  // Calculate expiry time
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + expiryHours);

  return {
    token,
    expiresAt,
    userId,
  };
}

/**
 * Verify if a recovery token is valid and not expired
 * @param tokenExpiresAt - Token expiry timestamp
 * @returns True if token is still valid
 */
export function isTokenValid(tokenExpiresAt: Date | string): boolean {
  const expiryDate = typeof tokenExpiresAt === 'string'
    ? new Date(tokenExpiresAt)
    : tokenExpiresAt;

  return expiryDate > new Date();
}

/**
 * Calculate password strength with detailed feedback
 * @param password - Password to evaluate
 * @returns Password strength analysis
 */
export function calculatePasswordStrength(password: string): PasswordStrength {
  const feedback: string[] = [];
  let score = 0;

  // Length check
  if (password.length < 8) {
    feedback.push('En az 8 karakter olmalı');
  } else if (password.length >= 8) {
    score++;
  }

  if (password.length >= 12) {
    score++;
  }

  // Complexity checks
  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  if (!hasLowercase) {
    feedback.push('Küçük harf ekleyin');
  }

  if (!hasUppercase) {
    feedback.push('Büyük harf ekleyin');
  } else if (hasLowercase && hasUppercase) {
    score++;
  }

  if (!hasNumber) {
    feedback.push('Sayı ekleyin');
  } else {
    score++;
  }

  if (!hasSpecial) {
    feedback.push('Özel karakter ekleyin (!@#$%^&*)');
  } else {
    score++;
  }

  // Common patterns check
  const commonPatterns = [
    /12345/,
    /qwerty/i,
    /password/i,
    /admin/i,
    /letmein/i,
    /welcome/i,
  ];

  if (commonPatterns.some(pattern => pattern.test(password))) {
    feedback.push('Yaygın kullanılan şifre desenlerinden kaçının');
    score = Math.max(0, score - 2);
  }

  // Determine strength level
  let strength: PasswordStrength['strength'];
  let color: string;

  if (score === 0) {
    strength = 'very-weak';
    color = '#ff4d4f'; // red
  } else if (score === 1) {
    strength = 'weak';
    color = '#ff7a45'; // orange
  } else if (score === 2) {
    strength = 'medium';
    color = '#faad14'; // yellow
  } else if (score === 3) {
    strength = 'strong';
    color = '#73d13d'; // light green
  } else {
    strength = 'very-strong';
    color = '#52c41a'; // green
  }

  // Add positive feedback for strong passwords
  if (score >= 4) {
    feedback.unshift('Güçlü şifre! ✓');
  } else if (score === 3) {
    feedback.unshift('İyi şifre, daha da güçlendirebilirsiniz');
  }

  return {
    score,
    feedback,
    strength,
    color,
  };
}

/**
 * Generate a temporary password suggestion
 * @returns Secure random password
 */
export function generateSecurePassword(): string {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const special = '!@#$%^&*';

  const allChars = lowercase + uppercase + numbers + special;

  // Ensure at least one of each type
  let password = '';
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];

  // Fill remaining characters
  for (let i = password.length; i < 16; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // Shuffle the password
  return password
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('');
}

/**
 * Hash a password using SHA-256 (for client-side validation only)
 * Note: Server should use bcrypt/argon2 for actual password storage
 * @param password - Password to hash
 * @returns Hashed password
 */
export function hashPasswordClient(password: string): string {
  return crypto
    .createHash('sha256')
    .update(password)
    .digest('hex');
}

/**
 * Validate password reset request data
 * @param email - Email address
 * @returns Validation result
 */
export function validatePasswordResetRequest(email: string): {
  valid: boolean;
  error?: string;
} {
  if (!email || email.trim().length === 0) {
    return { valid: false, error: 'E-posta adresi gerekli' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Geçerli bir e-posta adresi girin' };
  }

  return { valid: true };
}

/**
 * Validate password reset data
 * @param password - New password
 * @param confirmPassword - Password confirmation
 * @returns Validation result
 */
export function validatePasswordReset(
  password: string,
  confirmPassword: string
): {
  valid: boolean;
  error?: string;
} {
  if (!password || password.trim().length === 0) {
    return { valid: false, error: 'Şifre gerekli' };
  }

  if (password.length < 8) {
    return { valid: false, error: 'Şifre en az 8 karakter olmalı' };
  }

  if (password !== confirmPassword) {
    return { valid: false, error: 'Şifreler eşleşmiyor' };
  }

  const strength = calculatePasswordStrength(password);
  if (strength.score < 2) {
    return { valid: false, error: 'Şifre çok zayıf. Daha güçlü bir şifre seçin' };
  }

  return { valid: true };
}
