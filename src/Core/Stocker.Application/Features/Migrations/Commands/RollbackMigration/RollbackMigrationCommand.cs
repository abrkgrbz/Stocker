using MediatR;
using Stocker.SharedKernel.DTOs.Migration;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Migrations.Commands.RollbackMigration;

public record RollbackMigrationCommand(
    Guid TenantId,
    string MigrationName,
    string ModuleName) : IRequest<Result<RollbackMigrationResultDto>>;
