using MediatR;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.Modules.CRM.Infrastructure.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Reminders.Commands.CreateReminder;

public class CreateReminderCommandHandler : IRequestHandler<CreateReminderCommand, Result<int>>
{
    private readonly IReminderRepository _reminderRepository;

    public CreateReminderCommandHandler(IReminderRepository reminderRepository)
    {
        _reminderRepository = reminderRepository;
    }

    public async System.Threading.Tasks.Task<Result<int>> Handle(CreateReminderCommand request, CancellationToken cancellationToken)
    {
        var reminderResult = Reminder.Create(
            request.TenantId,
            request.UserId,
            request.Title,
            request.RemindAt,
            request.Type,
            request.Description,
            request.RelatedEntityId,
            request.RelatedEntityType,
            request.SendEmail,
            request.SendPush,
            request.SendInApp,
            request.RecurrenceType,
            request.RecurrencePattern,
            request.RecurrenceEndDate,
            request.AssignedToUserId,
            request.DueDate,
            request.MeetingStartTime,
            request.MeetingEndTime,
            request.Participants);

        if (!reminderResult.IsSuccess)
        {
            return Result<int>.Failure(reminderResult.Error);
        }

        var reminder = await _reminderRepository.CreateAsync(reminderResult.Value, cancellationToken);
        return Result<int>.Success(reminder.Id);
    }
}
