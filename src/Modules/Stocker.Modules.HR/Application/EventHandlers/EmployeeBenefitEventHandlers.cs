using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.HR.Domain.Events;

namespace Stocker.Modules.HR.Application.EventHandlers;

#region EmployeeBenefit Event Handlers

public class BenefitEnrolledEventHandler : INotificationHandler<BenefitEnrolledDomainEvent>
{
    private readonly ILogger<BenefitEnrolledEventHandler> _logger;

    public BenefitEnrolledEventHandler(ILogger<BenefitEnrolledEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(BenefitEnrolledDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Employee enrolled in benefit: {EmployeeName} → {BenefitType} ({BenefitPlan})",
            notification.EmployeeName,
            notification.BenefitType,
            notification.BenefitPlan);

        return Task.CompletedTask;
    }
}

public class BenefitEnrollmentUpdatedEventHandler : INotificationHandler<BenefitEnrollmentUpdatedDomainEvent>
{
    private readonly ILogger<BenefitEnrollmentUpdatedEventHandler> _logger;

    public BenefitEnrollmentUpdatedEventHandler(ILogger<BenefitEnrollmentUpdatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(BenefitEnrollmentUpdatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Employee benefit updated: {EmployeeName} - {BenefitType}, {OldPlan} → {NewPlan}",
            notification.EmployeeName,
            notification.BenefitType,
            notification.OldPlan,
            notification.NewPlan);

        return Task.CompletedTask;
    }
}

public class BenefitTerminatedEventHandler : INotificationHandler<BenefitTerminatedDomainEvent>
{
    private readonly ILogger<BenefitTerminatedEventHandler> _logger;

    public BenefitTerminatedEventHandler(ILogger<BenefitTerminatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(BenefitTerminatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Employee benefit terminated: {EmployeeName} - {BenefitType}, Reason: {TerminationReason}",
            notification.EmployeeName,
            notification.BenefitType,
            notification.TerminationReason);

        return Task.CompletedTask;
    }
}

public class BenefitEnrollmentPeriodOpenedEventHandler : INotificationHandler<BenefitEnrollmentPeriodOpenedDomainEvent>
{
    private readonly ILogger<BenefitEnrollmentPeriodOpenedEventHandler> _logger;

    public BenefitEnrollmentPeriodOpenedEventHandler(ILogger<BenefitEnrollmentPeriodOpenedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(BenefitEnrollmentPeriodOpenedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Benefit enrollment period opened: {OpenDate:d} - {CloseDate:d}, Eligible Employees: {EligibleEmployeeCount}",
            notification.OpenDate,
            notification.CloseDate,
            notification.EligibleEmployeeCount);

        return Task.CompletedTask;
    }
}

#endregion
