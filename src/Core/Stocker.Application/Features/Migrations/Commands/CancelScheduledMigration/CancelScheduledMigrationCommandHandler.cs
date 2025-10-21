using MediatR;
using Stocker.Application.Common.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Migrations.Commands.CancelScheduledMigration;

public class CancelScheduledMigrationCommandHandler
    : IRequestHandler<CancelScheduledMigrationCommand, Result<bool>>
{
    private readonly IMigrationService _migrationService;

    public CancelScheduledMigrationCommandHandler(IMigrationService migrationService)
    {
        _migrationService = migrationService;
    }

    public async Task<Result<bool>> Handle(
        CancelScheduledMigrationCommand request,
        CancellationToken cancellationToken)
    {
        try
        {
            var result = await _migrationService.CancelScheduledMigrationAsync(request.ScheduleId, cancellationToken);
            return Result<bool>.Success(result);
        }
        catch (Exception)
        {
            return Result<bool>.Failure(DomainErrors.General.ServerError);
        }
    }
}
