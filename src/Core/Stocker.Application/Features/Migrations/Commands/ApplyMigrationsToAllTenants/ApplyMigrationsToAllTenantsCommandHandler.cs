using MediatR;
using Stocker.Application.Common.Interfaces;
using Stocker.SharedKernel.DTOs.Migration;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Migrations.Commands.ApplyMigrationsToAllTenants;

public class ApplyMigrationsToAllTenantsCommandHandler
    : IRequestHandler<ApplyMigrationsToAllTenantsCommand, Result<List<ApplyMigrationResultDto>>>
{
    private readonly IMigrationService _migrationService;

    public ApplyMigrationsToAllTenantsCommandHandler(IMigrationService migrationService)
    {
        _migrationService = migrationService;
    }

    public async Task<Result<List<ApplyMigrationResultDto>>> Handle(
        ApplyMigrationsToAllTenantsCommand request,
        CancellationToken cancellationToken)
    {
        try
        {
            var results = await _migrationService.ApplyMigrationsToAllTenantsAsync(cancellationToken);
            return Result<List<ApplyMigrationResultDto>>.Success(results);
        }
        catch (Exception)
        {
            return Result<List<ApplyMigrationResultDto>>.Failure(
                DomainErrors.General.ServerError);
        }
    }
}
