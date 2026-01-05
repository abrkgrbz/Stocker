using MediatR;
using Stocker.Modules.HR.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.EmployeeSkills.Commands;

/// <summary>
/// Command to delete an employee skill
/// </summary>
public record DeleteEmployeeSkillCommand : IRequest<Result<bool>>
{
    public int EmployeeSkillId { get; init; }
}

/// <summary>
/// Handler for DeleteEmployeeSkillCommand
/// </summary>
public class DeleteEmployeeSkillCommandHandler : IRequestHandler<DeleteEmployeeSkillCommand, Result<bool>>
{
    private readonly IHRUnitOfWork _unitOfWork;

    public DeleteEmployeeSkillCommandHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(DeleteEmployeeSkillCommand request, CancellationToken cancellationToken)
    {
        // Get existing employee skill
        var employeeSkill = await _unitOfWork.EmployeeSkills.GetByIdAsync(request.EmployeeSkillId, cancellationToken);
        if (employeeSkill == null)
        {
            return Result<bool>.Failure(
                Error.NotFound("EmployeeSkill", $"Employee Skill with ID {request.EmployeeSkillId} not found"));
        }

        // Remove employee skill
        _unitOfWork.EmployeeSkills.Remove(employeeSkill);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
