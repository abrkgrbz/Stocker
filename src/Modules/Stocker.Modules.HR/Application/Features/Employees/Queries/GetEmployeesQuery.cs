using MediatR;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Domain.Enums;
using Stocker.Modules.HR.Domain.Repositories;
using Stocker.Modules.HR.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Employees.Queries;

/// <summary>
/// Query to get employees with filtering
/// </summary>
public record GetEmployeesQuery : IRequest<Result<List<EmployeeSummaryDto>>>
{
    public int? DepartmentId { get; init; }
    public int? PositionId { get; init; }
    public int? ManagerId { get; init; }
    public EmployeeStatus? Status { get; init; }
    public bool IncludeInactive { get; init; } = false;
    public string? SearchTerm { get; init; }
}

/// <summary>
/// Handler for GetEmployeesQuery
/// </summary>
public class GetEmployeesQueryHandler : IRequestHandler<GetEmployeesQuery, Result<List<EmployeeSummaryDto>>>
{
    private readonly IHRUnitOfWork _unitOfWork;

    public GetEmployeesQueryHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<List<EmployeeSummaryDto>>> Handle(GetEmployeesQuery request, CancellationToken cancellationToken)
    {
        IReadOnlyList<Domain.Entities.Employee> employees;

        // Apply filters
        if (!string.IsNullOrEmpty(request.SearchTerm))
        {
            employees = await _unitOfWork.Employees.SearchAsync(request.SearchTerm, cancellationToken);
        }
        else if (request.DepartmentId.HasValue)
        {
            employees = await _unitOfWork.Employees.GetByDepartmentAsync(request.DepartmentId.Value, cancellationToken);
        }
        else if (request.PositionId.HasValue)
        {
            employees = await _unitOfWork.Employees.GetByPositionAsync(request.PositionId.Value, cancellationToken);
        }
        else if (request.ManagerId.HasValue)
        {
            employees = await _unitOfWork.Employees.GetByManagerAsync(request.ManagerId.Value, cancellationToken);
        }
        else if (request.Status.HasValue)
        {
            employees = await _unitOfWork.Employees.GetByStatusAsync(request.Status.Value, cancellationToken);
        }
        else if (!request.IncludeInactive)
        {
            employees = await _unitOfWork.Employees.GetActiveEmployeesAsync(cancellationToken);
        }
        else
        {
            employees = await _unitOfWork.Employees.GetAllAsync(cancellationToken);
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
            var department = await _unitOfWork.Departments.GetByIdAsync(employee.DepartmentId, cancellationToken);
            departmentName = department?.Name;

            string? positionTitle = null;
            var position = await _unitOfWork.Positions.GetByIdAsync(employee.PositionId, cancellationToken);
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
