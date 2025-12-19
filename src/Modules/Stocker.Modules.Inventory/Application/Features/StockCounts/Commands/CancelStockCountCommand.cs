using MediatR;
using Stocker.Modules.Inventory.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.StockCounts.Commands;

public class CancelStockCountCommand : IRequest<Result<bool>>
{
    public Guid TenantId { get; set; }
    public int StockCountId { get; set; }
    public string? Reason { get; set; }
}

public class CancelStockCountCommandHandler : IRequestHandler<CancelStockCountCommand, Result<bool>>
{
    private readonly IInventoryUnitOfWork _unitOfWork;

    public CancelStockCountCommandHandler(IInventoryUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(CancelStockCountCommand request, CancellationToken cancellationToken)
    {
        var stockCount = await _unitOfWork.StockCounts.GetByIdAsync(request.StockCountId, cancellationToken);
        if (stockCount == null)
        {
            return Result<bool>.Failure(new Error("StockCount.NotFound", $"Stock count with ID {request.StockCountId} not found", ErrorType.NotFound));
        }

        try
        {
            stockCount.Cancel(request.Reason);
            await _unitOfWork.StockCounts.UpdateAsync(stockCount, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            return Result<bool>.Success(true);
        }
        catch (InvalidOperationException ex)
        {
            return Result<bool>.Failure(new Error("StockCount.InvalidOperation", ex.Message, ErrorType.Validation));
        }
    }
}
