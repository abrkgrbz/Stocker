using MediatR;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Reminders.Commands.DeleteReminder;

public record DeleteReminderCommand(int Id) : IRequest<Result>;
