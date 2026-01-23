namespace Stocker.Modules.Inventory.Domain.Entities;

/// <summary>
/// Stores processed request IDs for idempotency checking.
/// Prevents duplicate command processing when the same RequestId is sent multiple times.
/// </summary>
public class ProcessedRequest
{
    public Guid Id { get; private set; }
    public string CommandName { get; private set; } = string.Empty;
    public DateTime ProcessedAt { get; private set; }

    private ProcessedRequest() { } // EF Core

    public ProcessedRequest(Guid requestId, string commandName)
    {
        Id = requestId;
        CommandName = commandName;
        ProcessedAt = DateTime.UtcNow;
    }
}
