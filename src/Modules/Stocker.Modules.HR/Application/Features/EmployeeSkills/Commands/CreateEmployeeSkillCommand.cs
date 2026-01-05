using FluentValidation;
using MediatR;
using Stocker.Modules.HR.Domain.Entities;
using Stocker.Modules.HR.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.EmployeeSkills.Commands;

/// <summary>
/// Command to create a new employee skill
/// </summary>
public record CreateEmployeeSkillCommand : IRequest<Result<int>>
{
    public int EmployeeId { get; init; }
    public string SkillName { get; init; } = string.Empty;
    public SkillCategory Category { get; init; }
    public ProficiencyLevel ProficiencyLevel { get; init; }
    public SkillType SkillType { get; init; } = SkillType.Technical;
    public int? SkillId { get; init; }
    public decimal? YearsOfExperience { get; init; }
    public bool IsPrimary { get; init; }
    public bool IsActivelyUsed { get; init; } = true;
}

/// <summary>
/// Validator for CreateEmployeeSkillCommand
/// </summary>
public class CreateEmployeeSkillCommandValidator : AbstractValidator<CreateEmployeeSkillCommand>
{
    public CreateEmployeeSkillCommandValidator()
    {
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
    private readonly IHRUnitOfWork _unitOfWork;

    public CreateEmployeeSkillCommandHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<int>> Handle(CreateEmployeeSkillCommand request, CancellationToken cancellationToken)
    {
        // Verify employee exists
        var employee = await _unitOfWork.Employees.GetByIdAsync(request.EmployeeId, cancellationToken);
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
        employeeSkill.SetTenantId(_unitOfWork.TenantId);

        // Set optional properties
        if (request.SkillId.HasValue)
            employeeSkill.SetSkillId(request.SkillId.Value);

        if (request.YearsOfExperience.HasValue)
            employeeSkill.UpdateProficiency(request.ProficiencyLevel, request.YearsOfExperience.Value);

        employeeSkill.SetPrimary(request.IsPrimary);
        employeeSkill.SetActivelyUsed(request.IsActivelyUsed);

        // Save to repository
        await _unitOfWork.EmployeeSkills.AddAsync(employeeSkill, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<int>.Success(employeeSkill.Id);
    }
}
