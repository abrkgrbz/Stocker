using FluentValidation;
using MediatR;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.StockCounts.Commands;

public class CountItemCommand : IRequest<Result<bool>>
{
    public int TenantId { get; set; }
    public int StockCountId { get; set; }
    public int ItemId { get; set; }
    public decimal CountedQuantity { get; set; }
    public string? Notes { get; set; }
}

public class CountItemCommandValidator : AbstractValidator<CountItemCommand>
{
    public CountItemCommandValidator()
    {
        RuleFor(x => x.StockCountId).GreaterThan(0);
        RuleFor(x => x.ItemId).GreaterThan(0);
        RuleFor(x => x.CountedQuantity).GreaterThanOrEqualTo(0);
    }
}

public class CountItemCommandHandler : IRequestHandler<CountItemCommand, Result<bool>>
{
    private readonly IStockCountRepository _stockCountRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CountItemCommandHandler(IStockCountRepository stockCountRepository, IUnitOfWork unitOfWork)
    {
        _stockCountRepository = stockCountRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(CountItemCommand request, CancellationToken cancellationToken)
    {
        var stockCount = await _stockCountRepository.GetByIdAsync(request.StockCountId, cancellationToken);
        if (stockCount == null)
        {
            return Result<bool>.Failure(new Error("StockCount.NotFound", $"Stock count with ID {request.StockCountId} not found", ErrorType.NotFound));
        }

        var item = stockCount.Items.FirstOrDefault(i => i.Id == request.ItemId);
        if (item == null)
        {
            return Result<bool>.Failure(new Error("StockCountItem.NotFound", $"Item with ID {request.ItemId} not found in this count", ErrorType.NotFound));
        }

        if (stockCount.Status != Domain.Enums.StockCountStatus.InProgress)
        {
            return Result<bool>.Failure(new Error("StockCount.InvalidStatus", "Can only count items in in-progress stock counts", ErrorType.Validation));
        }

        item.Count(request.CountedQuantity, request.Notes);
        await _stockCountRepository.UpdateAsync(stockCount, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
