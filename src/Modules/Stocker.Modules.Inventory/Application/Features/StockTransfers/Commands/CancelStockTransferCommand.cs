using MediatR;
using Stocker.Modules.Inventory.Domain.Enums;
using Stocker.Modules.Inventory.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.StockTransfers.Commands;

public class CancelStockTransferCommand : IRequest<Result<bool>>
{
    public Guid TenantId { get; set; }
    public int TransferId { get; set; }
    public string? Reason { get; set; }
}

public class CancelStockTransferCommandHandler : IRequestHandler<CancelStockTransferCommand, Result<bool>>
{
    private readonly IInventoryUnitOfWork _unitOfWork;

    public CancelStockTransferCommandHandler(IInventoryUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(CancelStockTransferCommand request, CancellationToken cancellationToken)
    {
        var transfer = await _unitOfWork.StockTransfers.GetWithItemsAsync(request.TransferId, cancellationToken);
        if (transfer == null)
        {
            return Result<bool>.Failure(new Error("StockTransfer.NotFound", $"Transfer with ID {request.TransferId} not found", ErrorType.NotFound));
        }

        try
        {
            // Release reserved stock for items before completing cancellation
            // Only release if transfer hasn't been shipped yet (stock still reserved at source)
            if (transfer.Status == TransferStatus.Draft ||
                transfer.Status == TransferStatus.Pending ||
                transfer.Status == TransferStatus.Approved)
            {
                foreach (var item in transfer.Items)
                {
                    var stock = await _unitOfWork.Stocks.GetByProductAndLocationAsync(
                        item.ProductId, transfer.SourceWarehouseId, item.SourceLocationId, cancellationToken);

                    if (stock != null && stock.ReservedQuantity >= item.RequestedQuantity)
                    {
                        stock.ReleaseReservation(item.RequestedQuantity);
                    }
                }
            }

            transfer.Cancel(request.Reason);
            await _unitOfWork.StockTransfers.UpdateAsync(transfer, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            return Result<bool>.Success(true);
        }
        catch (InvalidOperationException ex)
        {
            return Result<bool>.Failure(new Error("StockTransfer.InvalidOperation", ex.Message, ErrorType.Validation));
        }
    }
}
