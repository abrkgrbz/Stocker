using MediatR;
using Stocker.Application.Common.Interfaces;
using Stocker.SharedKernel.DTOs.Migration;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Migrations.Commands.ScheduleMigration;

public class ScheduleMigrationCommandHandler
    : IRequestHandler<ScheduleMigrationCommand, Result<ScheduleMigrationResultDto>>
{
    private readonly IMigrationService _migrationService;

    public ScheduleMigrationCommandHandler(IMigrationService migrationService)
    {
        _migrationService = migrationService;
    }

    public async Task<Result<ScheduleMigrationResultDto>> Handle(
        ScheduleMigrationCommand request,
        CancellationToken cancellationToken)
    {
        try
        {
            var result = await _migrationService.ScheduleMigrationAsync(
                request.TenantId,
                request.ScheduledTime,
                request.MigrationName,
                request.ModuleName,
                cancellationToken);

            return Result<ScheduleMigrationResultDto>.Success(result);
        }
        catch (Exception)
        {
            return Result<ScheduleMigrationResultDto>.Failure(
                DomainErrors.General.ServerError);
        }
    }
}
