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
    private readonly IMasterDbContext _context;

    public CancelMigrationSessionCommandHandler(IMasterDbContext context)
    {
        _context = context;
    }

    public async Task<Result<bool>> Handle(CancelMigrationSessionCommand request, CancellationToken cancellationToken)
    {
        var session = await _context.MigrationSessions
            .FirstOrDefaultAsync(s => s.Id == request.SessionId && s.TenantId == request.TenantId, cancellationToken);

        if (session == null)
        {
            return Result<bool>.Failure(Error.NotFound("SessionNotFound", "Migrasyon oturumu bulunamadı"));
        }

        try
        {
            session.Cancel();
            await _context.SaveChangesAsync(cancellationToken);
            return Result<bool>.Success(true);
        }
        catch (InvalidOperationException ex)
        {
            return Result<bool>.Failure(Error.Validation("CannotCancel", ex.Message));
        }
    }
}
