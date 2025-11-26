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

public class UpdateSalesOrderHandler : IRequestHandler<UpdateSalesOrderCommand, Result<SalesOrderDto>>
{
    private readonly SalesDbContext _context;
    private readonly ITenantService _tenantService;
    private readonly ILogger<UpdateSalesOrderHandler> _logger;

    public UpdateSalesOrderHandler(
        SalesDbContext context,
        ITenantService tenantService,
        ILogger<UpdateSalesOrderHandler> logger)
    {
        _context = context;
        _tenantService = tenantService;
        _logger = logger;
    }

    public async Task<Result<SalesOrderDto>> Handle(UpdateSalesOrderCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue)
            return Result<SalesOrderDto>.Failure(Error.Unauthorized("Tenant", "Tenant not found"));

        var order = await _context.SalesOrders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == request.Id && o.TenantId == tenantId.Value, cancellationToken);

        if (order == null)
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

        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Sales order {OrderId} updated for tenant {TenantId}", order.Id, tenantId.Value);

        return Result<SalesOrderDto>.Success(SalesOrderDto.FromEntity(order));
    }
}

public class AddSalesOrderItemHandler : IRequestHandler<AddSalesOrderItemCommand, Result<SalesOrderDto>>
{
    private readonly SalesDbContext _context;
    private readonly ITenantService _tenantService;

    public AddSalesOrderItemHandler(SalesDbContext context, ITenantService tenantService)
    {
        _context = context;
        _tenantService = tenantService;
    }

    public async Task<Result<SalesOrderDto>> Handle(AddSalesOrderItemCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue)
            return Result<SalesOrderDto>.Failure(Error.Unauthorized("Tenant", "Tenant not found"));

        var order = await _context.SalesOrders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == request.SalesOrderId && o.TenantId == tenantId.Value, cancellationToken);

        if (order == null)
            return Result<SalesOrderDto>.Failure(Error.NotFound("SalesOrder", "Sales order not found"));

        var lineNumber = order.Items.Any() ? order.Items.Max(i => i.LineNumber) + 1 : 1;

        var itemResult = SalesOrderItem.Create(
            tenantId.Value,
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

        await _context.SaveChangesAsync(cancellationToken);

        return Result<SalesOrderDto>.Success(SalesOrderDto.FromEntity(order));
    }
}

public class RemoveSalesOrderItemHandler : IRequestHandler<RemoveSalesOrderItemCommand, Result<SalesOrderDto>>
{
    private readonly SalesDbContext _context;
    private readonly ITenantService _tenantService;

    public RemoveSalesOrderItemHandler(SalesDbContext context, ITenantService tenantService)
    {
        _context = context;
        _tenantService = tenantService;
    }

    public async Task<Result<SalesOrderDto>> Handle(RemoveSalesOrderItemCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue)
            return Result<SalesOrderDto>.Failure(Error.Unauthorized("Tenant", "Tenant not found"));

        var order = await _context.SalesOrders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == request.SalesOrderId && o.TenantId == tenantId.Value, cancellationToken);

        if (order == null)
            return Result<SalesOrderDto>.Failure(Error.NotFound("SalesOrder", "Sales order not found"));

        var removeResult = order.RemoveItem(request.ItemId);
        if (!removeResult.IsSuccess)
            return Result<SalesOrderDto>.Failure(removeResult.Error);

        // Also remove from context
        var item = await _context.SalesOrderItems
            .FirstOrDefaultAsync(i => i.Id == request.ItemId, cancellationToken);
        if (item != null)
            _context.SalesOrderItems.Remove(item);

        await _context.SaveChangesAsync(cancellationToken);

        return Result<SalesOrderDto>.Success(SalesOrderDto.FromEntity(order));
    }
}

public class ApproveSalesOrderHandler : IRequestHandler<ApproveSalesOrderCommand, Result<SalesOrderDto>>
{
    private readonly SalesDbContext _context;
    private readonly ITenantService _tenantService;
    private readonly ILogger<ApproveSalesOrderHandler> _logger;

    public ApproveSalesOrderHandler(
        SalesDbContext context,
        ITenantService tenantService,
        ILogger<ApproveSalesOrderHandler> logger)
    {
        _context = context;
        _tenantService = tenantService;
        _logger = logger;
    }

    public async Task<Result<SalesOrderDto>> Handle(ApproveSalesOrderCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue)
            return Result<SalesOrderDto>.Failure(Error.Unauthorized("Tenant", "Tenant not found"));

        var order = await _context.SalesOrders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == request.Id && o.TenantId == tenantId.Value, cancellationToken);

        if (order == null)
            return Result<SalesOrderDto>.Failure(Error.NotFound("SalesOrder", "Sales order not found"));

        // TODO: Get actual user ID from context
        var userId = Guid.NewGuid();
        var result = order.Approve(userId);
        if (!result.IsSuccess)
            return Result<SalesOrderDto>.Failure(result.Error);

        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Sales order {OrderId} approved for tenant {TenantId}", order.Id, tenantId.Value);

        return Result<SalesOrderDto>.Success(SalesOrderDto.FromEntity(order));
    }
}

public class CancelSalesOrderHandler : IRequestHandler<CancelSalesOrderCommand, Result<SalesOrderDto>>
{
    private readonly SalesDbContext _context;
    private readonly ITenantService _tenantService;
    private readonly ILogger<CancelSalesOrderHandler> _logger;

    public CancelSalesOrderHandler(
        SalesDbContext context,
        ITenantService tenantService,
        ILogger<CancelSalesOrderHandler> logger)
    {
        _context = context;
        _tenantService = tenantService;
        _logger = logger;
    }

    public async Task<Result<SalesOrderDto>> Handle(CancelSalesOrderCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue)
            return Result<SalesOrderDto>.Failure(Error.Unauthorized("Tenant", "Tenant not found"));

        var order = await _context.SalesOrders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == request.Id && o.TenantId == tenantId.Value, cancellationToken);

        if (order == null)
            return Result<SalesOrderDto>.Failure(Error.NotFound("SalesOrder", "Sales order not found"));

        var result = order.Cancel(request.Reason);
        if (!result.IsSuccess)
            return Result<SalesOrderDto>.Failure(result.Error);

        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Sales order {OrderId} cancelled for tenant {TenantId}", order.Id, tenantId.Value);

        return Result<SalesOrderDto>.Success(SalesOrderDto.FromEntity(order));
    }
}

public class DeleteSalesOrderHandler : IRequestHandler<DeleteSalesOrderCommand, Result>
{
    private readonly SalesDbContext _context;
    private readonly ITenantService _tenantService;
    private readonly ILogger<DeleteSalesOrderHandler> _logger;

    public DeleteSalesOrderHandler(
        SalesDbContext context,
        ITenantService tenantService,
        ILogger<DeleteSalesOrderHandler> logger)
    {
        _context = context;
        _tenantService = tenantService;
        _logger = logger;
    }

    public async Task<Result> Handle(DeleteSalesOrderCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue)
            return Result.Failure(Error.Unauthorized("Tenant", "Tenant not found"));

        var order = await _context.SalesOrders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == request.Id && o.TenantId == tenantId.Value, cancellationToken);

        if (order == null)
            return Result.Failure(Error.NotFound("SalesOrder", "Sales order not found"));

        if (order.Status != SalesOrderStatus.Draft && order.Status != SalesOrderStatus.Cancelled)
            return Result.Failure(Error.Conflict("SalesOrder", "Only draft or cancelled orders can be deleted"));

        _context.SalesOrders.Remove(order);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Sales order {OrderId} deleted for tenant {TenantId}", order.Id, tenantId.Value);

        return Result.Success();
    }
}
