using MediatR;
using Stocker.Application.Common.Interfaces;
using Stocker.SharedKernel.DTOs.Migration;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Migrations.Queries.GetMigrationScriptPreview;

public class GetMigrationScriptPreviewQueryHandler
    : IRequestHandler<GetMigrationScriptPreviewQuery, Result<MigrationScriptPreviewDto>>
{
    private readonly IMigrationService _migrationService;

    public GetMigrationScriptPreviewQueryHandler(IMigrationService migrationService)
    {
        _migrationService = migrationService;
    }

    public async Task<Result<MigrationScriptPreviewDto>> Handle(
        GetMigrationScriptPreviewQuery request,
        CancellationToken cancellationToken)
    {
        try
        {
            var result = await _migrationService.GetMigrationScriptPreviewAsync(
                request.TenantId,
                request.MigrationName,
                request.ModuleName,
                cancellationToken);

            return Result<MigrationScriptPreviewDto>.Success(result);
        }
        catch (Exception)
        {
            return Result<MigrationScriptPreviewDto>.Failure(
                DomainErrors.General.ServerError);
        }
    }
}
