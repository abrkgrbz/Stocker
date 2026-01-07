using MediatR;
using Stocker.Modules.HR.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.JobPostings.Commands;

/// <summary>
/// Command to publish a job posting
/// </summary>
public record PublishJobPostingCommand(int JobPostingId) : IRequest<Result<bool>>;

/// <summary>
/// Handler for PublishJobPostingCommand
/// </summary>
public class PublishJobPostingCommandHandler : IRequestHandler<PublishJobPostingCommand, Result<bool>>
{
    private readonly IHRUnitOfWork _unitOfWork;

    public PublishJobPostingCommandHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(PublishJobPostingCommand request, CancellationToken cancellationToken)
    {
        var jobPosting = await _unitOfWork.JobPostings.GetByIdAsync(request.JobPostingId, cancellationToken);
        if (jobPosting == null)
        {
            return Result<bool>.Failure(
                Error.NotFound("JobPosting", $"Job Posting with ID {request.JobPostingId} not found"));
        }

        try
        {
            jobPosting.Publish();
            await _unitOfWork.JobPostings.UpdateAsync(jobPosting, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            return Result<bool>.Success(true);
        }
        catch (InvalidOperationException ex)
        {
            return Result<bool>.Failure(Error.Validation("JobPosting.Status", ex.Message));
        }
    }
}
