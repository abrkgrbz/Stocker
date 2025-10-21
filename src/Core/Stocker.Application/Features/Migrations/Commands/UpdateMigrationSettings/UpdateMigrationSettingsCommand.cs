using MediatR;
using Stocker.SharedKernel.DTOs.Migration;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Migrations.Commands.UpdateMigrationSettings;

public record UpdateMigrationSettingsCommand(MigrationSettingsDto Settings)
    : IRequest<Result<MigrationSettingsDto>>;
