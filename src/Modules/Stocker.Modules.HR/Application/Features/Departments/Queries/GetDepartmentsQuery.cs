using MediatR;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Domain.Repositories;
using Stocker.Modules.HR.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Departments.Queries;

/// <summary>
/// Query to get all departments
/// </summary>
public record GetDepartmentsQuery : IRequest<Result<List<DepartmentDto>>>
{
    public bool IncludeInactive { get; init; } = false;
    public int? ParentDepartmentId { get; init; }
}

/// <summary>
/// Handler for GetDepartmentsQuery
/// </summary>
public class GetDepartmentsQueryHandler : IRequestHandler<GetDepartmentsQuery, Result<List<DepartmentDto>>>
{
    private readonly IHRUnitOfWork _unitOfWork;

    public GetDepartmentsQueryHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<List<DepartmentDto>>> Handle(GetDepartmentsQuery request, CancellationToken cancellationToken)
    {
        IReadOnlyList<Domain.Entities.Department> departments;

        if (request.ParentDepartmentId.HasValue)
        {
            departments = await _unitOfWork.Departments.GetSubDepartmentsAsync(request.ParentDepartmentId.Value, cancellationToken);
        }
        else
        {
            departments = await _unitOfWork.Departments.GetRootDepartmentsAsync(cancellationToken);
        }

        if (!request.IncludeInactive)
        {
            departments = departments.Where(d => d.IsActive).ToList();
        }

        var departmentDtos = new List<DepartmentDto>();
        foreach (var department in departments)
        {
            var employeeCount = await _unitOfWork.Departments.GetEmployeeCountAsync(department.Id, cancellationToken);

            string? managerName = null;
            if (department.ManagerId.HasValue)
            {
                var manager = await _unitOfWork.Employees.GetByIdAsync(department.ManagerId.Value, cancellationToken);
                managerName = manager != null ? $"{manager.FirstName} {manager.LastName}" : null;
            }

            string? parentDepartmentName = null;
            if (department.ParentDepartmentId.HasValue)
            {
                var parent = await _unitOfWork.Departments.GetByIdAsync(department.ParentDepartmentId.Value, cancellationToken);
                parentDepartmentName = parent?.Name;
            }

            departmentDtos.Add(new DepartmentDto
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
                IsActive = department.IsActive,
                CreatedAt = department.CreatedDate,
                UpdatedAt = department.UpdatedDate,
                EmployeeCount = employeeCount
            });
        }

        return Result<List<DepartmentDto>>.Success(departmentDtos.OrderBy(d => d.Name).ToList());
    }
}
