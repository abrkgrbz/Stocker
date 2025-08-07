using MediatR;
using Stocker.Application.DTOs.Tenant;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Tenants.Queries.GetTenantById;

public record GetTenantByIdQuery(Guid Id) : IRequest<Result<TenantDto>>;