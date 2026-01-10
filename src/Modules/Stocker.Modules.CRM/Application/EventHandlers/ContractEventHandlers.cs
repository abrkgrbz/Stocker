using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.CRM.Domain.Events;
using Stocker.Modules.CRM.Domain.Services;

namespace Stocker.Modules.CRM.Application.EventHandlers;

#region Contract Event Handlers

/// <summary>
/// Handler for contract created events
/// </summary>
public sealed class ContractCreatedEventHandler : INotificationHandler<ContractCreatedDomainEvent>
{
    private readonly ILogger<ContractCreatedEventHandler> _logger;

    public ContractCreatedEventHandler(ILogger<ContractCreatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(ContractCreatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Contract created: {ContractId} - {ContractNumber} for {AccountName}, Value: {ContractValue:C}",
            notification.ContractId,
            notification.ContractNumber,
            notification.AccountName,
            notification.ContractValue);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for contract sent for signature events
/// </summary>
public sealed class ContractSentForSignatureEventHandler : INotificationHandler<ContractSentForSignatureDomainEvent>
{
    private readonly ILogger<ContractSentForSignatureEventHandler> _logger;

    public ContractSentForSignatureEventHandler(ILogger<ContractSentForSignatureEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(ContractSentForSignatureDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Contract sent for signature: {ContractId} - {ContractNumber} to {AccountName}",
            notification.ContractId,
            notification.ContractNumber,
            notification.AccountName);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for contract signed events
/// </summary>
public sealed class ContractSignedEventHandler : INotificationHandler<ContractSignedDomainEvent>
{
    private readonly ICrmNotificationService _notificationService;
    private readonly ILogger<ContractSignedEventHandler> _logger;

    public ContractSignedEventHandler(
        ICrmNotificationService notificationService,
        ILogger<ContractSignedEventHandler> logger)
    {
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task Handle(ContractSignedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Contract signed: {ContractId} - {ContractNumber} for {AccountName}",
            notification.ContractId,
            notification.ContractNumber,
            notification.AccountName);

        await _notificationService.SendContractSignedAsync(
            notification.TenantId,
            notification.ContractId,
            notification.ContractNumber,
            notification.OwnerId,
            cancellationToken);
    }
}

/// <summary>
/// Handler for contract activated events
/// </summary>
public sealed class ContractActivatedEventHandler : INotificationHandler<ContractActivatedDomainEvent>
{
    private readonly ILogger<ContractActivatedEventHandler> _logger;

    public ContractActivatedEventHandler(ILogger<ContractActivatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(ContractActivatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Contract activated: {ContractId} - {ContractNumber}, Account: {AccountName}",
            notification.ContractId,
            notification.ContractNumber,
            notification.AccountName);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for contract renewed events
/// </summary>
public sealed class ContractRenewedEventHandler : INotificationHandler<ContractRenewedDomainEvent>
{
    private readonly ICrmNotificationService _notificationService;
    private readonly ILogger<ContractRenewedEventHandler> _logger;

    public ContractRenewedEventHandler(
        ICrmNotificationService notificationService,
        ILogger<ContractRenewedEventHandler> logger)
    {
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task Handle(ContractRenewedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Contract renewed: {ContractId} ({ContractNumber}) → New Contract {NewContractId}",
            notification.ContractId,
            notification.ContractNumber,
            notification.NewContractId);

        await _notificationService.SendContractRenewedAsync(
            notification.TenantId,
            notification.ContractId,
            notification.ContractNumber,
            notification.NewContractId,
            cancellationToken);
    }
}

/// <summary>
/// Handler for contract expiring events
/// </summary>
public sealed class ContractExpiringEventHandler : INotificationHandler<ContractExpiringDomainEvent>
{
    private readonly ICrmNotificationService _notificationService;
    private readonly ILogger<ContractExpiringEventHandler> _logger;

    public ContractExpiringEventHandler(
        ICrmNotificationService notificationService,
        ILogger<ContractExpiringEventHandler> logger)
    {
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task Handle(ContractExpiringDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Contract expiring: {ContractId} - {ContractNumber}, Expires: {EndDate}, Days remaining: {DaysRemaining}",
            notification.ContractId,
            notification.ContractNumber,
            notification.EndDate,
            notification.DaysRemaining);

        await _notificationService.SendContractExpiringSoonAsync(
            notification.TenantId,
            notification.ContractId,
            notification.ContractNumber,
            notification.OwnerId,
            notification.EndDate,
            cancellationToken);
    }
}

/// <summary>
/// Handler for contract expired events
/// </summary>
public sealed class ContractExpiredEventHandler : INotificationHandler<ContractExpiredDomainEvent>
{
    private readonly ILogger<ContractExpiredEventHandler> _logger;

    public ContractExpiredEventHandler(ILogger<ContractExpiredEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(ContractExpiredDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Contract expired: {ContractId} - {ContractNumber}",
            notification.ContractId,
            notification.ContractNumber);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for contract terminated events
/// </summary>
public sealed class ContractTerminatedEventHandler : INotificationHandler<ContractTerminatedDomainEvent>
{
    private readonly ILogger<ContractTerminatedEventHandler> _logger;

    public ContractTerminatedEventHandler(ILogger<ContractTerminatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(ContractTerminatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Contract terminated: {ContractId} - {ContractNumber}, Reason: {TerminationReason}",
            notification.ContractId,
            notification.ContractNumber,
            notification.TerminationReason ?? "Not specified");

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for contract amended events
/// </summary>
public sealed class ContractAmendedEventHandler : INotificationHandler<ContractAmendedDomainEvent>
{
    private readonly ILogger<ContractAmendedEventHandler> _logger;

    public ContractAmendedEventHandler(ILogger<ContractAmendedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(ContractAmendedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Contract amended: {ContractId} - {ContractNumber}, Amendment: {AmendmentDetails}",
            notification.ContractId,
            notification.ContractNumber,
            notification.AmendmentDetails);

        return Task.CompletedTask;
    }
}

#endregion
