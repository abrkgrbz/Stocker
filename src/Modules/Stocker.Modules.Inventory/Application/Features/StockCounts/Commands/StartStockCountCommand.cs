using FluentValidation;
using MediatR;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.StockCounts.Commands;

public class StartStockCountCommand : IRequest<Result<bool>>
{
    public int TenantId { get; set; }
    public int StockCountId { get; set; }
    public int CountedByUserId { get; set; }
}

public class StartStockCountCommandValidator : AbstractValidator<StartStockCountCommand>
{
    public StartStockCountCommandValidator()
    {
        RuleFor(x => x.StockCountId).GreaterThan(0);
        RuleFor(x => x.CountedByUserId).GreaterThan(0);
    }
}

public class StartStockCountCommandHandler : IRequestHandler<StartStockCountCommand, Result<bool>>
{
    private readonly IStockCountRepository _stockCountRepository;

    public StartStockCountCommandHandler(IStockCountRepository stockCountRepository)
    {
        _stockCountRepository = stockCountRepository;
    }

    public async Task<Result<bool>> Handle(StartStockCountCommand request, CancellationToken cancellationToken)
    {
        var stockCount = await _stockCountRepository.GetByIdAsync(request.StockCountId, cancellationToken);
        if (stockCount == null)
        {
            return Result<bool>.Failure(new Error("StockCount.NotFound", $"Stock count with ID {request.StockCountId} not found", ErrorType.NotFound));
        }

        try
        {
            stockCount.Start(request.CountedByUserId);
            await _stockCountRepository.UpdateAsync(stockCount, cancellationToken);
            return Result<bool>.Success(true);
        }
        catch (InvalidOperationException ex)
        {
            return Result<bool>.Failure(new Error("StockCount.InvalidOperation", ex.Message, ErrorType.Validation));
        }
    }
}
