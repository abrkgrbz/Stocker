using FluentValidation;
using MediatR;
using Stocker.Modules.HR.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.JobPostings.Commands;

/// <summary>
/// Command to delete a job posting
/// </summary>
public record DeleteJobPostingCommand(int JobPostingId) : IRequest<Result<bool>>;

/// <summary>
/// Validator for DeleteJobPostingCommand
/// </summary>
public class DeleteJobPostingCommandValidator : AbstractValidator<DeleteJobPostingCommand>
{
    public DeleteJobPostingCommandValidator()
    {
        RuleFor(x => x.JobPostingId)
            .GreaterThan(0).WithMessage("Job Posting ID must be greater than 0");
    }
}

/// <summary>
/// Handler for DeleteJobPostingCommand
/// </summary>
public class DeleteJobPostingCommandHandler : IRequestHandler<DeleteJobPostingCommand, Result<bool>>
{
    private readonly IHRUnitOfWork _unitOfWork;

    public DeleteJobPostingCommandHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(DeleteJobPostingCommand request, CancellationToken cancellationToken)
    {
        // Get existing job posting
        var jobPosting = await _unitOfWork.JobPostings.GetByIdAsync(request.JobPostingId, cancellationToken);
        if (jobPosting == null)
        {
            return Result<bool>.Failure(
                Error.NotFound("JobPosting", $"Job Posting with ID {request.JobPostingId} not found"));
        }

        // Check if there are active applications
        if (jobPosting.TotalApplications > 0)
        {
            return Result<bool>.Failure(
                Error.Conflict("JobPosting", $"Cannot delete job posting with {jobPosting.TotalApplications} applications. Please close or cancel the posting instead."));
        }

        // Remove job posting
        _unitOfWork.JobPostings.Remove(jobPosting);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
