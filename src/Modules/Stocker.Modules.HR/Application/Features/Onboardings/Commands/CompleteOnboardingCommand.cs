using MediatR;
using Stocker.Modules.HR.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Onboardings.Commands;

/// <summary>
/// Command to complete an onboarding process
/// </summary>
public record CompleteOnboardingCommand(int OnboardingId) : IRequest<Result<bool>>;

/// <summary>
/// Handler for CompleteOnboardingCommand
/// </summary>
public class CompleteOnboardingCommandHandler : IRequestHandler<CompleteOnboardingCommand, Result<bool>>
{
    private readonly IHRUnitOfWork _unitOfWork;

    public CompleteOnboardingCommandHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(CompleteOnboardingCommand request, CancellationToken cancellationToken)
    {
        var onboarding = await _unitOfWork.Onboardings.GetByIdAsync(request.OnboardingId, cancellationToken);
        if (onboarding == null)
        {
            return Result<bool>.Failure(
                Error.NotFound("Onboarding", $"Onboarding with ID {request.OnboardingId} not found"));
        }

        try
        {
            onboarding.Complete();
            await _unitOfWork.Onboardings.UpdateAsync(onboarding, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            return Result<bool>.Success(true);
        }
        catch (InvalidOperationException ex)
        {
            return Result<bool>.Failure(Error.Validation("Onboarding.Complete", ex.Message));
        }
    }
}
