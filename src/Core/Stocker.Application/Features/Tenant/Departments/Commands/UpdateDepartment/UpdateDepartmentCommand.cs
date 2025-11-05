using MediatR;
using Stocker.Application.DTOs.Tenant.Departments;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Tenant.Departments.Commands.UpdateDepartment;

public record UpdateDepartmentCommand(Guid Id, UpdateDepartmentDto Dto) : IRequest<Result<bool>>;
