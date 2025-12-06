using FluentValidation;
using MediatR;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Domain.Repositories;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Employees.Commands;

/// <summary>
/// Command to terminate an employee
/// </summary>
public class TerminateEmployeeCommand : IRequest<Result<EmployeeDto>>
{
    public Guid TenantId { get; set; }
    public int EmployeeId { get; set; }
    public TerminateEmployeeDto TerminationData { get; set; } = null!;
}

/// <summary>
/// Validator for TerminateEmployeeCommand
/// </summary>
public class TerminateEmployeeCommandValidator : AbstractValidator<TerminateEmployeeCommand>
{
    public TerminateEmployeeCommandValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Tenant ID is required");

        RuleFor(x => x.EmployeeId)
            .GreaterThan(0).WithMessage("Employee ID must be greater than 0");

        RuleFor(x => x.TerminationData)
            .NotNull().WithMessage("Termination data is required");

        When(x => x.TerminationData != null, () =>
        {
            RuleFor(x => x.TerminationData.TerminationDate)
                .NotEmpty().WithMessage("Termination date is required");
        });
    }
}

/// <summary>
/// Handler for TerminateEmployeeCommand
/// </summary>
public class TerminateEmployeeCommandHandler : IRequestHandler<TerminateEmployeeCommand, Result<EmployeeDto>>
{
    private readonly IEmployeeRepository _employeeRepository;
    private readonly IDepartmentRepository _departmentRepository;
    private readonly IPositionRepository _positionRepository;
    private readonly IUnitOfWork _unitOfWork;

    public TerminateEmployeeCommandHandler(
        IEmployeeRepository employeeRepository,
        IDepartmentRepository departmentRepository,
        IPositionRepository positionRepository,
        IUnitOfWork unitOfWork)
    {
        _employeeRepository = employeeRepository;
        _departmentRepository = departmentRepository;
        _positionRepository = positionRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<EmployeeDto>> Handle(TerminateEmployeeCommand request, CancellationToken cancellationToken)
    {
        var employee = await _employeeRepository.GetByIdAsync(request.EmployeeId, cancellationToken);
        if (employee == null)
        {
            return Result<EmployeeDto>.Failure(
                Error.NotFound("Employee", $"Employee with ID {request.EmployeeId} not found"));
        }

        if (employee.Status == Domain.Enums.EmployeeStatus.Terminated || employee.Status == Domain.Enums.EmployeeStatus.Resigned)
        {
            return Result<EmployeeDto>.Failure(
                Error.Conflict("Employee", "Employee is already terminated or resigned"));
        }

        // Terminate the employee
        employee.Terminate(request.TerminationData.TerminationDate, request.TerminationData.TerminationReason);

        // Save changes
        _employeeRepository.Update(employee);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Get related names
        string? departmentName = null;
        var department = await _departmentRepository.GetByIdAsync(employee.DepartmentId, cancellationToken);
        departmentName = department?.Name;

        string? positionTitle = null;
        var position = await _positionRepository.GetByIdAsync(employee.PositionId, cancellationToken);
        positionTitle = position?.Title;

        // Map to DTO
        var employeeDto = new EmployeeDto
        {
            Id = employee.Id,
            EmployeeCode = employee.EmployeeCode,
            FirstName = employee.FirstName,
            LastName = employee.LastName,
            MiddleName = employee.MiddleName,
            NationalId = employee.NationalId,
            BirthDate = employee.BirthDate,
            Gender = employee.Gender,
            Email = employee.Email.Value,
            Phone = employee.Phone.Value,
            DepartmentId = employee.DepartmentId,
            DepartmentName = departmentName,
            PositionId = employee.PositionId,
            PositionTitle = positionTitle,
            ManagerId = employee.ManagerId,
            HireDate = employee.HireDate,
            TerminationDate = employee.TerminationDate,
            TerminationReason = employee.TerminationReason,
            EmploymentType = employee.EmploymentType,
            Status = employee.Status,
            IsActive = !employee.IsDeleted,
            CreatedAt = employee.CreatedDate,
            UpdatedAt = employee.UpdatedDate
        };

        return Result<EmployeeDto>.Success(employeeDto);
    }
}
