/**
 * Cryptographic Utilities
 *
 * Provides encryption, key derivation, and signing functions
 * for the security module.
 */

import {
  createCipheriv,
  createDecipheriv,
  createHmac,
  createHash,
  randomBytes,
  pbkdf2Sync,
  sign,
  verify,
  createPrivateKey,
  createPublicKey,
  KeyObject,
} from 'crypto';

// ============================================
// Constants
// ============================================

// AES-256-GCM for symmetric encryption
const SYMMETRIC_ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const SALT_LENGTH = 32;

// PBKDF2 settings (high iteration count for security)
const PBKDF2_ITERATIONS = 100000;
const PBKDF2_KEY_LENGTH = 32;
const PBKDF2_DIGEST = 'sha512';

// Ed25519 for license signing
const SIGNING_ALGORITHM = 'ed25519';

// ============================================
// Key Derivation
// ============================================

/**
 * Derive a cryptographic key from password and salt using PBKDF2
 */
export function deriveKey(
  password: string | Buffer,
  salt: string | Buffer,
  iterations: number = PBKDF2_ITERATIONS,
  keyLength: number = PBKDF2_KEY_LENGTH
): Buffer {
  const passwordBuffer = typeof password === 'string' ? Buffer.from(password) : password;
  const saltBuffer = typeof salt === 'string' ? Buffer.from(salt) : salt;

  return pbkdf2Sync(passwordBuffer, saltBuffer, iterations, keyLength, PBKDF2_DIGEST);
}

/**
 * Derive database encryption key from license and machine ID
 *
 * This ensures:
 * - DB can only be opened with valid license
 * - DB cannot be moved to another machine
 */
export function deriveDatabaseKey(
  licenseSignature: string,
  machineId: string,
  customerId: string
): Buffer {
  // Create a unique salt from app-specific data + customer ID
  const salt = createHash('sha256')
    .update(`stocker-db-v1|${customerId}`)
    .digest();

  // Combine license signature and machine ID
  const password = createHmac('sha256', machineId)
    .update(licenseSignature)
    .digest();

  return deriveKey(password, salt, PBKDF2_ITERATIONS, 32);
}

// ============================================
// Symmetric Encryption (AES-256-GCM)
// ============================================

/**
 * Encrypt data with AES-256-GCM
 * Returns: salt (32) + iv (16) + authTag (16) + ciphertext
 */
export function encrypt(data: string | Buffer, password: string): Buffer {
  const dataBuffer = typeof data === 'string' ? Buffer.from(data) : data;

  // Generate random salt and IV
  const salt = randomBytes(SALT_LENGTH);
  const iv = randomBytes(IV_LENGTH);

  // Derive key from password
  const key = deriveKey(password, salt);

  // Encrypt
  const cipher = createCipheriv(SYMMETRIC_ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(dataBuffer), cipher.final()]);
  const authTag = cipher.getAuthTag();

  // Combine: salt + iv + authTag + ciphertext
  return Buffer.concat([salt, iv, authTag, encrypted]);
}

/**
 * Decrypt data encrypted with encrypt()
 */
export function decrypt(encryptedData: Buffer, password: string): Buffer {
  // Extract components
  const salt = encryptedData.subarray(0, SALT_LENGTH);
  const iv = encryptedData.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
  const authTag = encryptedData.subarray(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + AUTH_TAG_LENGTH);
  const ciphertext = encryptedData.subarray(SALT_LENGTH + IV_LENGTH + AUTH_TAG_LENGTH);

  // Derive key from password
  const key = deriveKey(password, salt);

  // Decrypt
  const decipher = createDecipheriv(SYMMETRIC_ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
}

// ============================================
// Digital Signatures (Ed25519)
// ============================================

/**
 * Sign data with Ed25519 private key
 * (Used by license server only)
 */
export function signData(data: string | Buffer, privateKeyPem: string): Buffer {
  const dataBuffer = typeof data === 'string' ? Buffer.from(data) : data;

  const privateKey = createPrivateKey({
    key: privateKeyPem,
    format: 'pem',
  });

  return sign(null, dataBuffer, privateKey);
}

/**
 * Verify Ed25519 signature
 * (Used by client to verify license)
 */
export function verifySignature(
  data: string | Buffer,
  signature: Buffer,
  publicKeyPem: string
): boolean {
  const dataBuffer = typeof data === 'string' ? Buffer.from(data) : data;

  try {
    const publicKey = createPublicKey({
      key: publicKeyPem,
      format: 'pem',
    });

    return verify(null, dataBuffer, publicKey, signature);
  } catch {
    return false;
  }
}

// ============================================
// Hashing
// ============================================

/**
 * Create SHA-256 hash
 */
export function sha256(data: string | Buffer): string {
  return createHash('sha256').update(data).digest('hex');
}

/**
 * Create SHA-512 hash
 */
export function sha512(data: string | Buffer): string {
  return createHash('sha512').update(data).digest('hex');
}

/**
 * Create HMAC-SHA256
 */
export function hmacSha256(data: string | Buffer, key: string | Buffer): string {
  return createHmac('sha256', key).update(data).digest('hex');
}

// ============================================
// Random Generation
// ============================================

/**
 * Generate random bytes
 */
export function generateRandomBytes(length: number): Buffer {
  return randomBytes(length);
}

/**
 * Generate random hex string
 */
export function generateRandomHex(length: number): string {
  return randomBytes(Math.ceil(length / 2))
    .toString('hex')
    .substring(0, length);
}

/**
 * Generate a secure random ID
 * @param byteLength Number of random bytes (default 16, resulting in 32 hex chars)
 */
export function generateSecureId(byteLength: number = 16): string {
  return randomBytes(byteLength).toString('hex');
}

// ============================================
// Key Pair Generation (for setup only)
// ============================================

/**
 * Generate Ed25519 key pair for license signing
 *
 * IMPORTANT: Run this ONCE on your server to generate keys.
 * Store the private key securely. Embed the public key in the app.
 */
export function generateKeyPair(): { privateKey: string; publicKey: string } {
  const { generateKeyPairSync } = require('crypto');

  const { privateKey, publicKey } = generateKeyPairSync('ed25519', {
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    publicKeyEncoding: { type: 'spki', format: 'pem' },
  });

  return { privateKey, publicKey };
}

// ============================================
// Constant-Time Comparison
// ============================================

/**
 * Compare two strings in constant time to prevent timing attacks
 */
export function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);

  let result = 0;
  for (let i = 0; i < bufA.length; i++) {
    result |= bufA[i] ^ bufB[i];
  }

  return result === 0;
}
