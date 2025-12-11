using MediatR;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Domain.Repositories;

namespace Stocker.Modules.HR.Application.Features.SuccessionPlans.Queries;

public record GetSuccessionPlanByIdQuery(int Id) : IRequest<SuccessionPlanDto?>;

public class GetSuccessionPlanByIdQueryHandler : IRequestHandler<GetSuccessionPlanByIdQuery, SuccessionPlanDto?>
{
    private readonly ISuccessionPlanRepository _repository;

    public GetSuccessionPlanByIdQueryHandler(ISuccessionPlanRepository repository)
    {
        _repository = repository;
    }

    public async System.Threading.Tasks.Task<SuccessionPlanDto?> Handle(GetSuccessionPlanByIdQuery request, CancellationToken cancellationToken)
    {
        var entity = await _repository.GetByIdAsync(request.Id, cancellationToken);
        if (entity == null) return null;

        return new SuccessionPlanDto
        {
            Id = entity.Id,
            PlanName = entity.PlanName,
            Status = entity.Status.ToString(),
            Priority = entity.Priority.ToString(),
            PositionId = entity.PositionId,
            DepartmentId = entity.DepartmentId,
            CurrentIncumbentId = entity.CurrentIncumbentId,
            IsCriticalPosition = entity.IsCriticalPosition,
            RiskLevel = entity.RiskLevel.ToString(),
            StartDate = entity.StartDate,
            TargetDate = entity.TargetDate,
            LastReviewDate = entity.LastReviewDate,
            NextReviewDate = entity.NextReviewDate,
            ExpectedVacancyDate = entity.ExpectedVacancyDate,
            VacancyReason = entity.VacancyReason?.ToString(),
            CompletionPercentage = entity.CompletionPercentage,
            HasReadyCandidate = entity.HasReadyCandidate,
            HasEmergencyBackup = entity.HasEmergencyBackup,
            RequiredCompetencies = entity.RequiredCompetencies,
            RequiredExperienceYears = entity.RequiredExperienceYears,
            RequiredCertifications = entity.RequiredCertifications,
            RequiredEducation = entity.RequiredEducation,
            CriticalSuccessFactors = entity.CriticalSuccessFactors,
            PlanOwnerId = entity.PlanOwnerId,
            HrResponsibleId = entity.HrResponsibleId,
            Description = entity.Description,
            Notes = entity.Notes,
            ExternalHiringNeeded = entity.ExternalHiringNeeded,
            Budget = entity.Budget,
            Currency = entity.Currency,
            CreatedAt = entity.CreatedDate,
            UpdatedAt = entity.UpdatedDate
        };
    }
}
