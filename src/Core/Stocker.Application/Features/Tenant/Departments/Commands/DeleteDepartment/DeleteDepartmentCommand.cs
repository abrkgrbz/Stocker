using MediatR;
using Stocker.Application.Common.Models;

namespace Stocker.Application.Features.Tenant.Departments.Commands.DeleteDepartment;

public record DeleteDepartmentCommand(Guid Id) : IRequest<Result<bool>>;
