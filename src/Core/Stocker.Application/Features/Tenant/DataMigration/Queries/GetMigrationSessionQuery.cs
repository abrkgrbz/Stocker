using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Application.Common.Interfaces;
using Stocker.SharedKernel.DTOs.DataMigration;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Tenant.DataMigration.Queries;

public class GetMigrationSessionQuery : IRequest<Result<MigrationSessionResponse>>
{
    public Guid TenantId { get; set; }
    public Guid SessionId { get; set; }
}

public class GetMigrationSessionQueryHandler : IRequestHandler<GetMigrationSessionQuery, Result<MigrationSessionResponse>>
{
    private readonly IMasterDbContext _context;

    public GetMigrationSessionQueryHandler(IMasterDbContext context)
    {
        _context = context;
    }

    public async Task<Result<MigrationSessionResponse>> Handle(GetMigrationSessionQuery request, CancellationToken cancellationToken)
    {
        var session = await _context.MigrationSessions
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.Id == request.SessionId && s.TenantId == request.TenantId, cancellationToken);

        if (session == null)
        {
            return Result<MigrationSessionResponse>.Failure(Error.NotFound("SessionNotFound", "Migrasyon oturumu bulunamadı"));
        }

        return Result<MigrationSessionResponse>.Success(new MigrationSessionResponse
        {
            SessionId = session.Id,
            TenantId = session.TenantId,
            SourceType = session.SourceType.ToString(),
            SourceName = session.SourceName,
            Status = session.Status.ToString(),
            Entities = session.Entities.Select(e => e.ToString()).ToList(),
            TotalRecords = session.TotalRecords,
            ValidRecords = session.ValidRecords,
            WarningRecords = session.WarningRecords,
            ErrorRecords = session.ErrorRecords,
            ImportedRecords = session.ImportedRecords,
            SkippedRecords = session.SkippedRecords,
            ErrorMessage = session.ErrorMessage,
            CreatedAt = session.CreatedAt,
            ValidatedAt = session.ValidatedAt,
            ImportStartedAt = session.ImportStartedAt,
            CompletedAt = session.CompletedAt,
            ExpiresAt = session.ExpiresAt
        });
    }
}
