using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Application.Common.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Tenant.DataMigration.Commands;

public class DeleteMigrationSessionCommand : IRequest<Result<bool>>
{
    public Guid TenantId { get; set; }
    public Guid SessionId { get; set; }
}

public class DeleteMigrationSessionCommandHandler : IRequestHandler<DeleteMigrationSessionCommand, Result<bool>>
{
    private readonly IMasterDbContext _context;

    public DeleteMigrationSessionCommandHandler(IMasterDbContext context)
    {
        _context = context;
    }

    public async Task<Result<bool>> Handle(DeleteMigrationSessionCommand request, CancellationToken cancellationToken)
    {
        var session = await _context.MigrationSessions
            .FirstOrDefaultAsync(s => s.Id == request.SessionId && s.TenantId == request.TenantId, cancellationToken);

        if (session == null)
        {
            return Result<bool>.Failure(Error.NotFound("SessionNotFound", "Migrasyon oturumu bulunamadı"));
        }

        if (!session.CanBeDeleted)
        {
            return Result<bool>.Failure(Error.Validation("CannotDelete", $"Bu durumda oturum silinemez: {session.Status}"));
        }

        // Delete related records first (due to FK constraints)
        var validationResults = await _context.MigrationValidationResults
            .Where(r => r.SessionId == request.SessionId)
            .ToListAsync(cancellationToken);

        _context.MigrationValidationResults.RemoveRange(validationResults);

        var chunks = await _context.MigrationChunks
            .Where(c => c.SessionId == request.SessionId)
            .ToListAsync(cancellationToken);

        _context.MigrationChunks.RemoveRange(chunks);

        _context.MigrationSessions.Remove(session);

        await _context.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
