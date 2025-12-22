namespace Stocker.Shared.Events.CRM;

/// <summary>
/// Published when a deal is won in the CRM module
/// </summary>
public record DealWonEvent(
    Guid DealId,
    Guid CustomerId,
    Guid TenantId,
    decimal Amount,
    string Currency,
    List<DealProductDto> Products,
    DateTime ClosedDate,
    Guid WonBy
) : IntegrationEvent, ITenantEvent;

/// <summary>
/// Product information in a won deal
/// </summary>
public record DealProductDto(
    Guid ProductId,
    string ProductName,
    decimal Quantity,
    decimal UnitPrice,
    decimal DiscountAmount
);
