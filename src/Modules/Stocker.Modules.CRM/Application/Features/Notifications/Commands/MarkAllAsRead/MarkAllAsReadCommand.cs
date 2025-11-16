using MediatR;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Notifications.Commands.MarkAllAsRead;

public record MarkAllAsReadCommand(
    Guid UserId
) : IRequest<Result<Unit>>;
