using MediatR;
using Stocker.Application.Features.Tenants.Queries.GetTenantSettings;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Tenants.Commands.UpdateTenantSettings;

public record UpdateTenantSettingsCommand : IRequest<Result>
{
    public Guid TenantId { get; init; }
    public GeneralSettings? General { get; init; }
    public BrandingSettings? Branding { get; init; }
    public EmailSettings? Email { get; init; }
    public NotificationSettings? Notifications { get; init; }
    public SecuritySettings? Security { get; init; }
    public ApiSettings? Api { get; init; }
    public StorageSettings? Storage { get; init; }
    public AdvancedSettings? Advanced { get; init; }
}
