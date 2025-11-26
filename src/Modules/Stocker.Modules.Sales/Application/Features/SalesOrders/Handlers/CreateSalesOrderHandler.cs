using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Modules.Sales.Application.DTOs;
using Stocker.Modules.Sales.Application.Features.SalesOrders.Commands;
using Stocker.Modules.Sales.Domain.Entities;
using Stocker.Modules.Sales.Infrastructure.Persistence;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Sales.Application.Features.SalesOrders.Handlers;

public class CreateSalesOrderHandler : IRequestHandler<CreateSalesOrderCommand, Result<SalesOrderDto>>
{
    private readonly SalesDbContext _context;
    private readonly ITenantService _tenantService;
    private readonly ILogger<CreateSalesOrderHandler> _logger;

    public CreateSalesOrderHandler(
        SalesDbContext context,
        ITenantService tenantService,
        ILogger<CreateSalesOrderHandler> logger)
    {
        _context = context;
        _tenantService = tenantService;
        _logger = logger;
    }

    public async Task<Result<SalesOrderDto>> Handle(CreateSalesOrderCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue)
            return Result<SalesOrderDto>.Failure(Error.Unauthorized("Tenant", "Tenant not found"));

        // Generate order number
        var orderNumber = await GenerateOrderNumberAsync(tenantId.Value, cancellationToken);

        // Create order
        var orderResult = SalesOrder.Create(
            tenantId.Value,
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
                tenantId.Value,
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

        _context.SalesOrders.Add(order);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Sales order {OrderNumber} created for tenant {TenantId}", orderNumber, tenantId.Value);

        // Reload with items
        var savedOrder = await _context.SalesOrders
            .Include(o => o.Items)
            .FirstAsync(o => o.Id == order.Id, cancellationToken);

        return Result<SalesOrderDto>.Success(SalesOrderDto.FromEntity(savedOrder));
    }

    private async Task<string> GenerateOrderNumberAsync(Guid tenantId, CancellationToken cancellationToken)
    {
        var today = DateTime.UtcNow;
        var prefix = $"SO-{today:yyyyMMdd}";

        var lastOrder = await _context.SalesOrders
            .Where(o => o.TenantId == tenantId && o.OrderNumber.StartsWith(prefix))
            .OrderByDescending(o => o.OrderNumber)
            .FirstOrDefaultAsync(cancellationToken);

        var sequence = 1;
        if (lastOrder != null)
        {
            var lastSequence = lastOrder.OrderNumber.Split('-').LastOrDefault();
            if (int.TryParse(lastSequence, out var parsed))
                sequence = parsed + 1;
        }

        return $"{prefix}-{sequence:D4}";
    }
}
