using MediatR;
using Stocker.Application.DTOs.Tenant.Chat;
using Stocker.Application.Interfaces.Repositories;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Tenant.Chat.Queries.GetPrivateMessages;

public class GetPrivateMessagesQueryHandler : IRequestHandler<GetPrivateMessagesQuery, Result<List<ChatMessageDto>>>
{
    private readonly IChatMessageRepository _chatMessageRepository;
    private readonly ITenantService _tenantService;
    private readonly ICurrentUserService _currentUserService;

    public GetPrivateMessagesQueryHandler(
        IChatMessageRepository chatMessageRepository,
        ITenantService tenantService,
        ICurrentUserService currentUserService)
    {
        _chatMessageRepository = chatMessageRepository;
        _tenantService = tenantService;
        _currentUserService = currentUserService;
    }

    public async Task<Result<List<ChatMessageDto>>> Handle(GetPrivateMessagesQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _tenantService.GetCurrentTenantId() ?? Guid.Empty;
        if (tenantId == Guid.Empty)
            return Result<List<ChatMessageDto>>.Failure(DomainErrors.Tenant.TenantNotFound);

        var userId = _currentUserService.UserId;
        if (!userId.HasValue || userId.Value == Guid.Empty)
            return Result<List<ChatMessageDto>>.Failure(DomainErrors.Authentication.NotAuthenticated);

        var messages = await _chatMessageRepository.GetPrivateMessagesAsync(
            tenantId,
            userId.Value,
            request.OtherUserId,
            request.Skip,
            request.Take,
            cancellationToken);

        var messageDtos = messages.Select(ChatMessageDto.FromEntity).ToList();

        return Result<List<ChatMessageDto>>.Success(messageDtos);
    }
}
