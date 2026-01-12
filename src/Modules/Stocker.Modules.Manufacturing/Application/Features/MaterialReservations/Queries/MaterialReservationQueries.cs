using MediatR;
using Stocker.Modules.Manufacturing.Application.DTOs;
using Stocker.Modules.Manufacturing.Application.Features.MaterialReservations.Commands;
using Stocker.Modules.Manufacturing.Domain.Enums;
using Stocker.Modules.Manufacturing.Interfaces;

namespace Stocker.Modules.Manufacturing.Application.Features.MaterialReservations.Queries;

#region Get Reservation By Id

public record GetMaterialReservationByIdQuery(int Id) : IRequest<MaterialReservationDto?>;

public class GetMaterialReservationByIdQueryHandler : IRequestHandler<GetMaterialReservationByIdQuery, MaterialReservationDto?>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public GetMaterialReservationByIdQueryHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<MaterialReservationDto?> Handle(GetMaterialReservationByIdQuery request, CancellationToken cancellationToken)
    {
        var reservation = await _unitOfWork.MaterialReservations.GetByIdWithDetailsAsync(request.Id, cancellationToken);
        return reservation != null ? ReservationMapper.ToDto(reservation) : null;
    }
}

#endregion

#region Get All Reservations

public record GetAllMaterialReservationsQuery : IRequest<IReadOnlyList<MaterialReservationListDto>>;

public class GetAllMaterialReservationsQueryHandler : IRequestHandler<GetAllMaterialReservationsQuery, IReadOnlyList<MaterialReservationListDto>>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public GetAllMaterialReservationsQueryHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IReadOnlyList<MaterialReservationListDto>> Handle(GetAllMaterialReservationsQuery request, CancellationToken cancellationToken)
    {
        var reservations = await _unitOfWork.MaterialReservations.GetAllAsync(cancellationToken);
        return reservations.Select(ReservationMapper.ToListDto).ToList();
    }
}

#endregion

#region Get Active Reservations

public record GetActiveMaterialReservationsQuery : IRequest<IReadOnlyList<MaterialReservationListDto>>;

public class GetActiveMaterialReservationsQueryHandler : IRequestHandler<GetActiveMaterialReservationsQuery, IReadOnlyList<MaterialReservationListDto>>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public GetActiveMaterialReservationsQueryHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IReadOnlyList<MaterialReservationListDto>> Handle(GetActiveMaterialReservationsQuery request, CancellationToken cancellationToken)
    {
        var reservations = await _unitOfWork.MaterialReservations.GetActiveReservationsAsync(cancellationToken);
        return reservations.Select(ReservationMapper.ToListDto).ToList();
    }
}

#endregion

#region Get Reservations By Status

public record GetMaterialReservationsByStatusQuery(MaterialReservationStatus Status) : IRequest<IReadOnlyList<MaterialReservationListDto>>;

public class GetMaterialReservationsByStatusQueryHandler : IRequestHandler<GetMaterialReservationsByStatusQuery, IReadOnlyList<MaterialReservationListDto>>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public GetMaterialReservationsByStatusQueryHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IReadOnlyList<MaterialReservationListDto>> Handle(GetMaterialReservationsByStatusQuery request, CancellationToken cancellationToken)
    {
        var reservations = await _unitOfWork.MaterialReservations.GetByStatusAsync(request.Status, cancellationToken);
        return reservations.Select(ReservationMapper.ToListDto).ToList();
    }
}

#endregion

#region Get Reservations By Product

public record GetMaterialReservationsByProductQuery(int ProductId) : IRequest<IReadOnlyList<MaterialReservationListDto>>;

public class GetMaterialReservationsByProductQueryHandler : IRequestHandler<GetMaterialReservationsByProductQuery, IReadOnlyList<MaterialReservationListDto>>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public GetMaterialReservationsByProductQueryHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IReadOnlyList<MaterialReservationListDto>> Handle(GetMaterialReservationsByProductQuery request, CancellationToken cancellationToken)
    {
        var reservations = await _unitOfWork.MaterialReservations.GetByProductAsync(request.ProductId, cancellationToken);
        return reservations.Select(ReservationMapper.ToListDto).ToList();
    }
}

#endregion

#region Get Reservations By Production Order

public record GetMaterialReservationsByProductionOrderQuery(int ProductionOrderId) : IRequest<IReadOnlyList<MaterialReservationListDto>>;

public class GetMaterialReservationsByProductionOrderQueryHandler : IRequestHandler<GetMaterialReservationsByProductionOrderQuery, IReadOnlyList<MaterialReservationListDto>>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public GetMaterialReservationsByProductionOrderQueryHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IReadOnlyList<MaterialReservationListDto>> Handle(GetMaterialReservationsByProductionOrderQuery request, CancellationToken cancellationToken)
    {
        var reservations = await _unitOfWork.MaterialReservations.GetByProductionOrderAsync(request.ProductionOrderId, cancellationToken);
        return reservations.Select(ReservationMapper.ToListDto).ToList();
    }
}

#endregion

#region Get Reservations By Warehouse

public record GetMaterialReservationsByWarehouseQuery(int WarehouseId) : IRequest<IReadOnlyList<MaterialReservationListDto>>;

public class GetMaterialReservationsByWarehouseQueryHandler : IRequestHandler<GetMaterialReservationsByWarehouseQuery, IReadOnlyList<MaterialReservationListDto>>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public GetMaterialReservationsByWarehouseQueryHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IReadOnlyList<MaterialReservationListDto>> Handle(GetMaterialReservationsByWarehouseQuery request, CancellationToken cancellationToken)
    {
        var reservations = await _unitOfWork.MaterialReservations.GetByWarehouseAsync(request.WarehouseId, cancellationToken);
        return reservations.Select(ReservationMapper.ToListDto).ToList();
    }
}

#endregion

#region Get Urgent Reservations

public record GetUrgentMaterialReservationsQuery : IRequest<IReadOnlyList<MaterialReservationListDto>>;

public class GetUrgentMaterialReservationsQueryHandler : IRequestHandler<GetUrgentMaterialReservationsQuery, IReadOnlyList<MaterialReservationListDto>>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public GetUrgentMaterialReservationsQueryHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IReadOnlyList<MaterialReservationListDto>> Handle(GetUrgentMaterialReservationsQuery request, CancellationToken cancellationToken)
    {
        var reservations = await _unitOfWork.MaterialReservations.GetUrgentReservationsAsync(cancellationToken);
        return reservations.Select(ReservationMapper.ToListDto).ToList();
    }
}

#endregion

#region Get Pending Approval Reservations

public record GetPendingApprovalMaterialReservationsQuery : IRequest<IReadOnlyList<MaterialReservationListDto>>;

public class GetPendingApprovalMaterialReservationsQueryHandler : IRequestHandler<GetPendingApprovalMaterialReservationsQuery, IReadOnlyList<MaterialReservationListDto>>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public GetPendingApprovalMaterialReservationsQueryHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IReadOnlyList<MaterialReservationListDto>> Handle(GetPendingApprovalMaterialReservationsQuery request, CancellationToken cancellationToken)
    {
        var reservations = await _unitOfWork.MaterialReservations.GetPendingApprovalAsync(cancellationToken);
        return reservations.Select(ReservationMapper.ToListDto).ToList();
    }
}

#endregion

#region Get Reservations By Required Date Range

public record GetMaterialReservationsByRequiredDateRangeQuery(DateTime StartDate, DateTime EndDate) : IRequest<IReadOnlyList<MaterialReservationListDto>>;

public class GetMaterialReservationsByRequiredDateRangeQueryHandler : IRequestHandler<GetMaterialReservationsByRequiredDateRangeQuery, IReadOnlyList<MaterialReservationListDto>>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public GetMaterialReservationsByRequiredDateRangeQueryHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IReadOnlyList<MaterialReservationListDto>> Handle(GetMaterialReservationsByRequiredDateRangeQuery request, CancellationToken cancellationToken)
    {
        var reservations = await _unitOfWork.MaterialReservations.GetByRequiredDateRangeAsync(request.StartDate, request.EndDate, cancellationToken);
        return reservations.Select(ReservationMapper.ToListDto).ToList();
    }
}

#endregion

#region Get Reservations By Lot

public record GetMaterialReservationsByLotQuery(string LotNumber) : IRequest<IReadOnlyList<MaterialReservationListDto>>;

public class GetMaterialReservationsByLotQueryHandler : IRequestHandler<GetMaterialReservationsByLotQuery, IReadOnlyList<MaterialReservationListDto>>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public GetMaterialReservationsByLotQueryHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IReadOnlyList<MaterialReservationListDto>> Handle(GetMaterialReservationsByLotQuery request, CancellationToken cancellationToken)
    {
        var reservations = await _unitOfWork.MaterialReservations.GetByLotNumberAsync(request.LotNumber, cancellationToken);
        return reservations.Select(ReservationMapper.ToListDto).ToList();
    }
}

#endregion

#region Get Reservation Summary

public record GetMaterialReservationSummaryQuery : IRequest<MaterialReservationSummaryDto>;

public class GetMaterialReservationSummaryQueryHandler : IRequestHandler<GetMaterialReservationSummaryQuery, MaterialReservationSummaryDto>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public GetMaterialReservationSummaryQueryHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<MaterialReservationSummaryDto> Handle(GetMaterialReservationSummaryQuery request, CancellationToken cancellationToken)
    {
        var reservations = await _unitOfWork.MaterialReservations.GetAllAsync(cancellationToken);
        var list = reservations.ToList();

        var total = list.Count;
        var active = list.Count(r => r.Status == MaterialReservationStatus.Aktif);
        var partiallyAllocated = list.Count(r => r.Status == MaterialReservationStatus.KısmenTahsis);
        var fullyAllocated = list.Count(r => r.Status == MaterialReservationStatus.TamTahsis);
        var completed = list.Count(r => r.Status == MaterialReservationStatus.Tamamlandı);
        var cancelled = list.Count(r => r.Status == MaterialReservationStatus.İptal);
        var expired = list.Count(r => r.Status == MaterialReservationStatus.Süresi_Doldu);
        var urgent = list.Count(r => r.IsUrgent && r.Status != MaterialReservationStatus.Tamamlandı && r.Status != MaterialReservationStatus.İptal);
        var pendingApproval = list.Count(r => r.RequiresApproval && !r.ApprovedDate.HasValue);

        var totalRequired = list.Sum(r => r.RequiredQuantity);
        var totalAllocated = list.Sum(r => r.AllocatedQuantity);
        var totalIssued = list.Sum(r => r.IssuedQuantity);

        var allocationRate = totalRequired > 0 ? totalAllocated / totalRequired * 100 : 0;
        var fulfillmentRate = totalRequired > 0 ? totalIssued / totalRequired * 100 : 0;

        return new MaterialReservationSummaryDto(
            total, active, partiallyAllocated, fullyAllocated, completed, cancelled, expired,
            urgent, pendingApproval,
            totalRequired, totalAllocated, totalIssued,
            allocationRate, fulfillmentRate);
    }
}

#endregion

#region Get Product Reservation Summary

public record GetProductReservationSummaryQuery(int ProductId) : IRequest<ProductReservationSummaryDto>;

public class GetProductReservationSummaryQueryHandler : IRequestHandler<GetProductReservationSummaryQuery, ProductReservationSummaryDto>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public GetProductReservationSummaryQueryHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<ProductReservationSummaryDto> Handle(GetProductReservationSummaryQuery request, CancellationToken cancellationToken)
    {
        var reservations = await _unitOfWork.MaterialReservations.GetByProductAsync(request.ProductId, cancellationToken);
        var activeReservations = reservations
            .Where(r => r.Status != MaterialReservationStatus.Tamamlandı && r.Status != MaterialReservationStatus.İptal)
            .ToList();

        var totalReserved = await _unitOfWork.MaterialReservations.GetTotalReservedQuantityByProductAsync(request.ProductId, cancellationToken);
        var totalAllocated = activeReservations.Sum(r => r.AllocatedQuantity);
        var totalIssued = activeReservations.Sum(r => r.IssuedQuantity);

        var first = reservations.FirstOrDefault();

        return new ProductReservationSummaryDto(
            request.ProductId,
            first?.ProductCode,
            first?.ProductName,
            totalReserved,
            totalAllocated,
            totalIssued,
            0, // AvailableForReservation would need stock integration
            activeReservations.Count);
    }
}

#endregion
