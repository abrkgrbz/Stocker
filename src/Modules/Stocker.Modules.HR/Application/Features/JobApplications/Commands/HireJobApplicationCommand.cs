using FluentValidation;
using MediatR;
using Stocker.Modules.HR.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.JobApplications.Commands;

/// <summary>
/// Command to hire a job applicant (accept offer)
/// </summary>
public record HireJobApplicationCommand(int JobApplicationId, DateTime HireDate) : IRequest<Result<bool>>;

/// <summary>
/// Validator for HireJobApplicationCommand
/// </summary>
public class HireJobApplicationCommandValidator : AbstractValidator<HireJobApplicationCommand>
{
    public HireJobApplicationCommandValidator()
    {
        RuleFor(x => x.JobApplicationId)
            .GreaterThan(0).WithMessage("Job Application ID must be greater than 0");

        RuleFor(x => x.HireDate)
            .NotEmpty().WithMessage("Hire date is required");
    }
}

/// <summary>
/// Handler for HireJobApplicationCommand
/// </summary>
public class HireJobApplicationCommandHandler : IRequestHandler<HireJobApplicationCommand, Result<bool>>
{
    private readonly IHRUnitOfWork _unitOfWork;

    public HireJobApplicationCommandHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(HireJobApplicationCommand request, CancellationToken cancellationToken)
    {
        var jobApplication = await _unitOfWork.JobApplications.GetByIdAsync(request.JobApplicationId, cancellationToken);
        if (jobApplication == null)
        {
            return Result<bool>.Failure(
                Error.NotFound("JobApplication", $"Job Application with ID {request.JobApplicationId} not found"));
        }

        try
        {
            jobApplication.AcceptOffer(request.HireDate);
            await _unitOfWork.JobApplications.UpdateAsync(jobApplication, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            return Result<bool>.Success(true);
        }
        catch (InvalidOperationException ex)
        {
            return Result<bool>.Failure(Error.Validation("JobApplication.Hire", ex.Message));
        }
    }
}
