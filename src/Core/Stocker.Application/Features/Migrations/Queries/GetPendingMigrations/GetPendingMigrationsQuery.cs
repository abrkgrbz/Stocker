using MediatR;
using Stocker.SharedKernel.DTOs.Migration;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Migrations.Queries.GetPendingMigrations;

public record GetPendingMigrationsQuery : IRequest<Result<List<TenantMigrationStatusDto>>>;
