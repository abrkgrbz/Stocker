using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Modules.Sales.Application.DTOs;
using Stocker.Modules.Sales.Application.Features.SalesOrders.Commands;
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
    private readonly ILogger<ConfirmSalesOrderHandler> _logger;

    public ConfirmSalesOrderHandler(
        ISalesUnitOfWork unitOfWork,
        ILogger<ConfirmSalesOrderHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<Result<SalesOrderDto>> Handle(ConfirmSalesOrderCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var order = await _unitOfWork.SalesOrders.GetWithItemsAsync(request.Id, cancellationToken);

        if (order == null || order.TenantId != tenantId)
            return Result<SalesOrderDto>.Failure(Error.NotFound("SalesOrder", "Sipariş bulunamadı"));

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
            return Result<SalesOrderDto>.Failure(Error.Conflict("SalesOrder",
                "Bu sipariş başka bir kullanıcı tarafından değiştirilmiş. Lütfen sayfayı yenileyip tekrar deneyin."));
        }

        _logger.LogInformation("Sales order {OrderId} confirmed for tenant {TenantId}", order.Id, tenantId);

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
    private readonly ILogger<ShipSalesOrderHandler> _logger;

    public ShipSalesOrderHandler(
        ISalesUnitOfWork unitOfWork,
        ILogger<ShipSalesOrderHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<Result<SalesOrderDto>> Handle(ShipSalesOrderCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var order = await _unitOfWork.SalesOrders.GetWithItemsAsync(request.Id, cancellationToken);

        if (order == null || order.TenantId != tenantId)
            return Result<SalesOrderDto>.Failure(Error.NotFound("SalesOrder", "Sipariş bulunamadı"));

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
            return Result<SalesOrderDto>.Failure(Error.Conflict("SalesOrder",
                "Bu sipariş başka bir kullanıcı tarafından değiştirilmiş. Lütfen sayfayı yenileyip tekrar deneyin."));
        }

        _logger.LogInformation("Sales order {OrderId} shipped for tenant {TenantId}", order.Id, tenantId);

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
    private readonly ILogger<DeliverSalesOrderHandler> _logger;

    public DeliverSalesOrderHandler(
        ISalesUnitOfWork unitOfWork,
        ILogger<DeliverSalesOrderHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<Result<SalesOrderDto>> Handle(DeliverSalesOrderCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var order = await _unitOfWork.SalesOrders.GetWithItemsAsync(request.Id, cancellationToken);

        if (order == null || order.TenantId != tenantId)
            return Result<SalesOrderDto>.Failure(Error.NotFound("SalesOrder", "Sipariş bulunamadı"));

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
            return Result<SalesOrderDto>.Failure(Error.Conflict("SalesOrder",
                "Bu sipariş başka bir kullanıcı tarafından değiştirilmiş. Lütfen sayfayı yenileyip tekrar deneyin."));
        }

        _logger.LogInformation("Sales order {OrderId} delivered for tenant {TenantId}", order.Id, tenantId);

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
    private readonly ILogger<CompleteSalesOrderHandler> _logger;

    public CompleteSalesOrderHandler(
        ISalesUnitOfWork unitOfWork,
        ILogger<CompleteSalesOrderHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<Result<SalesOrderDto>> Handle(CompleteSalesOrderCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var order = await _unitOfWork.SalesOrders.GetWithItemsAsync(request.Id, cancellationToken);

        if (order == null || order.TenantId != tenantId)
            return Result<SalesOrderDto>.Failure(Error.NotFound("SalesOrder", "Sipariş bulunamadı"));

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
            return Result<SalesOrderDto>.Failure(Error.Conflict("SalesOrder",
                "Bu sipariş başka bir kullanıcı tarafından değiştirilmiş. Lütfen sayfayı yenileyip tekrar deneyin."));
        }

        _logger.LogInformation("Sales order {OrderId} completed for tenant {TenantId}", order.Id, tenantId);

        return Result<SalesOrderDto>.Success(SalesOrderDto.FromEntity(order));
    }
}
