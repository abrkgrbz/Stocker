using FluentValidation;
using MediatR;
using Stocker.Modules.HR.Domain.Entities;
using Stocker.Modules.HR.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.EmployeeSkills.Commands;

/// <summary>
/// Command to update an employee skill
/// </summary>
public record UpdateEmployeeSkillCommand : IRequest<Result<bool>>
{
    public int EmployeeSkillId { get; init; }
    public ProficiencyLevel ProficiencyLevel { get; init; }
    public decimal? YearsOfExperience { get; init; }
    public bool? IsPrimary { get; init; }
    public bool? IsActivelyUsed { get; init; }
    public UsageFrequency? UsageFrequency { get; init; }
    public string? Notes { get; init; }
}

/// <summary>
/// Validator for UpdateEmployeeSkillCommand
/// </summary>
public class UpdateEmployeeSkillCommandValidator : AbstractValidator<UpdateEmployeeSkillCommand>
{
    public UpdateEmployeeSkillCommandValidator()
    {
        RuleFor(x => x.EmployeeSkillId)
            .GreaterThan(0).WithMessage("Employee Skill ID must be greater than 0");

        RuleFor(x => x.YearsOfExperience)
            .GreaterThanOrEqualTo(0).When(x => x.YearsOfExperience.HasValue)
            .WithMessage("Years of experience must be non-negative");
    }
}

/// <summary>
/// Handler for UpdateEmployeeSkillCommand
/// </summary>
public class UpdateEmployeeSkillCommandHandler : IRequestHandler<UpdateEmployeeSkillCommand, Result<bool>>
{
    private readonly IHRUnitOfWork _unitOfWork;

    public UpdateEmployeeSkillCommandHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(UpdateEmployeeSkillCommand request, CancellationToken cancellationToken)
    {
        // Get existing employee skill
        var employeeSkill = await _unitOfWork.EmployeeSkills.GetByIdAsync(request.EmployeeSkillId, cancellationToken);
        if (employeeSkill == null)
        {
            return Result<bool>.Failure(
                Error.NotFound("EmployeeSkill", $"Employee Skill with ID {request.EmployeeSkillId} not found"));
        }

        // Update the employee skill
        employeeSkill.UpdateProficiency(request.ProficiencyLevel, request.YearsOfExperience);

        if (request.IsPrimary.HasValue)
            employeeSkill.SetPrimary(request.IsPrimary.Value);

        if (request.IsActivelyUsed.HasValue)
            employeeSkill.SetActivelyUsed(request.IsActivelyUsed.Value);

        if (request.UsageFrequency.HasValue)
            employeeSkill.SetUsageFrequency(request.UsageFrequency.Value);

        if (request.Notes != null)
            employeeSkill.SetNotes(request.Notes);

        // Save changes
        _unitOfWork.EmployeeSkills.Update(employeeSkill);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
