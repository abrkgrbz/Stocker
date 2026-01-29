using MediatR;
using Stocker.Application.DTOs.Cart;
using Stocker.Domain.Master.Enums;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Cart.Commands.CreateCart;

/// <summary>
/// Create a new subscription cart for a tenant
/// </summary>
public record CreateCartCommand : IRequest<Result<CartDto>>
{
    public Guid TenantId { get; init; }
    public Guid? UserId { get; init; }
    public BillingCycle BillingCycle { get; init; } = BillingCycle.Aylik;
    public string Currency { get; init; } = "TRY";
}
