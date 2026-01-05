using FluentValidation;
using MediatR;
using Stocker.Modules.HR.Domain.Repositories;
using Stocker.Modules.HR.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Departments.Commands;

/// <summary>
/// Command to delete a department
/// </summary>
public record DeleteDepartmentCommand(int DepartmentId) : IRequest<Result<bool>>;

/// <summary>
/// Validator for DeleteDepartmentCommand
/// </summary>
public class DeleteDepartmentCommandValidator : AbstractValidator<DeleteDepartmentCommand>
{
    public DeleteDepartmentCommandValidator()
    {
        RuleFor(x => x.DepartmentId)
            .GreaterThan(0).WithMessage("Department ID must be greater than 0");
    }
}

/// <summary>
/// Handler for DeleteDepartmentCommand
/// </summary>
public class DeleteDepartmentCommandHandler : IRequestHandler<DeleteDepartmentCommand, Result<bool>>
{
    private readonly IHRUnitOfWork _unitOfWork;

    public DeleteDepartmentCommandHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(DeleteDepartmentCommand request, CancellationToken cancellationToken)
    {
        // Get existing department
        var department = await _unitOfWork.Departments.GetByIdAsync(request.DepartmentId, cancellationToken);
        if (department == null)
        {
            return Result<bool>.Failure(
                Error.NotFound("Department", $"Department with ID {request.DepartmentId} not found"));
        }

        // Check if department has employees
        var employeeCount = await _unitOfWork.Departments.GetEmployeeCountAsync(request.DepartmentId, cancellationToken);
        if (employeeCount > 0)
        {
            return Result<bool>.Failure(
                Error.Conflict("Department", $"Cannot delete department with {employeeCount} employees. Please reassign employees first."));
        }

        // Check if department has sub-departments
        var subDepartments = await _unitOfWork.Departments.GetSubDepartmentsAsync(request.DepartmentId, cancellationToken);
        if (subDepartments.Count > 0)
        {
            return Result<bool>.Failure(
                Error.Conflict("Department", $"Cannot delete department with {subDepartments.Count} sub-departments. Please delete or reassign sub-departments first."));
        }

        // Soft delete
        _unitOfWork.Departments.Remove(department);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
