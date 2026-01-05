using FluentValidation;
using MediatR;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Domain.Repositories;
using Stocker.Modules.HR.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Departments.Commands;

/// <summary>
/// Command to update a department
/// </summary>
public record UpdateDepartmentCommand : IRequest<Result<DepartmentDto>>
{
    public int DepartmentId { get; init; }
    public UpdateDepartmentDto DepartmentData { get; init; } = null!;
}

/// <summary>
/// Validator for UpdateDepartmentCommand
/// </summary>
public class UpdateDepartmentCommandValidator : AbstractValidator<UpdateDepartmentCommand>
{
    public UpdateDepartmentCommandValidator()
    {
        RuleFor(x => x.DepartmentId)
            .GreaterThan(0).WithMessage("Department ID must be greater than 0");

        RuleFor(x => x.DepartmentData)
            .NotNull().WithMessage("Department data is required");

        When(x => x.DepartmentData != null, () =>
        {
            RuleFor(x => x.DepartmentData.Name)
                .NotEmpty().WithMessage("Department name is required")
                .MaximumLength(100).WithMessage("Department name must not exceed 100 characters");

            RuleFor(x => x.DepartmentData.Description)
                .MaximumLength(500).WithMessage("Description must not exceed 500 characters");
        });
    }
}

/// <summary>
/// Handler for UpdateDepartmentCommand
/// </summary>
public class UpdateDepartmentCommandHandler : IRequestHandler<UpdateDepartmentCommand, Result<DepartmentDto>>
{
    private readonly IHRUnitOfWork _unitOfWork;

    public UpdateDepartmentCommandHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<DepartmentDto>> Handle(UpdateDepartmentCommand request, CancellationToken cancellationToken)
    {
        // Get existing department
        var department = await _unitOfWork.Departments.GetByIdAsync(request.DepartmentId, cancellationToken);
        if (department == null)
        {
            return Result<DepartmentDto>.Failure(
                Error.NotFound("Department", $"Department with ID {request.DepartmentId} not found"));
        }

        // Validate parent department if specified
        if (request.DepartmentData.ParentDepartmentId.HasValue)
        {
            // Prevent circular reference
            if (request.DepartmentData.ParentDepartmentId.Value == request.DepartmentId)
            {
                return Result<DepartmentDto>.Failure(
                    Error.Validation("Department.ParentDepartmentId", "A department cannot be its own parent"));
            }

            var parentDepartment = await _unitOfWork.Departments.GetByIdAsync(
                request.DepartmentData.ParentDepartmentId.Value, cancellationToken);

            if (parentDepartment == null)
            {
                return Result<DepartmentDto>.Failure(
                    Error.NotFound("Department", $"Parent department with ID {request.DepartmentData.ParentDepartmentId} not found"));
            }
        }

        // Update the department
        department.Update(
            request.DepartmentData.Name,
            request.DepartmentData.Description,
            request.DepartmentData.ParentDepartmentId,
            request.DepartmentData.CostCenter,
            request.DepartmentData.Location,
            request.DepartmentData.DisplayOrder);

        if (request.DepartmentData.ManagerId.HasValue)
        {
            department.SetManager(request.DepartmentData.ManagerId.Value);
        }

        // Save changes
        _unitOfWork.Departments.Update(department);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Get employee count
        var employeeCount = await _unitOfWork.Departments.GetEmployeeCountAsync(department.Id, cancellationToken);

        // Get manager name if available
        string? managerName = null;
        if (department.ManagerId.HasValue)
        {
            var manager = await _unitOfWork.Employees.GetByIdAsync(department.ManagerId.Value, cancellationToken);
            managerName = manager != null ? $"{manager.FirstName} {manager.LastName}" : null;
        }

        // Get parent department name
        string? parentDepartmentName = null;
        if (department.ParentDepartmentId.HasValue)
        {
            var parent = await _unitOfWork.Departments.GetByIdAsync(department.ParentDepartmentId.Value, cancellationToken);
            parentDepartmentName = parent?.Name;
        }

        // Map to DTO
        var departmentDto = new DepartmentDto
        {
            Id = department.Id,
            Code = department.Code,
            Name = department.Name,
            Description = department.Description,
            ParentDepartmentId = department.ParentDepartmentId,
            ParentDepartmentName = parentDepartmentName,
            ManagerId = department.ManagerId,
            ManagerName = managerName,
            CostCenter = department.CostCenter,
            Location = department.Location,
            DisplayOrder = department.DisplayOrder,
            IsActive = department.IsActive,
            CreatedAt = department.CreatedDate,
            UpdatedAt = department.UpdatedDate,
            EmployeeCount = employeeCount
        };

        return Result<DepartmentDto>.Success(departmentDto);
    }
}
