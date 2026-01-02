using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.Modules.CRM.Domain.Enums;
using Stocker.Modules.CRM.Interfaces;
using Stocker.SharedKernel.Pagination;

namespace Stocker.Modules.CRM.Application.Features.Meetings.Queries;

public class GetMeetingsQuery : IRequest<PagedResult<MeetingDto>>
{
    public MeetingType? MeetingType { get; set; }
    public Domain.Entities.MeetingStatus? Status { get; set; }
    public MeetingPriority? Priority { get; set; }
    public MeetingLocationType? LocationType { get; set; }
    public Guid? CustomerId { get; set; }
    public Guid? ContactId { get; set; }
    public Guid? LeadId { get; set; }
    public Guid? OpportunityId { get; set; }
    public Guid? DealId { get; set; }
    public Guid? CampaignId { get; set; }
    public int? OrganizerId { get; set; }
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
    public bool? IsRecurring { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 10;
}

/// <summary>
/// Uses ICRMUnitOfWork for consistent data access
/// </summary>
public class GetMeetingsQueryHandler : IRequestHandler<GetMeetingsQuery, PagedResult<MeetingDto>>
{
    private readonly ICRMUnitOfWork _unitOfWork;

    public GetMeetingsQueryHandler(ICRMUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async System.Threading.Tasks.Task<PagedResult<MeetingDto>> Handle(GetMeetingsQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var query = _unitOfWork.ReadRepository<Meeting>().AsQueryable()
            .Include(m => m.Customer)
            .Include(m => m.Contact)
            .Include(m => m.Lead)
            .Include(m => m.Opportunity)
            .Include(m => m.Deal)
            .Include(m => m.Campaign)
            .Where(m => m.TenantId == tenantId);

        if (request.MeetingType.HasValue)
            query = query.Where(m => m.MeetingType == request.MeetingType.Value);

        if (request.Status.HasValue)
            query = query.Where(m => m.Status == request.Status.Value);

        if (request.Priority.HasValue)
            query = query.Where(m => m.Priority == request.Priority.Value);

        if (request.LocationType.HasValue)
            query = query.Where(m => m.LocationType == request.LocationType.Value);

        if (request.CustomerId.HasValue)
            query = query.Where(m => m.CustomerId == request.CustomerId.Value);

        if (request.ContactId.HasValue)
            query = query.Where(m => m.ContactId == request.ContactId.Value);

        if (request.LeadId.HasValue)
            query = query.Where(m => m.LeadId == request.LeadId.Value);

        if (request.OpportunityId.HasValue)
            query = query.Where(m => m.OpportunityId == request.OpportunityId.Value);

        if (request.DealId.HasValue)
            query = query.Where(m => m.DealId == request.DealId.Value);

        if (request.CampaignId.HasValue)
            query = query.Where(m => m.CampaignId == request.CampaignId.Value);

        if (request.OrganizerId.HasValue)
            query = query.Where(m => m.OrganizerId == request.OrganizerId.Value);

        if (request.FromDate.HasValue)
            query = query.Where(m => m.StartTime >= request.FromDate.Value);

        if (request.ToDate.HasValue)
            query = query.Where(m => m.EndTime <= request.ToDate.Value);

        if (request.IsRecurring.HasValue)
            query = query.Where(m => m.IsRecurring == request.IsRecurring.Value);

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderByDescending(m => m.StartTime)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(m => new MeetingDto
            {
                Id = m.Id,
                Title = m.Title,
                Description = m.Description,
                MeetingType = m.MeetingType,
                Status = m.Status,
                Priority = m.Priority,
                StartTime = m.StartTime,
                EndTime = m.EndTime,
                IsAllDay = m.IsAllDay,
                Timezone = m.Timezone,
                ActualStartTime = m.ActualStartTime,
                ActualEndTime = m.ActualEndTime,
                LocationType = m.LocationType,
                Location = m.Location,
                MeetingRoom = m.MeetingRoom,
                OnlineMeetingLink = m.OnlineMeetingLink,
                OnlineMeetingPlatform = m.OnlineMeetingPlatform,
                MeetingPassword = m.MeetingPassword,
                DialInNumber = m.DialInNumber,
                CustomerId = m.CustomerId,
                CustomerName = m.Customer != null ? m.Customer.CompanyName : null,
                ContactId = m.ContactId,
                ContactName = m.Contact != null ? m.Contact.FullName : null,
                LeadId = m.LeadId,
                LeadName = m.Lead != null ? m.Lead.FirstName + " " + m.Lead.LastName : null,
                OpportunityId = m.OpportunityId,
                OpportunityName = m.Opportunity != null ? m.Opportunity.Name : null,
                DealId = m.DealId,
                DealTitle = m.Deal != null ? m.Deal.Name : null,
                CampaignId = m.CampaignId,
                CampaignName = m.Campaign != null ? m.Campaign.Name : null,
                OrganizerId = m.OrganizerId,
                OrganizerName = m.OrganizerName,
                OrganizerEmail = m.OrganizerEmail,
                Agenda = m.Agenda,
                Notes = m.Notes,
                Outcome = m.Outcome,
                ActionItems = m.ActionItems,
                HasReminder = m.HasReminder,
                ReminderMinutesBefore = m.ReminderMinutesBefore,
                ReminderSent = m.ReminderSent,
                IsRecurring = m.IsRecurring,
                RecurrencePattern = m.RecurrencePattern,
                ParentMeetingId = m.ParentMeetingId,
                RecurrenceEndDate = m.RecurrenceEndDate,
                HasRecording = m.HasRecording,
                RecordingUrl = m.RecordingUrl
            })
            .ToListAsync(cancellationToken);

        return new PagedResult<MeetingDto>(items, request.Page, request.PageSize, totalCount);
    }
}
