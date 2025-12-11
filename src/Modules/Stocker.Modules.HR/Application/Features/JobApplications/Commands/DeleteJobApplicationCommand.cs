using FluentValidation;
using MediatR;
using Stocker.Modules.HR.Domain.Repositories;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.JobApplications.Commands;

/// <summary>
/// Command to delete a job application
/// </summary>
public record DeleteJobApplicationCommand(
    Guid TenantId,
    int JobApplicationId) : IRequest<Result<bool>>;

/// <summary>
/// Validator for DeleteJobApplicationCommand
/// </summary>
public class DeleteJobApplicationCommandValidator : AbstractValidator<DeleteJobApplicationCommand>
{
    public DeleteJobApplicationCommandValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Tenant ID is required");

        RuleFor(x => x.JobApplicationId)
            .GreaterThan(0).WithMessage("Job Application ID must be greater than 0");
    }
}

/// <summary>
/// Handler for DeleteJobApplicationCommand
/// </summary>
public class DeleteJobApplicationCommandHandler : IRequestHandler<DeleteJobApplicationCommand, Result<bool>>
{
    private readonly IJobApplicationRepository _jobApplicationRepository;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteJobApplicationCommandHandler(
        IJobApplicationRepository jobApplicationRepository,
        IUnitOfWork unitOfWork)
    {
        _jobApplicationRepository = jobApplicationRepository;
        _unitOfWork = unitOfWork;
    }

    public async System.Threading.Tasks.Task<Result<bool>> Handle(DeleteJobApplicationCommand request, CancellationToken cancellationToken)
    {
        // Get existing job application
        var jobApplication = await _jobApplicationRepository.GetByIdAsync(request.JobApplicationId, cancellationToken);
        if (jobApplication == null)
        {
            return Result<bool>.Failure(
                Error.NotFound("JobApplication", $"Job Application with ID {request.JobApplicationId} not found"));
        }

        // Remove job application
        _jobApplicationRepository.Remove(jobApplication);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
