/**
 * Client-safe exponential backoff calculator
 * No Redis dependency - safe for client-side use
 */

/**
 * Calculate exponential backoff delay
 * @param attemptNumber - 0-based attempt number (0 = first retry)
 * @returns delay in milliseconds
 */
export function calculateBackoff(attemptNumber: number): number {
  // Base delay: 1 second
  // Max delay: 5 minutes
  const baseDelay = 1000
  const maxDelay = 5 * 60 * 1000

  // Exponential: 2^attempt * baseDelay
  // 0 -> 1s, 1 -> 2s, 2 -> 4s, 3 -> 8s, 4 -> 16s, etc.
  const delay = Math.min(baseDelay * Math.pow(2, attemptNumber), maxDelay)

  // Add jitter (±20%) to prevent thundering herd
  const jitter = delay * 0.2 * (Math.random() * 2 - 1)

  return Math.floor(delay + jitter)
}
