using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.Purchase.Domain.Events;

namespace Stocker.Modules.Purchase.Application.EventHandlers;

#region ImportDeclaration Event Handlers

/// <summary>
/// İthalat beyannamesi oluşturulduğunda tetiklenen handler
/// </summary>
public class ImportDeclarationCreatedEventHandler : INotificationHandler<ImportDeclarationCreatedDomainEvent>
{
    private readonly ILogger<ImportDeclarationCreatedEventHandler> _logger;

    public ImportDeclarationCreatedEventHandler(ILogger<ImportDeclarationCreatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(ImportDeclarationCreatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "İthalat beyannamesi oluşturuldu: {DeclarationNumber}, Gümrük: {CustomsOffice}, Değer: {TotalValue} {Currency}, Tenant: {TenantId}",
            notification.DeclarationNumber,
            notification.CustomsOffice,
            notification.TotalValue,
            notification.Currency,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// İthalat beyannamesi gümrüğe sunulduğunda tetiklenen handler
/// </summary>
public class ImportDeclarationSubmittedEventHandler : INotificationHandler<ImportDeclarationSubmittedDomainEvent>
{
    private readonly ILogger<ImportDeclarationSubmittedEventHandler> _logger;

    public ImportDeclarationSubmittedEventHandler(ILogger<ImportDeclarationSubmittedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(ImportDeclarationSubmittedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "İthalat beyannamesi sunuldu: {DeclarationNumber}, Referans: {SubmissionReference}, Tenant: {TenantId}",
            notification.DeclarationNumber,
            notification.SubmissionReference,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// İthalat beyannamesi onaylandığında tetiklenen handler
/// </summary>
public class ImportDeclarationApprovedEventHandler : INotificationHandler<ImportDeclarationApprovedDomainEvent>
{
    private readonly ILogger<ImportDeclarationApprovedEventHandler> _logger;

    public ImportDeclarationApprovedEventHandler(ILogger<ImportDeclarationApprovedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(ImportDeclarationApprovedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "İthalat beyannamesi onaylandı: {DeclarationNumber}, Onay No: {ApprovalNumber}, Tenant: {TenantId}",
            notification.DeclarationNumber,
            notification.ApprovalNumber,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Gümrük vergisi ödendiğinde tetiklenen handler
/// </summary>
public class CustomsDutyPaidEventHandler : INotificationHandler<CustomsDutyPaidDomainEvent>
{
    private readonly ILogger<CustomsDutyPaidEventHandler> _logger;

    public CustomsDutyPaidEventHandler(ILogger<CustomsDutyPaidEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(CustomsDutyPaidDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Gümrük vergisi ödendi: {DeclarationNumber}, Vergi: {DutyAmount}, Tenant: {TenantId}",
            notification.DeclarationNumber,
            notification.DutyAmount,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Mallar gümrükten çekildiğinde tetiklenen handler
/// </summary>
public class GoodsClearedFromCustomsEventHandler : INotificationHandler<GoodsClearedFromCustomsDomainEvent>
{
    private readonly ILogger<GoodsClearedFromCustomsEventHandler> _logger;

    public GoodsClearedFromCustomsEventHandler(ILogger<GoodsClearedFromCustomsEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(GoodsClearedFromCustomsDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Mallar gümrükten çekildi: {DeclarationNumber}, Tenant: {TenantId}",
            notification.DeclarationNumber,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

#endregion
