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
/// </summary>
public class UpdateSalesOrderHandler : IRequestHandler<UpdateSalesOrderCommand, Result<SalesOrderDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;
    private readonly ISalesAuditService _auditService;
    private readonly ILogger<UpdateSalesOrderHandler> _logger;

    public UpdateSalesOrderHandler(
        ISalesUnitOfWork unitOfWork,
        ISalesAuditService auditService,
        ILogger<UpdateSalesOrderHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _auditService = auditService;
        _logger = logger;
    }

    public async Task<Result<SalesOrderDto>> Handle(UpdateSalesOrderCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var order = await _unitOfWork.SalesOrders.GetWithItemsAsync(request.Id, cancellationToken);

        if (order == null || order.TenantId != tenantId)
            return Result<SalesOrderDto>.Failure(SalesErrors.Order.NotFound());

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

        // Update discount
        var discountResult = order.ApplyDiscount(request.DiscountAmount, request.DiscountRate);
        if (!discountResult.IsSuccess)
            return Result<SalesOrderDto>.Failure(discountResult.Error);

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
            new { request.CustomerId, request.CustomerName, request.DeliveryDate, request.DiscountAmount, request.DiscountRate },
            new { order.CustomerName, order.DeliveryDate, order.DiscountAmount, order.DiscountRate, order.TotalAmount },
            cancellationToken);

        return Result<SalesOrderDto>.Success(SalesOrderDto.FromEntity(order));
    }
}

/// <summary>
/// Handler for AddSalesOrderItemCommand
/// Uses ISalesUnitOfWork for consistent data access
/// </summary>
public class AddSalesOrderItemHandler : IRequestHandler<AddSalesOrderItemCommand, Result<SalesOrderDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;
    private readonly ISalesAuditService _auditService;
    private readonly ILogger<AddSalesOrderItemHandler> _logger;

    public AddSalesOrderItemHandler(ISalesUnitOfWork unitOfWork, ISalesAuditService auditService, ILogger<AddSalesOrderItemHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _auditService = auditService;
        _logger = logger;
    }

    public async Task<Result<SalesOrderDto>> Handle(AddSalesOrderItemCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var order = await _unitOfWork.SalesOrders.GetWithItemsAsync(request.SalesOrderId, cancellationToken);

        if (order == null || order.TenantId != tenantId)
            return Result<SalesOrderDto>.Failure(SalesErrors.Order.NotFound());

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
        if (request.DiscountRate > 0)
            item.ApplyDiscount(request.DiscountRate);

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
/// </summary>
public class RemoveSalesOrderItemHandler : IRequestHandler<RemoveSalesOrderItemCommand, Result<SalesOrderDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;
    private readonly ISalesAuditService _auditService;
    private readonly ILogger<RemoveSalesOrderItemHandler> _logger;

    public RemoveSalesOrderItemHandler(ISalesUnitOfWork unitOfWork, ISalesAuditService auditService, ILogger<RemoveSalesOrderItemHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _auditService = auditService;
        _logger = logger;
    }

    public async Task<Result<SalesOrderDto>> Handle(RemoveSalesOrderItemCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var order = await _unitOfWork.SalesOrders.GetWithItemsAsync(request.SalesOrderId, cancellationToken);

        if (order == null || order.TenantId != tenantId)
            return Result<SalesOrderDto>.Failure(SalesErrors.Order.NotFound());

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
/// </summary>
public class ApproveSalesOrderHandler : IRequestHandler<ApproveSalesOrderCommand, Result<SalesOrderDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;
    private readonly ISalesAuditService _auditService;
    private readonly ILogger<ApproveSalesOrderHandler> _logger;

    public ApproveSalesOrderHandler(
        ISalesUnitOfWork unitOfWork,
        ISalesAuditService auditService,
        ILogger<ApproveSalesOrderHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _auditService = auditService;
        _logger = logger;
    }

    public async Task<Result<SalesOrderDto>> Handle(ApproveSalesOrderCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

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
/// </summary>
public class CancelSalesOrderHandler : IRequestHandler<CancelSalesOrderCommand, Result<SalesOrderDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;
    private readonly ISalesAuditService _auditService;
    private readonly ILogger<CancelSalesOrderHandler> _logger;

    public CancelSalesOrderHandler(
        ISalesUnitOfWork unitOfWork,
        ISalesAuditService auditService,
        ILogger<CancelSalesOrderHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _auditService = auditService;
        _logger = logger;
    }

    public async Task<Result<SalesOrderDto>> Handle(CancelSalesOrderCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var order = await _unitOfWork.SalesOrders.GetWithItemsAsync(request.Id, cancellationToken);

        if (order == null || order.TenantId != tenantId)
            return Result<SalesOrderDto>.Failure(SalesErrors.Order.NotFound());

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
/// </summary>
public class DeleteSalesOrderHandler : IRequestHandler<DeleteSalesOrderCommand, Result>
{
    private readonly ISalesUnitOfWork _unitOfWork;
    private readonly ISalesAuditService _auditService;
    private readonly ILogger<DeleteSalesOrderHandler> _logger;

    public DeleteSalesOrderHandler(
        ISalesUnitOfWork unitOfWork,
        ISalesAuditService auditService,
        ILogger<DeleteSalesOrderHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _auditService = auditService;
        _logger = logger;
    }

    public async Task<Result> Handle(DeleteSalesOrderCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var order = await _unitOfWork.SalesOrders.GetWithItemsAsync(request.Id, cancellationToken);

        if (order == null || order.TenantId != tenantId)
            return Result.Failure(SalesErrors.Order.NotFound());

        if (order.Status != SalesOrderStatus.Draft && order.Status != SalesOrderStatus.Cancelled)
            return Result.Failure(SalesErrors.Order.OnlyDraftOrCancelledCanBeDeleted);

        var orderNumber = order.OrderNumber;
        var orderStatus = order.Status.ToString();

        _unitOfWork.SalesOrders.Remove(order);

        try
        {
            await _unitOfWork.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateConcurrencyException ex)
        {
            _logger.LogWarning(ex, "Sipariş {OrderId} silinirken eşzamanlılık çakışması", order.Id);
            return Result.Failure(SalesErrors.Order.ConcurrencyConflict);
        }

        _logger.LogInformation("Sales order {OrderId} deleted for tenant {TenantId}", order.Id, tenantId);

        // Audit log - sipariş silme kaydı
        await _auditService.LogOrderDeletedAsync(request.Id, orderNumber, orderStatus, cancellationToken);

        return Result.Success();
    }
}
