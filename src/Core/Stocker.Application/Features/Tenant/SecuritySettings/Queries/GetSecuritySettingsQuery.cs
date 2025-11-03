using MediatR;
using Stocker.Application.DTOs.Tenant.Security;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Tenant.SecuritySettings.Queries;

/// <summary>
/// Query to get complete security settings for a tenant
/// </summary>
public class GetSecuritySettingsQuery : IRequest<Result<SecuritySettingsDto>>
{
    public Guid TenantId { get; set; }
}
