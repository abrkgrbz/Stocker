using MediatR;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Migrations.Commands.CancelScheduledMigration;

public record CancelScheduledMigrationCommand(Guid ScheduleId) : IRequest<Result<bool>>;
