using MediatR;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.StockTransfers.Queries;

/// <summary>
/// Query to get a stock transfer by ID
/// </summary>
public class GetStockTransferByIdQuery : IRequest<Result<StockTransferDto>>
{
    public Guid TenantId { get; set; }
    public int TransferId { get; set; }
}

/// <summary>
/// Handler for GetStockTransferByIdQuery
/// </summary>
public class GetStockTransferByIdQueryHandler : IRequestHandler<GetStockTransferByIdQuery, Result<StockTransferDto>>
{
    private readonly IStockTransferRepository _transferRepository;

    public GetStockTransferByIdQueryHandler(IStockTransferRepository transferRepository)
    {
        _transferRepository = transferRepository;
    }

    public async Task<Result<StockTransferDto>> Handle(GetStockTransferByIdQuery request, CancellationToken cancellationToken)
    {
        var transfer = await _transferRepository.GetWithItemsAsync(request.TransferId, cancellationToken);

        if (transfer == null)
        {
            return Result<StockTransferDto>.Failure(new Error("StockTransfer.NotFound", $"Stock transfer with ID {request.TransferId} not found", ErrorType.NotFound));
        }

        var dto = new StockTransferDto
        {
            Id = transfer.Id,
            TransferNumber = transfer.TransferNumber,
            TransferDate = transfer.TransferDate,
            SourceWarehouseId = transfer.SourceWarehouseId,
            SourceWarehouseName = transfer.SourceWarehouse?.Name ?? string.Empty,
            DestinationWarehouseId = transfer.DestinationWarehouseId,
            DestinationWarehouseName = transfer.DestinationWarehouse?.Name ?? string.Empty,
            Status = transfer.Status,
            TransferType = transfer.TransferType,
            Description = transfer.Description,
            Notes = transfer.Notes,
            ExpectedArrivalDate = transfer.ExpectedArrivalDate,
            ShippedDate = transfer.ShippedDate,
            ReceivedDate = transfer.ReceivedDate,
            CompletedDate = transfer.CompletedDate,
            CancelledDate = transfer.CancelledDate,
            CancellationReason = transfer.CancellationReason,
            CreatedByUserId = transfer.CreatedByUserId,
            ApprovedByUserId = transfer.ApprovedByUserId,
            ShippedByUserId = transfer.ShippedByUserId,
            ReceivedByUserId = transfer.ReceivedByUserId,
            CreatedAt = transfer.CreatedDate,
            TotalRequestedQuantity = transfer.Items?.Sum(i => i.RequestedQuantity) ?? 0,
            TotalShippedQuantity = transfer.Items?.Sum(i => i.ShippedQuantity) ?? 0,
            TotalReceivedQuantity = transfer.Items?.Sum(i => i.ReceivedQuantity) ?? 0,
            Items = transfer.Items?.Select(i => new StockTransferItemDto
            {
                Id = i.Id,
                ProductId = i.ProductId,
                ProductCode = i.Product?.Code ?? string.Empty,
                ProductName = i.Product?.Name ?? string.Empty,
                SourceLocationId = i.SourceLocationId,
                DestinationLocationId = i.DestinationLocationId,
                RequestedQuantity = i.RequestedQuantity,
                ShippedQuantity = i.ShippedQuantity,
                ReceivedQuantity = i.ReceivedQuantity,
                DamagedQuantity = i.DamagedQuantity,
                Notes = i.Notes
            }).ToList() ?? new List<StockTransferItemDto>()
        };

        return Result<StockTransferDto>.Success(dto);
    }
}
