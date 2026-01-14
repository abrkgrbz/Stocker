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
    private readonly IBackupSchedulingService _backupSchedulingService;
    private readonly ILogger<RestoreBackupCommandHandler> _logger;

    public RestoreBackupCommandHandler(
        IMasterDbContext masterDbContext,
        IBackupSchedulingService backupSchedulingService,
        ILogger<RestoreBackupCommandHandler> logger)
    {
        _masterDbContext = masterDbContext;
        _backupSchedulingService = backupSchedulingService;
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
            _logger.LogInformation(
                "Backup restore initiated: {BackupId} by {RestoredBy}",
                request.BackupId, request.RestoredBy);

            // Enqueue background job to execute the restore
            var jobId = _backupSchedulingService.EnqueueRestore(
                request.TenantId,
                request.BackupId,
                request.RestoreDatabase,
                request.RestoreFiles,
                request.RestoreConfiguration);

            _logger.LogInformation(
                "Restore job enqueued: {JobId} for backup {BackupId}",
                jobId, request.BackupId);

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
