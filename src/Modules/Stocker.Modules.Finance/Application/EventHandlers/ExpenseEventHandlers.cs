using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.Finance.Domain.Events;

namespace Stocker.Modules.Finance.Application.EventHandlers;

#region Expense Event Handlers

/// <summary>
/// Masraf oluşturulduğunda tetiklenen handler
/// </summary>
public class ExpenseCreatedEventHandler : INotificationHandler<ExpenseCreatedDomainEvent>
{
    private readonly ILogger<ExpenseCreatedEventHandler> _logger;

    public ExpenseCreatedEventHandler(ILogger<ExpenseCreatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(ExpenseCreatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Masraf oluşturuldu: {ExpenseNumber}, Kategori: {Category}, Tutar: {Amount} {Currency}, Tenant: {TenantId}",
            notification.ExpenseNumber,
            notification.Category,
            notification.Amount,
            notification.Currency,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Masraf onaylandığında tetiklenen handler
/// </summary>
public class ExpenseApprovedEventHandler : INotificationHandler<ExpenseApprovedDomainEvent>
{
    private readonly ILogger<ExpenseApprovedEventHandler> _logger;

    public ExpenseApprovedEventHandler(ILogger<ExpenseApprovedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(ExpenseApprovedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Masraf onaylandı: {ExpenseNumber}, Onaylayan: {ApprovedById}, Tenant: {TenantId}",
            notification.ExpenseNumber,
            notification.ApprovedById,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Masraf reddedildiğinde tetiklenen handler
/// </summary>
public class ExpenseRejectedEventHandler : INotificationHandler<ExpenseRejectedDomainEvent>
{
    private readonly ILogger<ExpenseRejectedEventHandler> _logger;

    public ExpenseRejectedEventHandler(ILogger<ExpenseRejectedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(ExpenseRejectedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Masraf reddedildi: {ExpenseNumber}, Sebep: {RejectionReason}, Tenant: {TenantId}",
            notification.ExpenseNumber,
            notification.RejectionReason,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Masraf ödendiğinde tetiklenen handler
/// </summary>
public class ExpensePaidEventHandler : INotificationHandler<ExpensePaidDomainEvent>
{
    private readonly ILogger<ExpensePaidEventHandler> _logger;

    public ExpensePaidEventHandler(ILogger<ExpensePaidEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(ExpensePaidDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Masraf ödendi: {ExpenseNumber}, Ödenen: {PaidAmount}, Tenant: {TenantId}",
            notification.ExpenseNumber,
            notification.PaidAmount,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

#endregion
