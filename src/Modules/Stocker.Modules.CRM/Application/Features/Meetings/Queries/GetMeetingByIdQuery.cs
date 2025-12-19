using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.Modules.CRM.Interfaces;

namespace Stocker.Modules.CRM.Application.Features.Meetings.Queries;

public class GetMeetingByIdQuery : IRequest<MeetingDto?>
{
    public Guid Id { get; set; }
}

/// <summary>
/// Uses ICRMUnitOfWork for consistent data access
/// </summary>
public class GetMeetingByIdQueryHandler : IRequestHandler<GetMeetingByIdQuery, MeetingDto?>
{
    private readonly ICRMUnitOfWork _unitOfWork;

    public GetMeetingByIdQueryHandler(ICRMUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async System.Threading.Tasks.Task<MeetingDto?> Handle(GetMeetingByIdQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var entity = await _unitOfWork.ReadRepository<Meeting>().AsQueryable()
            .Include(m => m.Customer)
            .Include(m => m.Contact)
            .Include(m => m.Lead)
            .Include(m => m.Opportunity)
            .Include(m => m.Deal)
            .Include(m => m.Campaign)
            .FirstOrDefaultAsync(m => m.Id == request.Id && m.TenantId == tenantId, cancellationToken);

        if (entity == null)
            return null;

        return new MeetingDto
        {
            Id = entity.Id,
            Title = entity.Title,
            Description = entity.Description,
            MeetingType = entity.MeetingType,
            Status = entity.Status,
            Priority = entity.Priority,
            StartTime = entity.StartTime,
            EndTime = entity.EndTime,
            IsAllDay = entity.IsAllDay,
            Timezone = entity.Timezone,
            ActualStartTime = entity.ActualStartTime,
            ActualEndTime = entity.ActualEndTime,
            LocationType = entity.LocationType,
            Location = entity.Location,
            MeetingRoom = entity.MeetingRoom,
            OnlineMeetingLink = entity.OnlineMeetingLink,
            OnlineMeetingPlatform = entity.OnlineMeetingPlatform,
            MeetingPassword = entity.MeetingPassword,
            DialInNumber = entity.DialInNumber,
            CustomerId = entity.CustomerId,
            CustomerName = entity.Customer?.CompanyName,
            ContactId = entity.ContactId,
            ContactName = entity.Contact?.FullName,
            LeadId = entity.LeadId,
            LeadName = entity.Lead?.FirstName + " " + entity.Lead?.LastName,
            OpportunityId = entity.OpportunityId,
            OpportunityName = entity.Opportunity?.Name,
            DealId = entity.DealId,
            DealTitle = entity.Deal?.Name,
            CampaignId = entity.CampaignId,
            CampaignName = entity.Campaign?.Name,
            OrganizerId = entity.OrganizerId,
            OrganizerName = entity.OrganizerName,
            OrganizerEmail = entity.OrganizerEmail,
            Agenda = entity.Agenda,
            Notes = entity.Notes,
            Outcome = entity.Outcome,
            ActionItems = entity.ActionItems,
            HasReminder = entity.HasReminder,
            ReminderMinutesBefore = entity.ReminderMinutesBefore,
            ReminderSent = entity.ReminderSent,
            IsRecurring = entity.IsRecurring,
            RecurrencePattern = entity.RecurrencePattern,
            ParentMeetingId = entity.ParentMeetingId,
            RecurrenceEndDate = entity.RecurrenceEndDate,
            HasRecording = entity.HasRecording,
            RecordingUrl = entity.RecordingUrl
        };
    }
}
