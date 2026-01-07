using MediatR;
using Stocker.Modules.HR.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.JobPostings.Commands;

/// <summary>
/// Command to close a job posting
/// </summary>
public record CloseJobPostingCommand(int JobPostingId, string? Reason = null) : IRequest<Result<bool>>;

/// <summary>
/// Handler for CloseJobPostingCommand
/// </summary>
public class CloseJobPostingCommandHandler : IRequestHandler<CloseJobPostingCommand, Result<bool>>
{
    private readonly IHRUnitOfWork _unitOfWork;

    public CloseJobPostingCommandHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(CloseJobPostingCommand request, CancellationToken cancellationToken)
    {
        var jobPosting = await _unitOfWork.JobPostings.GetByIdAsync(request.JobPostingId, cancellationToken);
        if (jobPosting == null)
        {
            return Result<bool>.Failure(
                Error.NotFound("JobPosting", $"Job Posting with ID {request.JobPostingId} not found"));
        }

        jobPosting.Close(request.Reason);
        await _unitOfWork.JobPostings.UpdateAsync(jobPosting, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
