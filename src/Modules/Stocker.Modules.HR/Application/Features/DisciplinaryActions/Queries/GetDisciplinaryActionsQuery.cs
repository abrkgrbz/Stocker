using MediatR;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Interfaces;

namespace Stocker.Modules.HR.Application.Features.DisciplinaryActions.Queries;

public record GetDisciplinaryActionsQuery() : IRequest<List<DisciplinaryActionDto>>;

public class GetDisciplinaryActionsQueryHandler : IRequestHandler<GetDisciplinaryActionsQuery, List<DisciplinaryActionDto>>
{
    private readonly IHRUnitOfWork _unitOfWork;

    public GetDisciplinaryActionsQueryHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<List<DisciplinaryActionDto>> Handle(GetDisciplinaryActionsQuery request, CancellationToken cancellationToken)
    {
        var entities = await _unitOfWork.DisciplinaryActions.GetAllAsync(cancellationToken);
        return entities.Select(entity => new DisciplinaryActionDto
        {
            Id = entity.Id,
            EmployeeId = entity.EmployeeId,
            EmployeeName = entity.Employee?.FullName ?? string.Empty,
            ActionCode = entity.ActionCode,
            ActionType = entity.ActionType.ToString(),
            Status = entity.Status.ToString(),
            SeverityLevel = entity.SeverityLevel.ToString(),

            // Incident Information
            IncidentDate = entity.IncidentDate,
            IncidentLocation = entity.IncidentLocation,
            IncidentDescription = entity.IncidentDescription,
            ViolatedPolicy = entity.ViolatedPolicy,
            Witnesses = entity.Witnesses,
            Evidence = entity.Evidence,

            // Investigation
            InvestigationStartDate = entity.InvestigationStartDate,
            InvestigationEndDate = entity.InvestigationEndDate,
            InvestigatorId = entity.InvestigatorId,
            InvestigatorName = entity.Investigator?.FullName,
            InvestigationNotes = entity.InvestigationNotes,
            InvestigationFindings = entity.InvestigationFindings,

            // Defense
            DefenseRequested = entity.DefenseRequested,
            DefenseDeadline = entity.DefenseDeadline,
            DefenseReceived = entity.DefenseReceived,
            DefenseDate = entity.DefenseDate,
            DefenseText = entity.DefenseText,

            // Decision
            DecisionDate = entity.DecisionDate,
            DecisionMakerId = entity.DecisionMakerId,
            DecisionMakerName = entity.DecisionMaker?.FullName,
            Decision = entity.Decision,
            DecisionRationale = entity.DecisionRationale,

            // Applied Sanction
            AppliedSanction = entity.AppliedSanction?.ToString(),
            SanctionDetails = entity.SanctionDetails,
            SanctionStartDate = entity.SanctionStartDate,
            SanctionEndDate = entity.SanctionEndDate,
            SanctionDurationDays = entity.SanctionDurationDays,
            SalaryDeductionAmount = entity.SalaryDeductionAmount,
            Currency = entity.Currency,

            // Follow-up
            FollowUpRequired = entity.FollowUpRequired,
            FollowUpDate = entity.FollowUpDate,
            FollowUpNotes = entity.FollowUpNotes,
            HasPerformanceImprovementPlan = entity.HasPerformanceImprovementPlan,
            PerformanceImprovementPlanId = entity.PerformanceImprovementPlanId,

            // Appeal
            WasAppealed = entity.WasAppealed,
            AppealDate = entity.AppealDate,
            AppealOutcome = entity.AppealOutcome?.ToString(),
            AppealNotes = entity.AppealNotes,

            // Additional Information
            ReportedById = entity.ReportedById,
            ReportedByName = entity.ReportedBy?.FullName,
            HrRepresentativeId = entity.HrRepresentativeId,
            HrRepresentativeName = entity.HrRepresentative?.FullName,
            IsConfidential = entity.IsConfidential,
            PreviousWarningsCount = entity.PreviousWarningsCount,
            InternalNotes = entity.InternalNotes,

            IsActive = !entity.IsDeleted,
            CreatedAt = entity.CreatedDate,
            UpdatedAt = entity.UpdatedDate
        }).ToList();
    }
}
