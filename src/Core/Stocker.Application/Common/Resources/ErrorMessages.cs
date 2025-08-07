namespace Stocker.Application.Common.Resources;

/// <summary>
/// Centralized error messages for localization
/// </summary>
public static class ErrorMessages
{
    // General Errors
    public const string UnexpectedError = "An unexpected error occurred. Please try again later.";
    public const string ValidationError = "One or more validation errors occurred.";
    public const string UnauthorizedAccess = "You are not authorized to access this resource.";
    public const string ForbiddenAccess = "Access to this resource is forbidden.";
    public const string ResourceNotFound = "The requested resource was not found.";
    public const string ConflictError = "The operation conflicts with the current state.";

    // Authentication Errors
    public const string InvalidCredentials = "Invalid email or password.";
    public const string AccountLocked = "Your account has been locked. Please contact support.";
    public const string AccountNotActive = "Your account is not active.";
    public const string EmailNotVerified = "Please verify your email before logging in.";
    public const string InvalidRefreshToken = "Invalid or expired refresh token.";
    public const string TokenExpired = "Your session has expired. Please login again.";

    // Tenant Errors
    public const string TenantNotFound = "Tenant not found.";
    public const string TenantAlreadyExists = "A tenant with this code already exists.";
    public const string TenantNotActive = "The tenant is not active.";
    public const string TenantQuotaExceeded = "Tenant quota has been exceeded.";

    // User Errors
    public const string UserNotFound = "User not found.";
    public const string UserAlreadyExists = "A user with this email already exists.";
    public const string InvalidPassword = "Password does not meet security requirements.";
    public const string PasswordResetTokenInvalid = "Invalid or expired password reset token.";

    // Package Errors
    public const string PackageNotFound = "Package not found.";
    public const string PackageNotActive = "The selected package is not active.";
    public const string PackageDowngradeNotAllowed = "Downgrading to this package is not allowed.";

    // Subscription Errors
    public const string SubscriptionNotFound = "Subscription not found.";
    public const string SubscriptionExpired = "Your subscription has expired.";
    public const string PaymentRequired = "Payment is required to continue.";
    public const string TrialExpired = "Your trial period has expired.";

    // Business Rule Errors
    public const string InvalidOperation = "This operation is not valid in the current context.";
    public const string DuplicateEntry = "An entry with the same key already exists.";
    public const string InvalidDateRange = "The date range is invalid.";
    public const string MaximumLimitReached = "The maximum limit has been reached.";

    // Infrastructure Errors
    public const string DatabaseConnectionError = "Unable to connect to the database.";
    public const string ExternalServiceError = "An external service is currently unavailable.";
    public const string FileUploadError = "File upload failed.";
    public const string EmailSendError = "Failed to send email.";
}