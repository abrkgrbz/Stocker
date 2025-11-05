using MediatR;
using Stocker.Application.DTOs.Tenant.Departments;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Tenant.Departments.Commands.CreateDepartment;

public record CreateDepartmentCommand(CreateDepartmentDto Dto) : IRequest<Result<Guid>>;
