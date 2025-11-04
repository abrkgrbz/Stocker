using MediatR;
using Stocker.Application.Common.Models;
using Stocker.Application.DTOs.Tenant.Departments;

namespace Stocker.Application.Features.Tenant.Departments.Commands.CreateDepartment;

public record CreateDepartmentCommand(CreateDepartmentDto Dto) : IRequest<Result<Guid>>;
