using MediatR;
using Stocker.Application.Common.Interfaces;
using Stocker.SharedKernel.DTOs.Migration;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Migrations.Queries.GetMigrationHistory;

public class GetMigrationHistoryQueryHandler : IRequestHandler<GetMigrationHistoryQuery, Result<MigrationHistoryDto>>
{
    private readonly IMigrationService _migrationService;

    public GetMigrationHistoryQueryHandler(IMigrationService migrationService)
    {
        _migrationService = migrationService;
    }

    public async Task<Result<MigrationHistoryDto>> Handle(
        GetMigrationHistoryQuery request,
        CancellationToken cancellationToken)
    {
        try
        {
            var result = await _migrationService.GetMigrationHistoryAsync(request.TenantId, cancellationToken);
            return Result<MigrationHistoryDto>.Success(result);
        }
        catch (Exception)
        {
            return Result<MigrationHistoryDto>.Failure(
                DomainErrors.General.ServerError);
        }
    }
}
