using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.HR.Domain.Events;
using Stocker.Modules.HR.Domain.Services;

namespace Stocker.Modules.HR.Application.EventHandlers;

/// <summary>
/// Handler for payroll processed events
/// </summary>
public sealed class PayrollProcessedEventHandler : INotificationHandler<PayrollProcessedDomainEvent>
{
    private readonly ILogger<PayrollProcessedEventHandler> _logger;

    public PayrollProcessedEventHandler(ILogger<PayrollProcessedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(PayrollProcessedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Payroll processed: {PayrollId} - {EmployeeName}, Gross: {GrossSalary} {Currency}, Net: {NetSalary} {Currency}, Period: {PayPeriod}",
            notification.PayrollId,
            notification.EmployeeName,
            notification.GrossSalary,
            notification.Currency,
            notification.NetSalary,
            notification.Currency,
            notification.PayPeriod);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for payroll approved events
/// </summary>
public sealed class PayrollApprovedEventHandler : INotificationHandler<PayrollApprovedDomainEvent>
{
    private readonly ILogger<PayrollApprovedEventHandler> _logger;

    public PayrollApprovedEventHandler(ILogger<PayrollApprovedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(PayrollApprovedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "✅ Payroll approved: {PayrollId} - {EmployeeName}, Net: {NetSalary} {Currency}",
            notification.PayrollId,
            notification.EmployeeName,
            notification.NetSalary,
            notification.Currency);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for salary paid events - sends notification to employee
/// </summary>
public sealed class SalaryPaidEventHandler : INotificationHandler<SalaryPaidDomainEvent>
{
    private readonly IHrNotificationService _notificationService;
    private readonly ILogger<SalaryPaidEventHandler> _logger;

    public SalaryPaidEventHandler(
        IHrNotificationService notificationService,
        ILogger<SalaryPaidEventHandler> logger)
    {
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task Handle(SalaryPaidDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "💰 Salary paid: {PayrollId} - {EmployeeName}, Amount: {Amount} {Currency}, Method: {PaymentMethod}",
            notification.PayrollId,
            notification.EmployeeName,
            notification.Amount,
            notification.Currency,
            notification.PaymentMethod);

        await _notificationService.SendSalaryPaidAsync(
            notification.TenantId,
            notification.EmployeeId,
            notification.EmployeeName,
            notification.Amount,
            notification.Currency,
            notification.PaymentDate,
            cancellationToken);
    }
}

/// <summary>
/// Handler for bonus awarded events - sends notification to employee
/// </summary>
public sealed class BonusAwardedEventHandler : INotificationHandler<BonusAwardedDomainEvent>
{
    private readonly IHrNotificationService _notificationService;
    private readonly ILogger<BonusAwardedEventHandler> _logger;

    public BonusAwardedEventHandler(
        IHrNotificationService notificationService,
        ILogger<BonusAwardedEventHandler> logger)
    {
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task Handle(BonusAwardedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "🎉 Bonus awarded: {EmployeeId} - {EmployeeName}, Amount: {BonusAmount} {Currency}, Type: {BonusType}",
            notification.EmployeeId,
            notification.EmployeeName,
            notification.BonusAmount,
            notification.Currency,
            notification.BonusType);

        await _notificationService.SendBonusAwardedAsync(
            notification.TenantId,
            notification.EmployeeId,
            notification.EmployeeName,
            notification.BonusAmount,
            notification.Currency,
            notification.BonusType,
            cancellationToken);
    }
}

/// <summary>
/// Handler for salary deduction applied events
/// </summary>
public sealed class SalaryDeductionAppliedEventHandler : INotificationHandler<SalaryDeductionAppliedDomainEvent>
{
    private readonly ILogger<SalaryDeductionAppliedEventHandler> _logger;

    public SalaryDeductionAppliedEventHandler(ILogger<SalaryDeductionAppliedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(SalaryDeductionAppliedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Salary deduction applied: {EmployeeId} - {EmployeeName}, Amount: {DeductionAmount} {Currency}, Type: {DeductionType}",
            notification.EmployeeId,
            notification.EmployeeName,
            notification.DeductionAmount,
            notification.Currency,
            notification.DeductionType);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for payroll period closed events
/// </summary>
public sealed class PayrollPeriodClosedEventHandler : INotificationHandler<PayrollPeriodClosedDomainEvent>
{
    private readonly ILogger<PayrollPeriodClosedEventHandler> _logger;

    public PayrollPeriodClosedEventHandler(ILogger<PayrollPeriodClosedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(PayrollPeriodClosedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "📅 Payroll period closed: {PayPeriod}, Employees: {TotalEmployees}, Total: {TotalAmount} {Currency}",
            notification.PayPeriod,
            notification.TotalEmployees,
            notification.TotalAmount,
            notification.Currency);

        return Task.CompletedTask;
    }
}
