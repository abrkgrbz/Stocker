using MediatR;
using Stocker.SharedKernel.DTOs.Migration;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Migrations.Commands.ApplyMigrationsToAllTenants;

public record ApplyMigrationsToAllTenantsCommand : IRequest<Result<List<ApplyMigrationResultDto>>>;
