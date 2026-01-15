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
    private readonly ITenantDbContextFactory _tenantDbContextFactory;

    public SetMigrationMappingCommandHandler(ITenantDbContextFactory tenantDbContextFactory)
    {
        _tenantDbContextFactory = tenantDbContextFactory;
    }

    public async Task<Result<bool>> Handle(SetMigrationMappingCommand request, CancellationToken cancellationToken)
    {
        await using var context = await _tenantDbContextFactory.CreateDbContextAsync(request.TenantId);

        var session = await context.MigrationSessions
            .FirstOrDefaultAsync(s => s.Id == request.SessionId, cancellationToken);

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

        await context.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
