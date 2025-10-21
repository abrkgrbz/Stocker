using MediatR;
using Stocker.Application.Common.Interfaces;
using Stocker.SharedKernel.DTOs.Migration;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Migrations.Commands.UpdateMigrationSettings;

public class UpdateMigrationSettingsCommandHandler
    : IRequestHandler<UpdateMigrationSettingsCommand, Result<MigrationSettingsDto>>
{
    private readonly IMigrationService _migrationService;

    public UpdateMigrationSettingsCommandHandler(IMigrationService migrationService)
    {
        _migrationService = migrationService;
    }

    public async Task<Result<MigrationSettingsDto>> Handle(
        UpdateMigrationSettingsCommand request,
        CancellationToken cancellationToken)
    {
        try
        {
            var result = await _migrationService.UpdateMigrationSettingsAsync(
                request.Settings,
                cancellationToken);
            return Result<MigrationSettingsDto>.Success(result);
        }
        catch (Exception)
        {
            return Result<MigrationSettingsDto>.Failure(
                DomainErrors.General.ServerError);
        }
    }
}
