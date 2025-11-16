using MediatR;
using Stocker.Modules.CRM.Infrastructure.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Reminders.Commands.DeleteReminder;

public class DeleteReminderCommandHandler : IRequestHandler<DeleteReminderCommand, Result>
{
    private readonly IReminderRepository _reminderRepository;

    public DeleteReminderCommandHandler(IReminderRepository reminderRepository)
    {
        _reminderRepository = reminderRepository;
    }

    public async System.Threading.Tasks.Task<Result> Handle(DeleteReminderCommand request, CancellationToken cancellationToken)
    {
        var reminder = await _reminderRepository.GetByIdAsync(request.Id, cancellationToken);
        if (reminder == null)
        {
            return Result.Failure(Error.NotFound("Reminder", $"Reminder with id {request.Id} not found"));
        }

        await _reminderRepository.DeleteAsync(request.Id, cancellationToken);
        return Result.Success();
    }
}
