using MediatR;
using Stocker.Application.Common.Interfaces;
using Stocker.SharedKernel.DTOs.Migration;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Migrations.Commands.ApplyMigration;

public class ApplyMigrationCommandHandler : IRequestHandler<ApplyMigrationCommand, Result<ApplyMigrationResultDto>>
{
    private readonly IMigrationService _migrationService;

    public ApplyMigrationCommandHandler(IMigrationService migrationService)
    {
        _migrationService = migrationService;
    }

    public async Task<Result<ApplyMigrationResultDto>> Handle(
        ApplyMigrationCommand request,
        CancellationToken cancellationToken)
    {
        try
        {
            var result = await _migrationService.ApplyMigrationToTenantAsync(request.TenantId, cancellationToken);
            return Result<ApplyMigrationResultDto>.Success(result);
        }
        catch (Exception)
        {
            return Result<ApplyMigrationResultDto>.Failure(
                DomainErrors.General.ServerError);
        }
    }
}
