using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.API.Controllers.Base;
using Stocker.Application.DTOs.Cart;
using Stocker.Application.Features.Cart.Commands.AddItemToCart;
using Stocker.Application.Features.Cart.Commands.ClearCart;
using Stocker.Application.Features.Cart.Commands.CreateCart;
using Stocker.Application.Features.Cart.Commands.RemoveItemFromCart;
using Stocker.Application.Features.Cart.Commands.UpdateItemQuantity;
using Stocker.Application.Features.Cart.Queries.GetCart;
using Stocker.Application.Features.Cart.Queries.GetOrder;
using Stocker.Application.Features.Checkout.Commands.CompleteCheckout;
using Stocker.Application.Features.Checkout.Commands.InitiateCheckout;
using Stocker.Application.Features.Checkout.Commands.ProcessPaymentCallback;
using Stocker.Domain.Master.Enums;
using InitiateCheckoutRequestDto = Stocker.Application.DTOs.Cart.InitiateCheckoutRequest;

namespace Stocker.API.Controllers.Tenant;

/// <summary>
/// Subscription cart and checkout operations for tenants
/// </summary>
[Authorize]
[Route("api/tenant/cart")]
public class SubscriptionCartController : ApiController
{
    /// <summary>
    /// Mevcut aktif sepeti getir
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(CartDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetCart()
    {
        var tenantId = GetTenantId();
        if (tenantId == null)
        {
            return BadRequestResponse<CartDto>("Tenant bilgisi bulunamadı.");
        }

        var result = await Mediator.Send(new GetCartQuery { TenantId = tenantId.Value });
        return HandleResult(result);
    }

    /// <summary>
    /// Yeni sepet oluştur
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(CartDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateCart([FromBody] CreateCartRequest request)
    {
        var tenantId = GetTenantId();
        if (tenantId == null)
        {
            return BadRequestResponse<CartDto>("Tenant bilgisi bulunamadı.");
        }

        var userIdStr = GetUserId();
        Guid? userId = Guid.TryParse(userIdStr, out var parsed) ? parsed : null;

        var command = new CreateCartCommand
        {
            TenantId = tenantId.Value,
            UserId = userId,
            BillingCycle = request.BillingCycle,
            Currency = request.Currency ?? "TRY"
        };

        var result = await Mediator.Send(command);

        if (result.IsSuccess)
        {
            return CreatedResponse(result.Value, nameof(GetCart));
        }

        return HandleResult(result);
    }

    /// <summary>
    /// Sepete modül ekle
    /// </summary>
    [HttpPost("modules")]
    [ProducesResponseType(typeof(CartDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> AddModule([FromBody] AddModuleRequest request)
    {
        var tenantId = GetTenantId();
        if (tenantId == null)
        {
            return BadRequestResponse<CartDto>("Tenant bilgisi bulunamadı.");
        }

        var command = new AddModuleToCartCommand
        {
            TenantId = tenantId.Value,
            ModuleCode = request.ModuleCode
        };

        var result = await Mediator.Send(command);
        return HandleResult(result);
    }

    /// <summary>
    /// Sepete paket ekle
    /// </summary>
    [HttpPost("bundles")]
    [ProducesResponseType(typeof(CartDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> AddBundle([FromBody] AddBundleRequest request)
    {
        var tenantId = GetTenantId();
        if (tenantId == null)
        {
            return BadRequestResponse<CartDto>("Tenant bilgisi bulunamadı.");
        }

        var command = new AddBundleToCartCommand
        {
            TenantId = tenantId.Value,
            BundleCode = request.BundleCode
        };

        var result = await Mediator.Send(command);
        return HandleResult(result);
    }

    /// <summary>
    /// Sepete eklenti ekle
    /// </summary>
    [HttpPost("addons")]
    [ProducesResponseType(typeof(CartDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> AddAddOn([FromBody] AddAddOnRequest request)
    {
        var tenantId = GetTenantId();
        if (tenantId == null)
        {
            return BadRequestResponse<CartDto>("Tenant bilgisi bulunamadı.");
        }

        var command = new AddAddOnToCartCommand
        {
            TenantId = tenantId.Value,
            AddOnCode = request.AddOnCode,
            Quantity = request.Quantity
        };

        var result = await Mediator.Send(command);
        return HandleResult(result);
    }

    /// <summary>
    /// Sepete depolama planı ekle
    /// </summary>
    [HttpPost("storage")]
    [ProducesResponseType(typeof(CartDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> AddStoragePlan([FromBody] AddStoragePlanRequest request)
    {
        var tenantId = GetTenantId();
        if (tenantId == null)
        {
            return BadRequestResponse<CartDto>("Tenant bilgisi bulunamadı.");
        }

        var command = new AddStoragePlanToCartCommand
        {
            TenantId = tenantId.Value,
            PlanCode = request.PlanCode
        };

        var result = await Mediator.Send(command);
        return HandleResult(result);
    }

    /// <summary>
    /// Sepete kullanıcı kotası ekle
    /// </summary>
    [HttpPost("users")]
    [ProducesResponseType(typeof(CartDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> AddUsers([FromBody] AddUsersRequest request)
    {
        var tenantId = GetTenantId();
        if (tenantId == null)
        {
            return BadRequestResponse<CartDto>("Tenant bilgisi bulunamadı.");
        }

        var command = new AddUsersToCartCommand
        {
            TenantId = tenantId.Value,
            TierCode = request.TierCode,
            UserCount = request.UserCount
        };

        var result = await Mediator.Send(command);
        return HandleResult(result);
    }

    /// <summary>
    /// Sepet öğesi miktarını güncelle
    /// </summary>
    [HttpPut("items/{itemId:guid}/quantity")]
    [ProducesResponseType(typeof(CartDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateItemQuantity(Guid itemId, [FromBody] UpdateQuantityRequest request)
    {
        var tenantId = GetTenantId();
        if (tenantId == null)
        {
            return BadRequestResponse<CartDto>("Tenant bilgisi bulunamadı.");
        }

        var command = new UpdateItemQuantityCommand
        {
            TenantId = tenantId.Value,
            ItemId = itemId,
            Quantity = request.Quantity
        };

        var result = await Mediator.Send(command);
        return HandleResult(result);
    }

    /// <summary>
    /// Sepetten öğe kaldır
    /// </summary>
    [HttpDelete("items/{itemId:guid}")]
    [ProducesResponseType(typeof(CartDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> RemoveItem(Guid itemId)
    {
        var tenantId = GetTenantId();
        if (tenantId == null)
        {
            return BadRequestResponse<CartDto>("Tenant bilgisi bulunamadı.");
        }

        var command = new RemoveItemFromCartCommand
        {
            TenantId = tenantId.Value,
            ItemId = itemId
        };

        var result = await Mediator.Send(command);
        return HandleResult(result);
    }

    /// <summary>
    /// Sepeti temizle
    /// </summary>
    [HttpDelete]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ClearCart()
    {
        var tenantId = GetTenantId();
        if (tenantId == null)
        {
            return BadRequestResponse<object>("Tenant bilgisi bulunamadı.");
        }

        var command = new ClearCartCommand { TenantId = tenantId.Value };
        var result = await Mediator.Send(command);

        if (result.IsSuccess)
        {
            return NoContent();
        }

        return HandleFailure(result);
    }

    /// <summary>
    /// Ödeme sürecini başlat
    /// </summary>
    [HttpPost("checkout")]
    [ProducesResponseType(typeof(CheckoutInitResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> InitiateCheckout([FromBody] InitiateCheckoutRequestDto request)
    {
        var tenantId = GetTenantId();
        if (tenantId == null)
        {
            return BadRequestResponse<CheckoutInitResponse>("Tenant bilgisi bulunamadı.");
        }

        var command = new InitiateCheckoutCommand
        {
            TenantId = tenantId.Value,
            BillingAddress = request.BillingAddress,
            CallbackUrl = request.CallbackUrl
        };

        var result = await Mediator.Send(command);
        return HandleResult(result);
    }

    /// <summary>
    /// Ödeme tamamlandıktan sonra siparişi aktifleştir
    /// </summary>
    [HttpPost("orders/{orderId:guid}/complete")]
    [ProducesResponseType(typeof(OrderDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> CompleteCheckout(Guid orderId, [FromBody] CompleteCheckoutRequest? request = null)
    {
        var command = new CompleteCheckoutCommand
        {
            OrderId = orderId,
            PaymentProviderTransactionId = request?.PaymentProviderTransactionId
        };

        var result = await Mediator.Send(command);
        return HandleResult(result);
    }

    /// <summary>
    /// Iyzico ödeme callback - Ödeme sonucunu işle
    /// </summary>
    [HttpPost("orders/{orderId:guid}/callback")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(PaymentCallbackResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> PaymentCallback(Guid orderId, [FromForm] string token)
    {
        var command = new ProcessPaymentCallbackCommand
        {
            OrderId = orderId,
            Token = token
        };

        var result = await Mediator.Send(command);

        if (result.IsSuccess)
        {
            // Başarılı ödeme sonrası yönlendirme URL'si döndür
            return OkResponse(result.Value);
        }

        return HandleResult(result);
    }

    /// <summary>
    /// Sipariş durumunu sorgula
    /// </summary>
    [HttpGet("orders/{orderId:guid}")]
    [ProducesResponseType(typeof(OrderDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetOrder(Guid orderId)
    {
        var tenantId = GetTenantId();
        if (tenantId == null)
        {
            return BadRequestResponse<OrderDto>("Tenant bilgisi bulunamadı.");
        }

        var query = new GetOrderQuery
        {
            OrderId = orderId,
            TenantId = tenantId.Value
        };

        var result = await Mediator.Send(query);
        return HandleResult(result);
    }
}

#region Request DTOs

public record CreateCartRequest
{
    public BillingCycle BillingCycle { get; init; } = BillingCycle.Aylik;
    public string? Currency { get; init; }
}

public record AddModuleRequest
{
    public string ModuleCode { get; init; } = string.Empty;
}

public record AddBundleRequest
{
    public string BundleCode { get; init; } = string.Empty;
}

public record AddAddOnRequest
{
    public string AddOnCode { get; init; } = string.Empty;
    public int Quantity { get; init; } = 1;
}

public record AddStoragePlanRequest
{
    public string PlanCode { get; init; } = string.Empty;
}

public record AddUsersRequest
{
    public string TierCode { get; init; } = string.Empty;
    public int UserCount { get; init; } = 1;
}

public record UpdateQuantityRequest
{
    public int Quantity { get; init; }
}

public record CompleteCheckoutRequest
{
    public string? PaymentProviderTransactionId { get; init; }
}

#endregion
