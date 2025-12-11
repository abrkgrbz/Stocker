using MediatR;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.Modules.CRM.Domain.Repositories;
using Stocker.Modules.CRM.Infrastructure.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Meetings.Commands;

public class CreateMeetingCommandHandler : IRequestHandler<CreateMeetingCommand, Result<Guid>>
{
    private readonly IMeetingRepository _repository;
    private readonly SharedKernel.Interfaces.IUnitOfWork _unitOfWork;

    public CreateMeetingCommandHandler(
        IMeetingRepository repository,
        SharedKernel.Interfaces.IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async System.Threading.Tasks.Task<Result<Guid>> Handle(CreateMeetingCommand request, CancellationToken cancellationToken)
    {
        var meeting = new Meeting(
            request.TenantId,
            request.Title,
            request.StartTime,
            request.EndTime,
            request.OrganizerId,
            request.MeetingType);

        meeting.UpdateDetails(request.Title, request.Description);
        meeting.SetPriority(request.Priority);
        meeting.SetAllDay(request.IsAllDay);

        if (!string.IsNullOrEmpty(request.Timezone))
            meeting.SetTimezone(request.Timezone);

        if (request.LocationType == Domain.Entities.MeetingLocationType.Online &&
            !string.IsNullOrEmpty(request.OnlineMeetingLink) &&
            !string.IsNullOrEmpty(request.OnlineMeetingPlatform))
        {
            meeting.SetOnlineDetails(request.OnlineMeetingLink, request.OnlineMeetingPlatform,
                request.MeetingPassword, request.DialInNumber);
        }
        else if (request.LocationType == Domain.Entities.MeetingLocationType.InPerson &&
                 !string.IsNullOrEmpty(request.Location))
        {
            meeting.SetPhysicalLocation(request.Location, request.MeetingRoom);
        }
        else if (request.LocationType == Domain.Entities.MeetingLocationType.Hybrid &&
                 !string.IsNullOrEmpty(request.Location) &&
                 !string.IsNullOrEmpty(request.OnlineMeetingLink) &&
                 !string.IsNullOrEmpty(request.OnlineMeetingPlatform))
        {
            meeting.SetHybridLocation(request.Location, request.OnlineMeetingLink, request.OnlineMeetingPlatform);
        }

        if (request.CustomerId.HasValue)
            meeting.RelateToCustomer(request.CustomerId.Value);

        if (request.ContactId.HasValue)
            meeting.RelateToContact(request.ContactId.Value);

        if (request.LeadId.HasValue)
            meeting.RelateToLead(request.LeadId.Value);

        if (request.OpportunityId.HasValue)
            meeting.RelateToOpportunity(request.OpportunityId.Value);

        if (request.DealId.HasValue)
            meeting.RelateToDeal(request.DealId.Value);

        if (request.CampaignId.HasValue)
            meeting.RelateToCampaign(request.CampaignId.Value);

        if (!string.IsNullOrEmpty(request.OrganizerName) || !string.IsNullOrEmpty(request.OrganizerEmail))
            meeting.SetOrganizerInfo(request.OrganizerName, request.OrganizerEmail);

        if (!string.IsNullOrEmpty(request.Agenda))
            meeting.SetAgenda(request.Agenda);

        await _repository.CreateAsync(meeting, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<Guid>.Success(meeting.Id);
    }
}
