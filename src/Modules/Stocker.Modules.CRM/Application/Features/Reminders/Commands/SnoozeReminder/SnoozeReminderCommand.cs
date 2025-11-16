using MediatR;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Reminders.Commands.SnoozeReminder;

public record SnoozeReminderCommand(int Id, int Minutes) : IRequest<Result>;
