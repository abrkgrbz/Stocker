using MediatR;
using Stocker.Modules.CRM.Domain.Repositories;
using Stocker.Modules.CRM.Infrastructure.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Meetings.Commands;

public class UpdateMeetingCommandHandler : IRequestHandler<UpdateMeetingCommand, Result<bool>>
{
    private readonly IMeetingRepository _repository;
    private readonly SharedKernel.Interfaces.IUnitOfWork _unitOfWork;

    public UpdateMeetingCommandHandler(
        IMeetingRepository repository,
        SharedKernel.Interfaces.IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async System.Threading.Tasks.Task<Result<bool>> Handle(UpdateMeetingCommand request, CancellationToken cancellationToken)
    {
        var meeting = await _repository.GetByIdAsync(request.Id, cancellationToken);

        if (meeting == null)
        {
            return Result<bool>.Failure(Error.NotFound("Meeting.NotFound", $"Meeting with ID {request.Id} not found"));
        }

        if (meeting.TenantId != request.TenantId)
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

        await _repository.UpdateAsync(meeting, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
