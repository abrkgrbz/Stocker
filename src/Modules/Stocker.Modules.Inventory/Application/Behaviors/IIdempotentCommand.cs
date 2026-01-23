namespace Stocker.Modules.Inventory.Application.Behaviors;

/// <summary>
/// Marker interface for commands that should be idempotent.
/// Commands implementing this interface will be checked for duplicate processing
/// using the RequestId property as the idempotency key.
/// </summary>
public interface IIdempotentCommand
{
    /// <summary>
    /// Unique identifier for this request. Used as the idempotency key.
    /// Clients should generate and send this ID to prevent duplicate processing.
    /// </summary>
    Guid RequestId { get; set; }
}
