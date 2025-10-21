using MediatR;
using Stocker.Application.Common.Interfaces;
using Stocker.SharedKernel.DTOs.Migration;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Migrations.Queries.GetPendingMigrations;

public class GetPendingMigrationsQueryHandler : IRequestHandler<GetPendingMigrationsQuery, Result<List<TenantMigrationStatusDto>>>
{
    private readonly IMigrationService _migrationService;

    public GetPendingMigrationsQueryHandler(IMigrationService migrationService)
    {
        _migrationService = migrationService;
    }

    public async Task<Result<List<TenantMigrationStatusDto>>> Handle(
        GetPendingMigrationsQuery request,
        CancellationToken cancellationToken)
    {
        try
        {
            var result = await _migrationService.GetPendingMigrationsAsync(cancellationToken);
            return Result<List<TenantMigrationStatusDto>>.Success(result);
        }
        catch (Exception)
        {
            return Result<List<TenantMigrationStatusDto>>.Failure(
                DomainErrors.General.ServerError);
        }
    }
}
