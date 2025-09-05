using MediatR;

namespace Stocker.Application.Features.Tenant.Modules.Commands;

public class ToggleModuleCommand : IRequest<bool>
{
    public Guid TenantId { get; set; }
    public string ModuleCode { get; set; } = string.Empty;
    public bool Enable { get; set; }
    public string? ModifiedBy { get; set; }
}