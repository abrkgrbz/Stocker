using MediatR;
using Stocker.SharedKernel.DTOs.Migration;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Migrations.Commands.ApplyMigration;

public class ApplyMigrationCommand : IRequest<Result<ApplyMigrationResultDto>>
{
    public Guid TenantId { get; set; }
}
