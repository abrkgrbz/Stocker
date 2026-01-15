using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Application.Common.Interfaces;
using Stocker.Domain.Migration.Enums;
using Stocker.SharedKernel.DTOs.DataMigration;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Tenant.DataMigration.Queries;

public class GetValidationPreviewQuery : IRequest<Result<ValidationPreviewResponse>>
{
    public Guid TenantId { get; set; }
    public Guid SessionId { get; set; }
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 50;
    public string? Status { get; set; }
    public string? EntityType { get; set; }
}

public class GetValidationPreviewQueryHandler : IRequestHandler<GetValidationPreviewQuery, Result<ValidationPreviewResponse>>
{
    private readonly ITenantDbContextFactory _tenantDbContextFactory;

    public GetValidationPreviewQueryHandler(ITenantDbContextFactory tenantDbContextFactory)
    {
        _tenantDbContextFactory = tenantDbContextFactory;
    }

    public async Task<Result<ValidationPreviewResponse>> Handle(GetValidationPreviewQuery request, CancellationToken cancellationToken)
    {
        await using var context = await _tenantDbContextFactory.CreateDbContextAsync(request.TenantId);

        // Validate session
        var session = await context.MigrationSessions
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.Id == request.SessionId, cancellationToken);

        if (session == null)
        {
            return Result<ValidationPreviewResponse>.Failure(Error.NotFound("SessionNotFound", "Migrasyon oturumu bulunamadı"));
        }

        var query = context.MigrationValidationResults
            .AsNoTracking()
            .Where(r => r.SessionId == request.SessionId);

        // Filter by status
        if (!string.IsNullOrEmpty(request.Status) && Enum.TryParse<ValidationStatus>(request.Status, true, out var status))
        {
            query = query.Where(r => r.Status == status);
        }

        // Filter by entity type
        if (!string.IsNullOrEmpty(request.EntityType) && Enum.TryParse<MigrationEntityType>(request.EntityType, true, out var entityType))
        {
            query = query.Where(r => r.EntityType == entityType);
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var records = await query
            .OrderBy(r => r.GlobalRowIndex)
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(cancellationToken);

        // Get summary statistics
        var summaryQuery = context.MigrationValidationResults
            .Where(r => r.SessionId == request.SessionId);

        var validCount = await summaryQuery.CountAsync(r => r.Status == ValidationStatus.Valid, cancellationToken);
        var warningCount = await summaryQuery.CountAsync(r => r.Status == ValidationStatus.Warning, cancellationToken);
        var errorCount = await summaryQuery.CountAsync(r => r.Status == ValidationStatus.Error, cancellationToken);
        var fixedCount = await summaryQuery.CountAsync(r => r.Status == ValidationStatus.Fixed, cancellationToken);
        var skippedCount = await summaryQuery.CountAsync(r => r.Status == ValidationStatus.Skipped, cancellationToken);
        var pendingCount = await summaryQuery.CountAsync(r => r.Status == ValidationStatus.Pending, cancellationToken);

        var response = new ValidationPreviewResponse
        {
            SessionId = request.SessionId,
            TotalRecords = session.TotalRecords,
            ValidCount = validCount,
            WarningCount = warningCount,
            ErrorCount = errorCount,
            FixedCount = fixedCount,
            SkippedCount = skippedCount,
            PendingCount = pendingCount,
            PageNumber = request.PageNumber,
            PageSize = request.PageSize,
            TotalPages = (int)Math.Ceiling(totalCount / (double)request.PageSize),
            Records = records.Select(r => new ValidationResultItem
            {
                RecordId = r.Id,
                EntityType = r.EntityType.ToString(),
                RowIndex = r.GlobalRowIndex,
                Status = r.Status.ToString(),
                OriginalData = r.OriginalDataJson,
                TransformedData = r.TransformedDataJson,
                FixedData = r.FixedDataJson,
                Errors = r.ErrorsJson,
                Warnings = r.WarningsJson,
                UserAction = r.UserAction
            }).ToList()
        };

        return Result<ValidationPreviewResponse>.Success(response);
    }
}
