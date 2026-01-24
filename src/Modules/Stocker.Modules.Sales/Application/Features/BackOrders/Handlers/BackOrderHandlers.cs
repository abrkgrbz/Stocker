using MediatR;
using Stocker.Modules.Sales.Application.DTOs;
using Stocker.Modules.Sales.Application.Features.BackOrders.Commands;
using Stocker.Modules.Sales.Domain.Entities;
using Stocker.Modules.Sales.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Sales.Application.Features.BackOrders.Handlers;

public class CreateBackOrderHandler : IRequestHandler<CreateBackOrderCommand, Result<BackOrderDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public CreateBackOrderHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<BackOrderDto>> Handle(CreateBackOrderCommand request, CancellationToken cancellationToken)
    {
        var dto = request.Dto;
        var number = await _unitOfWork.BackOrders.GenerateBackOrderNumberAsync(cancellationToken);

        var result = BackOrder.Create(
            _unitOfWork.TenantId,
            number,
            dto.SalesOrderId,
            dto.SalesOrderNumber);

        if (!result.IsSuccess)
            return Result<BackOrderDto>.Failure(result.Error);

        var backOrder = result.Value;

        if (dto.CustomerId.HasValue)
            backOrder.SetCustomer(dto.CustomerId, dto.CustomerName, dto.CustomerEmail);

        if (dto.WarehouseId.HasValue)
            backOrder.SetWarehouse(dto.WarehouseId.Value, dto.WarehouseCode);

        if (dto.EstimatedRestockDate.HasValue)
            backOrder.SetEstimatedRestockDate(dto.EstimatedRestockDate);

        if (!string.IsNullOrWhiteSpace(dto.Type) && Enum.TryParse<BackOrderType>(dto.Type, true, out var type))
            backOrder.SetType(type);

        if (!string.IsNullOrWhiteSpace(dto.Priority) && Enum.TryParse<BackOrderPriority>(dto.Priority, true, out var priority))
            backOrder.SetPriority(priority);

        if (!string.IsNullOrWhiteSpace(dto.Notes))
            backOrder.SetNotes(dto.Notes);

        // Add items
        var lineNumber = 1;
        foreach (var itemDto in dto.Items)
        {
            var itemResult = BackOrderItem.Create(
                _unitOfWork.TenantId,
                backOrder.Id,
                lineNumber++,
                itemDto.SalesOrderItemId,
                itemDto.ProductId,
                itemDto.ProductCode,
                itemDto.ProductName,
                itemDto.Unit,
                itemDto.OrderedQuantity,
                itemDto.AvailableQuantity,
                itemDto.UnitPrice);

            if (!itemResult.IsSuccess)
                return Result<BackOrderDto>.Failure(itemResult.Error);

            backOrder.AddItem(itemResult.Value);
        }

        await _unitOfWork.BackOrders.AddAsync(backOrder, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<BackOrderDto>.Success(MapToDto(backOrder));
    }

    internal static BackOrderDto MapToDto(BackOrder entity) => new()
    {
        Id = entity.Id,
        BackOrderNumber = entity.BackOrderNumber,
        BackOrderDate = entity.BackOrderDate,
        Type = entity.Type.ToString(),
        Priority = entity.Priority.ToString(),
        Status = entity.Status.ToString(),
        SalesOrderId = entity.SalesOrderId,
        SalesOrderNumber = entity.SalesOrderNumber,
        CustomerId = entity.CustomerId,
        CustomerName = entity.CustomerName,
        WarehouseId = entity.WarehouseId,
        WarehouseCode = entity.WarehouseCode,
        EstimatedRestockDate = entity.EstimatedRestockDate,
        ActualFulfillmentDate = entity.ActualFulfillmentDate,
        CustomerNotified = entity.CustomerNotified,
        IsAutoFulfill = entity.IsAutoFulfill,
        TotalItemCount = entity.TotalItemCount,
        TotalPendingQuantity = entity.TotalPendingQuantity,
        TotalFulfilledQuantity = entity.TotalFulfilledQuantity,
        Notes = entity.Notes,
        Items = entity.Items.Select(MapItemToDto).ToList()
    };

    internal static BackOrderItemDto MapItemToDto(BackOrderItem item) => new()
    {
        Id = item.Id,
        LineNumber = item.LineNumber,
        ProductId = item.ProductId,
        ProductCode = item.ProductCode,
        ProductName = item.ProductName,
        Unit = item.Unit,
        OrderedQuantity = item.OrderedQuantity,
        AvailableQuantity = item.AvailableQuantity,
        PendingQuantity = item.PendingQuantity,
        FulfilledQuantity = item.FulfilledQuantity,
        UnitPrice = item.UnitPrice,
        IsFullyFulfilled = item.IsFullyFulfilled,
        SubstituteProductCode = item.SubstituteProductCode,
        PurchaseOrderNumber = item.PurchaseOrderNumber
    };

    internal static BackOrderListDto MapToListDto(BackOrder entity) => new()
    {
        Id = entity.Id,
        BackOrderNumber = entity.BackOrderNumber,
        BackOrderDate = entity.BackOrderDate,
        Type = entity.Type.ToString(),
        Priority = entity.Priority.ToString(),
        Status = entity.Status.ToString(),
        SalesOrderNumber = entity.SalesOrderNumber,
        CustomerName = entity.CustomerName,
        EstimatedRestockDate = entity.EstimatedRestockDate,
        TotalItemCount = entity.TotalItemCount,
        TotalPendingQuantity = entity.TotalPendingQuantity
    };
}

public class FulfillBackOrderItemHandler : IRequestHandler<FulfillBackOrderItemCommand, Result<BackOrderDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public FulfillBackOrderItemHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<BackOrderDto>> Handle(FulfillBackOrderItemCommand request, CancellationToken cancellationToken)
    {
        var backOrder = await _unitOfWork.BackOrders.GetWithItemsAsync(request.BackOrderId, cancellationToken);
        if (backOrder == null)
            return Result<BackOrderDto>.Failure(Error.NotFound("BackOrder.NotFound", "Back order not found"));

        var result = backOrder.FulfillItem(request.Dto.ItemId, request.Dto.Quantity);
        if (!result.IsSuccess)
            return Result<BackOrderDto>.Failure(result.Error);

        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return Result<BackOrderDto>.Success(CreateBackOrderHandler.MapToDto(backOrder));
    }
}

public class FullFulfillBackOrderHandler : IRequestHandler<FullFulfillBackOrderCommand, Result<BackOrderDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public FullFulfillBackOrderHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<BackOrderDto>> Handle(FullFulfillBackOrderCommand request, CancellationToken cancellationToken)
    {
        var backOrder = await _unitOfWork.BackOrders.GetWithItemsAsync(request.Id, cancellationToken);
        if (backOrder == null)
            return Result<BackOrderDto>.Failure(Error.NotFound("BackOrder.NotFound", "Back order not found"));

        var result = backOrder.FullFulfill();
        if (!result.IsSuccess)
            return Result<BackOrderDto>.Failure(result.Error);

        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return Result<BackOrderDto>.Success(CreateBackOrderHandler.MapToDto(backOrder));
    }
}

public class CancelBackOrderHandler : IRequestHandler<CancelBackOrderCommand, Result>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public CancelBackOrderHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> Handle(CancelBackOrderCommand request, CancellationToken cancellationToken)
    {
        var backOrder = await _unitOfWork.BackOrders.GetWithItemsAsync(request.Id, cancellationToken);
        if (backOrder == null)
            return Result.Failure(Error.NotFound("BackOrder.NotFound", "Back order not found"));

        var result = backOrder.Cancel(request.Reason);
        if (!result.IsSuccess)
            return result;

        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
}

public class SetBackOrderPriorityHandler : IRequestHandler<SetBackOrderPriorityCommand, Result>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public SetBackOrderPriorityHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> Handle(SetBackOrderPriorityCommand request, CancellationToken cancellationToken)
    {
        var backOrder = await _unitOfWork.BackOrders.GetByIdAsync(request.Id, cancellationToken);
        if (backOrder == null)
            return Result.Failure(Error.NotFound("BackOrder.NotFound", "Back order not found"));

        if (!Enum.TryParse<BackOrderPriority>(request.Priority, true, out var priority))
            return Result.Failure(Error.Validation("BackOrder.InvalidPriority", "Invalid priority value"));

        backOrder.SetPriority(priority);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
}

public class StartProcessingBackOrderHandler : IRequestHandler<StartProcessingBackOrderCommand, Result<BackOrderDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public StartProcessingBackOrderHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<BackOrderDto>> Handle(StartProcessingBackOrderCommand request, CancellationToken cancellationToken)
    {
        var backOrder = await _unitOfWork.BackOrders.GetWithItemsAsync(request.Id, cancellationToken);
        if (backOrder == null)
            return Result<BackOrderDto>.Failure(Error.NotFound("BackOrder.NotFound", "Back order not found"));

        var result = backOrder.StartProcessing();
        if (!result.IsSuccess)
            return Result<BackOrderDto>.Failure(result.Error);

        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return Result<BackOrderDto>.Success(CreateBackOrderHandler.MapToDto(backOrder));
    }
}

public class MarkBackOrderReadyHandler : IRequestHandler<MarkBackOrderReadyCommand, Result<BackOrderDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public MarkBackOrderReadyHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<BackOrderDto>> Handle(MarkBackOrderReadyCommand request, CancellationToken cancellationToken)
    {
        var backOrder = await _unitOfWork.BackOrders.GetWithItemsAsync(request.Id, cancellationToken);
        if (backOrder == null)
            return Result<BackOrderDto>.Failure(Error.NotFound("BackOrder.NotFound", "Back order not found"));

        var result = backOrder.MarkAsReadyToFulfill();
        if (!result.IsSuccess)
            return Result<BackOrderDto>.Failure(result.Error);

        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return Result<BackOrderDto>.Success(CreateBackOrderHandler.MapToDto(backOrder));
    }
}

public class SetEstimatedRestockDateHandler : IRequestHandler<SetEstimatedRestockDateCommand, Result>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public SetEstimatedRestockDateHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> Handle(SetEstimatedRestockDateCommand request, CancellationToken cancellationToken)
    {
        var backOrder = await _unitOfWork.BackOrders.GetByIdAsync(request.Id, cancellationToken);
        if (backOrder == null)
            return Result.Failure(Error.NotFound("BackOrder.NotFound", "Back order not found"));

        backOrder.SetEstimatedRestockDate(request.EstimatedDate);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
}

public class NotifyBackOrderCustomerHandler : IRequestHandler<NotifyBackOrderCustomerCommand, Result>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public NotifyBackOrderCustomerHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> Handle(NotifyBackOrderCustomerCommand request, CancellationToken cancellationToken)
    {
        var backOrder = await _unitOfWork.BackOrders.GetByIdAsync(request.Id, cancellationToken);
        if (backOrder == null)
            return Result.Failure(Error.NotFound("BackOrder.NotFound", "Back order not found"));

        backOrder.NotifyCustomer();
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
}
