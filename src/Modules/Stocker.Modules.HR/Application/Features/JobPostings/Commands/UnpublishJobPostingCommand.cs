using MediatR;
using Stocker.Modules.HR.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.JobPostings.Commands;

/// <summary>
/// Command to unpublish a job posting (put on hold)
/// </summary>
public record UnpublishJobPostingCommand(int JobPostingId) : IRequest<Result<bool>>;

/// <summary>
/// Handler for UnpublishJobPostingCommand
/// </summary>
public class UnpublishJobPostingCommandHandler : IRequestHandler<UnpublishJobPostingCommand, Result<bool>>
{
    private readonly IHRUnitOfWork _unitOfWork;

    public UnpublishJobPostingCommandHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(UnpublishJobPostingCommand request, CancellationToken cancellationToken)
    {
        var jobPosting = await _unitOfWork.JobPostings.GetByIdAsync(request.JobPostingId, cancellationToken);
        if (jobPosting == null)
        {
            return Result<bool>.Failure(
                Error.NotFound("JobPosting", $"Job Posting with ID {request.JobPostingId} not found"));
        }

        jobPosting.PutOnHold();
        await _unitOfWork.JobPostings.UpdateAsync(jobPosting, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
