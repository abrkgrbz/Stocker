using MediatR;
using Stocker.Application.DTOs.Tenant.Departments;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Tenant.Departments.Queries.GetAllDepartments;

public record GetAllDepartmentsQuery : IRequest<Result<List<DepartmentListDto>>>;
