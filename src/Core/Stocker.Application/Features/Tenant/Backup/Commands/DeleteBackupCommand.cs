using MediatR;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Tenant.Backup.Commands;

/// <summary>
/// Command to delete a backup
/// </summary>
public class DeleteBackupCommand : IRequest<Result>
{
    public Guid TenantId { get; init; }
    public Guid BackupId { get; init; }
    public string DeletedBy { get; init; } = string.Empty;
}
