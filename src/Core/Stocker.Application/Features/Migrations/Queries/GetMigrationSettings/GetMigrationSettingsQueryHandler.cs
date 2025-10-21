using MediatR;
using Stocker.Application.Common.Interfaces;
using Stocker.SharedKernel.DTOs.Migration;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Migrations.Queries.GetMigrationSettings;

public class GetMigrationSettingsQueryHandler
    : IRequestHandler<GetMigrationSettingsQuery, Result<MigrationSettingsDto>>
{
    private readonly IMigrationService _migrationService;

    public GetMigrationSettingsQueryHandler(IMigrationService migrationService)
    {
        _migrationService = migrationService;
    }

    public async Task<Result<MigrationSettingsDto>> Handle(
        GetMigrationSettingsQuery request,
        CancellationToken cancellationToken)
    {
        try
        {
            var result = await _migrationService.GetMigrationSettingsAsync(cancellationToken);
            return Result<MigrationSettingsDto>.Success(result);
        }
        catch (Exception)
        {
            return Result<MigrationSettingsDto>.Failure(
                DomainErrors.General.ServerError);
        }
    }
}
