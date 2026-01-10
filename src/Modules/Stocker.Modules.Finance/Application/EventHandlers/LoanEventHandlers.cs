using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.Finance.Domain.Events;

namespace Stocker.Modules.Finance.Application.EventHandlers;

#region Loan Event Handlers

/// <summary>
/// Kredi oluşturulduğunda tetiklenen handler
/// </summary>
public class LoanCreatedEventHandler : INotificationHandler<LoanCreatedDomainEvent>
{
    private readonly ILogger<LoanCreatedEventHandler> _logger;

    public LoanCreatedEventHandler(ILogger<LoanCreatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(LoanCreatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Kredi oluşturuldu: {LoanNumber}, Tip: {LoanType}, Anapara: {PrincipalAmount}, Faiz: %{InterestRate}, Vade: {TermMonths} ay, Tenant: {TenantId}",
            notification.LoanNumber,
            notification.LoanType,
            notification.PrincipalAmount,
            notification.InterestRate,
            notification.TermMonths,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Kredi taksiti ödendiğinde tetiklenen handler
/// </summary>
public class LoanInstallmentPaidEventHandler : INotificationHandler<LoanInstallmentPaidDomainEvent>
{
    private readonly ILogger<LoanInstallmentPaidEventHandler> _logger;

    public LoanInstallmentPaidEventHandler(ILogger<LoanInstallmentPaidEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(LoanInstallmentPaidDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Kredi taksiti ödendi: {LoanNumber}, Taksit No: {InstallmentNumber}, Anapara: {PrincipalPaid}, Faiz: {InterestPaid}, Kalan: {RemainingBalance}, Tenant: {TenantId}",
            notification.LoanNumber,
            notification.InstallmentNumber,
            notification.PrincipalPaid,
            notification.InterestPaid,
            notification.RemainingBalance,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Kredi kapatıldığında tetiklenen handler
/// </summary>
public class LoanClosedEventHandler : INotificationHandler<LoanClosedDomainEvent>
{
    private readonly ILogger<LoanClosedEventHandler> _logger;

    public LoanClosedEventHandler(ILogger<LoanClosedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(LoanClosedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Kredi kapatıldı: {LoanNumber}, Toplam Anapara: {TotalPrincipalPaid}, Toplam Faiz: {TotalInterestPaid}, Tenant: {TenantId}",
            notification.LoanNumber,
            notification.TotalPrincipalPaid,
            notification.TotalInterestPaid,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Kredi taksiti geciktiğinde tetiklenen handler
/// </summary>
public class LoanPaymentOverdueEventHandler : INotificationHandler<LoanPaymentOverdueDomainEvent>
{
    private readonly ILogger<LoanPaymentOverdueEventHandler> _logger;

    public LoanPaymentOverdueEventHandler(ILogger<LoanPaymentOverdueEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(LoanPaymentOverdueDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Kredi taksiti gecikti: {LoanNumber}, Taksit No: {InstallmentNumber}, Geciken Tutar: {OverdueAmount}, Gecikme: {DaysOverdue} gün, Tenant: {TenantId}",
            notification.LoanNumber,
            notification.InstallmentNumber,
            notification.OverdueAmount,
            notification.DaysOverdue,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

#endregion
