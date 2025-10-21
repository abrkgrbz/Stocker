using MediatR;
using Stocker.SharedKernel.DTOs.Migration;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Migrations.Commands.ScheduleMigration;

public record ScheduleMigrationCommand(
    Guid TenantId,
    DateTime ScheduledTime,
    string? MigrationName = null,
    string? ModuleName = null) : IRequest<Result<ScheduleMigrationResultDto>>;
