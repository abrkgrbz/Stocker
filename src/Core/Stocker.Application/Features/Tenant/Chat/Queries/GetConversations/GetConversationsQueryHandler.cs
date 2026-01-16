using MediatR;
using Stocker.Application.DTOs.Tenant.Chat;
using Stocker.Application.Interfaces.Repositories;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Tenant.Chat.Queries.GetConversations;

public class GetConversationsQueryHandler : IRequestHandler<GetConversationsQuery, Result<List<ChatConversationDto>>>
{
    private readonly IChatMessageRepository _chatMessageRepository;
    private readonly ITenantService _tenantService;
    private readonly ICurrentUserService _currentUserService;

    public GetConversationsQueryHandler(
        IChatMessageRepository chatMessageRepository,
        ITenantService tenantService,
        ICurrentUserService currentUserService)
    {
        _chatMessageRepository = chatMessageRepository;
        _tenantService = tenantService;
        _currentUserService = currentUserService;
    }

    public async Task<Result<List<ChatConversationDto>>> Handle(GetConversationsQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _tenantService.GetCurrentTenantId() ?? Guid.Empty;
        if (tenantId == Guid.Empty)
            return Result<List<ChatConversationDto>>.Failure(DomainErrors.Tenant.TenantNotFound);

        var userId = _currentUserService.UserId;
        if (!userId.HasValue || userId.Value == Guid.Empty)
            return Result<List<ChatConversationDto>>.Failure(DomainErrors.Authentication.NotAuthenticated);

        var conversations = await _chatMessageRepository.GetConversationsAsync(tenantId, userId.Value, cancellationToken);

        var conversationDtos = conversations.Select(c => new ChatConversationDto
        {
            UserId = c.UserId != Guid.Empty ? c.UserId : null,
            UserName = c.UserName,
            RoomName = c.RoomName,
            IsPrivate = c.IsPrivate,
            LastMessage = c.LastMessage != null ? ChatMessageDto.FromEntity(c.LastMessage) : null,
            UnreadCount = c.UnreadCount
        }).ToList();

        return Result<List<ChatConversationDto>>.Success(conversationDtos);
    }
}
