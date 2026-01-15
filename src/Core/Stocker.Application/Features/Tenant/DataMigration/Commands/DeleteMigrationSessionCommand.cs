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
    private readonly ITenantDbContextFactory _tenantDbContextFactory;

    public DeleteMigrationSessionCommandHandler(ITenantDbContextFactory tenantDbContextFactory)
    {
        _tenantDbContextFactory = tenantDbContextFactory;
    }

    public async Task<Result<bool>> Handle(DeleteMigrationSessionCommand request, CancellationToken cancellationToken)
    {
        await using var context = await _tenantDbContextFactory.CreateDbContextAsync(request.TenantId);

        var session = await context.MigrationSessions
            .FirstOrDefaultAsync(s => s.Id == request.SessionId, cancellationToken);

        if (session == null)
        {
            return Result<bool>.Failure(Error.NotFound("SessionNotFound", "Migrasyon oturumu bulunamadı"));
        }

        if (!session.CanBeDeleted)
        {
            return Result<bool>.Failure(Error.Validation("CannotDelete", $"Bu durumda oturum silinemez: {session.Status}"));
        }

        // Delete related records first (due to FK constraints)
        var validationResults = await context.MigrationValidationResults
            .Where(r => r.SessionId == request.SessionId)
            .ToListAsync(cancellationToken);

        context.MigrationValidationResults.RemoveRange(validationResults);

        var chunks = await context.MigrationChunks
            .Where(c => c.SessionId == request.SessionId)
            .ToListAsync(cancellationToken);

        context.MigrationChunks.RemoveRange(chunks);

        context.MigrationSessions.Remove(session);

        await context.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
