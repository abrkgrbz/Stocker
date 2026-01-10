using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.HR.Domain.Events;

namespace Stocker.Modules.HR.Application.EventHandlers;

#region EmployeeSkill Event Handlers

public class SkillAddedToEmployeeEventHandler : INotificationHandler<SkillAddedToEmployeeDomainEvent>
{
    private readonly ILogger<SkillAddedToEmployeeEventHandler> _logger;

    public SkillAddedToEmployeeEventHandler(ILogger<SkillAddedToEmployeeEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(SkillAddedToEmployeeDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Skill added to employee: {EmployeeName} + {SkillName}, Level: {ProficiencyLevel}",
            notification.EmployeeName,
            notification.SkillName,
            notification.ProficiencyLevel);

        return Task.CompletedTask;
    }
}

public class SkillProficiencyUpdatedEventHandler : INotificationHandler<SkillProficiencyUpdatedDomainEvent>
{
    private readonly ILogger<SkillProficiencyUpdatedEventHandler> _logger;

    public SkillProficiencyUpdatedEventHandler(ILogger<SkillProficiencyUpdatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(SkillProficiencyUpdatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Skill proficiency updated: {EmployeeName} - {SkillName}, {OldLevel} → {NewLevel}",
            notification.EmployeeName,
            notification.SkillName,
            notification.OldLevel,
            notification.NewLevel);

        return Task.CompletedTask;
    }
}

public class SkillEndorsedEventHandler : INotificationHandler<SkillEndorsedDomainEvent>
{
    private readonly ILogger<SkillEndorsedEventHandler> _logger;

    public SkillEndorsedEventHandler(ILogger<SkillEndorsedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(SkillEndorsedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Skill endorsed: {EmployeeName} - {SkillName}, Endorsed by: {EndorserName}",
            notification.EmployeeName,
            notification.SkillName,
            notification.EndorserName);

        return Task.CompletedTask;
    }
}

public class SkillRemovedFromEmployeeEventHandler : INotificationHandler<SkillRemovedFromEmployeeDomainEvent>
{
    private readonly ILogger<SkillRemovedFromEmployeeEventHandler> _logger;

    public SkillRemovedFromEmployeeEventHandler(ILogger<SkillRemovedFromEmployeeEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(SkillRemovedFromEmployeeDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Skill removed from employee: {EmployeeName} - {SkillName}",
            notification.EmployeeName,
            notification.SkillName);

        return Task.CompletedTask;
    }
}

#endregion
