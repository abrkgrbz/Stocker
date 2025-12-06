using FluentValidation;
using MediatR;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Domain.Entities;
using Stocker.Modules.HR.Domain.Repositories;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Departments.Commands;

/// <summary>
/// Command to create a new department
/// </summary>
public class CreateDepartmentCommand : IRequest<Result<DepartmentDto>>
{
    public Guid TenantId { get; set; }
    public CreateDepartmentDto DepartmentData { get; set; } = null!;
}

/// <summary>
/// Validator for CreateDepartmentCommand
/// </summary>
public class CreateDepartmentCommandValidator : AbstractValidator<CreateDepartmentCommand>
{
    public CreateDepartmentCommandValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Tenant ID is required");

        RuleFor(x => x.DepartmentData)
            .NotNull().WithMessage("Department data is required");

        When(x => x.DepartmentData != null, () =>
        {
            RuleFor(x => x.DepartmentData.Code)
                .NotEmpty().WithMessage("Department code is required")
                .MaximumLength(50).WithMessage("Department code must not exceed 50 characters");

            RuleFor(x => x.DepartmentData.Name)
                .NotEmpty().WithMessage("Department name is required")
                .MaximumLength(100).WithMessage("Department name must not exceed 100 characters");

            RuleFor(x => x.DepartmentData.Description)
                .MaximumLength(500).WithMessage("Description must not exceed 500 characters");
        });
    }
}

/// <summary>
/// Handler for CreateDepartmentCommand
/// </summary>
public class CreateDepartmentCommandHandler : IRequestHandler<CreateDepartmentCommand, Result<DepartmentDto>>
{
    private readonly IDepartmentRepository _departmentRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateDepartmentCommandHandler(
        IDepartmentRepository departmentRepository,
        IUnitOfWork unitOfWork)
    {
        _departmentRepository = departmentRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<DepartmentDto>> Handle(CreateDepartmentCommand request, CancellationToken cancellationToken)
    {
        // Check if department with same code already exists
        var existingDepartment = await _departmentRepository.GetByCodeAsync(request.DepartmentData.Code, cancellationToken);
        if (existingDepartment != null)
        {
            return Result<DepartmentDto>.Failure(
                Error.Conflict("Department.Code", "A department with this code already exists"));
        }

        // If parent department specified, verify it exists
        Department? parentDepartment = null;
        if (request.DepartmentData.ParentDepartmentId.HasValue)
        {
            parentDepartment = await _departmentRepository.GetByIdAsync(
                request.DepartmentData.ParentDepartmentId.Value, cancellationToken);

            if (parentDepartment == null)
            {
                return Result<DepartmentDto>.Failure(
                    Error.NotFound("Department", $"Parent department with ID {request.DepartmentData.ParentDepartmentId} not found"));
            }
        }

        // Create the department
        var department = new Department(
            request.DepartmentData.Code,
            request.DepartmentData.Name,
            request.DepartmentData.Description,
            request.DepartmentData.ParentDepartmentId,
            request.DepartmentData.CostCenter,
            request.DepartmentData.Location,
            request.DepartmentData.DisplayOrder);

        // Set tenant ID
        department.SetTenantId(request.TenantId);

        // Set manager if specified
        if (request.DepartmentData.ManagerId.HasValue)
        {
            department.SetManager(request.DepartmentData.ManagerId.Value);
        }

        // Save to repository
        await _departmentRepository.AddAsync(department, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Map to DTO
        var departmentDto = new DepartmentDto
        {
            Id = department.Id,
            Code = department.Code,
            Name = department.Name,
            Description = department.Description,
            ParentDepartmentId = department.ParentDepartmentId,
            ParentDepartmentName = parentDepartment?.Name,
            ManagerId = department.ManagerId,
            CostCenter = department.CostCenter,
            Location = department.Location,
            DisplayOrder = department.DisplayOrder,
            IsActive = department.IsActive,
            CreatedAt = department.CreatedDate,
            EmployeeCount = 0
        };

        return Result<DepartmentDto>.Success(departmentDto);
    }
}
