using MediatR;
using Stocker.Modules.HR.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Onboardings.Commands;

/// <summary>
/// Command to update an onboarding
/// </summary>
public record UpdateOnboardingCommand : IRequest<Result<bool>>
{
    public int OnboardingId { get; init; }
    public DateTime? PlannedEndDate { get; init; }
    public int? BuddyId { get; init; }
    public int? HrResponsibleId { get; init; }
    public int? ItResponsibleId { get; init; }
    public string? EquipmentNotes { get; init; }
    public string? EmployeeFeedback { get; init; }
    public string? ManagerFeedback { get; init; }
    public string? Notes { get; init; }
}

/// <summary>
/// Handler for UpdateOnboardingCommand
/// </summary>
public class UpdateOnboardingCommandHandler : IRequestHandler<UpdateOnboardingCommand, Result<bool>>
{
    private readonly IHRUnitOfWork _unitOfWork;

    public UpdateOnboardingCommandHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(UpdateOnboardingCommand request, CancellationToken cancellationToken)
    {
        // Get existing onboarding
        var onboarding = await _unitOfWork.Onboardings.GetByIdAsync(request.OnboardingId, cancellationToken);
        if (onboarding == null)
        {
            return Result<bool>.Failure(
                Error.NotFound("Onboarding", $"Onboarding with ID {request.OnboardingId} not found"));
        }

        // Verify buddy exists if specified
        if (request.BuddyId.HasValue)
        {
            var buddy = await _unitOfWork.Employees.GetByIdAsync(request.BuddyId.Value, cancellationToken);
            if (buddy == null)
            {
                return Result<bool>.Failure(
                    Error.NotFound("Employee", $"Buddy with ID {request.BuddyId} not found"));
            }
        }

        // Update the onboarding
        if (request.PlannedEndDate.HasValue)
            onboarding.SetPlannedEndDate(request.PlannedEndDate.Value);

        if (request.BuddyId.HasValue)
            onboarding.SetBuddy(request.BuddyId);

        if (request.HrResponsibleId.HasValue)
            onboarding.SetHrResponsible(request.HrResponsibleId);

        if (request.ItResponsibleId.HasValue)
            onboarding.SetItResponsible(request.ItResponsibleId);

        if (!string.IsNullOrEmpty(request.EquipmentNotes))
            onboarding.SetEquipmentNotes(request.EquipmentNotes);

        if (!string.IsNullOrEmpty(request.ManagerFeedback))
            onboarding.SetManagerFeedback(request.ManagerFeedback);

        if (!string.IsNullOrEmpty(request.Notes))
            onboarding.SetNotes(request.Notes);

        // Save changes
        _unitOfWork.Onboardings.Update(onboarding);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
