using MediatR;
using Stocker.Application.DTOs.Tenant;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Tenants.Commands.CreateTenantFromRegistration;

public sealed record CreateTenantFromRegistrationCommand(Guid RegistrationId) : IRequest<Result<TenantDto>>;