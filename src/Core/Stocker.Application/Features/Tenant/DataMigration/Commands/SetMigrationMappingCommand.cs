using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Application.Common.Interfaces;
using Stocker.Domain.Migration.Enums;
using Stocker.SharedKernel.DTOs.DataMigration;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Tenant.DataMigration.Commands;

public class SetMigrationMappingCommand : IRequest<Result<bool>>
{
    public Guid TenantId { get; set; }
    public Guid SessionId { get; set; }
    public MappingConfigDto MappingConfig { get; set; } = new();
}

public class SetMigrationMappingCommandHandler : IRequestHandler<SetMigrationMappingCommand, Result<bool>>
{
    private readonly IMasterDbContext _context;

    public SetMigrationMappingCommandHandler(IMasterDbContext context)
    {
        _context = context;
    }

    public async Task<Result<bool>> Handle(SetMigrationMappingCommand request, CancellationToken cancellationToken)
    {
        var session = await _context.MigrationSessions
            .FirstOrDefaultAsync(s => s.Id == request.SessionId && s.TenantId == request.TenantId, cancellationToken);

        if (session == null)
        {
            return Result<bool>.Failure(Error.NotFound("SessionNotFound", "Migrasyon oturumu bulunamadı"));
        }

        if (session.Status != MigrationSessionStatus.Uploaded && session.Status != MigrationSessionStatus.Validated)
        {
            return Result<bool>.Failure(Error.Validation("InvalidStatus", $"Bu durumda eşleştirme yapılamaz: {session.Status}"));
        }

        // Serialize mapping config
        var mappingConfigJson = System.Text.Json.JsonSerializer.Serialize(request.MappingConfig);
        session.SetMappingConfig(mappingConfigJson);

        await _context.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
