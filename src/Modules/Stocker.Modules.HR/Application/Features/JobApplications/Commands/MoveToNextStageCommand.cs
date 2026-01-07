using FluentValidation;
using MediatR;
using Stocker.Modules.HR.Domain.Entities;
using Stocker.Modules.HR.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.JobApplications.Commands;

/// <summary>
/// Command to move a job application to the next stage
/// </summary>
public record MoveToNextStageCommand(int JobApplicationId, string Stage) : IRequest<Result<bool>>;

/// <summary>
/// Validator for MoveToNextStageCommand
/// </summary>
public class MoveToNextStageCommandValidator : AbstractValidator<MoveToNextStageCommand>
{
    public MoveToNextStageCommandValidator()
    {
        RuleFor(x => x.JobApplicationId)
            .GreaterThan(0).WithMessage("Job Application ID must be greater than 0");

        RuleFor(x => x.Stage)
            .NotEmpty().WithMessage("Stage is required");
    }
}

/// <summary>
/// Handler for MoveToNextStageCommand
/// </summary>
public class MoveToNextStageCommandHandler : IRequestHandler<MoveToNextStageCommand, Result<bool>>
{
    private readonly IHRUnitOfWork _unitOfWork;

    public MoveToNextStageCommandHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(MoveToNextStageCommand request, CancellationToken cancellationToken)
    {
        var jobApplication = await _unitOfWork.JobApplications.GetByIdAsync(request.JobApplicationId, cancellationToken);
        if (jobApplication == null)
        {
            return Result<bool>.Failure(
                Error.NotFound("JobApplication", $"Job Application with ID {request.JobApplicationId} not found"));
        }

        if (!Enum.TryParse<ApplicationStage>(request.Stage, true, out var stage))
        {
            return Result<bool>.Failure(
                Error.Validation("JobApplication.Stage", $"Invalid stage: {request.Stage}"));
        }

        try
        {
            jobApplication.MoveToStage(stage);
            await _unitOfWork.JobApplications.UpdateAsync(jobApplication, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            return Result<bool>.Success(true);
        }
        catch (InvalidOperationException ex)
        {
            return Result<bool>.Failure(Error.Validation("JobApplication.MoveToStage", ex.Message));
        }
    }
}
