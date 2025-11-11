namespace Stocker.Shared.Events.CRM;

/// <summary>
/// Published when a deal is lost in the CRM module
/// </summary>
public record DealLostEvent(
    Guid DealId,
    Guid CustomerId,
    Guid TenantId,
    decimal Amount,
    string Currency,
    string LostReason,
    string? CompetitorName,
    DateTime ClosedDate,
    Guid LostBy
) : IntegrationEvent;
