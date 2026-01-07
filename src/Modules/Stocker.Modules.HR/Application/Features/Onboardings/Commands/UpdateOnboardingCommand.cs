using MediatR;
using Stocker.Modules.HR.Domain.Entities;
using Stocker.Modules.HR.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Onboardings.Commands;

/// <summary>
/// Command to update an onboarding
/// </summary>
public record UpdateOnboardingCommand : IRequest<Result<bool>>
{
    public int OnboardingId { get; init; }
    public string? Status { get; init; }
    public DateTime? PlannedEndDate { get; init; }
    public DateTime? ActualEndDate { get; init; }
    public int? BuddyId { get; init; }
    public int? HrResponsibleId { get; init; }
    public int? ItResponsibleId { get; init; }
    // Equipment
    public bool? LaptopProvided { get; init; }
    public bool? PhoneProvided { get; init; }
    public bool? AccessCardProvided { get; init; }
    public string? EquipmentNotes { get; init; }
    // IT Setup
    public bool? EmailAccountCreated { get; init; }
    public bool? AdAccountCreated { get; init; }
    public bool? SystemAccessGranted { get; init; }
    public bool? VpnAccessGranted { get; init; }
    // Documents
    public bool? ContractSigned { get; init; }
    public bool? NdaSigned { get; init; }
    public bool? PoliciesAcknowledged { get; init; }
    public bool? BankDetailsReceived { get; init; }
    public bool? EmergencyContactReceived { get; init; }
    // Training
    public bool? OrientationCompleted { get; init; }
    public bool? SafetyTrainingCompleted { get; init; }
    public bool? ComplianceTrainingCompleted { get; init; }
    public bool? ProductTrainingCompleted { get; init; }
    // Feedback
    public bool? Week1FeedbackReceived { get; init; }
    public bool? Month1FeedbackReceived { get; init; }
    public bool? Month3FeedbackReceived { get; init; }
    public string? EmployeeFeedback { get; init; }
    public string? ManagerFeedback { get; init; }
    // Other
    public bool? WelcomeKitSent { get; init; }
    public bool? DeskPrepared { get; init; }
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

        // Update status if specified
        if (!string.IsNullOrEmpty(request.Status))
        {
            if (Enum.TryParse<OnboardingStatus>(request.Status, true, out var status))
            {
                switch (status)
                {
                    case OnboardingStatus.InProgress:
                        onboarding.Start();
                        break;
                    case OnboardingStatus.Completed:
                        onboarding.Complete();
                        break;
                    case OnboardingStatus.Cancelled:
                        onboarding.Cancel();
                        break;
                }
            }
        }

        // Update dates
        if (request.PlannedEndDate.HasValue)
            onboarding.SetPlannedEndDate(request.PlannedEndDate.Value);

        if (request.ActualEndDate.HasValue)
            onboarding.SetActualEndDate(request.ActualEndDate.Value);

        // Update assignments
        if (request.BuddyId.HasValue)
            onboarding.SetBuddy(request.BuddyId);

        if (request.HrResponsibleId.HasValue)
            onboarding.SetHrResponsible(request.HrResponsibleId);

        if (request.ItResponsibleId.HasValue)
            onboarding.SetItResponsible(request.ItResponsibleId);

        // Update equipment
        if (request.LaptopProvided.HasValue)
            onboarding.SetLaptopProvided(request.LaptopProvided.Value);

        if (request.PhoneProvided.HasValue)
            onboarding.SetPhoneProvided(request.PhoneProvided.Value);

        if (request.AccessCardProvided.HasValue)
            onboarding.SetAccessCardProvided(request.AccessCardProvided.Value);

        if (!string.IsNullOrEmpty(request.EquipmentNotes))
            onboarding.SetEquipmentNotes(request.EquipmentNotes);

        // Update IT setup
        if (request.EmailAccountCreated.HasValue)
            onboarding.SetEmailAccountCreated(request.EmailAccountCreated.Value);

        if (request.AdAccountCreated.HasValue)
            onboarding.SetAdAccountCreated(request.AdAccountCreated.Value);

        if (request.SystemAccessGranted.HasValue)
            onboarding.SetSystemAccessGranted(request.SystemAccessGranted.Value);

        if (request.VpnAccessGranted.HasValue)
            onboarding.SetVpnAccessGranted(request.VpnAccessGranted.Value);

        // Update documents
        if (request.ContractSigned.HasValue)
            onboarding.SetContractSigned(request.ContractSigned.Value);

        if (request.NdaSigned.HasValue)
            onboarding.SetNdaSigned(request.NdaSigned.Value);

        if (request.PoliciesAcknowledged.HasValue)
            onboarding.SetPoliciesAcknowledged(request.PoliciesAcknowledged.Value);

        if (request.BankDetailsReceived.HasValue)
            onboarding.SetBankDetailsReceived(request.BankDetailsReceived.Value);

        if (request.EmergencyContactReceived.HasValue)
            onboarding.SetEmergencyContactReceived(request.EmergencyContactReceived.Value);

        // Update training
        if (request.OrientationCompleted.HasValue)
            onboarding.SetOrientationCompleted(request.OrientationCompleted.Value);

        if (request.SafetyTrainingCompleted.HasValue)
            onboarding.SetSafetyTrainingCompleted(request.SafetyTrainingCompleted.Value);

        if (request.ComplianceTrainingCompleted.HasValue)
            onboarding.SetComplianceTrainingCompleted(request.ComplianceTrainingCompleted.Value);

        if (request.ProductTrainingCompleted.HasValue)
            onboarding.SetProductTrainingCompleted(request.ProductTrainingCompleted.Value);

        // Update feedback
        if (request.Week1FeedbackReceived.HasValue)
            onboarding.SetWeek1FeedbackReceived(request.Week1FeedbackReceived.Value);

        if (request.Month1FeedbackReceived.HasValue)
            onboarding.SetMonth1FeedbackReceived(request.Month1FeedbackReceived.Value);

        if (request.Month3FeedbackReceived.HasValue)
            onboarding.SetMonth3FeedbackReceived(request.Month3FeedbackReceived.Value);

        if (!string.IsNullOrEmpty(request.EmployeeFeedback))
            onboarding.SetEmployeeFeedback(request.EmployeeFeedback);

        if (!string.IsNullOrEmpty(request.ManagerFeedback))
            onboarding.SetManagerFeedback(request.ManagerFeedback);

        // Update other
        if (request.WelcomeKitSent.HasValue)
            onboarding.SetWelcomeKitSent(request.WelcomeKitSent.Value);

        if (request.DeskPrepared.HasValue)
            onboarding.SetDeskPrepared(request.DeskPrepared.Value);

        if (!string.IsNullOrEmpty(request.Notes))
            onboarding.SetNotes(request.Notes);

        // Save changes
        _unitOfWork.Onboardings.Update(onboarding);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
