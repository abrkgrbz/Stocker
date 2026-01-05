using MediatR;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Onboardings.Queries;

public record GetOnboardingByIdQuery(int Id) : IRequest<Result<OnboardingDto>>;

public class GetOnboardingByIdQueryHandler : IRequestHandler<GetOnboardingByIdQuery, Result<OnboardingDto>>
{
    private readonly IHRUnitOfWork _unitOfWork;

    public GetOnboardingByIdQueryHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<OnboardingDto>> Handle(GetOnboardingByIdQuery request, CancellationToken cancellationToken)
    {
        var entity = await _unitOfWork.Onboardings.GetByIdAsync(request.Id, cancellationToken);
        if (entity == null)
        {
            return Result<OnboardingDto>.Failure(
                Error.NotFound("Onboarding", $"Onboarding with ID {request.Id} not found"));
        }

        var dto = new OnboardingDto
        {
            Id = entity.Id,
            EmployeeId = entity.EmployeeId,
            Status = entity.Status.ToString(),
            TemplateId = entity.TemplateId,
            StartDate = entity.StartDate,
            PlannedEndDate = entity.PlannedEndDate,
            ActualEndDate = entity.ActualEndDate,
            FirstDayOfWork = entity.FirstDayOfWork,
            BuddyId = entity.BuddyId,
            HrResponsibleId = entity.HrResponsibleId,
            ItResponsibleId = entity.ItResponsibleId,
            CompletionPercentage = entity.CompletionPercentage,
            TotalTasks = entity.TotalTasks,
            CompletedTasks = entity.CompletedTasks,
            LaptopProvided = entity.LaptopProvided,
            PhoneProvided = entity.PhoneProvided,
            AccessCardProvided = entity.AccessCardProvided,
            EquipmentNotes = entity.EquipmentNotes,
            EmailAccountCreated = entity.EmailAccountCreated,
            AdAccountCreated = entity.AdAccountCreated,
            SystemAccessGranted = entity.SystemAccessGranted,
            VpnAccessGranted = entity.VpnAccessGranted,
            ContractSigned = entity.ContractSigned,
            NdaSigned = entity.NdaSigned,
            PoliciesAcknowledged = entity.PoliciesAcknowledged,
            BankDetailsReceived = entity.BankDetailsReceived,
            EmergencyContactReceived = entity.EmergencyContactReceived,
            OrientationCompleted = entity.OrientationCompleted,
            SafetyTrainingCompleted = entity.SafetyTrainingCompleted,
            ComplianceTrainingCompleted = entity.ComplianceTrainingCompleted,
            ProductTrainingCompleted = entity.ProductTrainingCompleted,
            Week1FeedbackReceived = entity.Week1FeedbackReceived,
            Month1FeedbackReceived = entity.Month1FeedbackReceived,
            Month3FeedbackReceived = entity.Month3FeedbackReceived,
            EmployeeFeedback = entity.EmployeeFeedback,
            ManagerFeedback = entity.ManagerFeedback,
            WelcomeKitSent = entity.WelcomeKitSent,
            DeskPrepared = entity.DeskPrepared,
            TeamIntroductionDone = entity.TeamIntroductionDone,
            Notes = entity.Notes,
            CreatedAt = entity.CreatedDate,
            UpdatedAt = entity.UpdatedDate
        };

        return Result<OnboardingDto>.Success(dto);
    }
}
