using MediatR;
using Stocker.Application.Common.Interfaces;
using Stocker.Application.Common.Models;
using Stocker.Application.Interfaces.Repositories;
using Stocker.SharedKernel.Errors;

namespace Stocker.Application.Features.Tenant.Departments.Commands.DeleteDepartment;

public class DeleteDepartmentCommandHandler : IRequestHandler<DeleteDepartmentCommand, Result<bool>>
{
    private readonly IDepartmentRepository _departmentRepository;
    private readonly ITenantService _tenantService;

    public DeleteDepartmentCommandHandler(
        IDepartmentRepository departmentRepository,
        ITenantService tenantService)
    {
        _departmentRepository = departmentRepository;
        _tenantService = tenantService;
    }

    public async Task<Result<bool>> Handle(DeleteDepartmentCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _tenantService.GetTenantId();
        if (tenantId == Guid.Empty)
            return Result<bool>.Failure(DomainErrors.Tenant.TenantNotFound);

        var department = await _departmentRepository.GetByIdAsync(request.Id, tenantId, cancellationToken);
        if (department == null)
            return Result<bool>.Failure(DomainErrors.Department.NotFound);

        // Check if department has employees
        var employeeCount = await _departmentRepository.GetEmployeeCountAsync(request.Id, tenantId, cancellationToken);
        if (employeeCount > 0)
            return Result<bool>.Failure(DomainErrors.Department.HasEmployees);

        await _departmentRepository.DeleteAsync(department, cancellationToken);

        return Result<bool>.Success(true);
    }
}
