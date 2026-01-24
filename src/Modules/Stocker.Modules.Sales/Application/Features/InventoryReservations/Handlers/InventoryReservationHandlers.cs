using MediatR;
using Stocker.Modules.Sales.Application.DTOs;
using Stocker.Modules.Sales.Application.Features.InventoryReservations.Commands;
using Stocker.Modules.Sales.Domain.Entities;
using Stocker.Modules.Sales.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Sales.Application.Features.InventoryReservations.Handlers;

public class CreateReservationHandler : IRequestHandler<CreateReservationCommand, Result<InventoryReservationDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public CreateReservationHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<InventoryReservationDto>> Handle(CreateReservationCommand request, CancellationToken cancellationToken)
    {
        var dto = request.Dto;
        var number = await _unitOfWork.InventoryReservations.GenerateReservationNumberAsync(cancellationToken);

        Result<InventoryReservation> result;

        if (dto.SalesOrderId.HasValue && !string.IsNullOrWhiteSpace(dto.SalesOrderNumber) && dto.SalesOrderItemId.HasValue)
        {
            result = InventoryReservation.CreateForOrder(
                _unitOfWork.TenantId,
                number,
                dto.ProductId,
                dto.ProductCode,
                dto.ProductName,
                dto.Quantity,
                dto.Unit,
                dto.SalesOrderId.Value,
                dto.SalesOrderNumber,
                dto.SalesOrderItemId.Value,
                dto.ReservedUntil);
        }
        else
        {
            result = InventoryReservation.Create(
                _unitOfWork.TenantId,
                number,
                dto.ProductId,
                dto.ProductCode,
                dto.ProductName,
                dto.Quantity,
                dto.Unit,
                dto.ReservedUntil);
        }

        if (!result.IsSuccess)
            return Result<InventoryReservationDto>.Failure(result.Error);

        var reservation = result.Value;

        if (dto.WarehouseId.HasValue)
            reservation.SetWarehouse(dto.WarehouseId.Value, dto.WarehouseCode);

        if (!string.IsNullOrWhiteSpace(dto.LotNumber) || !string.IsNullOrWhiteSpace(dto.SerialNumber))
            reservation.SetLotTracking(dto.LotNumber, dto.SerialNumber, null);

        if (dto.Priority != 1)
            reservation.SetPriority(dto.Priority);

        if (!string.IsNullOrWhiteSpace(dto.Notes))
            reservation.SetNotes(dto.Notes);

        if (!string.IsNullOrWhiteSpace(dto.Source) && Enum.TryParse<ReservationSource>(dto.Source, true, out var source))
        {
            // Source is set internally in CreateForOrder, only override for manual
        }

        await _unitOfWork.InventoryReservations.AddAsync(reservation, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<InventoryReservationDto>.Success(MapToDto(reservation));
    }

    internal static InventoryReservationDto MapToDto(InventoryReservation entity) => new()
    {
        Id = entity.Id,
        ReservationNumber = entity.ReservationNumber,
        ProductId = entity.ProductId,
        ProductCode = entity.ProductCode,
        ProductName = entity.ProductName,
        WarehouseId = entity.WarehouseId,
        WarehouseCode = entity.WarehouseCode,
        ReservedQuantity = entity.ReservedQuantity,
        AllocatedQuantity = entity.AllocatedQuantity,
        RemainingQuantity = entity.RemainingQuantity,
        Unit = entity.Unit,
        LotNumber = entity.LotNumber,
        SerialNumber = entity.SerialNumber,
        Source = entity.Source.ToString(),
        SalesOrderId = entity.SalesOrderId,
        SalesOrderNumber = entity.SalesOrderNumber,
        Status = entity.Status.ToString(),
        Type = entity.Type.ToString(),
        ReservedAt = entity.ReservedAt,
        ReservedUntil = entity.ReservedUntil,
        ReleasedAt = entity.ReleasedAt,
        Priority = entity.Priority,
        IsAutoRelease = entity.IsAutoRelease,
        Notes = entity.Notes
    };

    internal static InventoryReservationListDto MapToListDto(InventoryReservation entity) => new()
    {
        Id = entity.Id,
        ReservationNumber = entity.ReservationNumber,
        ProductCode = entity.ProductCode,
        ProductName = entity.ProductName,
        ReservedQuantity = entity.ReservedQuantity,
        RemainingQuantity = entity.RemainingQuantity,
        Status = entity.Status.ToString(),
        Type = entity.Type.ToString(),
        Source = entity.Source.ToString(),
        ReservedAt = entity.ReservedAt,
        ReservedUntil = entity.ReservedUntil,
        SalesOrderNumber = entity.SalesOrderNumber
    };
}

public class AllocateReservationHandler : IRequestHandler<AllocateReservationCommand, Result<InventoryReservationDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public AllocateReservationHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<InventoryReservationDto>> Handle(AllocateReservationCommand request, CancellationToken cancellationToken)
    {
        var reservation = await _unitOfWork.InventoryReservations.GetByIdAsync(request.Id, cancellationToken);
        if (reservation == null)
            return Result<InventoryReservationDto>.Failure(Error.NotFound("Reservation.NotFound", "Reservation not found"));

        var result = reservation.Allocate(request.Dto.Quantity);
        if (!result.IsSuccess)
            return Result<InventoryReservationDto>.Failure(result.Error);

        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return Result<InventoryReservationDto>.Success(CreateReservationHandler.MapToDto(reservation));
    }
}

public class ReleaseReservationHandler : IRequestHandler<ReleaseReservationCommand, Result>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public ReleaseReservationHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> Handle(ReleaseReservationCommand request, CancellationToken cancellationToken)
    {
        var reservation = await _unitOfWork.InventoryReservations.GetByIdAsync(request.Id, cancellationToken);
        if (reservation == null)
            return Result.Failure(Error.NotFound("Reservation.NotFound", "Reservation not found"));

        var result = reservation.Release(request.Dto?.Reason);
        if (!result.IsSuccess)
            return result;

        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
}

public class PartialReleaseReservationHandler : IRequestHandler<PartialReleaseReservationCommand, Result<InventoryReservationDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public PartialReleaseReservationHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<InventoryReservationDto>> Handle(PartialReleaseReservationCommand request, CancellationToken cancellationToken)
    {
        var reservation = await _unitOfWork.InventoryReservations.GetByIdAsync(request.Id, cancellationToken);
        if (reservation == null)
            return Result<InventoryReservationDto>.Failure(Error.NotFound("Reservation.NotFound", "Reservation not found"));

        var result = reservation.PartialRelease(request.Quantity, request.Reason);
        if (!result.IsSuccess)
            return Result<InventoryReservationDto>.Failure(result.Error);

        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return Result<InventoryReservationDto>.Success(CreateReservationHandler.MapToDto(reservation));
    }
}

public class ExtendReservationHandler : IRequestHandler<ExtendReservationCommand, Result<InventoryReservationDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public ExtendReservationHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<InventoryReservationDto>> Handle(ExtendReservationCommand request, CancellationToken cancellationToken)
    {
        var reservation = await _unitOfWork.InventoryReservations.GetByIdAsync(request.Id, cancellationToken);
        if (reservation == null)
            return Result<InventoryReservationDto>.Failure(Error.NotFound("Reservation.NotFound", "Reservation not found"));

        var result = reservation.ExtendUntil(request.Dto.NewExpiry);
        if (!result.IsSuccess)
            return Result<InventoryReservationDto>.Failure(result.Error);

        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return Result<InventoryReservationDto>.Success(CreateReservationHandler.MapToDto(reservation));
    }
}

public class FulfillReservationHandler : IRequestHandler<FulfillReservationCommand, Result<InventoryReservationDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public FulfillReservationHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<InventoryReservationDto>> Handle(FulfillReservationCommand request, CancellationToken cancellationToken)
    {
        var reservation = await _unitOfWork.InventoryReservations.GetByIdAsync(request.Id, cancellationToken);
        if (reservation == null)
            return Result<InventoryReservationDto>.Failure(Error.NotFound("Reservation.NotFound", "Reservation not found"));

        var result = reservation.Fulfill();
        if (!result.IsSuccess)
            return Result<InventoryReservationDto>.Failure(result.Error);

        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return Result<InventoryReservationDto>.Success(CreateReservationHandler.MapToDto(reservation));
    }
}

public class ExpireReservationHandler : IRequestHandler<ExpireReservationCommand, Result>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public ExpireReservationHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> Handle(ExpireReservationCommand request, CancellationToken cancellationToken)
    {
        var reservation = await _unitOfWork.InventoryReservations.GetByIdAsync(request.Id, cancellationToken);
        if (reservation == null)
            return Result.Failure(Error.NotFound("Reservation.NotFound", "Reservation not found"));

        var result = reservation.Expire();
        if (!result.IsSuccess)
            return result;

        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
}

public class ExpireAllOverdueReservationsHandler : IRequestHandler<ExpireAllOverdueReservationsCommand, Result<int>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public ExpireAllOverdueReservationsHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<int>> Handle(ExpireAllOverdueReservationsCommand request, CancellationToken cancellationToken)
    {
        var expired = await _unitOfWork.InventoryReservations.GetExpiredAsync(cancellationToken);
        var count = 0;

        foreach (var reservation in expired)
        {
            if (reservation.IsAutoRelease)
            {
                reservation.Expire();
                count++;
            }
        }

        if (count > 0)
            await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<int>.Success(count);
    }
}
