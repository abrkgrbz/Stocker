using MediatR;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Domain.Enums;
using Stocker.Modules.HR.Domain.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Employees.Queries;

/// <summary>
/// Query to get employees with filtering
/// </summary>
public class GetEmployeesQuery : IRequest<Result<List<EmployeeSummaryDto>>>
{
    public Guid TenantId { get; set; }
    public int? DepartmentId { get; set; }
    public int? PositionId { get; set; }
    public int? ManagerId { get; set; }
    public EmployeeStatus? Status { get; set; }
    public bool IncludeInactive { get; set; } = false;
    public string? SearchTerm { get; set; }
}

/// <summary>
/// Handler for GetEmployeesQuery
/// </summary>
public class GetEmployeesQueryHandler : IRequestHandler<GetEmployeesQuery, Result<List<EmployeeSummaryDto>>>
{
    private readonly IEmployeeRepository _employeeRepository;
    private readonly IDepartmentRepository _departmentRepository;
    private readonly IPositionRepository _positionRepository;

    public GetEmployeesQueryHandler(
        IEmployeeRepository employeeRepository,
        IDepartmentRepository departmentRepository,
        IPositionRepository positionRepository)
    {
        _employeeRepository = employeeRepository;
        _departmentRepository = departmentRepository;
        _positionRepository = positionRepository;
    }

    public async Task<Result<List<EmployeeSummaryDto>>> Handle(GetEmployeesQuery request, CancellationToken cancellationToken)
    {
        IReadOnlyList<Domain.Entities.Employee> employees;

        // Apply filters
        if (!string.IsNullOrEmpty(request.SearchTerm))
        {
            employees = await _employeeRepository.SearchAsync(request.SearchTerm, cancellationToken);
        }
        else if (request.DepartmentId.HasValue)
        {
            employees = await _employeeRepository.GetByDepartmentAsync(request.DepartmentId.Value, cancellationToken);
        }
        else if (request.PositionId.HasValue)
        {
            employees = await _employeeRepository.GetByPositionAsync(request.PositionId.Value, cancellationToken);
        }
        else if (request.ManagerId.HasValue)
        {
            employees = await _employeeRepository.GetByManagerAsync(request.ManagerId.Value, cancellationToken);
        }
        else if (request.Status.HasValue)
        {
            employees = await _employeeRepository.GetByStatusAsync(request.Status.Value, cancellationToken);
        }
        else if (!request.IncludeInactive)
        {
            employees = await _employeeRepository.GetActiveEmployeesAsync(cancellationToken);
        }
        else
        {
            employees = await _employeeRepository.GetAllAsync(cancellationToken);
        }

        // Additional filtering - use IsDeleted instead of IsActive (from BaseEntity)
        if (!request.IncludeInactive)
        {
            employees = employees.Where(e => !e.IsDeleted &&
                e.Status != EmployeeStatus.Terminated &&
                e.Status != EmployeeStatus.Resigned).ToList();
        }

        if (request.Status.HasValue && !string.IsNullOrEmpty(request.SearchTerm))
        {
            employees = employees.Where(e => e.Status == request.Status.Value).ToList();
        }

        // Map to DTOs
        var employeeDtos = new List<EmployeeSummaryDto>();
        foreach (var employee in employees)
        {
            string? departmentName = null;
            var department = await _departmentRepository.GetByIdAsync(employee.DepartmentId, cancellationToken);
            departmentName = department?.Name;

            string? positionTitle = null;
            var position = await _positionRepository.GetByIdAsync(employee.PositionId, cancellationToken);
            positionTitle = position?.Title;

            employeeDtos.Add(new EmployeeSummaryDto
            {
                Id = employee.Id,
                EmployeeCode = employee.EmployeeCode,
                FullName = $"{employee.FirstName} {employee.LastName}",
                PhotoUrl = employee.PhotoUrl,
                Email = employee.Email?.Value,
                DepartmentName = departmentName,
                PositionTitle = positionTitle,
                Status = employee.Status,
                HireDate = employee.HireDate
            });
        }

        return Result<List<EmployeeSummaryDto>>.Success(employeeDtos.OrderBy(e => e.FullName).ToList());
    }
}
