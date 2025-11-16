using MediatR;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Reminders.Commands.CompleteReminder;

public record CompleteReminderCommand(int Id) : IRequest<Result>;
