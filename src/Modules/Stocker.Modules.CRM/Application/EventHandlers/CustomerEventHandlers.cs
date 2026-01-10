using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.CRM.Domain.Events;

namespace Stocker.Modules.CRM.Application.EventHandlers;

/// <summary>
/// Handler for customer created events
/// </summary>
public sealed class CustomerCreatedEventHandler : INotificationHandler<CustomerCreatedDomainEvent>
{
    private readonly ILogger<CustomerCreatedEventHandler> _logger;

    public CustomerCreatedEventHandler(ILogger<CustomerCreatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(CustomerCreatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Customer created: {CustomerId} - {CompanyName} ({CustomerType}) for Tenant {TenantId}",
            notification.CustomerId,
            notification.CompanyName,
            notification.CustomerType,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for customer updated events
/// </summary>
public sealed class CustomerUpdatedEventHandler : INotificationHandler<CustomerUpdatedDomainEvent>
{
    private readonly ILogger<CustomerUpdatedEventHandler> _logger;

    public CustomerUpdatedEventHandler(ILogger<CustomerUpdatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(CustomerUpdatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Customer updated: {CustomerId} - {CompanyName}",
            notification.CustomerId,
            notification.CompanyName);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for customer activated events
/// </summary>
public sealed class CustomerActivatedEventHandler : INotificationHandler<CustomerActivatedDomainEvent>
{
    private readonly ILogger<CustomerActivatedEventHandler> _logger;

    public CustomerActivatedEventHandler(ILogger<CustomerActivatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(CustomerActivatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Customer activated: {CustomerId} - {CompanyName}",
            notification.CustomerId,
            notification.CompanyName);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for customer deactivated events
/// </summary>
public sealed class CustomerDeactivatedEventHandler : INotificationHandler<CustomerDeactivatedDomainEvent>
{
    private readonly ILogger<CustomerDeactivatedEventHandler> _logger;

    public CustomerDeactivatedEventHandler(ILogger<CustomerDeactivatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(CustomerDeactivatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Customer deactivated: {CustomerId} - {CompanyName}",
            notification.CustomerId,
            notification.CompanyName);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for customer credit limit changed events
/// </summary>
public sealed class CustomerCreditLimitChangedEventHandler : INotificationHandler<CustomerCreditLimitChangedDomainEvent>
{
    private readonly ILogger<CustomerCreditLimitChangedEventHandler> _logger;

    public CustomerCreditLimitChangedEventHandler(ILogger<CustomerCreditLimitChangedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(CustomerCreditLimitChangedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Customer credit limit changed: {CustomerId} - {OldLimit} → {NewLimit}",
            notification.CustomerId,
            notification.OldLimit,
            notification.NewLimit);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for customer segment assigned events
/// </summary>
public sealed class CustomerSegmentAssignedEventHandler : INotificationHandler<CustomerSegmentAssignedDomainEvent>
{
    private readonly ILogger<CustomerSegmentAssignedEventHandler> _logger;

    public CustomerSegmentAssignedEventHandler(ILogger<CustomerSegmentAssignedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(CustomerSegmentAssignedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Customer assigned to segment: {CustomerId} → {SegmentName}",
            notification.CustomerId,
            notification.SegmentName);

        return Task.CompletedTask;
    }
}
