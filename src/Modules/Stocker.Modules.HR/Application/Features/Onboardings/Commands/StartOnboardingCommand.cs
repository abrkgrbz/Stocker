using MediatR;
using Stocker.Modules.HR.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Onboardings.Commands;

/// <summary>
/// Command to start an onboarding process
/// </summary>
public record StartOnboardingCommand(int OnboardingId) : IRequest<Result<bool>>;

/// <summary>
/// Handler for StartOnboardingCommand
/// </summary>
public class StartOnboardingCommandHandler : IRequestHandler<StartOnboardingCommand, Result<bool>>
{
    private readonly IHRUnitOfWork _unitOfWork;

    public StartOnboardingCommandHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(StartOnboardingCommand request, CancellationToken cancellationToken)
    {
        var onboarding = await _unitOfWork.Onboardings.GetByIdAsync(request.OnboardingId, cancellationToken);
        if (onboarding == null)
        {
            return Result<bool>.Failure(
                Error.NotFound("Onboarding", $"Onboarding with ID {request.OnboardingId} not found"));
        }

        try
        {
            onboarding.Start();
            await _unitOfWork.Onboardings.UpdateAsync(onboarding, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            return Result<bool>.Success(true);
        }
        catch (InvalidOperationException ex)
        {
            return Result<bool>.Failure(Error.Validation("Onboarding.Start", ex.Message));
        }
    }
}
