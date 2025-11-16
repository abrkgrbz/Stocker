using MediatR;
using Stocker.Modules.CRM.Infrastructure.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Reminders.Commands.UpdateReminder;

public class UpdateReminderCommandHandler : IRequestHandler<UpdateReminderCommand, Result>
{
    private readonly IReminderRepository _reminderRepository;

    public UpdateReminderCommandHandler(IReminderRepository reminderRepository)
    {
        _reminderRepository = reminderRepository;
    }

    public async System.Threading.Tasks.Task<Result> Handle(UpdateReminderCommand request, CancellationToken cancellationToken)
    {
        var reminder = await _reminderRepository.GetByIdAsync(request.Id, cancellationToken);
        if (reminder == null)
        {
            return Result.Failure(Error.NotFound("Reminder", $"Reminder with id {request.Id} not found"));
        }

        var updateResult = reminder.Update(
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

        if (!updateResult.IsSuccess)
        {
            return updateResult;
        }

        await _reminderRepository.UpdateAsync(reminder, cancellationToken);
        return Result.Success();
    }
}
