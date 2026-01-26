using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Modules.Sales.Application.DTOs;
using Stocker.Modules.Sales.Application.Features.SalesOrders.Commands;
using Stocker.Modules.Sales.Application.Services;
using Stocker.Modules.Sales.Domain;
using Stocker.Modules.Sales.Domain.Entities;
using Stocker.Modules.Sales.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Sales.Application.Features.SalesOrders.Handlers;

/// <summary>
/// Handler for UpdateSalesOrderCommand
/// Uses ISalesUnitOfWork for consistent data access
/// Includes resource-level authorization check
/// </summary>
public class UpdateSalesOrderHandler : IRequestHandler<UpdateSalesOrderCommand, Result<SalesOrderDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;
    private readonly IDiscountValidationService _discountValidationService;
    private readonly IResourceAuthorizationService _authorizationService;
    private readonly ISalesAuditService _auditService;
    private readonly ILogger<UpdateSalesOrderHandler> _logger;

    public UpdateSalesOrderHandler(
        ISalesUnitOfWork unitOfWork,
        IDiscountValidationService discountValidationService,
        IResourceAuthorizationService authorizationService,
        ISalesAuditService auditService,
        ILogger<UpdateSalesOrderHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _discountValidationService = discountValidationService;
        _authorizationService = authorizationService;
        _auditService = auditService;
        _logger = logger;
    }

    public async Task<Result<SalesOrderDto>> Handle(UpdateSalesOrderCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var order = await _unitOfWork.SalesOrders.GetWithItemsAsync(request.Id, cancellationToken);

        if (order == null || order.TenantId != tenantId)
            return Result<SalesOrderDto>.Failure(SalesErrors.Order.NotFound());

        // SECURITY: Resource-level authorization check
        var authResult = await _authorizationService.CanModifySalesOrderAsync(request.Id, cancellationToken);
        if (!authResult.IsSuccess)
            return Result<SalesOrderDto>.Failure(authResult.Error!);
        if (!authResult.Value)
            return Result<SalesOrderDto>.Failure(
                Error.Forbidden("Order.Unauthorized", "Bu siparişi güncelleme yetkiniz bulunmamaktadır."));

        if (order.Status != SalesOrderStatus.Draft)
            return Result<SalesOrderDto>.Failure(SalesErrors.Order.OnlyDraftCanBeUpdated);

        // Update customer
        order.UpdateCustomer(request.CustomerId, request.CustomerName, request.CustomerEmail);

        // Update delivery date
        if (request.DeliveryDate.HasValue)
        {
            var deliveryResult = order.SetDeliveryDate(request.DeliveryDate.Value);
            if (!deliveryResult.IsSuccess)
                return Result<SalesOrderDto>.Failure(deliveryResult.Error);
        }

        // Update addresses
        order.SetAddresses(request.ShippingAddress, request.BillingAddress);

        // Update notes
        order.SetNotes(request.Notes);

        // Update sales person
        order.SetSalesPerson(request.SalesPersonId, request.SalesPersonName);

        // SECURE DISCOUNT: Handle discount via CouponCode validation
        if (request.RemoveDiscount)
        {
            // Remove existing discount
            order.ApplyDiscount(0, 0);
            _logger.LogInformation("Discount removed from order {OrderId}", order.Id);
        }
        else if (!string.IsNullOrWhiteSpace(request.CouponCode))
        {
            // Validate and apply new discount from coupon code
            var orderSubtotal = order.Items.Sum(i => i.LineTotal);
            var productIds = order.Items.Where(i => i.ProductId.HasValue).Select(i => i.ProductId!.Value).ToList();
            var totalQuantity = (int)order.Items.Sum(i => i.Quantity);

            var discountResult = await _discountValidationService.ValidateAndCalculateAsync(
                request.CouponCode,
                orderSubtotal,
                totalQuantity,
                order.CustomerId,
                productIds,
                cancellationToken);

            if (!discountResult.IsSuccess)
            {
                _logger.LogWarning(
                    "Discount validation failed for order {OrderId} with coupon {CouponCode}: {Error}",
                    order.Id, request.CouponCode, discountResult.Error?.Description);
                return Result<SalesOrderDto>.Failure(discountResult.Error!);
            }

            var discount = discountResult.Value;
            var applyResult = order.ApplyDiscount(discount.CalculatedDiscountAmount, discount.EffectiveDiscountRate);
            if (!applyResult.IsSuccess)
                return Result<SalesOrderDto>.Failure(applyResult.Error);

            // Mark discount as used
            await _discountValidationService.MarkDiscountUsedAsync(discount.DiscountId, cancellationToken);

            _logger.LogInformation(
                "Applied discount to order {OrderId}: Code={CouponCode}, Amount={DiscountAmount}, Rate={DiscountRate}%",
                order.Id, request.CouponCode, discount.CalculatedDiscountAmount, discount.EffectiveDiscountRate);
        }

        try
        {
            await _unitOfWork.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateConcurrencyException ex)
        {
            _logger.LogWarning(ex, "Sipariş {OrderId} güncellenirken eşzamanlılık çakışması tespit edildi", order.Id);
            return Result<SalesOrderDto>.Failure(SalesErrors.Order.ConcurrencyConflict);
        }

        _logger.LogInformation("Sales order {OrderId} updated for tenant {TenantId}", order.Id, tenantId);

        // Audit log - sipariş güncelleme kaydı
        await _auditService.LogOrderUpdatedAsync(
            order.Id,
            order.OrderNumber,
            new { request.CustomerId, request.CustomerName, request.DeliveryDate, CouponCode = request.CouponCode ?? "(none)" },
            new { order.CustomerName, order.DeliveryDate, order.DiscountAmount, order.DiscountRate, order.TotalAmount },
            cancellationToken);

        return Result<SalesOrderDto>.Success(SalesOrderDto.FromEntity(order));
    }
}

/// <summary>
/// Handler for AddSalesOrderItemCommand
/// Uses ISalesUnitOfWork for consistent data access
/// Includes resource-level authorization check
/// </summary>
public class AddSalesOrderItemHandler : IRequestHandler<AddSalesOrderItemCommand, Result<SalesOrderDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;
    private readonly IDiscountValidationService _discountValidationService;
    private readonly IResourceAuthorizationService _authorizationService;
    private readonly ISalesAuditService _auditService;
    private readonly ILogger<AddSalesOrderItemHandler> _logger;

    public AddSalesOrderItemHandler(
        ISalesUnitOfWork unitOfWork,
        IDiscountValidationService discountValidationService,
        IResourceAuthorizationService authorizationService,
        ISalesAuditService auditService,
        ILogger<AddSalesOrderItemHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _discountValidationService = discountValidationService;
        _authorizationService = authorizationService;
        _auditService = auditService;
        _logger = logger;
    }

    public async Task<Result<SalesOrderDto>> Handle(AddSalesOrderItemCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var order = await _unitOfWork.SalesOrders.GetWithItemsAsync(request.SalesOrderId, cancellationToken);

        if (order == null || order.TenantId != tenantId)
            return Result<SalesOrderDto>.Failure(SalesErrors.Order.NotFound());

        // SECURITY: Resource-level authorization check
        var authResult = await _authorizationService.CanModifySalesOrderAsync(request.SalesOrderId, cancellationToken);
        if (!authResult.IsSuccess)
            return Result<SalesOrderDto>.Failure(authResult.Error!);
        if (!authResult.Value)
            return Result<SalesOrderDto>.Failure(
                Error.Forbidden("Order.Unauthorized", "Bu siparişe kalem ekleme yetkiniz bulunmamaktadır."));

        var lineNumber = order.Items.Any() ? order.Items.Max(i => i.LineNumber) + 1 : 1;

        var itemResult = SalesOrderItem.Create(
            tenantId,
            order.Id,
            lineNumber,
            request.ProductId,
            request.ProductCode,
            request.ProductName,
            request.Unit,
            request.Quantity,
            request.UnitPrice,
            request.VatRate,
            request.Description);

        if (!itemResult.IsSuccess)
            return Result<SalesOrderDto>.Failure(itemResult.Error);

        var item = itemResult.Value;

        // SECURE DISCOUNT: Validate item-level coupon code server-side
        if (!string.IsNullOrWhiteSpace(request.CouponCode))
        {
            var itemSubtotal = request.Quantity * request.UnitPrice;
            var itemDiscountResult = await _discountValidationService.ValidateAndCalculateAsync(
                request.CouponCode,
                itemSubtotal,
                (int)request.Quantity,
                order.CustomerId,
                request.ProductId.HasValue ? new[] { request.ProductId.Value } : null,
                cancellationToken);

            if (!itemDiscountResult.IsSuccess)
            {
                _logger.LogWarning(
                    "Item discount validation failed for coupon {CouponCode}: {Error}",
                    request.CouponCode, itemDiscountResult.Error?.Description);
                return Result<SalesOrderDto>.Failure(itemDiscountResult.Error!);
            }

            var discount = itemDiscountResult.Value;
            item.ApplyDiscount(discount.EffectiveDiscountRate);

            // Mark discount as used
            await _discountValidationService.MarkDiscountUsedAsync(discount.DiscountId, cancellationToken);

            _logger.LogDebug(
                "Applied item discount: Code={CouponCode}, Rate={DiscountRate}%, Amount={DiscountAmount}",
                request.CouponCode, discount.EffectiveDiscountRate, discount.CalculatedDiscountAmount);
        }

        var addResult = order.AddItem(item);
        if (!addResult.IsSuccess)
            return Result<SalesOrderDto>.Failure(addResult.Error);

        try
        {
            await _unitOfWork.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateConcurrencyException ex)
        {
            _logger.LogWarning(ex, "Sipariş {OrderId} kalem eklenirken eşzamanlılık çakışması", request.SalesOrderId);
            return Result<SalesOrderDto>.Failure(SalesErrors.Order.ConcurrencyConflict);
        }

        // Audit log - kalem ekleme kaydı
        await _auditService.LogOrderItemAddedAsync(
            order.Id,
            order.OrderNumber,
            request.ProductName,
            request.Quantity,
            request.UnitPrice,
            cancellationToken);

        return Result<SalesOrderDto>.Success(SalesOrderDto.FromEntity(order));
    }
}

/// <summary>
/// Handler for RemoveSalesOrderItemCommand
/// Uses ISalesUnitOfWork for consistent data access
/// Includes resource-level authorization check
/// </summary>
public class RemoveSalesOrderItemHandler : IRequestHandler<RemoveSalesOrderItemCommand, Result<SalesOrderDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;
    private readonly IResourceAuthorizationService _authorizationService;
    private readonly ISalesAuditService _auditService;
    private readonly ILogger<RemoveSalesOrderItemHandler> _logger;

    public RemoveSalesOrderItemHandler(
        ISalesUnitOfWork unitOfWork,
        IResourceAuthorizationService authorizationService,
        ISalesAuditService auditService,
        ILogger<RemoveSalesOrderItemHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _authorizationService = authorizationService;
        _auditService = auditService;
        _logger = logger;
    }

    public async Task<Result<SalesOrderDto>> Handle(RemoveSalesOrderItemCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var order = await _unitOfWork.SalesOrders.GetWithItemsAsync(request.SalesOrderId, cancellationToken);

        if (order == null || order.TenantId != tenantId)
            return Result<SalesOrderDto>.Failure(SalesErrors.Order.NotFound());

        // SECURITY: Resource-level authorization check
        var authResult = await _authorizationService.CanModifySalesOrderAsync(request.SalesOrderId, cancellationToken);
        if (!authResult.IsSuccess)
            return Result<SalesOrderDto>.Failure(authResult.Error!);
        if (!authResult.Value)
            return Result<SalesOrderDto>.Failure(
                Error.Forbidden("Order.Unauthorized", "Bu siparişten kalem silme yetkiniz bulunmamaktadır."));

        var removeResult = order.RemoveItem(request.ItemId);
        if (!removeResult.IsSuccess)
            return Result<SalesOrderDto>.Failure(removeResult.Error);

        try
        {
            await _unitOfWork.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateConcurrencyException ex)
        {
            _logger.LogWarning(ex, "Sipariş {OrderId} kalem silinirken eşzamanlılık çakışması", request.SalesOrderId);
            return Result<SalesOrderDto>.Failure(SalesErrors.Order.ConcurrencyConflict);
        }

        // Audit log - kalem silme kaydı
        await _auditService.LogOrderItemRemovedAsync(
            order.Id,
            order.OrderNumber,
            request.ItemId,
            cancellationToken);

        return Result<SalesOrderDto>.Success(SalesOrderDto.FromEntity(order));
    }
}

/// <summary>
/// Handler for ApproveSalesOrderCommand
/// Uses ISalesUnitOfWork for consistent data access
/// Includes resource-level authorization check (Manager only can approve)
/// </summary>
public class ApproveSalesOrderHandler : IRequestHandler<ApproveSalesOrderCommand, Result<SalesOrderDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;
    private readonly IResourceAuthorizationService _authorizationService;
    private readonly ISalesAuditService _auditService;
    private readonly ILogger<ApproveSalesOrderHandler> _logger;

    public ApproveSalesOrderHandler(
        ISalesUnitOfWork unitOfWork,
        IResourceAuthorizationService authorizationService,
        ISalesAuditService auditService,
        ILogger<ApproveSalesOrderHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _authorizationService = authorizationService;
        _auditService = auditService;
        _logger = logger;
    }

    public async Task<Result<SalesOrderDto>> Handle(ApproveSalesOrderCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        // SECURITY: Only managers can approve orders
        if (!_authorizationService.IsManager())
            return Result<SalesOrderDto>.Failure(
                Error.Forbidden("Order.ApprovalUnauthorized", "Sipariş onaylama yetkiniz bulunmamaktadır. Yalnızca yöneticiler onaylayabilir."));

        var order = await _unitOfWork.SalesOrders.GetWithItemsAsync(request.Id, cancellationToken);

        if (order == null || order.TenantId != tenantId)
            return Result<SalesOrderDto>.Failure(SalesErrors.Order.NotFound());

        // TODO: Get actual user ID from context
        var userId = Guid.NewGuid();
        var result = order.Approve(userId);
        if (!result.IsSuccess)
            return Result<SalesOrderDto>.Failure(result.Error);

        try
        {
            await _unitOfWork.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateConcurrencyException ex)
        {
            _logger.LogWarning(ex, "Sipariş {OrderId} onaylanırken eşzamanlılık çakışması", order.Id);
            return Result<SalesOrderDto>.Failure(SalesErrors.Order.ConcurrencyConflict);
        }

        _logger.LogInformation("Sales order {OrderId} approved for tenant {TenantId}", order.Id, tenantId);

        // Audit log - sipariş onay kaydı
        await _auditService.LogOrderApprovedAsync(order.Id, order.OrderNumber, userId, cancellationToken);

        return Result<SalesOrderDto>.Success(SalesOrderDto.FromEntity(order));
    }
}

/// <summary>
/// Handler for CancelSalesOrderCommand
/// Uses ISalesUnitOfWork for consistent data access
/// Includes resource-level authorization check
/// </summary>
public class CancelSalesOrderHandler : IRequestHandler<CancelSalesOrderCommand, Result<SalesOrderDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;
    private readonly IResourceAuthorizationService _authorizationService;
    private readonly ISalesAuditService _auditService;
    private readonly ILogger<CancelSalesOrderHandler> _logger;

    public CancelSalesOrderHandler(
        ISalesUnitOfWork unitOfWork,
        IResourceAuthorizationService authorizationService,
        ISalesAuditService auditService,
        ILogger<CancelSalesOrderHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _authorizationService = authorizationService;
        _auditService = auditService;
        _logger = logger;
    }

    public async Task<Result<SalesOrderDto>> Handle(CancelSalesOrderCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var order = await _unitOfWork.SalesOrders.GetWithItemsAsync(request.Id, cancellationToken);

        if (order == null || order.TenantId != tenantId)
            return Result<SalesOrderDto>.Failure(SalesErrors.Order.NotFound());

        // SECURITY: Resource-level authorization check
        var authResult = await _authorizationService.CanModifySalesOrderAsync(request.Id, cancellationToken);
        if (!authResult.IsSuccess)
            return Result<SalesOrderDto>.Failure(authResult.Error!);
        if (!authResult.Value)
            return Result<SalesOrderDto>.Failure(
                Error.Forbidden("Order.Unauthorized", "Bu siparişi iptal etme yetkiniz bulunmamaktadır."));

        var result = order.Cancel(request.Reason);
        if (!result.IsSuccess)
            return Result<SalesOrderDto>.Failure(result.Error);

        try
        {
            await _unitOfWork.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateConcurrencyException ex)
        {
            _logger.LogWarning(ex, "Sipariş {OrderId} iptal edilirken eşzamanlılık çakışması", order.Id);
            return Result<SalesOrderDto>.Failure(SalesErrors.Order.ConcurrencyConflict);
        }

        _logger.LogInformation("Sales order {OrderId} cancelled for tenant {TenantId}", order.Id, tenantId);

        // Audit log - sipariş iptal kaydı
        await _auditService.LogOrderCancelledAsync(order.Id, order.OrderNumber, request.Reason, cancellationToken);

        return Result<SalesOrderDto>.Success(SalesOrderDto.FromEntity(order));
    }
}

/// <summary>
/// Handler for DeleteSalesOrderCommand
/// Uses ISalesUnitOfWork for consistent data access
/// Includes resource-level authorization check
/// </summary>
public class DeleteSalesOrderHandler : IRequestHandler<DeleteSalesOrderCommand, Result>
{
    private readonly ISalesUnitOfWork _unitOfWork;
    private readonly IResourceAuthorizationService _authorizationService;
    private readonly ISalesAuditService _auditService;
    private readonly ILogger<DeleteSalesOrderHandler> _logger;

    public DeleteSalesOrderHandler(
        ISalesUnitOfWork unitOfWork,
        IResourceAuthorizationService authorizationService,
        ISalesAuditService auditService,
        ILogger<DeleteSalesOrderHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _authorizationService = authorizationService;
        _auditService = auditService;
        _logger = logger;
    }

    public async Task<Result> Handle(DeleteSalesOrderCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var order = await _unitOfWork.SalesOrders.GetWithItemsAsync(request.Id, cancellationToken);

        if (order == null || order.TenantId != tenantId)
            return Result.Failure(SalesErrors.Order.NotFound());

        // SECURITY: Resource-level authorization check
        var authResult = await _authorizationService.CanModifySalesOrderAsync(request.Id, cancellationToken);
        if (!authResult.IsSuccess)
            return Result.Failure(authResult.Error!);
        if (!authResult.Value)
            return Result.Failure(
                Error.Forbidden("Order.Unauthorized", "Bu siparişi silme yetkiniz bulunmamaktadır."));

        if (order.Status != SalesOrderStatus.Draft && order.Status != SalesOrderStatus.Cancelled)
            return Result.Failure(SalesErrors.Order.OnlyDraftOrCancelledCanBeDeleted);

        var orderNumber = order.OrderNumber;
        var orderStatus = order.Status.ToString();

        // SOFT DELETE: Mark entity as deleted instead of physical removal
        // Entity will be filtered out by global query filter but remains in database for audit/recovery
        order.MarkAsDeleted();

        // Also soft delete all order items
        foreach (var item in order.Items)
        {
            item.MarkAsDeleted();
        }

        try
        {
            await _unitOfWork.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateConcurrencyException ex)
        {
            _logger.LogWarning(ex, "Sipariş {OrderId} silinirken eşzamanlılık çakışması", order.Id);
            return Result.Failure(SalesErrors.Order.ConcurrencyConflict);
        }

        _logger.LogInformation("Sales order {OrderId} soft deleted for tenant {TenantId}", order.Id, tenantId);

        // Audit log - sipariş silme kaydı
        await _auditService.LogOrderDeletedAsync(request.Id, orderNumber, orderStatus, cancellationToken);

        return Result.Success();
    }
}
