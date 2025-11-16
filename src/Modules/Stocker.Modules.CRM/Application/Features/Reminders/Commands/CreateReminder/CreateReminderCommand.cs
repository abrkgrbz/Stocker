using MediatR;
using Stocker.Modules.CRM.Domain.Enums;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Reminders.Commands.CreateReminder;

public record CreateReminderCommand(
    Guid TenantId,
    Guid UserId,
    string Title,
    DateTime RemindAt,
    ReminderType Type,
    string? Description = null,
    int? RelatedEntityId = null,
    string? RelatedEntityType = null,
    bool SendEmail = false,
    bool SendPush = true,
    bool SendInApp = true,
    RecurrenceType RecurrenceType = RecurrenceType.None,
    string? RecurrencePattern = null,
    DateTime? RecurrenceEndDate = null,
    Guid? AssignedToUserId = null,
    DateTime? DueDate = null,
    DateTime? MeetingStartTime = null,
    DateTime? MeetingEndTime = null,
    string? Participants = null) : IRequest<Result<int>>;
