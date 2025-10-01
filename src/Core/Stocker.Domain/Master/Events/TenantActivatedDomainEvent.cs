using Stocker.SharedKernel.Primitives;

namespace Stocker.Domain.Master.Events;

public sealed record TenantActivatedDomainEvent(
    Guid TenantId,
    string CompanyCode,
    string CompanyName,
    string ContactEmail) : DomainEvent;