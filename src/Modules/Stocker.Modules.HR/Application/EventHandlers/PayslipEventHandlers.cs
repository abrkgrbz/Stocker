using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.HR.Domain.Events;

namespace Stocker.Modules.HR.Application.EventHandlers;

#region Payslip Event Handlers

public class PayslipGeneratedEventHandler : INotificationHandler<PayslipGeneratedDomainEvent>
{
    private readonly ILogger<PayslipGeneratedEventHandler> _logger;

    public PayslipGeneratedEventHandler(ILogger<PayslipGeneratedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(PayslipGeneratedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Payslip generated: {EmployeeName}, Period: {PayPeriodStart:d} - {PayPeriodEnd:d}, Net: {NetAmount:C}",
            notification.EmployeeName,
            notification.PayPeriodStart,
            notification.PayPeriodEnd,
            notification.NetAmount);

        return Task.CompletedTask;
    }
}

public class PayslipApprovedEventHandler : INotificationHandler<PayslipApprovedDomainEvent>
{
    private readonly ILogger<PayslipApprovedEventHandler> _logger;

    public PayslipApprovedEventHandler(ILogger<PayslipApprovedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(PayslipApprovedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Payslip approved: {EmployeeName}, Net: {NetAmount:C}",
            notification.EmployeeName,
            notification.NetAmount);

        return Task.CompletedTask;
    }
}

public class PayslipSentToEmployeeEventHandler : INotificationHandler<PayslipSentToEmployeeDomainEvent>
{
    private readonly ILogger<PayslipSentToEmployeeEventHandler> _logger;

    public PayslipSentToEmployeeEventHandler(ILogger<PayslipSentToEmployeeEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(PayslipSentToEmployeeDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Payslip sent to employee: {EmployeeName} ({EmployeeEmail}), Sent: {SentDate:d}",
            notification.EmployeeName,
            notification.EmployeeEmail,
            notification.SentDate);

        return Task.CompletedTask;
    }
}

public class PayslipDisputedEventHandler : INotificationHandler<PayslipDisputedDomainEvent>
{
    private readonly ILogger<PayslipDisputedEventHandler> _logger;

    public PayslipDisputedEventHandler(ILogger<PayslipDisputedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(PayslipDisputedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Payslip disputed: {EmployeeName}, Reason: {DisputeReason}",
            notification.EmployeeName,
            notification.DisputeReason);

        return Task.CompletedTask;
    }
}

public class PayslipCorrectedEventHandler : INotificationHandler<PayslipCorrectedDomainEvent>
{
    private readonly ILogger<PayslipCorrectedEventHandler> _logger;

    public PayslipCorrectedEventHandler(ILogger<PayslipCorrectedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(PayslipCorrectedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Payslip corrected: {EmployeeName}, {OldNetAmount:C} → {NewNetAmount:C}, Reason: {CorrectionReason}",
            notification.EmployeeName,
            notification.OldNetAmount,
            notification.NewNetAmount,
            notification.CorrectionReason);

        return Task.CompletedTask;
    }
}

#endregion
