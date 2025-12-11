using MediatR;
using Stocker.Modules.CRM.Domain.Repositories;
using Stocker.Modules.CRM.Infrastructure.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Meetings.Commands;

public class DeleteMeetingCommandHandler : IRequestHandler<DeleteMeetingCommand, Result<bool>>
{
    private readonly IMeetingRepository _repository;
    private readonly SharedKernel.Interfaces.IUnitOfWork _unitOfWork;

    public DeleteMeetingCommandHandler(
        IMeetingRepository repository,
        SharedKernel.Interfaces.IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async System.Threading.Tasks.Task<Result<bool>> Handle(DeleteMeetingCommand request, CancellationToken cancellationToken)
    {
        var meeting = await _repository.GetByIdAsync(request.Id, cancellationToken);

        if (meeting == null)
        {
            return Result<bool>.Failure(Error.NotFound("Meeting.NotFound", $"Meeting with ID {request.Id} not found"));
        }

        if (meeting.TenantId != request.TenantId)
        {
            return Result<bool>.Failure(Error.Forbidden("Meeting.Forbidden", "You don't have permission to delete this meeting"));
        }

        meeting.Cancel("Meeting deleted by user");
        await _repository.UpdateAsync(meeting, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
