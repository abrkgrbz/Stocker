using MediatR;
using Stocker.Application.Common.Interfaces;
using Stocker.Application.Interfaces.Repositories;
using Stocker.Domain.Tenant.Entities;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Tenant.Departments.Commands.CreateDepartment;

public class CreateDepartmentCommandHandler : IRequestHandler<CreateDepartmentCommand, Result<Guid>>
{
    private readonly IDepartmentRepository _departmentRepository;
    private readonly ITenantService _tenantService;
    private readonly ICompanyService _companyService;

    public CreateDepartmentCommandHandler(
        IDepartmentRepository departmentRepository,
        ITenantService tenantService,
        ICompanyService companyService)
    {
        _departmentRepository = departmentRepository;
        _tenantService = tenantService;
        _companyService = companyService;
    }

    public async Task<Result<Guid>> Handle(CreateDepartmentCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _tenantService.GetCurrentTenantId() ?? Guid.Empty;
        if (tenantId == Guid.Empty)
            return Result<Guid>.Failure(DomainErrors.Tenant.TenantNotFound);

        // Get company ID if exists, otherwise use null (nullable company support)
        var companyId = await _companyService.GetDefaultCompanyIdAsync(tenantId, cancellationToken);
        var nullableCompanyId = companyId == Guid.Empty ? (Guid?)null : companyId;

        // Check if department with same name already exists
        var existingDepartment = await _departmentRepository.GetByNameAsync(request.Dto.Name, tenantId, cancellationToken);
        if (existingDepartment != null)
            return Result<Guid>.Failure(DomainErrors.Department.AlreadyExists);

        var department = new Department(
            tenantId,
            nullableCompanyId,
            request.Dto.Name,
            request.Dto.Code,
            request.Dto.Description,
            request.Dto.ParentDepartmentId
        );

        await _departmentRepository.AddAsync(department, cancellationToken);

        return Result<Guid>.Success(department.Id);
    }
}
