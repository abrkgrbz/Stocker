using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.Sales.Application.DTOs;
using Stocker.Modules.Sales.Application.Features.SalesOrders.Commands;
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
    private readonly ILogger<UpdateSalesOrderHandler> _logger;

    public UpdateSalesOrderHandler(
        ISalesUnitOfWork unitOfWork,
        ILogger<UpdateSalesOrderHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<Result<SalesOrderDto>> Handle(UpdateSalesOrderCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var order = await _unitOfWork.SalesOrders.GetWithItemsAsync(request.Id, cancellationToken);

        if (order == null || order.TenantId != tenantId)
            return Result<SalesOrderDto>.Failure(Error.NotFound("SalesOrder", "Sales order not found"));

        if (order.Status != SalesOrderStatus.Draft)
            return Result<SalesOrderDto>.Failure(Error.Conflict("SalesOrder", "Only draft orders can be updated"));

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

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Sales order {OrderId} updated for tenant {TenantId}", order.Id, tenantId);

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

    public AddSalesOrderItemHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<SalesOrderDto>> Handle(AddSalesOrderItemCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var order = await _unitOfWork.SalesOrders.GetWithItemsAsync(request.SalesOrderId, cancellationToken);

        if (order == null || order.TenantId != tenantId)
            return Result<SalesOrderDto>.Failure(Error.NotFound("SalesOrder", "Sales order not found"));

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

        await _unitOfWork.SaveChangesAsync(cancellationToken);

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

    public RemoveSalesOrderItemHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<SalesOrderDto>> Handle(RemoveSalesOrderItemCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var order = await _unitOfWork.SalesOrders.GetWithItemsAsync(request.SalesOrderId, cancellationToken);

        if (order == null || order.TenantId != tenantId)
            return Result<SalesOrderDto>.Failure(Error.NotFound("SalesOrder", "Sales order not found"));

        var removeResult = order.RemoveItem(request.ItemId);
        if (!removeResult.IsSuccess)
            return Result<SalesOrderDto>.Failure(removeResult.Error);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

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
    private readonly ILogger<ApproveSalesOrderHandler> _logger;

    public ApproveSalesOrderHandler(
        ISalesUnitOfWork unitOfWork,
        ILogger<ApproveSalesOrderHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<Result<SalesOrderDto>> Handle(ApproveSalesOrderCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var order = await _unitOfWork.SalesOrders.GetWithItemsAsync(request.Id, cancellationToken);

        if (order == null || order.TenantId != tenantId)
            return Result<SalesOrderDto>.Failure(Error.NotFound("SalesOrder", "Sales order not found"));

        // TODO: Get actual user ID from context
        var userId = Guid.NewGuid();
        var result = order.Approve(userId);
        if (!result.IsSuccess)
            return Result<SalesOrderDto>.Failure(result.Error);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Sales order {OrderId} approved for tenant {TenantId}", order.Id, tenantId);

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
    private readonly ILogger<CancelSalesOrderHandler> _logger;

    public CancelSalesOrderHandler(
        ISalesUnitOfWork unitOfWork,
        ILogger<CancelSalesOrderHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<Result<SalesOrderDto>> Handle(CancelSalesOrderCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var order = await _unitOfWork.SalesOrders.GetWithItemsAsync(request.Id, cancellationToken);

        if (order == null || order.TenantId != tenantId)
            return Result<SalesOrderDto>.Failure(Error.NotFound("SalesOrder", "Sales order not found"));

        var result = order.Cancel(request.Reason);
        if (!result.IsSuccess)
            return Result<SalesOrderDto>.Failure(result.Error);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Sales order {OrderId} cancelled for tenant {TenantId}", order.Id, tenantId);

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
    private readonly ILogger<DeleteSalesOrderHandler> _logger;

    public DeleteSalesOrderHandler(
        ISalesUnitOfWork unitOfWork,
        ILogger<DeleteSalesOrderHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<Result> Handle(DeleteSalesOrderCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var order = await _unitOfWork.SalesOrders.GetWithItemsAsync(request.Id, cancellationToken);

        if (order == null || order.TenantId != tenantId)
            return Result.Failure(Error.NotFound("SalesOrder", "Sales order not found"));

        if (order.Status != SalesOrderStatus.Draft && order.Status != SalesOrderStatus.Cancelled)
            return Result.Failure(Error.Conflict("SalesOrder", "Only draft or cancelled orders can be deleted"));

        _unitOfWork.SalesOrders.Remove(order);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Sales order {OrderId} deleted for tenant {TenantId}", order.Id, tenantId);

        return Result.Success();
    }
}
