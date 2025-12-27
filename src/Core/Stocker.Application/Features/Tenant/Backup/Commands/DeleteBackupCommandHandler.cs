using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Tenant.Backup.Commands;

/// <summary>
/// Handler for deleting a backup
/// </summary>
public class DeleteBackupCommandHandler : IRequestHandler<DeleteBackupCommand, Result>
{
    private readonly IMasterDbContext _masterDbContext;
    private readonly ILogger<DeleteBackupCommandHandler> _logger;

    public DeleteBackupCommandHandler(
        IMasterDbContext masterDbContext,
        ILogger<DeleteBackupCommandHandler> logger)
    {
        _masterDbContext = masterDbContext;
        _logger = logger;
    }

    public async Task<Result> Handle(DeleteBackupCommand request, CancellationToken cancellationToken)
    {
        var backup = await _masterDbContext.TenantBackups
            .FirstOrDefaultAsync(b => b.Id == request.BackupId && b.TenantId == request.TenantId, cancellationToken);

        if (backup == null)
        {
            return Result.Failure(
                new Error("Backup.NotFound", "Yedek bulunamadı", ErrorType.NotFound));
        }

        try
        {
            // Mark as deleted (soft delete)
            backup.MarkAsDeleted();
            await _masterDbContext.SaveChangesAsync(cancellationToken);

            _logger.LogInformation(
                "Backup deleted: {BackupId} by {DeletedBy}",
                request.BackupId, request.DeletedBy);

            return Result.Success();
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Cannot delete backup {BackupId}", request.BackupId);
            return Result.Failure(
                new Error("Backup.CannotDelete", ex.Message, ErrorType.Validation));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to delete backup {BackupId}", request.BackupId);
            return Result.Failure(
                new Error("Backup.DeleteFailed", "Yedek silinemedi", ErrorType.Failure));
        }
    }
}
