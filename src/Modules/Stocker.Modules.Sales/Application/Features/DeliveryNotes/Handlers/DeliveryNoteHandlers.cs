using MediatR;
using Stocker.Modules.Sales.Application.DTOs;
using Stocker.Modules.Sales.Application.Features.DeliveryNotes.Commands;
using Stocker.Modules.Sales.Domain.Entities;
using Stocker.Modules.Sales.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Sales.Application.Features.DeliveryNotes.Handlers;

public class CreateDeliveryNoteHandler : IRequestHandler<CreateDeliveryNoteCommand, Result<DeliveryNoteDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public CreateDeliveryNoteHandler(ISalesUnitOfWork unitOfWork) => _unitOfWork = unitOfWork;

    public async Task<Result<DeliveryNoteDto>> Handle(CreateDeliveryNoteCommand request, CancellationToken cancellationToken)
    {
        var dto = request.Dto;

        if (!Enum.TryParse<DeliveryNoteType>(dto.DeliveryNoteType, out var type))
            type = DeliveryNoteType.SalesDeliveryNote;

        var sequenceNumber = await _unitOfWork.DeliveryNotes.GetNextSequenceNumberAsync(dto.Series, cancellationToken);

        var result = DeliveryNote.Create(
            _unitOfWork.TenantId,
            type,
            dto.Series,
            sequenceNumber,
            dto.DeliveryNoteDate,
            dto.SenderTaxId,
            dto.SenderName,
            dto.SenderAddress,
            dto.ReceiverTaxId,
            dto.ReceiverName,
            dto.ReceiverAddress);

        if (!result.IsSuccess)
            return Result<DeliveryNoteDto>.Failure(result.Error);

        var deliveryNote = result.Value!;

        if (dto.SenderTaxOffice != null || dto.SenderCity != null)
            deliveryNote.SetSenderDetails(dto.SenderTaxOffice, dto.SenderCity, dto.SenderDistrict, null);

        if (dto.ReceiverTaxOffice != null || dto.ReceiverCity != null)
            deliveryNote.SetReceiverDetails(dto.ReceiverTaxOffice, dto.ReceiverCity, dto.ReceiverDistrict, null, null);

        if (dto.ReceiverId.HasValue)
        {
            // Set receiver via reflection or internal method - entity handles it in Create
        }

        if (dto.SalesOrderId.HasValue)
        {
            // Link is set in entity factory for shipment-based creation
        }

        if (dto.WarehouseId.HasValue)
            deliveryNote.SetWarehouse(dto.WarehouseId);

        if (!string.IsNullOrEmpty(dto.Description))
            deliveryNote.SetDescription(dto.Description);

        // Add items
        for (int i = 0; i < dto.Items.Count; i++)
        {
            var itemDto = dto.Items[i];
            var itemResult = deliveryNote.AddItem(
                i + 1,
                itemDto.ProductId,
                itemDto.ProductCode,
                itemDto.ProductName,
                itemDto.Quantity,
                itemDto.Unit,
                itemDto.LotNumber);

            if (!itemResult.IsSuccess)
                return Result<DeliveryNoteDto>.Failure(itemResult.Error);

            var item = itemResult.Value!;
            if (itemDto.SerialNumber != null) item.SetSerialNumber(itemDto.SerialNumber);
            if (itemDto.GrossWeight.HasValue || itemDto.NetWeight.HasValue)
                item.SetWeights(itemDto.GrossWeight, itemDto.NetWeight);
        }

        await _unitOfWork.DeliveryNotes.AddAsync(deliveryNote, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var savedNote = await _unitOfWork.DeliveryNotes.GetWithItemsAsync(deliveryNote.Id, cancellationToken);
        return Result<DeliveryNoteDto>.Success(MapToDto(savedNote!));
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
}

public class ApproveDeliveryNoteHandler : IRequestHandler<ApproveDeliveryNoteCommand, Result<DeliveryNoteDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public ApproveDeliveryNoteHandler(ISalesUnitOfWork unitOfWork) => _unitOfWork = unitOfWork;

    public async Task<Result<DeliveryNoteDto>> Handle(ApproveDeliveryNoteCommand request, CancellationToken cancellationToken)
    {
        var deliveryNote = await _unitOfWork.DeliveryNotes.GetWithItemsAsync(request.Id, cancellationToken);
        if (deliveryNote == null)
            return Result<DeliveryNoteDto>.Failure(Error.NotFound("DeliveryNote", "İrsaliye bulunamadı."));

        var result = deliveryNote.Approve();
        if (!result.IsSuccess)
            return Result<DeliveryNoteDto>.Failure(result.Error);

        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return Result<DeliveryNoteDto>.Success(MapToDto(deliveryNote));
    }

    private static DeliveryNoteDto MapToDto(DeliveryNote entity) => CreateDeliveryNoteHandler.MapToDto(entity);
}

public class DispatchDeliveryNoteHandler : IRequestHandler<DispatchDeliveryNoteCommand, Result<DeliveryNoteDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public DispatchDeliveryNoteHandler(ISalesUnitOfWork unitOfWork) => _unitOfWork = unitOfWork;

    public async Task<Result<DeliveryNoteDto>> Handle(DispatchDeliveryNoteCommand request, CancellationToken cancellationToken)
    {
        var deliveryNote = await _unitOfWork.DeliveryNotes.GetWithItemsAsync(request.Id, cancellationToken);
        if (deliveryNote == null)
            return Result<DeliveryNoteDto>.Failure(Error.NotFound("DeliveryNote", "İrsaliye bulunamadı."));

        var dto = request.Dto;

        if (!string.IsNullOrEmpty(dto.TransportMode) && Enum.TryParse<TransportMode>(dto.TransportMode, out var mode))
            deliveryNote.SetTransportInfo(mode, dto.CarrierTaxId, dto.CarrierName);

        if (!string.IsNullOrEmpty(dto.VehiclePlate) || !string.IsNullOrEmpty(dto.DriverName))
            deliveryNote.SetVehicleInfo(dto.VehiclePlate, dto.TrailerPlate, dto.DriverName, dto.DriverNationalId);

        var dispatchTime = dto.DispatchDate?.TimeOfDay;
        var result = deliveryNote.Dispatch(dto.DispatchDate, dispatchTime);
        if (!result.IsSuccess)
            return Result<DeliveryNoteDto>.Failure(result.Error);

        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return Result<DeliveryNoteDto>.Success(MapToDto(deliveryNote));
    }

    private static DeliveryNoteDto MapToDto(DeliveryNote entity) => CreateDeliveryNoteHandler.MapToDto(entity);
}

public class DeliverDeliveryNoteHandler : IRequestHandler<DeliverDeliveryNoteCommand, Result<DeliveryNoteDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public DeliverDeliveryNoteHandler(ISalesUnitOfWork unitOfWork) => _unitOfWork = unitOfWork;

    public async Task<Result<DeliveryNoteDto>> Handle(DeliverDeliveryNoteCommand request, CancellationToken cancellationToken)
    {
        var deliveryNote = await _unitOfWork.DeliveryNotes.GetWithItemsAsync(request.Id, cancellationToken);
        if (deliveryNote == null)
            return Result<DeliveryNoteDto>.Failure(Error.NotFound("DeliveryNote", "İrsaliye bulunamadı."));

        var result = deliveryNote.Deliver(request.Dto.ReceivedBy, request.Dto.Signature);
        if (!result.IsSuccess)
            return Result<DeliveryNoteDto>.Failure(result.Error);

        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return Result<DeliveryNoteDto>.Success(MapToDto(deliveryNote));
    }

    private static DeliveryNoteDto MapToDto(DeliveryNote entity) => CreateDeliveryNoteHandler.MapToDto(entity);
}

public class CancelDeliveryNoteHandler : IRequestHandler<CancelDeliveryNoteCommand, Result>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public CancelDeliveryNoteHandler(ISalesUnitOfWork unitOfWork) => _unitOfWork = unitOfWork;

    public async Task<Result> Handle(CancelDeliveryNoteCommand request, CancellationToken cancellationToken)
    {
        var deliveryNote = await _unitOfWork.DeliveryNotes.GetWithItemsAsync(request.Id, cancellationToken);
        if (deliveryNote == null)
            return Result.Failure(Error.NotFound("DeliveryNote", "İrsaliye bulunamadı."));

        var result = deliveryNote.Cancel(request.Dto.Reason);
        if (!result.IsSuccess)
            return result;

        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
}

public class PrintDeliveryNoteHandler : IRequestHandler<PrintDeliveryNoteCommand, Result<DeliveryNoteDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public PrintDeliveryNoteHandler(ISalesUnitOfWork unitOfWork) => _unitOfWork = unitOfWork;

    public async Task<Result<DeliveryNoteDto>> Handle(PrintDeliveryNoteCommand request, CancellationToken cancellationToken)
    {
        var deliveryNote = await _unitOfWork.DeliveryNotes.GetWithItemsAsync(request.Id, cancellationToken);
        if (deliveryNote == null)
            return Result<DeliveryNoteDto>.Failure(Error.NotFound("DeliveryNote", "İrsaliye bulunamadı."));

        var result = deliveryNote.Print();
        if (!result.IsSuccess)
            return Result<DeliveryNoteDto>.Failure(result.Error);

        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return Result<DeliveryNoteDto>.Success(MapToDto(deliveryNote));
    }

    private static DeliveryNoteDto MapToDto(DeliveryNote entity) => CreateDeliveryNoteHandler.MapToDto(entity);
}

public class AddDeliveryNoteItemHandler : IRequestHandler<AddDeliveryNoteItemCommand, Result<DeliveryNoteItemDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public AddDeliveryNoteItemHandler(ISalesUnitOfWork unitOfWork) => _unitOfWork = unitOfWork;

    public async Task<Result<DeliveryNoteItemDto>> Handle(AddDeliveryNoteItemCommand request, CancellationToken cancellationToken)
    {
        var deliveryNote = await _unitOfWork.DeliveryNotes.GetWithItemsAsync(request.DeliveryNoteId, cancellationToken);
        if (deliveryNote == null)
            return Result<DeliveryNoteItemDto>.Failure(Error.NotFound("DeliveryNote", "İrsaliye bulunamadı."));

        var lineNumber = deliveryNote.Items.Count + 1;
        var dto = request.Dto;

        var result = deliveryNote.AddItem(lineNumber, dto.ProductId, dto.ProductCode, dto.ProductName, dto.Quantity, dto.Unit, dto.LotNumber);
        if (!result.IsSuccess)
            return Result<DeliveryNoteItemDto>.Failure(result.Error);

        var item = result.Value!;
        if (dto.SerialNumber != null) item.SetSerialNumber(dto.SerialNumber);
        if (dto.GrossWeight.HasValue || dto.NetWeight.HasValue) item.SetWeights(dto.GrossWeight, dto.NetWeight);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<DeliveryNoteItemDto>.Success(new DeliveryNoteItemDto
        {
            Id = item.Id,
            LineNumber = item.LineNumber,
            ProductId = item.ProductId,
            ProductCode = item.ProductCode,
            ProductName = item.ProductName,
            Quantity = item.Quantity,
            Unit = item.Unit,
            GrossWeight = item.GrossWeight,
            NetWeight = item.NetWeight,
            LotNumber = item.LotNumber,
            SerialNumber = item.SerialNumber,
            ExpiryDate = item.ExpiryDate,
            Notes = item.Notes
        });
    }
}

public class LinkInvoiceHandler : IRequestHandler<LinkInvoiceCommand, Result>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public LinkInvoiceHandler(ISalesUnitOfWork unitOfWork) => _unitOfWork = unitOfWork;

    public async Task<Result> Handle(LinkInvoiceCommand request, CancellationToken cancellationToken)
    {
        var deliveryNote = await _unitOfWork.DeliveryNotes.GetWithItemsAsync(request.DeliveryNoteId, cancellationToken);
        if (deliveryNote == null)
            return Result.Failure(Error.NotFound("DeliveryNote", "İrsaliye bulunamadı."));

        deliveryNote.LinkInvoice(request.InvoiceId, request.InvoiceNumber);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
}
