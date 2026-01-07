using MediatR;
using Stocker.Modules.HR.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Interviews.Commands;

/// <summary>
/// Command to complete an interview
/// </summary>
public record CompleteInterviewCommand(int InterviewId, int? ActualDurationMinutes = null) : IRequest<Result<bool>>;

/// <summary>
/// Handler for CompleteInterviewCommand
/// </summary>
public class CompleteInterviewCommandHandler : IRequestHandler<CompleteInterviewCommand, Result<bool>>
{
    private readonly IHRUnitOfWork _unitOfWork;

    public CompleteInterviewCommandHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(CompleteInterviewCommand request, CancellationToken cancellationToken)
    {
        var interview = await _unitOfWork.Interviews.GetByIdAsync(request.InterviewId, cancellationToken);
        if (interview == null)
        {
            return Result<bool>.Failure(
                Error.NotFound("Interview", $"Interview with ID {request.InterviewId} not found"));
        }

        try
        {
            interview.Complete(request.ActualDurationMinutes);
            await _unitOfWork.Interviews.UpdateAsync(interview, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            return Result<bool>.Success(true);
        }
        catch (InvalidOperationException ex)
        {
            return Result<bool>.Failure(Error.Validation("Interview.Complete", ex.Message));
        }
    }
}
