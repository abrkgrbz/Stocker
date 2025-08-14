using MediatR;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Tenants.Commands.DeleteTenant;

public class DeleteTenantCommand : IRequest<Result<bool>>
{
    public Guid TenantId { get; set; }
    public string? Reason { get; set; }
    public bool HardDelete { get; set; } = false; // Default to soft delete

    public DeleteTenantCommand(Guid tenantId, string? reason = null, bool hardDelete = false)
    {
        TenantId = tenantId;
        Reason = reason;
        HardDelete = hardDelete;
    }
}