using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Application.Common.Interfaces;
using Stocker.Application.DTOs.Backup;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Tenant.Backup.Queries;

/// <summary>
/// Handler for getting backup statistics
/// </summary>
public class GetBackupStatisticsQueryHandler : IRequestHandler<GetBackupStatisticsQuery, Result<BackupStatisticsDto>>
{
    private readonly IMasterDbContext _masterDbContext;

    public GetBackupStatisticsQueryHandler(IMasterDbContext masterDbContext)
    {
        _masterDbContext = masterDbContext;
    }

    public async Task<Result<BackupStatisticsDto>> Handle(GetBackupStatisticsQuery request, CancellationToken cancellationToken)
    {
        var query = _masterDbContext.TenantBackups
            .AsQueryable()
            .Where(b => b.TenantId == request.TenantId);

        var totalBackups = await query.CountAsync(cancellationToken);
        var completedBackups = await query.Where(b => b.Status == "Completed").CountAsync(cancellationToken);
        var pendingBackups = await query.Where(b => b.Status == "Pending" || b.Status == "InProgress").CountAsync(cancellationToken);
        var failedBackups = await query.Where(b => b.Status == "Failed").CountAsync(cancellationToken);
        var totalSizeBytes = await query.Where(b => b.Status == "Completed").SumAsync(b => b.SizeInBytes, cancellationToken);
        var lastBackupDate = await query
            .Where(b => b.Status == "Completed")
            .OrderByDescending(b => b.CompletedAt)
            .Select(b => b.CompletedAt)
            .FirstOrDefaultAsync(cancellationToken);
        var restorableBackups = await query.Where(b => b.IsRestorable).CountAsync(cancellationToken);
        var expiredBackups = await query
            .Where(b => b.ExpiresAt != null && b.ExpiresAt < DateTime.UtcNow)
            .CountAsync(cancellationToken);

        var statistics = new BackupStatisticsDto
        {
            TotalBackups = totalBackups,
            CompletedBackups = completedBackups,
            PendingBackups = pendingBackups,
            FailedBackups = failedBackups,
            TotalSizeBytes = totalSizeBytes,
            LastBackupDate = lastBackupDate,
            RestorableBackups = restorableBackups,
            ExpiredBackups = expiredBackups
        };

        return Result<BackupStatisticsDto>.Success(statistics);
    }
}
