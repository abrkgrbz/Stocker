using MediatR;
using Stocker.Application.Common.Interfaces;
using Stocker.Application.DTOs.Tenant.Departments;
using Stocker.Application.Interfaces.Repositories;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Tenant.Departments.Queries.GetAllDepartments;

public class GetAllDepartmentsQueryHandler : IRequestHandler<GetAllDepartmentsQuery, Result<List<DepartmentListDto>>>
{
    private readonly IDepartmentRepository _departmentRepository;
    private readonly ITenantService _tenantService;

    public GetAllDepartmentsQueryHandler(
        IDepartmentRepository departmentRepository,
        ITenantService tenantService)
    {
        _departmentRepository = departmentRepository;
        _tenantService = tenantService;
    }

    public async Task<Result<List<DepartmentListDto>>> Handle(GetAllDepartmentsQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _tenantService.GetCurrentTenantId() ?? Guid.Empty;
        if (tenantId == Guid.Empty)
            return Result<List<DepartmentListDto>>.Failure(DomainErrors.Tenant.TenantNotFound);

        var departments = await _departmentRepository.GetAllAsync(tenantId, cancellationToken);

        var departmentDtos = new List<DepartmentListDto>();

        foreach (var department in departments)
        {
            var employeeCount = await _departmentRepository.GetEmployeeCountAsync(department.Id, tenantId, cancellationToken);

            departmentDtos.Add(new DepartmentListDto
            {
                Id = department.Id,
                Name = department.Name,
                Code = department.Code,
                Description = department.Description,
                ParentDepartmentId = department.ParentDepartmentId,
                ParentDepartmentName = department.ParentDepartmentId.HasValue
                    ? departments.FirstOrDefault(d => d.Id == department.ParentDepartmentId.Value)?.Name
                    : null,
                IsActive = department.IsActive,
                EmployeeCount = employeeCount
            });
        }

        return Result<List<DepartmentListDto>>.Success(departmentDtos);
    }
}
