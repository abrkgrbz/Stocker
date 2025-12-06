using MediatR;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Domain.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Departments.Queries;

/// <summary>
/// Query to get a department by ID
/// </summary>
public class GetDepartmentByIdQuery : IRequest<Result<DepartmentDto>>
{
    public Guid TenantId { get; set; }
    public int DepartmentId { get; set; }
}

/// <summary>
/// Handler for GetDepartmentByIdQuery
/// </summary>
public class GetDepartmentByIdQueryHandler : IRequestHandler<GetDepartmentByIdQuery, Result<DepartmentDto>>
{
    private readonly IDepartmentRepository _departmentRepository;
    private readonly IEmployeeRepository _employeeRepository;

    public GetDepartmentByIdQueryHandler(
        IDepartmentRepository departmentRepository,
        IEmployeeRepository employeeRepository)
    {
        _departmentRepository = departmentRepository;
        _employeeRepository = employeeRepository;
    }

    public async Task<Result<DepartmentDto>> Handle(GetDepartmentByIdQuery request, CancellationToken cancellationToken)
    {
        var department = await _departmentRepository.GetWithSubDepartmentsAsync(request.DepartmentId, cancellationToken);
        if (department == null)
        {
            return Result<DepartmentDto>.Failure(
                Error.NotFound("Department", $"Department with ID {request.DepartmentId} not found"));
        }

        var employeeCount = await _departmentRepository.GetEmployeeCountAsync(department.Id, cancellationToken);

        string? managerName = null;
        if (department.ManagerId.HasValue)
        {
            var manager = await _employeeRepository.GetByIdAsync(department.ManagerId.Value, cancellationToken);
            managerName = manager != null ? $"{manager.FirstName} {manager.LastName}" : null;
        }

        string? parentDepartmentName = null;
        if (department.ParentDepartmentId.HasValue)
        {
            var parent = await _departmentRepository.GetByIdAsync(department.ParentDepartmentId.Value, cancellationToken);
            parentDepartmentName = parent?.Name;
        }

        // Map sub-departments
        var subDepartmentDtos = new List<DepartmentDto>();
        foreach (var subDept in department.SubDepartments)
        {
            var subEmployeeCount = await _departmentRepository.GetEmployeeCountAsync(subDept.Id, cancellationToken);
            subDepartmentDtos.Add(new DepartmentDto
            {
                Id = subDept.Id,
                Code = subDept.Code,
                Name = subDept.Name,
                Description = subDept.Description,
                ParentDepartmentId = subDept.ParentDepartmentId,
                IsActive = subDept.IsActive,
                CreatedAt = subDept.CreatedDate,
                EmployeeCount = subEmployeeCount
            });
        }

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
            IsActive = department.IsActive,
            CreatedAt = department.CreatedDate,
            UpdatedAt = department.UpdatedDate,
            EmployeeCount = employeeCount,
            SubDepartments = subDepartmentDtos
        };

        return Result<DepartmentDto>.Success(departmentDto);
    }
}
