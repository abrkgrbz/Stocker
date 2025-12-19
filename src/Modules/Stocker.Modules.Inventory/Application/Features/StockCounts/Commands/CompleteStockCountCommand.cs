using MediatR;
using Stocker.Modules.Inventory.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.StockCounts.Commands;

public class CompleteStockCountCommand : IRequest<Result<bool>>
{
    public Guid TenantId { get; set; }
    public int StockCountId { get; set; }
}

public class CompleteStockCountCommandHandler : IRequestHandler<CompleteStockCountCommand, Result<bool>>
{
    private readonly IInventoryUnitOfWork _unitOfWork;

    public CompleteStockCountCommandHandler(IInventoryUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(CompleteStockCountCommand request, CancellationToken cancellationToken)
    {
        var stockCount = await _unitOfWork.StockCounts.GetByIdAsync(request.StockCountId, cancellationToken);
        if (stockCount == null)
        {
            return Result<bool>.Failure(new Error("StockCount.NotFound", $"Stock count with ID {request.StockCountId} not found", ErrorType.NotFound));
        }

        try
        {
            stockCount.Complete();
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
