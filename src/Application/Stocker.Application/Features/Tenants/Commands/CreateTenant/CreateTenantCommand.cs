using MediatR;
using Stocker.Domain.Enums;

namespace Stocker.Application.Features.Tenants.Commands.CreateTenant;

public class CreateTenantCommand : IRequest<CreateTenantResponse>
{
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string Domain { get; set; } = string.Empty;
    public string ContactEmail { get; set; } = string.Empty;
    public Guid PackageId { get; set; }
    public BillingCycle BillingCycle { get; set; }
}

public class CreateTenantResponse
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string Domain { get; set; } = string.Empty;
    public string ContactEmail { get; set; } = string.Empty;
    public Guid PackageId { get; set; }
    public string PackageName { get; set; } = string.Empty;
    public BillingCycle BillingCycle { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}