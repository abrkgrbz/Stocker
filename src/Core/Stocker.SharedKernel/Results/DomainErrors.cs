namespace Stocker.SharedKernel.Results;

public static class DomainErrors
{
    public static class General
    {
        public static Error UnProcessableRequest => Error.Failure(
            "General.UnProcessableRequest",
            "The server could not process the request.");

        public static Error ServerError => Error.Failure(
            "General.ServerError",
            "The server encountered an unrecoverable error.");
    }

    public static class Authentication
    {
        public static Error InvalidCredentials => Error.Unauthorized(
            "Authentication.InvalidCredentials",
            "The provided credentials are invalid.");

        public static Error NotAuthenticated => Error.Unauthorized(
            "Authentication.NotAuthenticated",
            "User is not authenticated.");

        public static Error NotAuthorized => Error.Forbidden(
            "Authentication.NotAuthorized",
            "User is not authorized to perform this action.");
    }

    public static class Tenant
    {
        public static Error NotFound(Guid tenantId) => Error.NotFound(
            "Tenant.NotFound",
            $"Tenant with ID '{tenantId}' was not found.");

        public static Error NotFoundByCode(string code) => Error.NotFound(
            "Tenant.NotFoundByCode",
            $"Tenant with code '{code}' was not found.");

        public static Error AlreadyExists(string code) => Error.Conflict(
            "Tenant.AlreadyExists",
            $"Tenant with code '{code}' already exists.");

        public static Error Inactive(Guid tenantId) => Error.Validation(
            "Tenant.Inactive",
            $"Tenant with ID '{tenantId}' is not active.");

        public static Error InvalidDomain(string domain) => Error.Validation(
            "Tenant.InvalidDomain",
            $"Domain '{domain}' is not valid.");
    }

    public static class Package
    {
        public static Error NotFound(Guid packageId) => Error.NotFound(
            "Package.NotFound",
            $"Package with ID '{packageId}' was not found.");

        public static Error Inactive(Guid packageId) => Error.Validation(
            "Package.Inactive",
            $"Package with ID '{packageId}' is not active.");
    }

    public static class User
    {
        public static Error NotFound(Guid userId) => Error.NotFound(
            "User.NotFound",
            $"User with ID '{userId}' was not found.");

        public static Error EmailAlreadyExists(string email) => Error.Conflict(
            "User.EmailAlreadyExists",
            $"User with email '{email}' already exists.");

        public static Error InvalidEmail(string email) => Error.Validation(
            "User.InvalidEmail",
            $"Email '{email}' is not valid.");

        public static Error WeakPassword => Error.Validation(
            "User.WeakPassword",
            "Password does not meet the minimum requirements.");
    }

    public static class Subscription
    {
        public static Error NotFound(Guid subscriptionId) => Error.NotFound(
            "Subscription.NotFound",
            $"Subscription with ID '{subscriptionId}' was not found.");

        public static Error AlreadyActive => Error.Conflict(
            "Subscription.AlreadyActive",
            "Subscription is already active.");

        public static Error Expired => Error.Validation(
            "Subscription.Expired",
            "Subscription has expired.");

        public static Error TrialNotAvailable => Error.Validation(
            "Subscription.TrialNotAvailable",
            "Trial period is not available for this subscription.");
    }
}