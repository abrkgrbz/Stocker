using MediatR;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Tenants.Commands.SuspendTenant;

public class SuspendTenantCommand : IRequest<Result<bool>>
{
    public Guid TenantId { get; set; }
    public string Reason { get; set; } = string.Empty;
    public DateTime? SuspendedUntil { get; set; }
    public string? SuspendedBy { get; set; }
}