using MediatR;
using Stocker.Application.Common.Models;
using Stocker.Application.DTOs.Tenant.Departments;

namespace Stocker.Application.Features.Tenant.Departments.Queries.GetAllDepartments;

public record GetAllDepartmentsQuery : IRequest<Result<List<DepartmentListDto>>>;
