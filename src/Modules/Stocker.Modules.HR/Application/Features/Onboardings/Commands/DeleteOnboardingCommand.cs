using MediatR;
using Stocker.Modules.HR.Domain.Entities;
using Stocker.Modules.HR.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Onboardings.Commands;

/// <summary>
/// Command to delete an onboarding
/// </summary>
public record DeleteOnboardingCommand(int OnboardingId) : IRequest<Result<bool>>;

/// <summary>
/// Handler for DeleteOnboardingCommand
/// </summary>
public class DeleteOnboardingCommandHandler : IRequestHandler<DeleteOnboardingCommand, Result<bool>>
{
    private readonly IHRUnitOfWork _unitOfWork;

    public DeleteOnboardingCommandHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(DeleteOnboardingCommand request, CancellationToken cancellationToken)
    {
        // Get existing onboarding
        var onboarding = await _unitOfWork.Onboardings.GetByIdAsync(request.OnboardingId, cancellationToken);
        if (onboarding == null)
        {
            return Result<bool>.Failure(
                Error.NotFound("Onboarding", $"Onboarding with ID {request.OnboardingId} not found"));
        }

        // Check if onboarding is completed - can only delete if not completed
        if (onboarding.Status == OnboardingStatus.Completed)
        {
            return Result<bool>.Failure(
                Error.Conflict("Onboarding", "Cannot delete completed onboarding. Consider cancelling it instead."));
        }

        // Soft delete
        _unitOfWork.Onboardings.Remove(onboarding);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
