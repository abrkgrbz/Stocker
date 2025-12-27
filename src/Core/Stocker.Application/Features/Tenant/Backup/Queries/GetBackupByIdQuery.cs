using MediatR;
using Stocker.Application.DTOs.Backup;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Tenant.Backup.Queries;

/// <summary>
/// Query to get a specific backup by ID
/// </summary>
public class GetBackupByIdQuery : IRequest<Result<BackupDetailDto>>
{
    public Guid TenantId { get; init; }
    public Guid BackupId { get; init; }
}
