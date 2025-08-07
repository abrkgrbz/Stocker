using MediatR;
using Stocker.Application.DTOs.Tenant;
using Stocker.Domain.Master.Enums;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Tenants.Commands.CreateTenant;

public record CreateTenantCommand : IRequest<Result<TenantDto>>
{
    public string Name { get; init; } = string.Empty;
    public string Code { get; init; } = string.Empty;
    public string Domain { get; init; } = string.Empty;
    public string? ContactEmail { get; init; }
    public Guid PackageId { get; init; }
    public BillingCycle BillingCycle { get; init; } = BillingCycle.Monthly; // Default to monthly
}