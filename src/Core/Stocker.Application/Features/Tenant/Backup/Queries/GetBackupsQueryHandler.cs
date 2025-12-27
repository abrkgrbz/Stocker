using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Application.Common.Interfaces;
using Stocker.Application.DTOs.Backup;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Tenant.Backup.Queries;

/// <summary>
/// Handler for getting list of backups
/// </summary>
public class GetBackupsQueryHandler : IRequestHandler<GetBackupsQuery, Result<PagedResult<BackupDto>>>
{
    private readonly IMasterDbContext _masterDbContext;

    public GetBackupsQueryHandler(IMasterDbContext masterDbContext)
    {
        _masterDbContext = masterDbContext;
    }

    public async Task<Result<PagedResult<BackupDto>>> Handle(GetBackupsQuery request, CancellationToken cancellationToken)
    {
        var query = _masterDbContext.TenantBackups
            .AsQueryable()
            .Where(b => b.TenantId == request.TenantId);

        // Apply filters
        if (!string.IsNullOrEmpty(request.Status))
            query = query.Where(b => b.Status == request.Status);

        if (!string.IsNullOrEmpty(request.BackupType))
            query = query.Where(b => b.BackupType == request.BackupType);

        if (request.FromDate.HasValue)
            query = query.Where(b => b.CreatedAt >= request.FromDate.Value);

        if (request.ToDate.HasValue)
            query = query.Where(b => b.CreatedAt <= request.ToDate.Value);

        // Get total count
        var totalCount = await query.CountAsync(cancellationToken);

        // Apply sorting
        query = request.SortBy?.ToLower() switch
        {
            "name" => request.SortDescending ? query.OrderByDescending(b => b.BackupName) : query.OrderBy(b => b.BackupName),
            "size" => request.SortDescending ? query.OrderByDescending(b => b.SizeInBytes) : query.OrderBy(b => b.SizeInBytes),
            "status" => request.SortDescending ? query.OrderByDescending(b => b.Status) : query.OrderBy(b => b.Status),
            "type" => request.SortDescending ? query.OrderByDescending(b => b.BackupType) : query.OrderBy(b => b.BackupType),
            _ => request.SortDescending ? query.OrderByDescending(b => b.CreatedAt) : query.OrderBy(b => b.CreatedAt)
        };

        // Apply pagination
        var skip = (request.PageNumber - 1) * request.PageSize;
        var backups = await query
            .Skip(skip)
            .Take(request.PageSize)
            .Select(b => new BackupDto
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
                Description = b.Description
            })
            .ToListAsync(cancellationToken);

        var result = new PagedResult<BackupDto>
        {
            Items = backups,
            TotalCount = totalCount,
            PageNumber = request.PageNumber,
            PageSize = request.PageSize
        };

        return Result<PagedResult<BackupDto>>.Success(result);
    }
}
