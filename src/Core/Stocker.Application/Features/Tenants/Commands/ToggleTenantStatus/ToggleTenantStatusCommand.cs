using MediatR;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Tenants.Commands.ToggleTenantStatus;

public record ToggleTenantStatusCommand : IRequest<Result<bool>>
{
    public Guid Id { get; init; }
    public string ModifiedBy { get; init; } = string.Empty;
}