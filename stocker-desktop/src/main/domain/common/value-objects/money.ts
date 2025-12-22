/**
 * Money Value Object
 *
 * Ported from C# Stocker.Domain.Common.ValueObjects.Money
 * Represents monetary values with currency
 */

export class Money {
  private constructor(
    public readonly amount: number,
    public readonly currency: string
  ) {
    // Ensure immutability
    Object.freeze(this);
  }

  // ============================================
  // Factory Methods
  // ============================================

  /**
   * Create a Money instance
   * @throws Error if amount is negative or currency is invalid
   */
  static create(amount: number, currency: string): Money {
    if (amount < 0) {
      throw new Error('Amount cannot be negative');
    }

    if (!currency || currency.trim().length === 0) {
      throw new Error('Currency cannot be empty');
    }

    if (currency.length !== 3) {
      throw new Error('Currency must be a 3-letter ISO code');
    }

    return new Money(
      Math.round(amount * 100) / 100, // Round to 2 decimal places
      currency.toUpperCase()
    );
  }

  /**
   * Create a Money instance, returning null on error (for optional fields)
   */
  static tryCreate(amount: number | null | undefined, currency: string | null | undefined): Money | null {
    if (amount === null || amount === undefined || !currency) {
      return null;
    }

    try {
      return Money.create(amount, currency);
    } catch {
      return null;
    }
  }

  /**
   * Create zero money
   */
  static zero(currency: string): Money {
    return Money.create(0, currency);
  }

  /**
   * Create from database values (Prisma)
   */
  static fromDb(amount: number, currency: string): Money {
    return new Money(
      Number(amount), // Prisma Decimal comes as Decimal type
      currency
    );
  }

  // ============================================
  // Arithmetic Operations
  // ============================================

  /**
   * Add two money values (must have same currency)
   */
  add(other: Money): Money {
    this.ensureSameCurrency(other);
    return Money.create(this.amount + other.amount, this.currency);
  }

  /**
   * Subtract money value (must have same currency)
   */
  subtract(other: Money): Money {
    this.ensureSameCurrency(other);
    return Money.create(this.amount - other.amount, this.currency);
  }

  /**
   * Multiply by a factor
   */
  multiply(factor: number): Money {
    return Money.create(this.amount * factor, this.currency);
  }

  /**
   * Divide by a divisor
   */
  divide(divisor: number): Money {
    if (divisor === 0) {
      throw new Error('Cannot divide by zero');
    }
    return Money.create(this.amount / divisor, this.currency);
  }

  /**
   * Calculate percentage
   */
  percentage(percent: number): Money {
    return Money.create((this.amount * percent) / 100, this.currency);
  }

  // ============================================
  // Comparison
  // ============================================

  /**
   * Check if amount is zero
   */
  isZero(): boolean {
    return this.amount === 0;
  }

  /**
   * Check if positive
   */
  isPositive(): boolean {
    return this.amount > 0;
  }

  /**
   * Check equality
   */
  equals(other: Money): boolean {
    return this.amount === other.amount && this.currency === other.currency;
  }

  /**
   * Compare to another money value
   */
  compareTo(other: Money): number {
    this.ensureSameCurrency(other);
    return this.amount - other.amount;
  }

  /**
   * Check if greater than
   */
  greaterThan(other: Money): boolean {
    return this.compareTo(other) > 0;
  }

  /**
   * Check if less than
   */
  lessThan(other: Money): boolean {
    return this.compareTo(other) < 0;
  }

  // ============================================
  // Formatting
  // ============================================

  /**
   * Format as string: "1,234.56 TRY"
   */
  toString(): string {
    return `${this.amount.toFixed(2)} ${this.currency}`;
  }

  /**
   * Format with locale
   */
  format(locale: string = 'tr-TR'): string {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: this.currency,
    }).format(this.amount);
  }

  /**
   * Convert to plain object for serialization
   */
  toJSON(): { amount: number; currency: string } {
    return {
      amount: this.amount,
      currency: this.currency,
    };
  }

  /**
   * Convert to database format (Prisma)
   */
  toDb(): { amount: number; currency: string } {
    return {
      amount: this.amount,
      currency: this.currency,
    };
  }

  // ============================================
  // Private Helpers
  // ============================================

  private ensureSameCurrency(other: Money): void {
    if (this.currency !== other.currency) {
      throw new Error(
        `Cannot operate on money with different currencies: ${this.currency} and ${other.currency}`
      );
    }
  }
}

// ============================================
// Currency Constants
// ============================================

export const Currencies = {
  TRY: 'TRY',
  USD: 'USD',
  EUR: 'EUR',
  GBP: 'GBP',
} as const;

export type CurrencyCode = (typeof Currencies)[keyof typeof Currencies];

// ============================================
// Helper Types for Prisma
// ============================================

/**
 * Type for Money fields split into two columns in Prisma
 */
export interface MoneyFields {
  amount: number;
  currency: string;
}

/**
 * Type for optional Money fields
 */
export interface OptionalMoneyFields {
  amount: number | null;
  currency: string | null;
}
