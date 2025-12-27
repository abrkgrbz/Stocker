using Stocker.Application.DTOs.Security;
using Stocker.SharedKernel.Results;
using MediatR;

namespace Stocker.Application.Features.Tenant.AuditLogs.Queries;

/// <summary>
/// Query to get a specific audit log by ID for a tenant
/// </summary>
public class GetTenantAuditLogByIdQuery : IRequest<Result<SecurityAuditLogDto>>
{
    public Guid TenantId { get; set; }
    public Guid LogId { get; set; }
}
