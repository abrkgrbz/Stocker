using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Sales.Domain;

/// <summary>
/// Centralized error definitions for the Sales module.
/// Provides type-safe, consistent error codes and messages.
/// </summary>
public static class SalesErrors
{
    public static class Order
    {
        public static Error NotFound(Guid orderId) => Error.NotFound(
            "SalesOrder.NotFound",
            $"Sales order with ID '{orderId}' was not found.");

        public static Error NotFound() => Error.NotFound(
            "SalesOrder.NotFound",
            "Sales order was not found.");

        public static Error NotFoundByNumber(string orderNumber) => Error.NotFound(
            "SalesOrder.NotFound",
            $"Sales order with number '{orderNumber}' was not found.");

        public static Error OnlyDraftCanBeUpdated => Error.Conflict(
            "SalesOrder.OnlyDraftCanBeUpdated",
            "Only draft orders can be updated.");

        public static Error OnlyDraftOrCancelledCanBeDeleted => Error.Conflict(
            "SalesOrder.OnlyDraftOrCancelledCanBeDeleted",
            "Only draft or cancelled orders can be deleted.");

        public static Error ConcurrencyConflict => Error.Conflict(
            "SalesOrder.ConcurrencyConflict",
            "This order has been modified by another user. Please refresh and try again.");

        public static Error CreationFailed(string reason) => Error.Failure(
            "SalesOrder.CreationFailed",
            $"Failed to create sales order: {reason}");

        public static Error InsufficientStock(string productCode, decimal required, decimal available) => Error.Validation(
            "SalesOrder.InsufficientStock",
            $"Insufficient stock for {productCode}. Required: {required}, Available: {available}");
    }

    public static class Contract
    {
        public static Error NotFound(Guid contractId) => Error.NotFound(
            "Contract.NotFound",
            $"Customer contract with ID '{contractId}' was not found.");

        public static Error NotFound() => Error.NotFound(
            "Contract.NotFound",
            "Specified customer contract was not found.");
    }

    public static class Territory
    {
        public static Error AccessDenied(Guid salesPersonId, Guid territoryId) => Error.Forbidden(
            "Territory.AccessDenied",
            $"Sales person '{salesPersonId}' does not have access to territory '{territoryId}'.");
    }

    public static class Price
    {
        public static Error ValidationFailed(string productCode, string reason) => Error.Validation(
            "Price.ValidationFailed",
            $"Price validation failed for product {productCode}: {reason}");
    }

    public static class Infrastructure
    {
        public static Error DatabaseError(string operation) => Error.Failure(
            "Sales.DatabaseError",
            $"A database error occurred during {operation}. Please try again.");

        public static Error ExternalServiceError(string service) => Error.Failure(
            "Sales.ExternalServiceError",
            $"External service '{service}' is temporarily unavailable. Please try again later.");
    }
}
