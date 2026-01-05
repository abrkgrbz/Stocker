using MediatR;
using Stocker.Modules.HR.Domain.Entities;
using Stocker.Modules.HR.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.SuccessionPlans.Commands;

/// <summary>
/// Command to update a succession plan
/// </summary>
public record UpdateSuccessionPlanCommand : IRequest<Result<bool>>
{
    public int SuccessionPlanId { get; init; }
    public SuccessionPriority? Priority { get; init; }
    public int? CurrentIncumbentId { get; init; }
    public int? PlanOwnerId { get; init; }
    public int? HrResponsibleId { get; init; }
    public DateTime? TargetDate { get; init; }
    public DateTime? ExpectedVacancyDate { get; init; }
    public VacancyReason? VacancyReason { get; init; }
    public string? Description { get; init; }
    public string? RequiredCompetencies { get; init; }
    public int? RequiredExperienceYears { get; init; }
    public string? RequiredCertifications { get; init; }
    public string? RequiredEducation { get; init; }
    public string? CriticalSuccessFactors { get; init; }
    public string? Notes { get; init; }
    public decimal? Budget { get; init; }
    public bool? ExternalHiringNeeded { get; init; }
}

/// <summary>
/// Handler for UpdateSuccessionPlanCommand
/// </summary>
public class UpdateSuccessionPlanCommandHandler : IRequestHandler<UpdateSuccessionPlanCommand, Result<bool>>
{
    private readonly IHRUnitOfWork _unitOfWork;

    public UpdateSuccessionPlanCommandHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(UpdateSuccessionPlanCommand request, CancellationToken cancellationToken)
    {
        // Get existing succession plan
        var successionPlan = await _unitOfWork.SuccessionPlans.GetByIdAsync(request.SuccessionPlanId, cancellationToken);
        if (successionPlan == null)
        {
            return Result<bool>.Failure(
                Error.NotFound("SuccessionPlan", $"Succession plan with ID {request.SuccessionPlanId} not found"));
        }

        // Verify current incumbent exists if specified
        if (request.CurrentIncumbentId.HasValue)
        {
            var incumbent = await _unitOfWork.Employees.GetByIdAsync(request.CurrentIncumbentId.Value, cancellationToken);
            if (incumbent == null)
            {
                return Result<bool>.Failure(
                    Error.NotFound("Employee", $"Current incumbent with ID {request.CurrentIncumbentId} not found"));
            }
        }

        // Update the succession plan
        if (request.Priority.HasValue)
            successionPlan.SetPriority(request.Priority.Value);

        if (request.CurrentIncumbentId.HasValue)
            successionPlan.SetCurrentIncumbent(request.CurrentIncumbentId);

        if (request.PlanOwnerId.HasValue)
            successionPlan.SetPlanOwner(request.PlanOwnerId);

        if (request.HrResponsibleId.HasValue)
            successionPlan.SetHrResponsible(request.HrResponsibleId);

        if (request.TargetDate.HasValue)
            successionPlan.SetTargetDate(request.TargetDate);

        if (request.ExpectedVacancyDate.HasValue)
            successionPlan.SetExpectedVacancy(request.ExpectedVacancyDate, request.VacancyReason);

        if (!string.IsNullOrEmpty(request.Description))
            successionPlan.SetDescription(request.Description);

        if (!string.IsNullOrEmpty(request.RequiredCompetencies))
            successionPlan.SetRequiredCompetencies(request.RequiredCompetencies);

        if (request.RequiredExperienceYears.HasValue)
            successionPlan.SetRequiredExperience(request.RequiredExperienceYears);

        if (!string.IsNullOrEmpty(request.RequiredCertifications))
            successionPlan.SetRequiredCertifications(request.RequiredCertifications);

        if (!string.IsNullOrEmpty(request.RequiredEducation))
            successionPlan.SetRequiredEducation(request.RequiredEducation);

        if (!string.IsNullOrEmpty(request.CriticalSuccessFactors))
            successionPlan.SetCriticalSuccessFactors(request.CriticalSuccessFactors);

        if (!string.IsNullOrEmpty(request.Notes))
            successionPlan.SetNotes(request.Notes);

        if (request.Budget.HasValue)
            successionPlan.SetBudget(request.Budget);

        if (request.ExternalHiringNeeded.HasValue)
            successionPlan.SetExternalHiringNeeded(request.ExternalHiringNeeded.Value);

        // Reassess risk after updates
        successionPlan.AssessRisk();

        // Save changes
        _unitOfWork.SuccessionPlans.Update(successionPlan);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
