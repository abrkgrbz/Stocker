using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Modules.Sales.Application.DTOs;
using Stocker.Modules.Sales.Application.Features.SalesOrders.Commands;
using Stocker.Modules.Sales.Domain.Entities;
using Stocker.Modules.Sales.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Sales.Application.Features.SalesOrders.Handlers;

/// <summary>
/// Handler for CreateSalesOrderCommand
/// Uses ISalesUnitOfWork to ensure repository and SaveChanges use the same DbContext instance
/// </summary>
public class CreateSalesOrderHandler : IRequestHandler<CreateSalesOrderCommand, Result<SalesOrderDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;
    private readonly ILogger<CreateSalesOrderHandler> _logger;

    public CreateSalesOrderHandler(
        ISalesUnitOfWork unitOfWork,
        ILogger<CreateSalesOrderHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<Result<SalesOrderDto>> Handle(CreateSalesOrderCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        // Generate order number
        var orderNumber = await _unitOfWork.SalesOrders.GenerateOrderNumberAsync(cancellationToken);

        // Create order
        var orderResult = SalesOrder.Create(
            tenantId,
            orderNumber,
            request.OrderDate,
            request.CustomerId,
            request.CustomerName,
            request.CustomerEmail,
            request.Currency);

        if (!orderResult.IsSuccess)
            return Result<SalesOrderDto>.Failure(orderResult.Error);

        var order = orderResult.Value;

        // Set additional properties
        if (request.ShippingAddress != null || request.BillingAddress != null)
            order.SetAddresses(request.ShippingAddress, request.BillingAddress);

        if (!string.IsNullOrEmpty(request.Notes))
            order.SetNotes(request.Notes);

        if (request.SalesPersonId.HasValue)
            order.SetSalesPerson(request.SalesPersonId, request.SalesPersonName);

        // Add items
        var lineNumber = 1;
        foreach (var itemCmd in request.Items)
        {
            var itemResult = SalesOrderItem.Create(
                tenantId,
                order.Id,
                lineNumber++,
                itemCmd.ProductId,
                itemCmd.ProductCode,
                itemCmd.ProductName,
                itemCmd.Unit,
                itemCmd.Quantity,
                itemCmd.UnitPrice,
                itemCmd.VatRate,
                itemCmd.Description);

            if (!itemResult.IsSuccess)
                return Result<SalesOrderDto>.Failure(itemResult.Error);

            var item = itemResult.Value;
            if (itemCmd.DiscountRate > 0)
                item.ApplyDiscount(itemCmd.DiscountRate);

            order.AddItem(item);
        }

        await _unitOfWork.SalesOrders.AddAsync(order, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Sales order {OrderNumber} created for tenant {TenantId}", orderNumber, tenantId);

        // Reload with items
        var savedOrder = await _unitOfWork.SalesOrders.GetWithItemsAsync(order.Id, cancellationToken);

        return Result<SalesOrderDto>.Success(SalesOrderDto.FromEntity(savedOrder!));
    }
}
