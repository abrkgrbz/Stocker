using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Tenant.Backup.Commands;

/// <summary>
/// Handler for restoring from a backup
/// </summary>
public class RestoreBackupCommandHandler : IRequestHandler<RestoreBackupCommand, Result>
{
    private readonly IMasterDbContext _masterDbContext;
    private readonly ILogger<RestoreBackupCommandHandler> _logger;

    public RestoreBackupCommandHandler(
        IMasterDbContext masterDbContext,
        ILogger<RestoreBackupCommandHandler> logger)
    {
        _masterDbContext = masterDbContext;
        _logger = logger;
    }

    public async Task<Result> Handle(RestoreBackupCommand request, CancellationToken cancellationToken)
    {
        var backup = await _masterDbContext.TenantBackups
            .FirstOrDefaultAsync(b => b.Id == request.BackupId && b.TenantId == request.TenantId, cancellationToken);

        if (backup == null)
        {
            return Result.Failure(
                new Error("Backup.NotFound", "Yedek bulunamadı", ErrorType.NotFound));
        }

        if (!backup.IsRestorable)
        {
            return Result.Failure(
                new Error("Backup.NotRestorable", "Bu yedek geri yüklenebilir durumda değil", ErrorType.Validation));
        }

        if (backup.IsExpired())
        {
            return Result.Failure(
                new Error("Backup.Expired", "Bu yedeğin süresi dolmuş", ErrorType.Validation));
        }

        try
        {
            // Record restore attempt
            backup.RecordRestore(request.Notes);
            await _masterDbContext.SaveChangesAsync(cancellationToken);

            _logger.LogInformation(
                "Backup restore initiated: {BackupId} by {RestoredBy}",
                request.BackupId, request.RestoredBy);

            // TODO: Implement actual restore logic
            // This would typically:
            // 1. Stop the tenant's services
            // 2. Restore database from backup
            // 3. Restore files from backup
            // 4. Restore configuration
            // 5. Restart services
            // For now, we just record the restore attempt

            return Result.Success();
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Cannot restore backup {BackupId}", request.BackupId);
            return Result.Failure(
                new Error("Backup.CannotRestore", ex.Message, ErrorType.Validation));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to restore backup {BackupId}", request.BackupId);
            return Result.Failure(
                new Error("Backup.RestoreFailed", "Geri yükleme başarısız oldu", ErrorType.Failure));
        }
    }
}
