using MediatR;
using Stocker.Application.Common.Interfaces;
using Stocker.Domain.Migration.Entities;
using Stocker.Domain.Migration.Enums;
using Stocker.SharedKernel.DTOs.DataMigration;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Tenant.DataMigration.Commands;

public class CreateMigrationSessionCommand : IRequest<Result<MigrationSessionResponse>>
{
    public Guid TenantId { get; set; }
    public Guid UserId { get; set; }
    public string SourceType { get; set; } = string.Empty;
    public string SourceName { get; set; } = string.Empty;
    public List<string> Entities { get; set; } = new();
}

public class CreateMigrationSessionCommandHandler : IRequestHandler<CreateMigrationSessionCommand, Result<MigrationSessionResponse>>
{
    private readonly ITenantDbContextFactory _tenantDbContextFactory;

    public CreateMigrationSessionCommandHandler(ITenantDbContextFactory tenantDbContextFactory)
    {
        _tenantDbContextFactory = tenantDbContextFactory;
    }

    public async Task<Result<MigrationSessionResponse>> Handle(CreateMigrationSessionCommand request, CancellationToken cancellationToken)
    {
        // Parse source type
        if (!Enum.TryParse<MigrationSourceType>(request.SourceType, true, out var sourceType))
        {
            return Result<MigrationSessionResponse>.Failure(Error.Validation("InvalidSourceType", $"Geçersiz kaynak türü: {request.SourceType}"));
        }

        // Parse entity types
        var entityTypes = new List<MigrationEntityType>();
        foreach (var entity in request.Entities)
        {
            if (Enum.TryParse<MigrationEntityType>(entity, true, out var entityType))
            {
                entityTypes.Add(entityType);
            }
            else
            {
                return Result<MigrationSessionResponse>.Failure(Error.Validation("InvalidEntityType", $"Geçersiz veri türü: {entity}"));
            }
        }

        if (entityTypes.Count == 0)
        {
            return Result<MigrationSessionResponse>.Failure(Error.Validation("NoEntities", "En az bir veri türü seçilmelidir"));
        }

        await using var context = await _tenantDbContextFactory.CreateDbContextAsync(request.TenantId);

        var session = new MigrationSession(
            request.TenantId,
            request.UserId,
            sourceType,
            request.SourceName,
            entityTypes);

        context.MigrationSessions.Add(session);
        await context.SaveChangesAsync(cancellationToken);

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
            CreatedAt = session.CreatedAt,
            ExpiresAt = session.ExpiresAt
        });
    }
}
