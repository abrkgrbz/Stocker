using MediatR;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Tenants.Commands.ActivateTenant;

public class ActivateTenantCommand : IRequest<Result<bool>>
{
    public Guid TenantId { get; set; }
    public string? ActivatedBy { get; set; }
    public string? Notes { get; set; }
}