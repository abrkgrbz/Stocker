using FluentValidation;
using MediatR;
using Stocker.Modules.HR.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Onboardings.Commands;

/// <summary>
/// Command to complete an onboarding task
/// </summary>
public record CompleteOnboardingTaskCommand(int OnboardingId, int TaskId) : IRequest<Result<bool>>;

/// <summary>
/// Validator for CompleteOnboardingTaskCommand
/// </summary>
public class CompleteOnboardingTaskCommandValidator : AbstractValidator<CompleteOnboardingTaskCommand>
{
    public CompleteOnboardingTaskCommandValidator()
    {
        RuleFor(x => x.OnboardingId)
            .GreaterThan(0).WithMessage("Onboarding ID must be greater than 0");

        RuleFor(x => x.TaskId)
            .GreaterThan(0).WithMessage("Task ID must be greater than 0");
    }
}

/// <summary>
/// Handler for CompleteOnboardingTaskCommand
/// </summary>
public class CompleteOnboardingTaskCommandHandler : IRequestHandler<CompleteOnboardingTaskCommand, Result<bool>>
{
    private readonly IHRUnitOfWork _unitOfWork;

    public CompleteOnboardingTaskCommandHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(CompleteOnboardingTaskCommand request, CancellationToken cancellationToken)
    {
        var onboarding = await _unitOfWork.Onboardings.GetByIdAsync(request.OnboardingId, cancellationToken);
        if (onboarding == null)
        {
            return Result<bool>.Failure(
                Error.NotFound("Onboarding", $"Onboarding with ID {request.OnboardingId} not found"));
        }

        try
        {
            onboarding.CompleteTask(request.TaskId);
            await _unitOfWork.Onboardings.UpdateAsync(onboarding, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            return Result<bool>.Success(true);
        }
        catch (InvalidOperationException ex)
        {
            return Result<bool>.Failure(Error.Validation("Onboarding.CompleteTask", ex.Message));
        }
    }
}
