using MediatR;
using Stocker.Application.DTOs.Backup;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Tenant.Backup.Queries;

/// <summary>
/// Query to get backup statistics for a tenant
/// </summary>
public class GetBackupStatisticsQuery : IRequest<Result<BackupStatisticsDto>>
{
    public Guid TenantId { get; init; }
}
