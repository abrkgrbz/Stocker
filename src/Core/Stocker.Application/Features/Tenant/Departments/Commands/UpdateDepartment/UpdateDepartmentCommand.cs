using MediatR;
using Stocker.Application.Common.Models;
using Stocker.Application.DTOs.Tenant.Departments;

namespace Stocker.Application.Features.Tenant.Departments.Commands.UpdateDepartment;

public record UpdateDepartmentCommand(Guid Id, UpdateDepartmentDto Dto) : IRequest<Result<bool>>;
