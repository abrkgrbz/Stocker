using MediatR;
using Stocker.Modules.HR.Domain.Entities;
using Stocker.Modules.HR.Domain.Repositories;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.SuccessionPlans.Commands;

/// <summary>
/// Command to create a new succession plan
/// </summary>
public record CreateSuccessionPlanCommand : IRequest<Result<int>>
{
    public Guid TenantId { get; init; }
    public string PlanName { get; init; } = string.Empty;
    public int PositionId { get; init; }
    public int DepartmentId { get; init; }
    public bool IsCriticalPosition { get; init; }
    public SuccessionPriority Priority { get; init; }
    public int? CurrentIncumbentId { get; init; }
    public int? PlanOwnerId { get; init; }
    public int? HrResponsibleId { get; init; }
    public DateTime? TargetDate { get; init; }
    public DateTime? ExpectedVacancyDate { get; init; }
    public VacancyReason? VacancyReason { get; init; }
    public string? Description { get; init; }
    public string? RequiredCompetencies { get; init; }
    public int? RequiredExperienceYears { get; init; }
}

/// <summary>
/// Handler for CreateSuccessionPlanCommand
/// </summary>
public class CreateSuccessionPlanCommandHandler : IRequestHandler<CreateSuccessionPlanCommand, Result<int>>
{
    private readonly ISuccessionPlanRepository _successionPlanRepository;
    private readonly IPositionRepository _positionRepository;
    private readonly IDepartmentRepository _departmentRepository;
    private readonly IEmployeeRepository _employeeRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateSuccessionPlanCommandHandler(
        ISuccessionPlanRepository successionPlanRepository,
        IPositionRepository positionRepository,
        IDepartmentRepository departmentRepository,
        IEmployeeRepository employeeRepository,
        IUnitOfWork unitOfWork)
    {
        _successionPlanRepository = successionPlanRepository;
        _positionRepository = positionRepository;
        _departmentRepository = departmentRepository;
        _employeeRepository = employeeRepository;
        _unitOfWork = unitOfWork;
    }

    public async System.Threading.Tasks.Task<Result<int>> Handle(CreateSuccessionPlanCommand request, CancellationToken cancellationToken)
    {
        // Verify position exists
        var position = await _positionRepository.GetByIdAsync(request.PositionId, cancellationToken);
        if (position == null)
        {
            return Result<int>.Failure(
                Error.NotFound("Position", $"Position with ID {request.PositionId} not found"));
        }

        // Verify department exists
        var department = await _departmentRepository.GetByIdAsync(request.DepartmentId, cancellationToken);
        if (department == null)
        {
            return Result<int>.Failure(
                Error.NotFound("Department", $"Department with ID {request.DepartmentId} not found"));
        }

        // Verify current incumbent exists if specified
        if (request.CurrentIncumbentId.HasValue)
        {
            var incumbent = await _employeeRepository.GetByIdAsync(request.CurrentIncumbentId.Value, cancellationToken);
            if (incumbent == null)
            {
                return Result<int>.Failure(
                    Error.NotFound("Employee", $"Current incumbent with ID {request.CurrentIncumbentId} not found"));
            }
        }

        // Create the succession plan
        var successionPlan = new SuccessionPlan(
            request.PlanName,
            request.PositionId,
            request.DepartmentId,
            request.IsCriticalPosition,
            request.Priority);

        // Set tenant ID
        successionPlan.SetTenantId(request.TenantId);

        // Set optional properties
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

        // Assess initial risk
        successionPlan.AssessRisk();

        // Save to repository
        await _successionPlanRepository.AddAsync(successionPlan, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<int>.Success(successionPlan.Id);
    }
}
