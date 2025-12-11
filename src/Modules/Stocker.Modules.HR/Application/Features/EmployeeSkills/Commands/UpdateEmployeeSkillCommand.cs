using FluentValidation;
using MediatR;
using Stocker.Modules.HR.Domain.Entities;
using Stocker.Modules.HR.Domain.Repositories;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.EmployeeSkills.Commands;

/// <summary>
/// Command to update an employee skill
/// </summary>
public record UpdateEmployeeSkillCommand(
    Guid TenantId,
    int EmployeeSkillId,
    ProficiencyLevel ProficiencyLevel,
    decimal? YearsOfExperience = null,
    bool? IsPrimary = null,
    bool? IsActivelyUsed = null,
    UsageFrequency? UsageFrequency = null,
    string? Notes = null) : IRequest<Result<bool>>;

/// <summary>
/// Validator for UpdateEmployeeSkillCommand
/// </summary>
public class UpdateEmployeeSkillCommandValidator : AbstractValidator<UpdateEmployeeSkillCommand>
{
    public UpdateEmployeeSkillCommandValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Tenant ID is required");

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
    private readonly IEmployeeSkillRepository _employeeSkillRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateEmployeeSkillCommandHandler(
        IEmployeeSkillRepository employeeSkillRepository,
        IUnitOfWork unitOfWork)
    {
        _employeeSkillRepository = employeeSkillRepository;
        _unitOfWork = unitOfWork;
    }

    public async System.Threading.Tasks.Task<Result<bool>> Handle(UpdateEmployeeSkillCommand request, CancellationToken cancellationToken)
    {
        // Get existing employee skill
        var employeeSkill = await _employeeSkillRepository.GetByIdAsync(request.EmployeeSkillId, cancellationToken);
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
        _employeeSkillRepository.Update(employeeSkill);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
