using MediatR;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Tenant.Backup.Commands;

/// <summary>
/// Command to restore from a backup
/// </summary>
public class RestoreBackupCommand : IRequest<Result>
{
    public Guid TenantId { get; init; }
    public Guid BackupId { get; init; }
    public string RestoredBy { get; init; } = string.Empty;
    public string? Notes { get; init; }

    /// <summary>
    /// Whether to restore the database (if backup includes it)
    /// </summary>
    public bool RestoreDatabase { get; init; } = true;

    /// <summary>
    /// Whether to restore files (if backup includes them)
    /// </summary>
    public bool RestoreFiles { get; init; } = true;

    /// <summary>
    /// Whether to restore configuration (if backup includes it)
    /// </summary>
    public bool RestoreConfiguration { get; init; } = true;
}
