using FluentValidation;
using MediatR;
using Stocker.Modules.HR.Domain.Entities;
using Stocker.Modules.HR.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.JobApplications.Commands;

/// <summary>
/// Command to reject a job application
/// </summary>
public record RejectJobApplicationCommand(int JobApplicationId, string Reason, string Category) : IRequest<Result<bool>>;

/// <summary>
/// Validator for RejectJobApplicationCommand
/// </summary>
public class RejectJobApplicationCommandValidator : AbstractValidator<RejectJobApplicationCommand>
{
    public RejectJobApplicationCommandValidator()
    {
        RuleFor(x => x.JobApplicationId)
            .GreaterThan(0).WithMessage("Job Application ID must be greater than 0");

        RuleFor(x => x.Reason)
            .NotEmpty().WithMessage("Rejection reason is required")
            .MaximumLength(1000).WithMessage("Rejection reason must not exceed 1000 characters");

        RuleFor(x => x.Category)
            .NotEmpty().WithMessage("Rejection category is required");
    }
}

/// <summary>
/// Handler for RejectJobApplicationCommand
/// </summary>
public class RejectJobApplicationCommandHandler : IRequestHandler<RejectJobApplicationCommand, Result<bool>>
{
    private readonly IHRUnitOfWork _unitOfWork;

    public RejectJobApplicationCommandHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(RejectJobApplicationCommand request, CancellationToken cancellationToken)
    {
        var jobApplication = await _unitOfWork.JobApplications.GetByIdAsync(request.JobApplicationId, cancellationToken);
        if (jobApplication == null)
        {
            return Result<bool>.Failure(
                Error.NotFound("JobApplication", $"Job Application with ID {request.JobApplicationId} not found"));
        }

        if (!Enum.TryParse<RejectionCategory>(request.Category, true, out var category))
        {
            return Result<bool>.Failure(
                Error.Validation("JobApplication.Category", $"Invalid rejection category: {request.Category}"));
        }

        try
        {
            jobApplication.Reject(request.Reason, category);
            await _unitOfWork.JobApplications.UpdateAsync(jobApplication, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            return Result<bool>.Success(true);
        }
        catch (InvalidOperationException ex)
        {
            return Result<bool>.Failure(Error.Validation("JobApplication.Reject", ex.Message));
        }
    }
}
