using MediatR;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.Modules.CRM.Domain.Enums;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Meetings.Commands;

public record UpdateMeetingCommand(
    Guid Id,
    Guid TenantId,
    string Title,
    DateTime StartTime,
    DateTime EndTime,
    string? Description = null,
    MeetingType? MeetingType = null,
    MeetingPriority? Priority = null,
    bool? IsAllDay = null,
    string? Timezone = null,
    MeetingLocationType? LocationType = null,
    string? Location = null,
    string? MeetingRoom = null,
    string? OnlineMeetingLink = null,
    string? OnlineMeetingPlatform = null,
    string? MeetingPassword = null,
    string? DialInNumber = null,
    string? Agenda = null,
    string? Notes = null
) : IRequest<Result<bool>>;
