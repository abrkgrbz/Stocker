using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Application.Common.Interfaces;
using Stocker.Domain.Migration.Enums;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Tenant.DataMigration.Commands;

public class UpdateMigrationRecordActionCommand : IRequest<Result<bool>>
{
    public Guid TenantId { get; set; }
    public Guid SessionId { get; set; }
    public Guid RecordId { get; set; }
    public string Action { get; set; } = "import";
    public string? FixedData { get; set; }
}

public class UpdateMigrationRecordActionCommandHandler : IRequestHandler<UpdateMigrationRecordActionCommand, Result<bool>>
{
    private readonly IMasterDbContext _context;

    public UpdateMigrationRecordActionCommandHandler(IMasterDbContext context)
    {
        _context = context;
    }

    public async Task<Result<bool>> Handle(UpdateMigrationRecordActionCommand request, CancellationToken cancellationToken)
    {
        // Validate session
        var session = await _context.MigrationSessions
            .FirstOrDefaultAsync(s => s.Id == request.SessionId && s.TenantId == request.TenantId, cancellationToken);

        if (session == null)
        {
            return Result<bool>.Failure(Error.NotFound("SessionNotFound", "Migrasyon oturumu bulunamadı"));
        }

        if (session.Status != MigrationSessionStatus.Validated)
        {
            return Result<bool>.Failure(Error.Validation("InvalidStatus", $"Bu durumda kayıt güncellenemez: {session.Status}"));
        }

        // Get record
        var record = await _context.MigrationValidationResults
            .FirstOrDefaultAsync(r => r.Id == request.RecordId && r.SessionId == request.SessionId, cancellationToken);

        if (record == null)
        {
            return Result<bool>.Failure(Error.NotFound("RecordNotFound", "Kayıt bulunamadı"));
        }

        // Apply action
        switch (request.Action.ToLowerInvariant())
        {
            case "import":
                record.MarkForImport();
                break;

            case "skip":
                record.Skip();
                break;

            case "fix":
                if (string.IsNullOrEmpty(request.FixedData))
                {
                    return Result<bool>.Failure(Error.Validation("NoFixedData", "Düzeltme verisi gerekli"));
                }
                record.Fix(request.FixedData);
                break;

            default:
                return Result<bool>.Failure(Error.Validation("InvalidAction", $"Geçersiz işlem: {request.Action}"));
        }

        await _context.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
