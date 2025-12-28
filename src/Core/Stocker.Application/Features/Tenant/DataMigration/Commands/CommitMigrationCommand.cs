using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Application.Common.Interfaces;
using Stocker.Domain.Migration.Enums;
using Stocker.SharedKernel.DTOs.DataMigration;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Tenant.DataMigration.Commands;

public class CommitMigrationCommand : IRequest<Result<CommitMigrationResponse>>
{
    public Guid TenantId { get; set; }
    public Guid SessionId { get; set; }
    public MigrationOptionsDto? Options { get; set; }
}

public class CommitMigrationCommandHandler : IRequestHandler<CommitMigrationCommand, Result<CommitMigrationResponse>>
{
    private readonly IMasterDbContext _context;
    private readonly IMigrationJobScheduler _jobScheduler;

    public CommitMigrationCommandHandler(
        IMasterDbContext context,
        IMigrationJobScheduler jobScheduler)
    {
        _context = context;
        _jobScheduler = jobScheduler;
    }

    public async Task<Result<CommitMigrationResponse>> Handle(CommitMigrationCommand request, CancellationToken cancellationToken)
    {
        var session = await _context.MigrationSessions
            .FirstOrDefaultAsync(s => s.Id == request.SessionId && s.TenantId == request.TenantId, cancellationToken);

        if (session == null)
        {
            return Result<CommitMigrationResponse>.Failure(Error.NotFound("SessionNotFound", "Migrasyon oturumu bulunamadı"));
        }

        if (session.Status != MigrationSessionStatus.Validated)
        {
            return Result<CommitMigrationResponse>.Failure(Error.Validation("InvalidStatus", $"Bu durumda import başlatılamaz: {session.Status}"));
        }

        // Count importable records
        var importableCount = await _context.MigrationValidationResults
            .Where(r => r.SessionId == request.SessionId)
            .Where(r => r.Status == ValidationStatus.Valid ||
                       r.Status == ValidationStatus.Warning ||
                       r.Status == ValidationStatus.Fixed)
            .Where(r => r.UserAction != "skip")
            .CountAsync(cancellationToken);

        if (importableCount == 0)
        {
            return Result<CommitMigrationResponse>.Failure(Error.Validation("NoImportableRecords", "İçe aktarılabilecek kayıt bulunamadı"));
        }

        // Save options
        if (request.Options != null)
        {
            var optionsJson = System.Text.Json.JsonSerializer.Serialize(request.Options);
            session.SetOptions(optionsJson);
        }

        // Enqueue import job
        var jobId = _jobScheduler.EnqueueImportJob(request.SessionId);

        session.StartImport(jobId);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<CommitMigrationResponse>.Success(new CommitMigrationResponse
        {
            SessionId = session.Id,
            JobId = jobId,
            EstimatedRecords = importableCount,
            Message = $"{importableCount} kayıt içe aktarılmak üzere kuyruğa alındı"
        });
    }
}

/// <summary>
/// Interface for migration import background job
/// </summary>
public interface IMigrationImportJob
{
    Task ImportSessionAsync(Guid sessionId, CancellationToken cancellationToken);
}
