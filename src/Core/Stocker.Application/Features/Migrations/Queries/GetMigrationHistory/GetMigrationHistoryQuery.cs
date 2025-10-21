using MediatR;
using Stocker.SharedKernel.DTOs.Migration;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Migrations.Queries.GetMigrationHistory;

public record GetMigrationHistoryQuery(Guid TenantId) : IRequest<Result<MigrationHistoryDto>>;
