using MediatR;
using Stocker.Application.Common.Interfaces;
using Stocker.Application.Common.Models;
using Stocker.Application.Interfaces.Repositories;
using Stocker.SharedKernel.Errors;

namespace Stocker.Application.Features.Tenant.Departments.Commands.UpdateDepartment;

public class UpdateDepartmentCommandHandler : IRequestHandler<UpdateDepartmentCommand, Result<bool>>
{
    private readonly IDepartmentRepository _departmentRepository;
    private readonly ITenantService _tenantService;

    public UpdateDepartmentCommandHandler(
        IDepartmentRepository departmentRepository,
        ITenantService tenantService)
    {
        _departmentRepository = departmentRepository;
        _tenantService = tenantService;
    }

    public async Task<Result<bool>> Handle(UpdateDepartmentCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _tenantService.GetTenantId();
        if (tenantId == Guid.Empty)
            return Result<bool>.Failure(DomainErrors.Tenant.TenantNotFound);

        var department = await _departmentRepository.GetByIdAsync(request.Id, tenantId, cancellationToken);
        if (department == null)
            return Result<bool>.Failure(DomainErrors.Department.NotFound);

        department.Update(request.Dto.Name, request.Dto.Code, request.Dto.Description);
        await _departmentRepository.UpdateAsync(department, cancellationToken);

        return Result<bool>.Success(true);
    }
}
