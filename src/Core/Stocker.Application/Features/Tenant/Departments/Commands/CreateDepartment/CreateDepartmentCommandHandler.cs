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

        var companyId = await _companyService.GetDefaultCompanyIdAsync(tenantId, cancellationToken);
        if (companyId == Guid.Empty)
            return Result<Guid>.Failure(DomainErrors.Tenant.CompanyNotFound);

        // Check if department with same name already exists
        var existingDepartment = await _departmentRepository.GetByNameAsync(request.Dto.Name, tenantId, cancellationToken);
        if (existingDepartment != null)
            return Result<Guid>.Failure(DomainErrors.Department.AlreadyExists);

        var department = new Department(
            tenantId,
            companyId,
            request.Dto.Name,
            request.Dto.Code,
            request.Dto.Description,
            request.Dto.ParentDepartmentId
        );

        await _departmentRepository.AddAsync(department, cancellationToken);

        return Result<Guid>.Success(department.Id);
    }
}
