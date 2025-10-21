using MediatR;
using Stocker.SharedKernel.DTOs.Migration;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Migrations.Queries.GetScheduledMigrations;

public record GetScheduledMigrationsQuery : IRequest<Result<List<ScheduledMigrationDto>>>;
