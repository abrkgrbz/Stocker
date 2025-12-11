using FluentValidation;
using MediatR;
using Stocker.Modules.HR.Domain.Repositories;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.EmployeeSkills.Commands;

/// <summary>
/// Command to delete an employee skill
/// </summary>
public record DeleteEmployeeSkillCommand(
    Guid TenantId,
    int EmployeeSkillId) : IRequest<Result<bool>>;

/// <summary>
/// Validator for DeleteEmployeeSkillCommand
/// </summary>
public class DeleteEmployeeSkillCommandValidator : AbstractValidator<DeleteEmployeeSkillCommand>
{
    public DeleteEmployeeSkillCommandValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Tenant ID is required");

        RuleFor(x => x.EmployeeSkillId)
            .GreaterThan(0).WithMessage("Employee Skill ID must be greater than 0");
    }
}

/// <summary>
/// Handler for DeleteEmployeeSkillCommand
/// </summary>
public class DeleteEmployeeSkillCommandHandler : IRequestHandler<DeleteEmployeeSkillCommand, Result<bool>>
{
    private readonly IEmployeeSkillRepository _employeeSkillRepository;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteEmployeeSkillCommandHandler(
        IEmployeeSkillRepository employeeSkillRepository,
        IUnitOfWork unitOfWork)
    {
        _employeeSkillRepository = employeeSkillRepository;
        _unitOfWork = unitOfWork;
    }

    public async System.Threading.Tasks.Task<Result<bool>> Handle(DeleteEmployeeSkillCommand request, CancellationToken cancellationToken)
    {
        // Get existing employee skill
        var employeeSkill = await _employeeSkillRepository.GetByIdAsync(request.EmployeeSkillId, cancellationToken);
        if (employeeSkill == null)
        {
            return Result<bool>.Failure(
                Error.NotFound("EmployeeSkill", $"Employee Skill with ID {request.EmployeeSkillId} not found"));
        }

        // Remove employee skill
        _employeeSkillRepository.Remove(employeeSkill);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
