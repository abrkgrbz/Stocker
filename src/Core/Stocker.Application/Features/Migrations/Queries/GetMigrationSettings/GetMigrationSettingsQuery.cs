using MediatR;
using Stocker.SharedKernel.DTOs.Migration;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Migrations.Queries.GetMigrationSettings;

public record GetMigrationSettingsQuery : IRequest<Result<MigrationSettingsDto>>;
