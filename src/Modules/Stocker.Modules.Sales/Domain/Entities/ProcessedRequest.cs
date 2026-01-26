namespace Stocker.Modules.Sales.Domain.Entities;

/// <summary>
/// Stores processed request IDs for idempotency checking.
/// Prevents duplicate command processing when the same RequestId is sent multiple times.
/// </summary>
/// <remarks>
/// This entity is used by the IdempotencyBehavior to track which requests
/// have already been processed. When a command with IIdempotentCommand is executed,
/// its RequestId is stored here after successful processing.
///
/// Note: This entity does NOT implement ITenantEntity because idempotency keys
/// are unique per request, not per tenant. The same RequestId should be rejected
/// regardless of tenant context.
/// </remarks>
public class ProcessedRequest
{
    /// <summary>
    /// The unique request ID that was processed (idempotency key).
    /// </summary>
    public Guid Id { get; private set; }

    /// <summary>
    /// The name of the command that was processed.
    /// Used for logging and debugging purposes.
    /// </summary>
    public string CommandName { get; private set; } = string.Empty;

    /// <summary>
    /// The UTC timestamp when this request was processed.
    /// </summary>
    public DateTime ProcessedAt { get; private set; }

    /// <summary>
    /// The tenant ID that processed this request.
    /// Stored for audit purposes but not used in uniqueness checks.
    /// </summary>
    public Guid TenantId { get; private set; }

    /// <summary>
    /// EF Core constructor.
    /// </summary>
    private ProcessedRequest() { }

    /// <summary>
    /// Creates a new processed request record.
    /// </summary>
    /// <param name="requestId">The unique request ID.</param>
    /// <param name="commandName">The name of the processed command.</param>
    /// <param name="tenantId">The tenant ID (optional, defaults to empty).</param>
    public ProcessedRequest(Guid requestId, string commandName, Guid tenantId = default)
    {
        Id = requestId;
        CommandName = commandName;
        ProcessedAt = DateTime.UtcNow;
        TenantId = tenantId;
    }
}
