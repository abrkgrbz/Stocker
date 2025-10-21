using MediatR;
using Stocker.Application.Common.Interfaces;
using Stocker.SharedKernel.DTOs.Migration;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Migrations.Commands.RollbackMigration;

public class RollbackMigrationCommandHandler
    : IRequestHandler<RollbackMigrationCommand, Result<RollbackMigrationResultDto>>
{
    private readonly IMigrationService _migrationService;

    public RollbackMigrationCommandHandler(IMigrationService migrationService)
    {
        _migrationService = migrationService;
    }

    public async Task<Result<RollbackMigrationResultDto>> Handle(
        RollbackMigrationCommand request,
        CancellationToken cancellationToken)
    {
        try
        {
            var result = await _migrationService.RollbackMigrationAsync(
                request.TenantId,
                request.MigrationName,
                request.ModuleName,
                cancellationToken);

            return Result<RollbackMigrationResultDto>.Success(result);
        }
        catch (Exception)
        {
            return Result<RollbackMigrationResultDto>.Failure(
                DomainErrors.General.ServerError);
        }
    }
}
