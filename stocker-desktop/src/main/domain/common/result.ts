/**
 * Result Pattern - TypeScript implementation
 *
 * Ported from C# Stocker.SharedKernel.Results.Result
 * Provides type-safe error handling without exceptions
 */

// ============================================
// Error Types
// ============================================

export type ErrorType = 'Validation' | 'NotFound' | 'Conflict' | 'Internal' | 'Unauthorized';

export class AppError {
  constructor(
    public readonly code: string,
    public readonly message: string,
    public readonly type: ErrorType = 'Validation'
  ) {}

  static none(): AppError {
    return new AppError('', '', 'Validation');
  }

  static validation(code: string, message: string): AppError {
    return new AppError(code, message, 'Validation');
  }

  static notFound(code: string, message: string): AppError {
    return new AppError(code, message, 'NotFound');
  }

  static conflict(code: string, message: string): AppError {
    return new AppError(code, message, 'Conflict');
  }

  static internal(code: string, message: string): AppError {
    return new AppError(code, message, 'Internal');
  }

  static unauthorized(code: string, message: string): AppError {
    return new AppError(code, message, 'Unauthorized');
  }

  toJSON(): Record<string, unknown> {
    return {
      code: this.code,
      message: this.message,
      type: this.type,
    };
  }
}

// ============================================
// Result Class
// ============================================

export class Result<T = void> {
  protected constructor(
    private readonly _isSuccess: boolean,
    private readonly _error: AppError | null,
    private readonly _errors: AppError[] | null,
    private readonly _value: T | undefined
  ) {}

  get isSuccess(): boolean {
    return this._isSuccess;
  }

  get isFailure(): boolean {
    return !this._isSuccess;
  }

  get error(): AppError {
    if (this._isSuccess) {
      throw new Error('Cannot access error of a successful result');
    }
    return this._error || AppError.none();
  }

  get errors(): AppError[] {
    if (this._isSuccess) {
      throw new Error('Cannot access errors of a successful result');
    }
    return this._errors || [this._error!];
  }

  get value(): T {
    if (!this._isSuccess) {
      throw new Error(`Cannot access value of a failed result: ${this._error?.message}`);
    }
    return this._value as T;
  }

  // ============================================
  // Factory Methods
  // ============================================

  static success(): Result<void>;
  static success<T>(value: T): Result<T>;
  static success<T>(value?: T): Result<T> {
    return new Result<T>(true, null, null, value);
  }

  static failure<T = never>(error: AppError): Result<T> {
    return new Result<T>(false, error, null, undefined);
  }

  static failures<T = never>(errors: AppError[]): Result<T> {
    return new Result<T>(false, errors[0] || AppError.none(), errors, undefined);
  }

  // ============================================
  // Transformation Methods
  // ============================================

  /**
   * Transform the value if successful
   */
  map<U>(fn: (value: T) => U): Result<U> {
    if (this.isFailure) {
      return Result.failure<U>(this._error!);
    }
    return Result.success(fn(this._value as T));
  }

  /**
   * Chain another Result-returning operation
   */
  flatMap<U>(fn: (value: T) => Result<U>): Result<U> {
    if (this.isFailure) {
      return Result.failure<U>(this._error!);
    }
    return fn(this._value as T);
  }

  /**
   * Execute a side effect if successful
   */
  tap(fn: (value: T) => void): Result<T> {
    if (this.isSuccess) {
      fn(this._value as T);
    }
    return this;
  }

  /**
   * Execute a side effect if failed
   */
  tapError(fn: (error: AppError) => void): Result<T> {
    if (this.isFailure) {
      fn(this._error!);
    }
    return this;
  }

  /**
   * Get value or default
   */
  getOrDefault(defaultValue: T): T {
    return this.isSuccess ? (this._value as T) : defaultValue;
  }

  /**
   * Get value or throw
   */
  getOrThrow(): T {
    if (this.isFailure) {
      throw new Error(this._error?.message || 'Result is failure');
    }
    return this._value as T;
  }

  /**
   * Match pattern for handling success/failure
   */
  match<U>(onSuccess: (value: T) => U, onFailure: (error: AppError) => U): U {
    return this.isSuccess ? onSuccess(this._value as T) : onFailure(this._error!);
  }

  // ============================================
  // Serialization
  // ============================================

  /**
   * Convert to IPC-safe format
   */
  toIpcResult(): IpcResult<T> {
    if (this.isSuccess) {
      return {
        isSuccess: true,
        value: this._value,
      };
    }
    return {
      isSuccess: false,
      error: this._error?.toJSON() as IpcResult<T>['error'],
      errors: this._errors?.map((e) => e.toJSON()) as IpcResult<T>['errors'],
    };
  }
}

// ============================================
// IPC Result Type (for serialization)
// ============================================

export interface IpcResult<T = void> {
  isSuccess: boolean;
  value?: T;
  error?: {
    code: string;
    message: string;
    type: ErrorType;
  };
  errors?: Array<{
    code: string;
    message: string;
    type: ErrorType;
  }>;
}

// ============================================
// Validation Result
// ============================================

/**
 * Validation-specific result with multiple errors support
 */
export function createValidationResult(errors: AppError[]): Result<void> {
  if (errors.length === 0) {
    return Result.success();
  }
  return Result.failures(errors);
}

export const ValidationResult = {
  valid: (): Result<void> => Result.success(),
  invalid: (errors: AppError[]): Result<void> => Result.failures(errors),
  fromErrors: (errors: AppError[]): Result<void> => createValidationResult(errors),
};

// ============================================
// Helper Functions
// ============================================

/**
 * Combine multiple results into one
 */
export function combineResults<T extends readonly Result<unknown>[]>(
  ...results: T
): Result<unknown[]> {
  const errors: AppError[] = [];
  const values: unknown[] = [];

  for (const result of results) {
    if (result.isFailure) {
      errors.push(...result.errors);
    } else {
      values.push(result.value);
    }
  }

  if (errors.length > 0) {
    return Result.failures<unknown[]>(errors);
  }

  return Result.success(values);
}

/**
 * Execute async operation and wrap in Result
 */
export async function tryCatch<T>(fn: () => Promise<T>): Promise<Result<T>> {
  try {
    const value = await fn();
    return Result.success(value);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return Result.failure<T>(AppError.internal('Exception', message));
  }
}
