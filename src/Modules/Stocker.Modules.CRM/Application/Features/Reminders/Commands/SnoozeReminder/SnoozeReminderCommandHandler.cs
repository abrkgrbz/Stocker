using MediatR;
using Stocker.Modules.CRM.Infrastructure.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Reminders.Commands.SnoozeReminder;

public class SnoozeReminderCommandHandler : IRequestHandler<SnoozeReminderCommand, Result>
{
    private readonly IReminderRepository _reminderRepository;

    public SnoozeReminderCommandHandler(IReminderRepository reminderRepository)
    {
        _reminderRepository = reminderRepository;
    }

    public async System.Threading.Tasks.Task<Result> Handle(SnoozeReminderCommand request, CancellationToken cancellationToken)
    {
        var reminder = await _reminderRepository.GetByIdAsync(request.Id, cancellationToken);
        if (reminder == null)
        {
            return Result.Failure(Error.NotFound("Reminder", $"Reminder with id {request.Id} not found"));
        }

        var snoozeResult = reminder.Snooze(request.Minutes);
        if (!snoozeResult.IsSuccess)
        {
            return snoozeResult;
        }

        await _reminderRepository.UpdateAsync(reminder, cancellationToken);
        return Result.Success();
    }
}
