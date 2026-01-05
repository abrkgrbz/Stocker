using MediatR;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Onboardings.Queries;

public record GetOnboardingsQuery(int? EmployeeId = null, bool ActiveOnly = false) : IRequest<Result<List<OnboardingDto>>>;

public class GetOnboardingsQueryHandler : IRequestHandler<GetOnboardingsQuery, Result<List<OnboardingDto>>>
{
    private readonly IHRUnitOfWork _unitOfWork;

    public GetOnboardingsQueryHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<List<OnboardingDto>>> Handle(GetOnboardingsQuery request, CancellationToken cancellationToken)
    {
        var entities = await _unitOfWork.Onboardings.GetAllAsync(cancellationToken);

        if (request.EmployeeId.HasValue)
        {
            entities = entities.Where(o => o.EmployeeId == request.EmployeeId.Value).ToList();
        }

        if (request.ActiveOnly)
        {
            entities = entities.Where(o =>
                o.Status != Domain.Entities.OnboardingStatus.Completed &&
                o.Status != Domain.Entities.OnboardingStatus.Cancelled).ToList();
        }

        var dtos = entities.Select(e => new OnboardingDto
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

        return Result<List<OnboardingDto>>.Success(dtos);
    }
}
