using MediatR;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.StockCounts.Commands;

public class CompleteStockCountCommand : IRequest<Result<bool>>
{
    public int TenantId { get; set; }
    public int StockCountId { get; set; }
}

public class CompleteStockCountCommandHandler : IRequestHandler<CompleteStockCountCommand, Result<bool>>
{
    private readonly IStockCountRepository _stockCountRepository;

    public CompleteStockCountCommandHandler(IStockCountRepository stockCountRepository)
    {
        _stockCountRepository = stockCountRepository;
    }

    public async Task<Result<bool>> Handle(CompleteStockCountCommand request, CancellationToken cancellationToken)
    {
        var stockCount = await _stockCountRepository.GetByIdAsync(request.StockCountId, cancellationToken);
        if (stockCount == null)
        {
            return Result<bool>.Failure(new Error("StockCount.NotFound", $"Stock count with ID {request.StockCountId} not found", ErrorType.NotFound));
        }

        try
        {
            stockCount.Complete();
            await _stockCountRepository.UpdateAsync(stockCount, cancellationToken);
            return Result<bool>.Success(true);
        }
        catch (InvalidOperationException ex)
        {
            return Result<bool>.Failure(new Error("StockCount.InvalidOperation", ex.Message, ErrorType.Validation));
        }
    }
}
