using Stocker.SharedKernel.Primitives;

namespace Stocker.Domain.Master.Events;

public sealed record TenantOnboardingStartedDomainEvent(Guid TenantId) : DomainEvent;

public sealed record TenantOnboardingCompletedDomainEvent(Guid TenantId) : DomainEvent;