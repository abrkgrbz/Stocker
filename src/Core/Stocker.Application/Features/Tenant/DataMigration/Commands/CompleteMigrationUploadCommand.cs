using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Application.Common.Interfaces;
using Stocker.Domain.Migration.Enums;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Tenant.DataMigration.Commands;

public class CompleteMigrationUploadCommand : IRequest<Result<bool>>
{
    public Guid TenantId { get; set; }
    public Guid SessionId { get; set; }
}

public class CompleteMigrationUploadCommandHandler : IRequestHandler<CompleteMigrationUploadCommand, Result<bool>>
{
    private readonly IMasterDbContext _context;

    public CompleteMigrationUploadCommandHandler(IMasterDbContext context)
    {
        _context = context;
    }

    public async Task<Result<bool>> Handle(CompleteMigrationUploadCommand request, CancellationToken cancellationToken)
    {
        var session = await _context.MigrationSessions
            .FirstOrDefaultAsync(s => s.Id == request.SessionId && s.TenantId == request.TenantId, cancellationToken);

        if (session == null)
        {
            return Result<bool>.Failure(Error.NotFound("SessionNotFound", "Migrasyon oturumu bulunamadı"));
        }

        if (session.Status != MigrationSessionStatus.Uploading)
        {
            return Result<bool>.Failure(Error.Validation("InvalidStatus", $"Yükleme bu durumda tamamlanamaz: {session.Status}"));
        }

        // Count total records
        var totalRecords = await _context.MigrationValidationResults
            .Where(r => r.SessionId == request.SessionId)
            .CountAsync(cancellationToken);

        if (totalRecords == 0)
        {
            return Result<bool>.Failure(Error.Validation("NoRecords", "Henüz veri yüklenmedi"));
        }

        session.MarkAsUploaded(totalRecords);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
