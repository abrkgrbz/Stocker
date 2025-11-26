using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Modules.Sales.Application.DTOs;
using Stocker.Modules.Sales.Application.Features.SalesOrders.Commands;
using Stocker.Modules.Sales.Infrastructure.Persistence;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Sales.Application.Features.SalesOrders.Handlers;

public class ConfirmSalesOrderHandler : IRequestHandler<ConfirmSalesOrderCommand, Result<SalesOrderDto>>
{
    private readonly SalesDbContext _context;
    private readonly ITenantService _tenantService;
    private readonly ILogger<ConfirmSalesOrderHandler> _logger;

    public ConfirmSalesOrderHandler(
        SalesDbContext context,
        ITenantService tenantService,
        ILogger<ConfirmSalesOrderHandler> logger)
    {
        _context = context;
        _tenantService = tenantService;
        _logger = logger;
    }

    public async Task<Result<SalesOrderDto>> Handle(ConfirmSalesOrderCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue)
            return Result<SalesOrderDto>.Failure(Error.Unauthorized("Tenant", "Tenant not found"));

        var order = await _context.SalesOrders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == request.Id && o.TenantId == tenantId.Value, cancellationToken);

        if (order == null)
            return Result<SalesOrderDto>.Failure(Error.NotFound("SalesOrder", "Sales order not found"));

        var result = order.Confirm();
        if (!result.IsSuccess)
            return Result<SalesOrderDto>.Failure(result.Error);

        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Sales order {OrderId} confirmed for tenant {TenantId}", order.Id, tenantId.Value);

        return Result<SalesOrderDto>.Success(SalesOrderDto.FromEntity(order));
    }
}

public class ShipSalesOrderHandler : IRequestHandler<ShipSalesOrderCommand, Result<SalesOrderDto>>
{
    private readonly SalesDbContext _context;
    private readonly ITenantService _tenantService;
    private readonly ILogger<ShipSalesOrderHandler> _logger;

    public ShipSalesOrderHandler(
        SalesDbContext context,
        ITenantService tenantService,
        ILogger<ShipSalesOrderHandler> logger)
    {
        _context = context;
        _tenantService = tenantService;
        _logger = logger;
    }

    public async Task<Result<SalesOrderDto>> Handle(ShipSalesOrderCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue)
            return Result<SalesOrderDto>.Failure(Error.Unauthorized("Tenant", "Tenant not found"));

        var order = await _context.SalesOrders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == request.Id && o.TenantId == tenantId.Value, cancellationToken);

        if (order == null)
            return Result<SalesOrderDto>.Failure(Error.NotFound("SalesOrder", "Sales order not found"));

        var result = order.Ship();
        if (!result.IsSuccess)
            return Result<SalesOrderDto>.Failure(result.Error);

        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Sales order {OrderId} shipped for tenant {TenantId}", order.Id, tenantId.Value);

        return Result<SalesOrderDto>.Success(SalesOrderDto.FromEntity(order));
    }
}

public class DeliverSalesOrderHandler : IRequestHandler<DeliverSalesOrderCommand, Result<SalesOrderDto>>
{
    private readonly SalesDbContext _context;
    private readonly ITenantService _tenantService;
    private readonly ILogger<DeliverSalesOrderHandler> _logger;

    public DeliverSalesOrderHandler(
        SalesDbContext context,
        ITenantService tenantService,
        ILogger<DeliverSalesOrderHandler> logger)
    {
        _context = context;
        _tenantService = tenantService;
        _logger = logger;
    }

    public async Task<Result<SalesOrderDto>> Handle(DeliverSalesOrderCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue)
            return Result<SalesOrderDto>.Failure(Error.Unauthorized("Tenant", "Tenant not found"));

        var order = await _context.SalesOrders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == request.Id && o.TenantId == tenantId.Value, cancellationToken);

        if (order == null)
            return Result<SalesOrderDto>.Failure(Error.NotFound("SalesOrder", "Sales order not found"));

        var result = order.Deliver();
        if (!result.IsSuccess)
            return Result<SalesOrderDto>.Failure(result.Error);

        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Sales order {OrderId} delivered for tenant {TenantId}", order.Id, tenantId.Value);

        return Result<SalesOrderDto>.Success(SalesOrderDto.FromEntity(order));
    }
}

public class CompleteSalesOrderHandler : IRequestHandler<CompleteSalesOrderCommand, Result<SalesOrderDto>>
{
    private readonly SalesDbContext _context;
    private readonly ITenantService _tenantService;
    private readonly ILogger<CompleteSalesOrderHandler> _logger;

    public CompleteSalesOrderHandler(
        SalesDbContext context,
        ITenantService tenantService,
        ILogger<CompleteSalesOrderHandler> logger)
    {
        _context = context;
        _tenantService = tenantService;
        _logger = logger;
    }

    public async Task<Result<SalesOrderDto>> Handle(CompleteSalesOrderCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue)
            return Result<SalesOrderDto>.Failure(Error.Unauthorized("Tenant", "Tenant not found"));

        var order = await _context.SalesOrders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == request.Id && o.TenantId == tenantId.Value, cancellationToken);

        if (order == null)
            return Result<SalesOrderDto>.Failure(Error.NotFound("SalesOrder", "Sales order not found"));

        var result = order.Complete();
        if (!result.IsSuccess)
            return Result<SalesOrderDto>.Failure(result.Error);

        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Sales order {OrderId} completed for tenant {TenantId}", order.Id, tenantId.Value);

        return Result<SalesOrderDto>.Success(SalesOrderDto.FromEntity(order));
    }
}
