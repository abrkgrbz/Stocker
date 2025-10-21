using MediatR;
using Stocker.Application.Common.Interfaces;
using Stocker.SharedKernel.DTOs.Migration;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Migrations.Queries.GetScheduledMigrations;

public class GetScheduledMigrationsQueryHandler
    : IRequestHandler<GetScheduledMigrationsQuery, Result<List<ScheduledMigrationDto>>>
{
    private readonly IMigrationService _migrationService;

    public GetScheduledMigrationsQueryHandler(IMigrationService migrationService)
    {
        _migrationService = migrationService;
    }

    public async Task<Result<List<ScheduledMigrationDto>>> Handle(
        GetScheduledMigrationsQuery request,
        CancellationToken cancellationToken)
    {
        try
        {
            var result = await _migrationService.GetScheduledMigrationsAsync(cancellationToken);
            return Result<List<ScheduledMigrationDto>>.Success(result);
        }
        catch (Exception)
        {
            return Result<List<ScheduledMigrationDto>>.Failure(
                DomainErrors.General.ServerError);
        }
    }
}
