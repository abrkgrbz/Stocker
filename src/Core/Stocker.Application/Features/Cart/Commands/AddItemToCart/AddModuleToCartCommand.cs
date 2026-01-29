using MediatR;
using Stocker.Application.DTOs.Cart;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Cart.Commands.AddItemToCart;

/// <summary>
/// Add a module to the cart
/// </summary>
public record AddModuleToCartCommand : IRequest<Result<CartDto>>
{
    public Guid TenantId { get; init; }
    public string ModuleCode { get; init; } = string.Empty;
}

/// <summary>
/// Add a bundle to the cart
/// </summary>
public record AddBundleToCartCommand : IRequest<Result<CartDto>>
{
    public Guid TenantId { get; init; }
    public string BundleCode { get; init; } = string.Empty;
}

/// <summary>
/// Add an add-on to the cart
/// </summary>
public record AddAddOnToCartCommand : IRequest<Result<CartDto>>
{
    public Guid TenantId { get; init; }
    public string AddOnCode { get; init; } = string.Empty;
    public int Quantity { get; init; } = 1;
}

/// <summary>
/// Add a storage plan to the cart
/// </summary>
public record AddStoragePlanToCartCommand : IRequest<Result<CartDto>>
{
    public Guid TenantId { get; init; }
    public string PlanCode { get; init; } = string.Empty;
}

/// <summary>
/// Add additional users to the cart
/// </summary>
public record AddUsersToCartCommand : IRequest<Result<CartDto>>
{
    public Guid TenantId { get; init; }
    public string TierCode { get; init; } = string.Empty;
    public int UserCount { get; init; } = 1;
}
