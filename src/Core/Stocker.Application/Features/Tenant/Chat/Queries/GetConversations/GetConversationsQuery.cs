using MediatR;
using Stocker.Application.DTOs.Tenant.Chat;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Tenant.Chat.Queries.GetConversations;

public record GetConversationsQuery : IRequest<Result<List<ChatConversationDto>>>;
