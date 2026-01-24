using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Sales.Application.DTOs;
using Stocker.Modules.Sales.Application.Features.DeliveryNotes.Queries;
using Stocker.Modules.Sales.Domain.Entities;
using Stocker.Modules.Sales.Interfaces;
using Stocker.SharedKernel.Pagination;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Sales.Application.Features.DeliveryNotes.Handlers;

public class GetDeliveryNoteByIdHandler : IRequestHandler<GetDeliveryNoteByIdQuery, Result<DeliveryNoteDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public GetDeliveryNoteByIdHandler(ISalesUnitOfWork unitOfWork) => _unitOfWork = unitOfWork;

    public async Task<Result<DeliveryNoteDto>> Handle(GetDeliveryNoteByIdQuery request, CancellationToken cancellationToken)
    {
        var deliveryNote = await _unitOfWork.DeliveryNotes.GetWithItemsAsync(request.Id, cancellationToken);
        if (deliveryNote == null)
            return Result<DeliveryNoteDto>.Failure(Error.NotFound("DeliveryNote", "İrsaliye bulunamadı."));

        return Result<DeliveryNoteDto>.Success(MapToDto(deliveryNote));
    }

    internal static DeliveryNoteDto MapToDto(DeliveryNote entity) => new()
    {
        Id = entity.Id,
        DeliveryNoteNumber = entity.DeliveryNoteNumber,
        Series = entity.Series,
        SequenceNumber = entity.SequenceNumber,
        DeliveryNoteDate = entity.DeliveryNoteDate,
        DeliveryNoteType = entity.DeliveryNoteType.ToString(),
        Status = entity.Status.ToString(),
        IsEDeliveryNote = entity.IsEDeliveryNote,
        EDeliveryNoteUuid = entity.EDeliveryNoteUuid,
        EDeliveryNoteStatus = entity.EDeliveryNoteStatus?.ToString(),
        ShipmentId = entity.ShipmentId,
        SalesOrderId = entity.SalesOrderId,
        SalesOrderNumber = entity.SalesOrderNumber,
        InvoiceId = entity.InvoiceId,
        InvoiceNumber = entity.InvoiceNumber,
        SenderTaxId = entity.SenderTaxId,
        SenderName = entity.SenderName,
        SenderTaxOffice = entity.SenderTaxOffice,
        SenderAddress = entity.SenderAddress,
        SenderCity = entity.SenderCity,
        SenderDistrict = entity.SenderDistrict,
        ReceiverId = entity.ReceiverId,
        ReceiverTaxId = entity.ReceiverTaxId,
        ReceiverName = entity.ReceiverName,
        ReceiverTaxOffice = entity.ReceiverTaxOffice,
        ReceiverAddress = entity.ReceiverAddress,
        ReceiverCity = entity.ReceiverCity,
        ReceiverDistrict = entity.ReceiverDistrict,
        TransportMode = entity.TransportMode.ToString(),
        CarrierName = entity.CarrierName,
        VehiclePlate = entity.VehiclePlate,
        DriverName = entity.DriverName,
        TotalLineCount = entity.TotalLineCount,
        TotalQuantity = entity.TotalQuantity,
        TotalGrossWeight = entity.TotalGrossWeight,
        TotalNetWeight = entity.TotalNetWeight,
        DispatchDate = entity.DispatchDate,
        IsDelivered = entity.IsDelivered,
        DeliveryDate = entity.DeliveryDate,
        ReceivedBy = entity.ReceivedBy,
        Description = entity.Description,
        Notes = entity.Notes,
        WarehouseId = entity.WarehouseId,
        Items = entity.Items.Select(i => new DeliveryNoteItemDto
        {
            Id = i.Id,
            LineNumber = i.LineNumber,
            ProductId = i.ProductId,
            ProductCode = i.ProductCode,
            ProductName = i.ProductName,
            Quantity = i.Quantity,
            Unit = i.Unit,
            GrossWeight = i.GrossWeight,
            NetWeight = i.NetWeight,
            LotNumber = i.LotNumber,
            SerialNumber = i.SerialNumber,
            ExpiryDate = i.ExpiryDate,
            Notes = i.Notes
        }).ToList()
    };

    internal static DeliveryNoteListDto MapToListDto(DeliveryNote entity) => new()
    {
        Id = entity.Id,
        DeliveryNoteNumber = entity.DeliveryNoteNumber,
        DeliveryNoteDate = entity.DeliveryNoteDate,
        DeliveryNoteType = entity.DeliveryNoteType.ToString(),
        Status = entity.Status.ToString(),
        ReceiverName = entity.ReceiverName,
        SalesOrderNumber = entity.SalesOrderNumber,
        TotalLineCount = entity.TotalLineCount,
        TotalQuantity = entity.TotalQuantity,
        IsEDeliveryNote = entity.IsEDeliveryNote,
        IsDelivered = entity.IsDelivered,
        DeliveryDate = entity.DeliveryDate
    };
}

public class GetDeliveryNoteByNumberHandler : IRequestHandler<GetDeliveryNoteByNumberQuery, Result<DeliveryNoteDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public GetDeliveryNoteByNumberHandler(ISalesUnitOfWork unitOfWork) => _unitOfWork = unitOfWork;

    public async Task<Result<DeliveryNoteDto>> Handle(GetDeliveryNoteByNumberQuery request, CancellationToken cancellationToken)
    {
        var deliveryNote = await _unitOfWork.DeliveryNotes.GetByNumberAsync(request.DeliveryNoteNumber, cancellationToken);
        if (deliveryNote == null)
            return Result<DeliveryNoteDto>.Failure(Error.NotFound("DeliveryNote", "İrsaliye bulunamadı."));

        return Result<DeliveryNoteDto>.Success(GetDeliveryNoteByIdHandler.MapToDto(deliveryNote));
    }
}

public class GetDeliveryNotesHandler : IRequestHandler<GetDeliveryNotesQuery, Result<PagedResult<DeliveryNoteListDto>>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public GetDeliveryNotesHandler(ISalesUnitOfWork unitOfWork) => _unitOfWork = unitOfWork;

    public async Task<Result<PagedResult<DeliveryNoteListDto>>> Handle(GetDeliveryNotesQuery request, CancellationToken cancellationToken)
    {
        var query = _unitOfWork.ReadRepository<DeliveryNote>().AsQueryable()
            .Include(d => d.Items)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            var term = request.SearchTerm.ToLower();
            query = query.Where(d => d.DeliveryNoteNumber.ToLower().Contains(term) ||
                                     d.ReceiverName.ToLower().Contains(term) ||
                                     (d.SalesOrderNumber != null && d.SalesOrderNumber.ToLower().Contains(term)));
        }

        if (request.Status.HasValue)
            query = query.Where(d => d.Status == request.Status.Value);

        if (request.Type.HasValue)
            query = query.Where(d => d.DeliveryNoteType == request.Type.Value);

        if (request.FromDate.HasValue)
            query = query.Where(d => d.DeliveryNoteDate >= request.FromDate.Value);

        if (request.ToDate.HasValue)
            query = query.Where(d => d.DeliveryNoteDate <= request.ToDate.Value);

        query = request.SortBy?.ToLower() switch
        {
            "number" => request.SortDescending ? query.OrderByDescending(d => d.DeliveryNoteNumber) : query.OrderBy(d => d.DeliveryNoteNumber),
            "date" => request.SortDescending ? query.OrderByDescending(d => d.DeliveryNoteDate) : query.OrderBy(d => d.DeliveryNoteDate),
            "receiver" => request.SortDescending ? query.OrderByDescending(d => d.ReceiverName) : query.OrderBy(d => d.ReceiverName),
            "status" => request.SortDescending ? query.OrderByDescending(d => d.Status) : query.OrderBy(d => d.Status),
            _ => query.OrderByDescending(d => d.DeliveryNoteDate)
        };

        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(d => new DeliveryNoteListDto
            {
                Id = d.Id,
                DeliveryNoteNumber = d.DeliveryNoteNumber,
                DeliveryNoteDate = d.DeliveryNoteDate,
                DeliveryNoteType = d.DeliveryNoteType.ToString(),
                Status = d.Status.ToString(),
                ReceiverName = d.ReceiverName,
                SalesOrderNumber = d.SalesOrderNumber,
                TotalLineCount = d.TotalLineCount,
                TotalQuantity = d.TotalQuantity,
                IsEDeliveryNote = d.IsEDeliveryNote,
                IsDelivered = d.IsDelivered,
                DeliveryDate = d.DeliveryDate
            })
            .ToListAsync(cancellationToken);

        var pagedResult = new PagedResult<DeliveryNoteListDto>(items, totalCount, request.Page, request.PageSize);
        return Result<PagedResult<DeliveryNoteListDto>>.Success(pagedResult);
    }
}

public class GetDeliveryNotesBySalesOrderHandler : IRequestHandler<GetDeliveryNotesBySalesOrderQuery, Result<List<DeliveryNoteListDto>>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public GetDeliveryNotesBySalesOrderHandler(ISalesUnitOfWork unitOfWork) => _unitOfWork = unitOfWork;

    public async Task<Result<List<DeliveryNoteListDto>>> Handle(GetDeliveryNotesBySalesOrderQuery request, CancellationToken cancellationToken)
    {
        var notes = await _unitOfWork.DeliveryNotes.GetBySalesOrderIdAsync(request.SalesOrderId, cancellationToken);
        var result = notes.Select(GetDeliveryNoteByIdHandler.MapToListDto).ToList();
        return Result<List<DeliveryNoteListDto>>.Success(result);
    }
}

public class GetDeliveryNotesByReceiverHandler : IRequestHandler<GetDeliveryNotesByReceiverQuery, Result<List<DeliveryNoteListDto>>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public GetDeliveryNotesByReceiverHandler(ISalesUnitOfWork unitOfWork) => _unitOfWork = unitOfWork;

    public async Task<Result<List<DeliveryNoteListDto>>> Handle(GetDeliveryNotesByReceiverQuery request, CancellationToken cancellationToken)
    {
        var notes = await _unitOfWork.DeliveryNotes.GetByReceiverIdAsync(request.ReceiverId, cancellationToken);
        var result = notes.Select(GetDeliveryNoteByIdHandler.MapToListDto).ToList();
        return Result<List<DeliveryNoteListDto>>.Success(result);
    }
}

public class GetDeliveryNotesByStatusHandler : IRequestHandler<GetDeliveryNotesByStatusQuery, Result<List<DeliveryNoteListDto>>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public GetDeliveryNotesByStatusHandler(ISalesUnitOfWork unitOfWork) => _unitOfWork = unitOfWork;

    public async Task<Result<List<DeliveryNoteListDto>>> Handle(GetDeliveryNotesByStatusQuery request, CancellationToken cancellationToken)
    {
        var notes = await _unitOfWork.DeliveryNotes.GetByStatusAsync(request.Status, cancellationToken);
        var result = notes.Select(GetDeliveryNoteByIdHandler.MapToListDto).ToList();
        return Result<List<DeliveryNoteListDto>>.Success(result);
    }
}
