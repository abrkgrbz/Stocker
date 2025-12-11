using FluentValidation;
using MediatR;
using Stocker.Modules.HR.Domain.Entities;
using Stocker.Modules.HR.Domain.Repositories;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.EmployeeSkills.Commands;

/// <summary>
/// Command to create a new employee skill
/// </summary>
public record CreateEmployeeSkillCommand(
    Guid TenantId,
    int EmployeeId,
    string SkillName,
    SkillCategory Category,
    ProficiencyLevel ProficiencyLevel,
    SkillType SkillType = SkillType.Technical,
    int? SkillId = null,
    decimal? YearsOfExperience = null,
    bool IsPrimary = false,
    bool IsActivelyUsed = true) : IRequest<Result<int>>;

/// <summary>
/// Validator for CreateEmployeeSkillCommand
/// </summary>
public class CreateEmployeeSkillCommandValidator : AbstractValidator<CreateEmployeeSkillCommand>
{
    public CreateEmployeeSkillCommandValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Tenant ID is required");

        RuleFor(x => x.EmployeeId)
            .GreaterThan(0).WithMessage("Employee ID must be greater than 0");

        RuleFor(x => x.SkillName)
            .NotEmpty().WithMessage("Skill name is required")
            .MaximumLength(200).WithMessage("Skill name must not exceed 200 characters");

        RuleFor(x => x.YearsOfExperience)
            .GreaterThanOrEqualTo(0).When(x => x.YearsOfExperience.HasValue)
            .WithMessage("Years of experience must be non-negative");
    }
}

/// <summary>
/// Handler for CreateEmployeeSkillCommand
/// </summary>
public class CreateEmployeeSkillCommandHandler : IRequestHandler<CreateEmployeeSkillCommand, Result<int>>
{
    private readonly IEmployeeSkillRepository _employeeSkillRepository;
    private readonly IEmployeeRepository _employeeRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateEmployeeSkillCommandHandler(
        IEmployeeSkillRepository employeeSkillRepository,
        IEmployeeRepository employeeRepository,
        IUnitOfWork unitOfWork)
    {
        _employeeSkillRepository = employeeSkillRepository;
        _employeeRepository = employeeRepository;
        _unitOfWork = unitOfWork;
    }

    public async System.Threading.Tasks.Task<Result<int>> Handle(CreateEmployeeSkillCommand request, CancellationToken cancellationToken)
    {
        // Verify employee exists
        var employee = await _employeeRepository.GetByIdAsync(request.EmployeeId, cancellationToken);
        if (employee == null)
        {
            return Result<int>.Failure(
                Error.NotFound("Employee", $"Employee with ID {request.EmployeeId} not found"));
        }

        // Create the employee skill
        var employeeSkill = new EmployeeSkill(
            request.EmployeeId,
            request.SkillName,
            request.Category,
            request.ProficiencyLevel,
            request.SkillType);

        // Set tenant ID
        employeeSkill.SetTenantId(request.TenantId);

        // Set optional properties
        if (request.SkillId.HasValue)
            employeeSkill.SetSkillId(request.SkillId.Value);

        if (request.YearsOfExperience.HasValue)
            employeeSkill.UpdateProficiency(request.ProficiencyLevel, request.YearsOfExperience.Value);

        employeeSkill.SetPrimary(request.IsPrimary);
        employeeSkill.SetActivelyUsed(request.IsActivelyUsed);

        // Save to repository
        await _employeeSkillRepository.AddAsync(employeeSkill, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<int>.Success(employeeSkill.Id);
    }
}
