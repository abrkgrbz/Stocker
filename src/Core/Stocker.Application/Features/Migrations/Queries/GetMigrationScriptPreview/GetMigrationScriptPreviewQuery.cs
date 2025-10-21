using MediatR;
using Stocker.SharedKernel.DTOs.Migration;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Migrations.Queries.GetMigrationScriptPreview;

public record GetMigrationScriptPreviewQuery(
    Guid TenantId,
    string MigrationName,
    string ModuleName) : IRequest<Result<MigrationScriptPreviewDto>>;
