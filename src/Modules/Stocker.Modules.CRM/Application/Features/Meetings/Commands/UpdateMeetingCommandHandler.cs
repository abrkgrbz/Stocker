using MediatR;
using Stocker.Modules.CRM.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Meetings.Commands;

public class UpdateMeetingCommandHandler : IRequestHandler<UpdateMeetingCommand, Result<bool>>
{
    private readonly ICRMUnitOfWork _unitOfWork;

    public UpdateMeetingCommandHandler(ICRMUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async System.Threading.Tasks.Task<Result<bool>> Handle(UpdateMeetingCommand request, CancellationToken cancellationToken)
    {
        var meeting = await _unitOfWork.Meetings.GetByIdAsync(request.Id, cancellationToken);

        if (meeting == null)
        {
            return Result<bool>.Failure(Error.NotFound("Meeting.NotFound", $"Meeting with ID {request.Id} not found"));
        }

        if (meeting.TenantId != _unitOfWork.TenantId)
        {
            return Result<bool>.Failure(Error.Forbidden("Meeting.Forbidden", "You don't have permission to update this meeting"));
        }

        meeting.UpdateDetails(request.Title, request.Description);

        if (request.MeetingType.HasValue)
            meeting.SetMeetingType(request.MeetingType.Value);

        if (request.Priority.HasValue)
            meeting.SetPriority(request.Priority.Value);

        if (request.IsAllDay.HasValue)
            meeting.SetAllDay(request.IsAllDay.Value);

        if (!string.IsNullOrEmpty(request.Timezone))
            meeting.SetTimezone(request.Timezone);

        if (request.LocationType.HasValue)
        {
            if (request.LocationType.Value == Domain.Entities.MeetingLocationType.Online &&
                !string.IsNullOrEmpty(request.OnlineMeetingLink) &&
                !string.IsNullOrEmpty(request.OnlineMeetingPlatform))
            {
                meeting.SetOnlineDetails(request.OnlineMeetingLink, request.OnlineMeetingPlatform,
                    request.MeetingPassword, request.DialInNumber);
            }
            else if (request.LocationType.Value == Domain.Entities.MeetingLocationType.InPerson &&
                     !string.IsNullOrEmpty(request.Location))
            {
                meeting.SetPhysicalLocation(request.Location, request.MeetingRoom);
            }
            else if (request.LocationType.Value == Domain.Entities.MeetingLocationType.Hybrid &&
                     !string.IsNullOrEmpty(request.Location) &&
                     !string.IsNullOrEmpty(request.OnlineMeetingLink) &&
                     !string.IsNullOrEmpty(request.OnlineMeetingPlatform))
            {
                meeting.SetHybridLocation(request.Location, request.OnlineMeetingLink, request.OnlineMeetingPlatform);
            }
        }

        if (!string.IsNullOrEmpty(request.Agenda))
            meeting.SetAgenda(request.Agenda);

        if (!string.IsNullOrEmpty(request.Notes))
            meeting.SetNotes(request.Notes);

        await _unitOfWork.Meetings.UpdateAsync(meeting, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
