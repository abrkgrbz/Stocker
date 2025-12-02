using MediatR;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Subscriptions.Commands.ChangePackage;

public record ChangePackageCommand : IRequest<Result<bool>>
{
    public Guid TenantId { get; init; }
    public Guid NewPackageId { get; init; }
}
