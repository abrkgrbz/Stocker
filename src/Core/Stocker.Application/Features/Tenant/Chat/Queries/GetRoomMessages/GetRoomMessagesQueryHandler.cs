using MediatR;
using Stocker.Application.DTOs.Tenant.Chat;
using Stocker.Application.Interfaces.Repositories;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Tenant.Chat.Queries.GetRoomMessages;

public class GetRoomMessagesQueryHandler : IRequestHandler<GetRoomMessagesQuery, Result<List<ChatMessageDto>>>
{
    private readonly IChatMessageRepository _chatMessageRepository;
    private readonly ITenantService _tenantService;

    public GetRoomMessagesQueryHandler(
        IChatMessageRepository chatMessageRepository,
        ITenantService tenantService)
    {
        _chatMessageRepository = chatMessageRepository;
        _tenantService = tenantService;
    }

    public async Task<Result<List<ChatMessageDto>>> Handle(GetRoomMessagesQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _tenantService.GetCurrentTenantId() ?? Guid.Empty;
        if (tenantId == Guid.Empty)
            return Result<List<ChatMessageDto>>.Failure(DomainErrors.Tenant.TenantNotFound);

        var messages = await _chatMessageRepository.GetRoomMessagesAsync(
            tenantId,
            request.RoomName,
            request.Skip,
            request.Take,
            cancellationToken);

        var messageDtos = messages.Select(ChatMessageDto.FromEntity).ToList();

        return Result<List<ChatMessageDto>>.Success(messageDtos);
    }
}
