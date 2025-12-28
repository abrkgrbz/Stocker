using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Application.Common.Interfaces;
using Stocker.Domain.Migration.Enums;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Tenant.DataMigration.Commands;

public class StartMigrationValidationCommand : IRequest<Result<bool>>
{
    public Guid TenantId { get; set; }
    public Guid SessionId { get; set; }
}

public class StartMigrationValidationCommandHandler : IRequestHandler<StartMigrationValidationCommand, Result<bool>>
{
    private readonly IMasterDbContext _context;
    private readonly IMigrationJobScheduler _jobScheduler;

    public StartMigrationValidationCommandHandler(
        IMasterDbContext context,
        IMigrationJobScheduler jobScheduler)
    {
        _context = context;
        _jobScheduler = jobScheduler;
    }

    public async Task<Result<bool>> Handle(StartMigrationValidationCommand request, CancellationToken cancellationToken)
    {
        var session = await _context.MigrationSessions
            .FirstOrDefaultAsync(s => s.Id == request.SessionId && s.TenantId == request.TenantId, cancellationToken);

        if (session == null)
        {
            return Result<bool>.Failure(Error.NotFound("SessionNotFound", "Migrasyon oturumu bulunamadı"));
        }

        if (session.Status != MigrationSessionStatus.Uploaded)
        {
            return Result<bool>.Failure(Error.Validation("InvalidStatus", $"Bu durumda doğrulama başlatılamaz: {session.Status}"));
        }

        // Check if mapping is configured
        if (string.IsNullOrEmpty(session.MappingConfigJson))
        {
            return Result<bool>.Failure(Error.Validation("NoMapping", "Alan eşleştirmesi yapılmadan doğrulama başlatılamaz"));
        }

        session.StartValidation();
        await _context.SaveChangesAsync(cancellationToken);

        // Enqueue background validation job
        _jobScheduler.EnqueueValidationJob(request.SessionId);

        return Result<bool>.Success(true);
    }
}

/// <summary>
/// Interface for migration validation background job
/// </summary>
public interface IMigrationValidationJob
{
    Task ValidateSessionAsync(Guid sessionId, CancellationToken cancellationToken);
}
