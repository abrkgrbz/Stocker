using MediatR;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Domain.Entities;
using Stocker.Modules.HR.Domain.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Departments.Queries;

/// <summary>
/// Query to get the department hierarchy tree
/// </summary>
public class GetDepartmentTreeQuery : IRequest<Result<List<DepartmentTreeDto>>>
{
    public Guid TenantId { get; set; }
    public bool IncludeInactive { get; set; } = false;
}

/// <summary>
/// Handler for GetDepartmentTreeQuery
/// </summary>
public class GetDepartmentTreeQueryHandler : IRequestHandler<GetDepartmentTreeQuery, Result<List<DepartmentTreeDto>>>
{
    private readonly IDepartmentRepository _departmentRepository;

    public GetDepartmentTreeQueryHandler(IDepartmentRepository departmentRepository)
    {
        _departmentRepository = departmentRepository;
    }

    public async Task<Result<List<DepartmentTreeDto>>> Handle(GetDepartmentTreeQuery request, CancellationToken cancellationToken)
    {
        var allDepartments = await _departmentRepository.GetDepartmentTreeAsync(cancellationToken);

        if (!request.IncludeInactive)
        {
            allDepartments = allDepartments.Where(d => d.IsActive).ToList();
        }

        // Build tree structure
        var rootDepartments = allDepartments.Where(d => !d.ParentDepartmentId.HasValue).ToList();
        var tree = await BuildTreeAsync(rootDepartments, allDepartments, 0, cancellationToken);

        return Result<List<DepartmentTreeDto>>.Success(tree);
    }

    private async Task<List<DepartmentTreeDto>> BuildTreeAsync(
        IEnumerable<Department> departments,
        IReadOnlyList<Department> allDepartments,
        int level,
        CancellationToken cancellationToken)
    {
        var result = new List<DepartmentTreeDto>();

        foreach (var department in departments)
        {
            var employeeCount = await _departmentRepository.GetEmployeeCountAsync(department.Id, cancellationToken);
            var children = allDepartments.Where(d => d.ParentDepartmentId == department.Id).ToList();

            var node = new DepartmentTreeDto
            {
                Id = department.Id,
                Code = department.Code,
                Name = department.Name,
                Level = level,
                HasChildren = children.Any(),
                EmployeeCount = employeeCount,
                Children = await BuildTreeAsync(children, allDepartments, level + 1, cancellationToken)
            };

            result.Add(node);
        }

        return result;
    }
}
