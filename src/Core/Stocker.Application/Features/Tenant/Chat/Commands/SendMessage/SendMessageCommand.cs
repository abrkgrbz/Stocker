using MediatR;
using Stocker.Application.DTOs.Tenant.Chat;
using Stocker.Domain.Tenant.Entities;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Tenant.Chat.Commands.SendMessage;

public record SendMessageCommand(
    string Content,
    string? RoomName,
    Guid? RecipientId,
    string? RecipientName,
    bool IsPrivate,
    ChatMessageType MessageType = ChatMessageType.Text,
    string? AttachmentUrl = null,
    string? AttachmentName = null
) : IRequest<Result<ChatMessageDto>>;
