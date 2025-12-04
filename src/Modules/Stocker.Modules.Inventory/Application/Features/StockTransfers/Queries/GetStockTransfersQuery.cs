using MediatR;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Domain.Enums;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.StockTransfers.Queries;

/// <summary>
/// Query to get stock transfers
/// </summary>
public class GetStockTransfersQuery : IRequest<Result<List<StockTransferListDto>>>
{
    public Guid TenantId { get; set; }
    public int? SourceWarehouseId { get; set; }
    public int? DestinationWarehouseId { get; set; }
    public TransferStatus? Status { get; set; }
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
}

/// <summary>
/// Handler for GetStockTransfersQuery
/// </summary>
public class GetStockTransfersQueryHandler : IRequestHandler<GetStockTransfersQuery, Result<List<StockTransferListDto>>>
{
    private readonly IStockTransferRepository _transferRepository;

    public GetStockTransfersQueryHandler(IStockTransferRepository transferRepository)
    {
        _transferRepository = transferRepository;
    }

    public async Task<Result<List<StockTransferListDto>>> Handle(GetStockTransfersQuery request, CancellationToken cancellationToken)
    {
        IReadOnlyList<Domain.Entities.StockTransfer> transfers;

        if (request.Status.HasValue)
        {
            transfers = await _transferRepository.GetByStatusAsync(request.Status.Value, cancellationToken);
        }
        else if (request.SourceWarehouseId.HasValue)
        {
            transfers = await _transferRepository.GetBySourceWarehouseAsync(request.SourceWarehouseId.Value, cancellationToken);
        }
        else if (request.DestinationWarehouseId.HasValue)
        {
            transfers = await _transferRepository.GetByDestinationWarehouseAsync(request.DestinationWarehouseId.Value, cancellationToken);
        }
        else if (request.FromDate.HasValue && request.ToDate.HasValue)
        {
            transfers = await _transferRepository.GetByDateRangeAsync(request.FromDate.Value, request.ToDate.Value, cancellationToken);
        }
        else
        {
            transfers = await _transferRepository.GetAllAsync(cancellationToken);
        }

        var dtos = transfers.Select(t => new StockTransferListDto
        {
            Id = t.Id,
            TransferNumber = t.TransferNumber,
            TransferDate = t.TransferDate,
            SourceWarehouseName = t.SourceWarehouse?.Name ?? string.Empty,
            DestinationWarehouseName = t.DestinationWarehouse?.Name ?? string.Empty,
            Status = t.Status,
            TransferType = t.TransferType,
            ItemCount = t.Items?.Count ?? 0,
            TotalQuantity = t.Items?.Sum(i => i.RequestedQuantity) ?? 0
        }).ToList();

        return Result<List<StockTransferListDto>>.Success(dtos);
    }
}
