namespace Stocker.Modules.Sales.Application.Behaviors;

/// <summary>
/// Marker interface for commands that should be idempotent.
/// Commands implementing this interface will be checked for duplicate processing
/// using the RequestId property as the idempotency key.
/// </summary>
/// <remarks>
/// Implement this interface on commands that can cause duplicate processing issues
/// when retried, such as:
/// - CreateSalesOrderCommand
/// - CreateInvoiceCommand
/// - ProcessPaymentCommand
/// - Any command that creates or modifies financial data
/// </remarks>
public interface IIdempotentCommand
{
    /// <summary>
    /// Unique identifier for this request. Used as the idempotency key.
    /// Clients should generate and send this ID to prevent duplicate processing.
    /// </summary>
    /// <remarks>
    /// Best practices:
    /// - Generate a new GUID for each unique request
    /// - Reuse the same GUID when retrying the same request
    /// - Store the GUID on the client side until the request succeeds
    /// </remarks>
    Guid RequestId { get; set; }
}
