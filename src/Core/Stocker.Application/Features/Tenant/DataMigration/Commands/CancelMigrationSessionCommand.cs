using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Application.Common.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Tenant.DataMigration.Commands;

public class CancelMigrationSessionCommand : IRequest<Result<bool>>
{
    public Guid TenantId { get; set; }
    public Guid SessionId { get; set; }
}

public class CancelMigrationSessionCommandHandler : IRequestHandler<CancelMigrationSessionCommand, Result<bool>>
{
    private readonly ITenantDbContextFactory _tenantDbContextFactory;

    public CancelMigrationSessionCommandHandler(ITenantDbContextFactory tenantDbContextFactory)
    {
        _tenantDbContextFactory = tenantDbContextFactory;
    }

    public async Task<Result<bool>> Handle(CancelMigrationSessionCommand request, CancellationToken cancellationToken)
    {
        await using var context = await _tenantDbContextFactory.CreateDbContextAsync(request.TenantId);

        var session = await context.MigrationSessions
            .FirstOrDefaultAsync(s => s.Id == request.SessionId, cancellationToken);

        if (session == null)
        {
            return Result<bool>.Failure(Error.NotFound("SessionNotFound", "Migrasyon oturumu bulunamadı"));
        }

        try
        {
            session.Cancel();
            await context.SaveChangesAsync(cancellationToken);
            return Result<bool>.Success(true);
        }
        catch (InvalidOperationException ex)
        {
            return Result<bool>.Failure(Error.Validation("CannotCancel", ex.Message));
        }
    }
}
