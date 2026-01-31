using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Application.DTOs.Tenant.Chat;
using Stocker.Application.Features.Tenant.Chat.Commands.MarkAsRead;
using Stocker.Application.Features.Tenant.Chat.Commands.SendMessage;
using Stocker.Application.Features.Tenant.Chat.Queries.GetConversations;
using Stocker.Application.Features.Tenant.Chat.Queries.GetPrivateMessages;
using Stocker.Application.Features.Tenant.Chat.Queries.GetRoomMessages;
using Stocker.Domain.Tenant.Entities;

namespace Stocker.API.Controllers.Tenant;

[ApiController]
[Route("api/tenant/[controller]")]
[Authorize]
public class ChatController : ControllerBase
{
    private readonly IMediator _mediator;

    public ChatController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Get messages for a specific room
    /// </summary>
    [HttpGet("rooms/{roomName}/messages")]
    public async Task<IActionResult> GetRoomMessages(
        string roomName,
        [FromQuery] int skip = 0,
        [FromQuery] int take = 50,
        CancellationToken cancellationToken = default)
    {
        var result = await _mediator.Send(new GetRoomMessagesQuery(roomName, skip, take), cancellationToken);

        if (result.IsSuccess)
        {
            return Ok(new
            {
                success = true,
                data = result.Value,
                message = "Mesajlar başarıyla getirildi"
            });
        }

        return BadRequest(new
        {
            success = false,
            message = result.Error.Description
        });
    }

    /// <summary>
    /// Get private messages between current user and another user
    /// </summary>
    [HttpGet("private/{userId}/messages")]
    public async Task<IActionResult> GetPrivateMessages(
        Guid userId,
        [FromQuery] int skip = 0,
        [FromQuery] int take = 50,
        CancellationToken cancellationToken = default)
    {
        var result = await _mediator.Send(new GetPrivateMessagesQuery(userId, skip, take), cancellationToken);

        if (result.IsSuccess)
        {
            return Ok(new
            {
                success = true,
                data = result.Value,
                message = "Özel mesajlar başarıyla getirildi"
            });
        }

        return BadRequest(new
        {
            success = false,
            message = result.Error.Description
        });
    }

    /// <summary>
    /// Get all conversations for current user
    /// </summary>
    [HttpGet("conversations")]
    public async Task<IActionResult> GetConversations(CancellationToken cancellationToken = default)
    {
        var result = await _mediator.Send(new GetConversationsQuery(), cancellationToken);

        if (result.IsSuccess)
        {
            return Ok(new
            {
                success = true,
                data = result.Value,
                message = "Konuşmalar başarıyla getirildi"
            });
        }

        return BadRequest(new
        {
            success = false,
            message = result.Error.Description
        });
    }

    /// <summary>
    /// Send a message (room or private)
    /// </summary>
    [HttpPost("messages")]
    public async Task<IActionResult> SendMessage(
        [FromBody] SendMessageDto dto,
        CancellationToken cancellationToken = default)
    {
        var result = await _mediator.Send(new SendMessageCommand(
            dto.Content,
            dto.RoomName,
            dto.RecipientId,
            null, // RecipientName will be fetched if needed
            dto.IsPrivate,
            dto.MessageType,
            dto.AttachmentUrl,
            dto.AttachmentName
        ), cancellationToken);

        if (result.IsSuccess)
        {
            return Ok(new
            {
                success = true,
                data = result.Value,
                message = "Mesaj başarıyla gönderildi"
            });
        }

        return BadRequest(new
        {
            success = false,
            message = result.Error.Description
        });
    }

    /// <summary>
    /// Mark messages as read
    /// </summary>
    [HttpPut("messages/read")]
    public async Task<IActionResult> MarkAsRead(
        [FromBody] MarkAsReadDto dto,
        CancellationToken cancellationToken = default)
    {
        var result = await _mediator.Send(new MarkMessagesAsReadCommand(dto.MessageIds), cancellationToken);

        if (result.IsSuccess)
        {
            return Ok(new
            {
                success = true,
                data = new { markedCount = result.Value },
                message = $"{result.Value} mesaj okundu olarak işaretlendi"
            });
        }

        return BadRequest(new
        {
            success = false,
            message = result.Error.Description
        });
    }
}

public class MarkAsReadDto
{
    public List<Guid> MessageIds { get; set; } = new();
}
