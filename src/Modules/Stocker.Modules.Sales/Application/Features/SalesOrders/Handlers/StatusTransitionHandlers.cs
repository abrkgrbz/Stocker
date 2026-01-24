using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Modules.Sales.Application.DTOs;
using Stocker.Modules.Sales.Application.Features.SalesOrders.Commands;
using Stocker.Modules.Sales.Application.Services;
using Stocker.Modules.Sales.Domain;
using Stocker.Modules.Sales.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Sales.Application.Features.SalesOrders.Handlers;

/// <summary>
/// Handler for ConfirmSalesOrderCommand
/// Uses ISalesUnitOfWork for consistent data access
/// </summary>
public class ConfirmSalesOrderHandler : IRequestHandler<ConfirmSalesOrderCommand, Result<SalesOrderDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;
    private readonly ISalesAuditService _auditService;
    private readonly ILogger<ConfirmSalesOrderHandler> _logger;

    public ConfirmSalesOrderHandler(
        ISalesUnitOfWork unitOfWork,
        ISalesAuditService auditService,
        ILogger<ConfirmSalesOrderHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _auditService = auditService;
        _logger = logger;
    }

    public async Task<Result<SalesOrderDto>> Handle(ConfirmSalesOrderCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var order = await _unitOfWork.SalesOrders.GetWithItemsAsync(request.Id, cancellationToken);

        if (order == null || order.TenantId != tenantId)
            return Result<SalesOrderDto>.Failure(SalesErrors.Order.NotFound(request.Id));

        var result = order.Confirm();
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

        _logger.LogInformation("Sales order {OrderId} confirmed for tenant {TenantId}", order.Id, tenantId);

        // Audit log - sipariş onaylama (durum değişikliği)
        await _auditService.LogOrderStatusChangedAsync(
            order.Id, order.OrderNumber, "Draft", "Confirmed", null, cancellationToken);

        return Result<SalesOrderDto>.Success(SalesOrderDto.FromEntity(order));
    }
}

/// <summary>
/// Handler for ShipSalesOrderCommand
/// Uses ISalesUnitOfWork for consistent data access
/// </summary>
public class ShipSalesOrderHandler : IRequestHandler<ShipSalesOrderCommand, Result<SalesOrderDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;
    private readonly ISalesAuditService _auditService;
    private readonly ILogger<ShipSalesOrderHandler> _logger;

    public ShipSalesOrderHandler(
        ISalesUnitOfWork unitOfWork,
        ISalesAuditService auditService,
        ILogger<ShipSalesOrderHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _auditService = auditService;
        _logger = logger;
    }

    public async Task<Result<SalesOrderDto>> Handle(ShipSalesOrderCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var order = await _unitOfWork.SalesOrders.GetWithItemsAsync(request.Id, cancellationToken);

        if (order == null || order.TenantId != tenantId)
            return Result<SalesOrderDto>.Failure(SalesErrors.Order.NotFound(request.Id));

        var result = order.Ship();
        if (!result.IsSuccess)
            return Result<SalesOrderDto>.Failure(result.Error);

        try
        {
            await _unitOfWork.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateConcurrencyException ex)
        {
            _logger.LogWarning(ex, "Sipariş {OrderId} sevk edilirken eşzamanlılık çakışması", order.Id);
            return Result<SalesOrderDto>.Failure(SalesErrors.Order.ConcurrencyConflict);
        }

        _logger.LogInformation("Sales order {OrderId} shipped for tenant {TenantId}", order.Id, tenantId);

        // Audit log - sevkiyat durum değişikliği
        await _auditService.LogOrderStatusChangedAsync(
            order.Id, order.OrderNumber, "Confirmed", "Shipped", null, cancellationToken);

        return Result<SalesOrderDto>.Success(SalesOrderDto.FromEntity(order));
    }
}

/// <summary>
/// Handler for DeliverSalesOrderCommand
/// Uses ISalesUnitOfWork for consistent data access
/// </summary>
public class DeliverSalesOrderHandler : IRequestHandler<DeliverSalesOrderCommand, Result<SalesOrderDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;
    private readonly ISalesAuditService _auditService;
    private readonly ILogger<DeliverSalesOrderHandler> _logger;

    public DeliverSalesOrderHandler(
        ISalesUnitOfWork unitOfWork,
        ISalesAuditService auditService,
        ILogger<DeliverSalesOrderHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _auditService = auditService;
        _logger = logger;
    }

    public async Task<Result<SalesOrderDto>> Handle(DeliverSalesOrderCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var order = await _unitOfWork.SalesOrders.GetWithItemsAsync(request.Id, cancellationToken);

        if (order == null || order.TenantId != tenantId)
            return Result<SalesOrderDto>.Failure(SalesErrors.Order.NotFound(request.Id));

        var result = order.Deliver();
        if (!result.IsSuccess)
            return Result<SalesOrderDto>.Failure(result.Error);

        try
        {
            await _unitOfWork.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateConcurrencyException ex)
        {
            _logger.LogWarning(ex, "Sipariş {OrderId} teslim edilirken eşzamanlılık çakışması", order.Id);
            return Result<SalesOrderDto>.Failure(SalesErrors.Order.ConcurrencyConflict);
        }

        _logger.LogInformation("Sales order {OrderId} delivered for tenant {TenantId}", order.Id, tenantId);

        // Audit log - teslim durum değişikliği
        await _auditService.LogOrderStatusChangedAsync(
            order.Id, order.OrderNumber, "Shipped", "Delivered", null, cancellationToken);

        return Result<SalesOrderDto>.Success(SalesOrderDto.FromEntity(order));
    }
}

/// <summary>
/// Handler for CompleteSalesOrderCommand
/// Uses ISalesUnitOfWork for consistent data access
/// </summary>
public class CompleteSalesOrderHandler : IRequestHandler<CompleteSalesOrderCommand, Result<SalesOrderDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;
    private readonly ISalesAuditService _auditService;
    private readonly ILogger<CompleteSalesOrderHandler> _logger;

    public CompleteSalesOrderHandler(
        ISalesUnitOfWork unitOfWork,
        ISalesAuditService auditService,
        ILogger<CompleteSalesOrderHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _auditService = auditService;
        _logger = logger;
    }

    public async Task<Result<SalesOrderDto>> Handle(CompleteSalesOrderCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var order = await _unitOfWork.SalesOrders.GetWithItemsAsync(request.Id, cancellationToken);

        if (order == null || order.TenantId != tenantId)
            return Result<SalesOrderDto>.Failure(SalesErrors.Order.NotFound(request.Id));

        var result = order.Complete();
        if (!result.IsSuccess)
            return Result<SalesOrderDto>.Failure(result.Error);

        try
        {
            await _unitOfWork.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateConcurrencyException ex)
        {
            _logger.LogWarning(ex, "Sipariş {OrderId} tamamlanırken eşzamanlılık çakışması", order.Id);
            return Result<SalesOrderDto>.Failure(SalesErrors.Order.ConcurrencyConflict);
        }

        _logger.LogInformation("Sales order {OrderId} completed for tenant {TenantId}", order.Id, tenantId);

        // Audit log - tamamlama durum değişikliği
        await _auditService.LogOrderStatusChangedAsync(
            order.Id, order.OrderNumber, "Delivered", "Completed", null, cancellationToken);

        return Result<SalesOrderDto>.Success(SalesOrderDto.FromEntity(order));
    }
}
