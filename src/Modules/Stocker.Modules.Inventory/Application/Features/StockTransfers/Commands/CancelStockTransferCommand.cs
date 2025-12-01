using MediatR;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.StockTransfers.Commands;

public class CancelStockTransferCommand : IRequest<Result<bool>>
{
    public int TenantId { get; set; }
    public int TransferId { get; set; }
    public string? Reason { get; set; }
}

public class CancelStockTransferCommandHandler : IRequestHandler<CancelStockTransferCommand, Result<bool>>
{
    private readonly IStockTransferRepository _stockTransferRepository;

    public CancelStockTransferCommandHandler(IStockTransferRepository stockTransferRepository)
    {
        _stockTransferRepository = stockTransferRepository;
    }

    public async Task<Result<bool>> Handle(CancelStockTransferCommand request, CancellationToken cancellationToken)
    {
        var transfer = await _stockTransferRepository.GetByIdAsync(request.TransferId, cancellationToken);
        if (transfer == null)
        {
            return Result<bool>.Failure(new Error("StockTransfer.NotFound", $"Transfer with ID {request.TransferId} not found", ErrorType.NotFound));
        }

        try
        {
            transfer.Cancel(request.Reason);
            await _stockTransferRepository.UpdateAsync(transfer, cancellationToken);
            return Result<bool>.Success(true);
        }
        catch (InvalidOperationException ex)
        {
            return Result<bool>.Failure(new Error("StockTransfer.InvalidOperation", ex.Message, ErrorType.Validation));
        }
    }
}
