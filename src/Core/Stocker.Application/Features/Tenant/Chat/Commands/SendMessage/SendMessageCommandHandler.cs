using MediatR;
using Stocker.Application.DTOs.Tenant.Chat;
using Stocker.Application.Interfaces.Repositories;
using Stocker.Domain.Tenant.Entities;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Tenant.Chat.Commands.SendMessage;

public class SendMessageCommandHandler : IRequestHandler<SendMessageCommand, Result<ChatMessageDto>>
{
    private readonly IChatMessageRepository _chatMessageRepository;
    private readonly ITenantService _tenantService;
    private readonly ICurrentUserService _currentUserService;

    public SendMessageCommandHandler(
        IChatMessageRepository chatMessageRepository,
        ITenantService tenantService,
        ICurrentUserService currentUserService)
    {
        _chatMessageRepository = chatMessageRepository;
        _tenantService = tenantService;
        _currentUserService = currentUserService;
    }

    public async Task<Result<ChatMessageDto>> Handle(SendMessageCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _tenantService.GetCurrentTenantId() ?? Guid.Empty;
        if (tenantId == Guid.Empty)
            return Result<ChatMessageDto>.Failure(DomainErrors.Tenant.TenantNotFound);

        var userId = _currentUserService.UserId;
        var currentUserName = _currentUserService.UserName ?? "Unknown";

        if (!userId.HasValue || userId.Value == Guid.Empty)
            return Result<ChatMessageDto>.Failure(DomainErrors.Authentication.NotAuthenticated);

        ChatMessage message;

        if (request.IsPrivate)
        {
            if (!request.RecipientId.HasValue)
                return Result<ChatMessageDto>.Failure(Error.Validation("Chat.RecipientRequired", "Özel mesaj için alıcı belirtilmelidir."));

            message = ChatMessage.CreatePrivateMessage(
                tenantId,
                userId.Value,
                currentUserName,
                request.RecipientId.Value,
                request.RecipientName ?? "Unknown",
                request.Content,
                request.MessageType,
                request.AttachmentUrl,
                request.AttachmentName);
        }
        else
        {
            if (string.IsNullOrWhiteSpace(request.RoomName))
                return Result<ChatMessageDto>.Failure(Error.Validation("Chat.RoomRequired", "Oda mesajı için oda adı belirtilmelidir."));

            message = ChatMessage.CreateRoomMessage(
                tenantId,
                userId.Value,
                currentUserName,
                request.Content,
                request.RoomName,
                request.MessageType,
                request.AttachmentUrl,
                request.AttachmentName);
        }

        await _chatMessageRepository.AddAsync(message, cancellationToken);

        return Result<ChatMessageDto>.Success(ChatMessageDto.FromEntity(message));
    }
}
