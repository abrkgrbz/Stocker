using MediatR;
using Stocker.Modules.CRM.Infrastructure.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Reminders.Commands.CompleteReminder;

public class CompleteReminderCommandHandler : IRequestHandler<CompleteReminderCommand, Result>
{
    private readonly IReminderRepository _reminderRepository;

    public CompleteReminderCommandHandler(IReminderRepository reminderRepository)
    {
        _reminderRepository = reminderRepository;
    }

    public async System.Threading.Tasks.Task<Result> Handle(CompleteReminderCommand request, CancellationToken cancellationToken)
    {
        var reminder = await _reminderRepository.GetByIdAsync(request.Id, cancellationToken);
        if (reminder == null)
        {
            return Result.Failure(Error.NotFound("Reminder", $"Reminder with id {request.Id} not found"));
        }

        var completeResult = reminder.Complete();
        if (!completeResult.IsSuccess)
        {
            return completeResult;
        }

        await _reminderRepository.UpdateAsync(reminder, cancellationToken);
        return Result.Success();
    }
}
