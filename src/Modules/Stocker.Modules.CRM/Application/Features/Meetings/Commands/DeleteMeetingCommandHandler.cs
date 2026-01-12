using MediatR;
using Stocker.Modules.CRM.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Meetings.Commands;

public class DeleteMeetingCommandHandler : IRequestHandler<DeleteMeetingCommand, Result<bool>>
{
    private readonly ICRMUnitOfWork _unitOfWork;

    public DeleteMeetingCommandHandler(ICRMUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async System.Threading.Tasks.Task<Result<bool>> Handle(DeleteMeetingCommand request, CancellationToken cancellationToken)
    {
        var meeting = await _unitOfWork.Meetings.GetByIdAsync(request.Id, cancellationToken);

        if (meeting == null)
        {
            return Result<bool>.Failure(Error.NotFound("Meeting.NotFound", $"Meeting with ID {request.Id} not found"));
        }

        if (meeting.TenantId != _unitOfWork.TenantId)
        {
            return Result<bool>.Failure(Error.Forbidden("Meeting.Forbidden", "You don't have permission to delete this meeting"));
        }

        meeting.Cancel("Meeting deleted by user");
        await _unitOfWork.Meetings.UpdateAsync(meeting, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
