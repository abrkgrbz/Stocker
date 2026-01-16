using MediatR;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Tenant.Chat.Commands.MarkAsRead;

public record MarkMessagesAsReadCommand(IEnumerable<Guid> MessageIds) : IRequest<Result<int>>;
