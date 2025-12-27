using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Application.Common.Interfaces;
using Stocker.Application.DTOs.Backup;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Tenant.Backup.Queries;

/// <summary>
/// Handler for getting a specific backup by ID
/// </summary>
public class GetBackupByIdQueryHandler : IRequestHandler<GetBackupByIdQuery, Result<BackupDetailDto>>
{
    private readonly IMasterDbContext _masterDbContext;

    public GetBackupByIdQueryHandler(IMasterDbContext masterDbContext)
    {
        _masterDbContext = masterDbContext;
    }

    public async Task<Result<BackupDetailDto>> Handle(GetBackupByIdQuery request, CancellationToken cancellationToken)
    {
        var backup = await _masterDbContext.TenantBackups
            .AsQueryable()
            .Where(b => b.Id == request.BackupId && b.TenantId == request.TenantId)
            .Select(b => new BackupDetailDto
            {
                Id = b.Id,
                BackupName = b.BackupName,
                BackupType = b.BackupType,
                Status = b.Status,
                CreatedAt = b.CreatedAt,
                CompletedAt = b.CompletedAt,
                CreatedBy = b.CreatedBy,
                SizeInBytes = b.SizeInBytes,
                StorageLocation = b.StorageLocation,
                IncludesDatabase = b.IncludesDatabase,
                IncludesFiles = b.IncludesFiles,
                IncludesConfiguration = b.IncludesConfiguration,
                IsCompressed = b.IsCompressed,
                IsEncrypted = b.IsEncrypted,
                IsRestorable = b.IsRestorable,
                ExpiresAt = b.ExpiresAt,
                Description = b.Description,
                FilePath = b.FilePath,
                DownloadUrl = b.DownloadUrl,
                LastRestoredAt = b.LastRestoredAt,
                RestoreCount = b.RestoreCount,
                RestoreNotes = b.RestoreNotes,
                ErrorMessage = b.ErrorMessage,
                RetryCount = b.RetryCount,
                Tags = b.Tags,
                Metadata = b.Metadata
            })
            .FirstOrDefaultAsync(cancellationToken);

        if (backup == null)
        {
            return Result<BackupDetailDto>.Failure(
                new Error("Backup.NotFound", "Yedek bulunamadı", ErrorType.NotFound));
        }

        return Result<BackupDetailDto>.Success(backup);
    }
}
