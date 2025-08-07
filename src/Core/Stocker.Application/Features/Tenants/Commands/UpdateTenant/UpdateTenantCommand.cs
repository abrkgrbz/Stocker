using MediatR;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Tenants.Commands.UpdateTenant;

public record UpdateTenantCommand : IRequest<Result<bool>>
{
    public Guid Id { get; set; }
    public string Name { get; init; } = string.Empty;
    public string? ContactEmail { get; init; }
    public string? ContactPhone { get; init; }
    public string? Address { get; init; }
    public string? ModifiedBy { get; set; }
    
    // For Tenant Admin restrictions
    private bool _isRestrictedMode = false;
    
    public void RestrictFieldsForTenantAdmin()
    {
        _isRestrictedMode = true;
    }
    
    public bool IsRestrictedMode => _isRestrictedMode;
}