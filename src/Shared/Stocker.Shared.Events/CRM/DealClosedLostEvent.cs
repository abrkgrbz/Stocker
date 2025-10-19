namespace Stocker.Shared.Events.CRM;

/// <summary>
/// Published when a deal is closed as lost in the CRM module
/// </summary>
public record DealClosedLostEvent(
    Guid DealId,
    Guid CustomerId,
    Guid TenantId,
    decimal Amount,
    string Currency,
    string LossReason,
    DateTime ClosedDate,
    Guid ClosedBy
) : IntegrationEvent;
