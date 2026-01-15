using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Application.Common.Interfaces;
using Stocker.Domain.Migration.Enums;
using Stocker.SharedKernel.DTOs.DataMigration;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Tenant.DataMigration.Commands;

public class BulkUpdateMigrationRecordActionCommand : IRequest<Result<BulkActionResponse>>
{
    public Guid TenantId { get; set; }
    public Guid SessionId { get; set; }
    public List<Guid> RecordIds { get; set; } = new();
    public string Action { get; set; } = "import";
}

public class BulkUpdateMigrationRecordActionCommandHandler : IRequestHandler<BulkUpdateMigrationRecordActionCommand, Result<BulkActionResponse>>
{
    private readonly ITenantDbContextFactory _tenantDbContextFactory;

    public BulkUpdateMigrationRecordActionCommandHandler(ITenantDbContextFactory tenantDbContextFactory)
    {
        _tenantDbContextFactory = tenantDbContextFactory;
    }

    public async Task<Result<BulkActionResponse>> Handle(BulkUpdateMigrationRecordActionCommand request, CancellationToken cancellationToken)
    {
        await using var context = await _tenantDbContextFactory.CreateDbContextAsync(request.TenantId);

        // Validate session
        var session = await context.MigrationSessions
            .FirstOrDefaultAsync(s => s.Id == request.SessionId, cancellationToken);

        if (session == null)
        {
            return Result<BulkActionResponse>.Failure(Error.NotFound("SessionNotFound", "Migrasyon oturumu bulunamadı"));
        }

        if (session.Status != MigrationSessionStatus.Validated)
        {
            return Result<BulkActionResponse>.Failure(Error.Validation("InvalidStatus", $"Bu durumda kayıtlar güncellenemez: {session.Status}"));
        }

        // Validate action
        if (request.Action.ToLowerInvariant() != "import" && request.Action.ToLowerInvariant() != "skip")
        {
            return Result<BulkActionResponse>.Failure(Error.Validation("InvalidAction", "Toplu işlem sadece 'import' veya 'skip' olabilir"));
        }

        // Get records
        var records = await context.MigrationValidationResults
            .Where(r => request.RecordIds.Contains(r.Id) && r.SessionId == request.SessionId)
            .ToListAsync(cancellationToken);

        int updatedCount = 0;
        int skippedCount = 0;

        foreach (var record in records)
        {
            switch (request.Action.ToLowerInvariant())
            {
                case "import":
                    if (record.CanBeImported)
                    {
                        record.MarkForImport();
                        updatedCount++;
                    }
                    else
                    {
                        skippedCount++;
                    }
                    break;

                case "skip":
                    record.Skip();
                    updatedCount++;
                    break;
            }
        }

        await context.SaveChangesAsync(cancellationToken);

        return Result<BulkActionResponse>.Success(new BulkActionResponse
        {
            UpdatedCount = updatedCount,
            SkippedCount = skippedCount,
            TotalRequested = request.RecordIds.Count
        });
    }
}
