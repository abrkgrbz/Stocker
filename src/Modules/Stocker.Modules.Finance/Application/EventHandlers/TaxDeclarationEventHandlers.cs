using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.Finance.Domain.Events;

namespace Stocker.Modules.Finance.Application.EventHandlers;

#region TaxDeclaration Event Handlers

/// <summary>
/// Vergi beyannamesi oluşturulduğunda tetiklenen handler
/// </summary>
public class TaxDeclarationCreatedEventHandler : INotificationHandler<TaxDeclarationCreatedDomainEvent>
{
    private readonly ILogger<TaxDeclarationCreatedEventHandler> _logger;

    public TaxDeclarationCreatedEventHandler(ILogger<TaxDeclarationCreatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(TaxDeclarationCreatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Vergi beyannamesi oluşturuldu: {DeclarationNumber}, Tip: {TaxType}, Dönem: {Period}, Tutar: {TaxAmount}, Son Ödeme: {DueDate}, Tenant: {TenantId}",
            notification.DeclarationNumber,
            notification.TaxType,
            notification.Period,
            notification.TaxAmount,
            notification.DueDate,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Vergi beyannamesi gönderildiğinde tetiklenen handler
/// </summary>
public class TaxDeclarationSubmittedEventHandler : INotificationHandler<TaxDeclarationSubmittedDomainEvent>
{
    private readonly ILogger<TaxDeclarationSubmittedEventHandler> _logger;

    public TaxDeclarationSubmittedEventHandler(ILogger<TaxDeclarationSubmittedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(TaxDeclarationSubmittedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Vergi beyannamesi gönderildi: {DeclarationNumber}, Tip: {TaxType}, Referans: {SubmissionReference}, Tenant: {TenantId}",
            notification.DeclarationNumber,
            notification.TaxType,
            notification.SubmissionReference,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Vergi ödendiğinde tetiklenen handler
/// </summary>
public class TaxPaidEventHandler : INotificationHandler<TaxPaidDomainEvent>
{
    private readonly ILogger<TaxPaidEventHandler> _logger;

    public TaxPaidEventHandler(ILogger<TaxPaidEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(TaxPaidDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Vergi ödendi: {DeclarationNumber}, Ödenen: {PaidAmount}, Referans: {PaymentReference}, Tenant: {TenantId}",
            notification.DeclarationNumber,
            notification.PaidAmount,
            notification.PaymentReference,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Vergi beyannamesi düzeltildiğinde tetiklenen handler
/// </summary>
public class TaxDeclarationAmendedEventHandler : INotificationHandler<TaxDeclarationAmendedDomainEvent>
{
    private readonly ILogger<TaxDeclarationAmendedEventHandler> _logger;

    public TaxDeclarationAmendedEventHandler(ILogger<TaxDeclarationAmendedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(TaxDeclarationAmendedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Vergi beyannamesi düzeltildi: {DeclarationNumber}, Eski: {OldAmount}, Yeni: {NewAmount}, Sebep: {AmendmentReason}, Tenant: {TenantId}",
            notification.DeclarationNumber,
            notification.OldAmount,
            notification.NewAmount,
            notification.AmendmentReason,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

#endregion
