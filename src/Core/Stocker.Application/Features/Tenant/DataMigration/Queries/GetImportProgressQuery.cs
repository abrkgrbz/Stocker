using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Application.Common.Interfaces;
using Stocker.Domain.Migration.Enums;
using Stocker.SharedKernel.DTOs.DataMigration;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Tenant.DataMigration.Queries;

public class GetImportProgressQuery : IRequest<Result<ImportProgressDto>>
{
    public Guid TenantId { get; set; }
    public Guid SessionId { get; set; }
}

public class GetImportProgressQueryHandler : IRequestHandler<GetImportProgressQuery, Result<ImportProgressDto>>
{
    private readonly IMasterDbContext _context;

    public GetImportProgressQueryHandler(IMasterDbContext context)
    {
        _context = context;
    }

    public async Task<Result<ImportProgressDto>> Handle(GetImportProgressQuery request, CancellationToken cancellationToken)
    {
        var session = await _context.MigrationSessions
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.Id == request.SessionId && s.TenantId == request.TenantId, cancellationToken);

        if (session == null)
        {
            return Result<ImportProgressDto>.Failure(Error.NotFound("SessionNotFound", "Migrasyon oturumu bulunamadı"));
        }

        // Count imported records
        var importedCount = await _context.MigrationValidationResults
            .Where(r => r.SessionId == request.SessionId && r.ImportedAt != null)
            .CountAsync(cancellationToken);

        // Calculate total importable
        var totalImportable = await _context.MigrationValidationResults
            .Where(r => r.SessionId == request.SessionId)
            .Where(r => r.Status == ValidationStatus.Valid ||
                       r.Status == ValidationStatus.Warning ||
                       r.Status == ValidationStatus.Fixed)
            .Where(r => r.UserAction != "skip")
            .CountAsync(cancellationToken);

        var progress = new ImportProgressDto
        {
            SessionId = session.Id,
            Status = session.Status.ToString(),
            TotalRecords = session.TotalRecords,
            ImportableRecords = totalImportable,
            ImportedRecords = importedCount,
            SkippedRecords = session.SkippedRecords,
            ProgressPercentage = totalImportable > 0 ? (int)((double)importedCount / totalImportable * 100) : 0,
            StartedAt = session.ImportStartedAt,
            CompletedAt = session.CompletedAt,
            ErrorMessage = session.ErrorMessage,
            EstimatedTimeRemaining = CalculateEstimatedTimeRemaining(session, importedCount, totalImportable)
        };

        return Result<ImportProgressDto>.Success(progress);
    }

    private TimeSpan? CalculateEstimatedTimeRemaining(Domain.Migration.Entities.MigrationSession session, int importedCount, int totalImportable)
    {
        if (session.Status != MigrationSessionStatus.Importing || session.ImportStartedAt == null)
            return null;

        if (importedCount == 0)
            return null;

        var elapsed = DateTime.UtcNow - session.ImportStartedAt.Value;
        var recordsPerSecond = importedCount / elapsed.TotalSeconds;

        if (recordsPerSecond <= 0)
            return null;

        var remainingRecords = totalImportable - importedCount;
        var remainingSeconds = remainingRecords / recordsPerSecond;

        return TimeSpan.FromSeconds(remainingSeconds);
    }
}
