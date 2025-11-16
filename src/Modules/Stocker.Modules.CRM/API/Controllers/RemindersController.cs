using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.CRM.Application.Features.Reminders.Commands.CompleteReminder;
using Stocker.Modules.CRM.Application.Features.Reminders.Commands.CreateReminder;
using Stocker.Modules.CRM.Application.Features.Reminders.Commands.DeleteReminder;
using Stocker.Modules.CRM.Application.Features.Reminders.Commands.SnoozeReminder;
using Stocker.Modules.CRM.Application.Features.Reminders.Commands.UpdateReminder;
using Stocker.Modules.CRM.Application.Features.Reminders.Queries.GetReminders;
using Stocker.SharedKernel.Results;
using System.Security.Claims;

namespace Stocker.Modules.CRM.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class RemindersController : ControllerBase
{
    private readonly IMediator _mediator;

    public RemindersController(IMediator mediator)
    {
        _mediator = mediator;
    }

    private Guid GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.Parse(userIdClaim ?? throw new UnauthorizedAccessException("User ID not found"));
    }

    private Guid GetTenantId()
    {
        var tenantIdClaim = User.FindFirst("TenantId")?.Value;
        return Guid.Parse(tenantIdClaim ?? throw new UnauthorizedAccessException("Tenant ID not found"));
    }

    [HttpGet]
    public async Task<IActionResult> GetReminders(
        [FromQuery] bool? pendingOnly = null,
        [FromQuery] int? skip = null,
        [FromQuery] int? take = null,
        [FromQuery] Guid? assignedToUserId = null,
        CancellationToken cancellationToken = default)
    {
        var userId = GetUserId();
        var query = new GetRemindersQuery(userId, pendingOnly, skip, take, assignedToUserId);
        var result = await _mediator.Send(query, cancellationToken);

        return result.IsSuccess
            ? Ok(result.Value)
            : BadRequest(result.Error);
    }

    [HttpPost]
    public async Task<IActionResult> CreateReminder(
        [FromBody] CreateReminderCommand command,
        CancellationToken cancellationToken = default)
    {
        var userId = GetUserId();
        var tenantId = GetTenantId();

        // Override userId and tenantId from token
        var commandWithAuth = command with { UserId = userId, TenantId = tenantId };
        var result = await _mediator.Send(commandWithAuth, cancellationToken);

        return result.IsSuccess
            ? Ok(result.Value)
            : BadRequest(result.Error);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateReminder(
        int id,
        [FromBody] UpdateReminderCommand command,
        CancellationToken cancellationToken = default)
    {
        var commandWithId = command with { Id = id };
        var result = await _mediator.Send(commandWithId, cancellationToken);

        return result.IsSuccess
            ? Ok()
            : BadRequest(result.Error);
    }

    [HttpPost("{id}/snooze")]
    public async Task<IActionResult> SnoozeReminder(
        int id,
        [FromBody] SnoozeReminderRequest request,
        CancellationToken cancellationToken = default)
    {
        var command = new SnoozeReminderCommand(id, request.Minutes);
        var result = await _mediator.Send(command, cancellationToken);

        return result.IsSuccess
            ? Ok()
            : BadRequest(result.Error);
    }

    [HttpPost("{id}/complete")]
    public async Task<IActionResult> CompleteReminder(
        int id,
        CancellationToken cancellationToken = default)
    {
        var command = new CompleteReminderCommand(id);
        var result = await _mediator.Send(command, cancellationToken);

        return result.IsSuccess
            ? Ok()
            : BadRequest(result.Error);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteReminder(
        int id,
        CancellationToken cancellationToken = default)
    {
        var command = new DeleteReminderCommand(id);
        var result = await _mediator.Send(command, cancellationToken);

        return result.IsSuccess
            ? Ok()
            : BadRequest(result.Error);
    }
}

public record SnoozeReminderRequest(int Minutes);
