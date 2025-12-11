using MediatR;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Domain.Repositories;

namespace Stocker.Modules.HR.Application.Features.Onboardings.Queries;

public record GetOnboardingsQuery() : IRequest<List<OnboardingDto>>;

public class GetOnboardingsQueryHandler : IRequestHandler<GetOnboardingsQuery, List<OnboardingDto>>
{
    private readonly IOnboardingRepository _repository;

    public GetOnboardingsQueryHandler(IOnboardingRepository repository)
    {
        _repository = repository;
    }

    public async System.Threading.Tasks.Task<List<OnboardingDto>> Handle(GetOnboardingsQuery request, CancellationToken cancellationToken)
    {
        var entities = await _repository.GetAllAsync(cancellationToken);
        return entities.Select(e => new OnboardingDto
        {
            Id = e.Id,
            EmployeeId = e.EmployeeId,
            Status = e.Status.ToString(),
            TemplateId = e.TemplateId,
            StartDate = e.StartDate,
            PlannedEndDate = e.PlannedEndDate,
            ActualEndDate = e.ActualEndDate,
            FirstDayOfWork = e.FirstDayOfWork,
            BuddyId = e.BuddyId,
            HrResponsibleId = e.HrResponsibleId,
            ItResponsibleId = e.ItResponsibleId,
            CompletionPercentage = e.CompletionPercentage,
            TotalTasks = e.TotalTasks,
            CompletedTasks = e.CompletedTasks,
            LaptopProvided = e.LaptopProvided,
            PhoneProvided = e.PhoneProvided,
            AccessCardProvided = e.AccessCardProvided,
            EquipmentNotes = e.EquipmentNotes,
            EmailAccountCreated = e.EmailAccountCreated,
            AdAccountCreated = e.AdAccountCreated,
            SystemAccessGranted = e.SystemAccessGranted,
            VpnAccessGranted = e.VpnAccessGranted,
            ContractSigned = e.ContractSigned,
            NdaSigned = e.NdaSigned,
            PoliciesAcknowledged = e.PoliciesAcknowledged,
            BankDetailsReceived = e.BankDetailsReceived,
            EmergencyContactReceived = e.EmergencyContactReceived,
            OrientationCompleted = e.OrientationCompleted,
            SafetyTrainingCompleted = e.SafetyTrainingCompleted,
            ComplianceTrainingCompleted = e.ComplianceTrainingCompleted,
            ProductTrainingCompleted = e.ProductTrainingCompleted,
            Week1FeedbackReceived = e.Week1FeedbackReceived,
            Month1FeedbackReceived = e.Month1FeedbackReceived,
            Month3FeedbackReceived = e.Month3FeedbackReceived,
            EmployeeFeedback = e.EmployeeFeedback,
            ManagerFeedback = e.ManagerFeedback,
            WelcomeKitSent = e.WelcomeKitSent,
            DeskPrepared = e.DeskPrepared,
            TeamIntroductionDone = e.TeamIntroductionDone,
            Notes = e.Notes,
            CreatedAt = e.CreatedDate,
            UpdatedAt = e.UpdatedDate
        }).ToList();
    }
}
