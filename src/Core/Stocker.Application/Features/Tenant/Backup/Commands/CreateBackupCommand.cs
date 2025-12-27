using MediatR;
using Stocker.Application.DTOs.Backup;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Tenant.Backup.Commands;

/// <summary>
/// Command to create a new backup
/// </summary>
public class CreateBackupCommand : IRequest<Result<BackupDto>>
{
    public Guid TenantId { get; init; }
    public string BackupName { get; init; } = string.Empty;
    public string BackupType { get; init; } = "Full"; // Full, Incremental, Differential
    public string CreatedBy { get; init; } = string.Empty;
    public bool IncludeDatabase { get; init; } = true;
    public bool IncludeFiles { get; init; } = true;
    public bool IncludeConfiguration { get; init; } = true;
    public bool Compress { get; init; } = true;
    public bool Encrypt { get; init; } = true;
    public string? Description { get; init; }
}
