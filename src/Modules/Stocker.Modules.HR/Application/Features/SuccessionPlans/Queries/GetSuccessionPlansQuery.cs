using MediatR;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Domain.Repositories;

namespace Stocker.Modules.HR.Application.Features.SuccessionPlans.Queries;

public record GetSuccessionPlansQuery() : IRequest<List<SuccessionPlanDto>>;

public class GetSuccessionPlansQueryHandler : IRequestHandler<GetSuccessionPlansQuery, List<SuccessionPlanDto>>
{
    private readonly ISuccessionPlanRepository _repository;

    public GetSuccessionPlansQueryHandler(ISuccessionPlanRepository repository)
    {
        _repository = repository;
    }

    public async System.Threading.Tasks.Task<List<SuccessionPlanDto>> Handle(GetSuccessionPlansQuery request, CancellationToken cancellationToken)
    {
        var entities = await _repository.GetAllAsync(cancellationToken);
        return entities.Select(e => new SuccessionPlanDto
        {
            Id = e.Id,
            PlanName = e.PlanName,
            Status = e.Status.ToString(),
            Priority = e.Priority.ToString(),
            PositionId = e.PositionId,
            DepartmentId = e.DepartmentId,
            CurrentIncumbentId = e.CurrentIncumbentId,
            IsCriticalPosition = e.IsCriticalPosition,
            RiskLevel = e.RiskLevel.ToString(),
            StartDate = e.StartDate,
            TargetDate = e.TargetDate,
            LastReviewDate = e.LastReviewDate,
            NextReviewDate = e.NextReviewDate,
            ExpectedVacancyDate = e.ExpectedVacancyDate,
            VacancyReason = e.VacancyReason?.ToString(),
            CompletionPercentage = e.CompletionPercentage,
            HasReadyCandidate = e.HasReadyCandidate,
            HasEmergencyBackup = e.HasEmergencyBackup,
            RequiredCompetencies = e.RequiredCompetencies,
            RequiredExperienceYears = e.RequiredExperienceYears,
            RequiredCertifications = e.RequiredCertifications,
            RequiredEducation = e.RequiredEducation,
            CriticalSuccessFactors = e.CriticalSuccessFactors,
            PlanOwnerId = e.PlanOwnerId,
            HrResponsibleId = e.HrResponsibleId,
            Description = e.Description,
            Notes = e.Notes,
            ExternalHiringNeeded = e.ExternalHiringNeeded,
            Budget = e.Budget,
            Currency = e.Currency,
            CreatedAt = e.CreatedDate,
            UpdatedAt = e.UpdatedDate
        }).ToList();
    }
}
