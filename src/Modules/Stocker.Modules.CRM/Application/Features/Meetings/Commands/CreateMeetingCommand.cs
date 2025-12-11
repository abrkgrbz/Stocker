using MediatR;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.Modules.CRM.Domain.Enums;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Meetings.Commands;

public record CreateMeetingCommand(
    Guid TenantId,
    string Title,
    DateTime StartTime,
    DateTime EndTime,
    int OrganizerId,
    MeetingType MeetingType = MeetingType.General,
    string? Description = null,
    MeetingPriority Priority = MeetingPriority.Normal,
    bool IsAllDay = false,
    string? Timezone = null,
    MeetingLocationType LocationType = MeetingLocationType.InPerson,
    string? Location = null,
    string? MeetingRoom = null,
    string? OnlineMeetingLink = null,
    string? OnlineMeetingPlatform = null,
    string? MeetingPassword = null,
    string? DialInNumber = null,
    Guid? CustomerId = null,
    Guid? ContactId = null,
    Guid? LeadId = null,
    Guid? OpportunityId = null,
    Guid? DealId = null,
    Guid? CampaignId = null,
    string? OrganizerName = null,
    string? OrganizerEmail = null,
    string? Agenda = null
) : IRequest<Result<Guid>>;
