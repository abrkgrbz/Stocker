using MediatR;
using Stocker.Application.DTOs.Tenant.Chat;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Tenant.Chat.Queries.GetPrivateMessages;

public record GetPrivateMessagesQuery(Guid OtherUserId, int Skip = 0, int Take = 50)
    : IRequest<Result<List<ChatMessageDto>>>;
