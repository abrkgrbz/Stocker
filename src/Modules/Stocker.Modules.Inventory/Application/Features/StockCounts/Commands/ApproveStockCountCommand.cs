using FluentValidation;
using MediatR;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.StockCounts.Commands;

public class ApproveStockCountCommand : IRequest<Result<bool>>
{
    public int TenantId { get; set; }
    public int StockCountId { get; set; }
    public int ApprovedByUserId { get; set; }
}

public class ApproveStockCountCommandValidator : AbstractValidator<ApproveStockCountCommand>
{
    public ApproveStockCountCommandValidator()
    {
        RuleFor(x => x.StockCountId).GreaterThan(0);
        RuleFor(x => x.ApprovedByUserId).GreaterThan(0);
    }
}

public class ApproveStockCountCommandHandler : IRequestHandler<ApproveStockCountCommand, Result<bool>>
{
    private readonly IStockCountRepository _stockCountRepository;
    private readonly IUnitOfWork _unitOfWork;

    public ApproveStockCountCommandHandler(IStockCountRepository stockCountRepository, IUnitOfWork unitOfWork)
    {
        _stockCountRepository = stockCountRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(ApproveStockCountCommand request, CancellationToken cancellationToken)
    {
        var stockCount = await _stockCountRepository.GetByIdAsync(request.StockCountId, cancellationToken);
        if (stockCount == null)
        {
            return Result<bool>.Failure(new Error("StockCount.NotFound", $"Stock count with ID {request.StockCountId} not found", ErrorType.NotFound));
        }

        try
        {
            stockCount.Approve(request.ApprovedByUserId);
            await _stockCountRepository.UpdateAsync(stockCount, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            return Result<bool>.Success(true);
        }
        catch (InvalidOperationException ex)
        {
            return Result<bool>.Failure(new Error("StockCount.InvalidOperation", ex.Message, ErrorType.Validation));
        }
    }
}
