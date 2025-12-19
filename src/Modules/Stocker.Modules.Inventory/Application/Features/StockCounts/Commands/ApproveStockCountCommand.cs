using FluentValidation;
using MediatR;
using Stocker.Modules.Inventory.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.StockCounts.Commands;

public class ApproveStockCountCommand : IRequest<Result<bool>>
{
    public Guid TenantId { get; set; }
    public int StockCountId { get; set; }
    public int ApprovedByUserId { get; set; }
}

public class ApproveStockCountCommandValidator : AbstractValidator<ApproveStockCountCommand>
{
    public ApproveStockCountCommandValidator()
    {
        RuleFor(x => x.StockCountId).NotEmpty();
        RuleFor(x => x.ApprovedByUserId).NotEmpty();
    }
}

public class ApproveStockCountCommandHandler : IRequestHandler<ApproveStockCountCommand, Result<bool>>
{
    private readonly IInventoryUnitOfWork _unitOfWork;

    public ApproveStockCountCommandHandler(IInventoryUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(ApproveStockCountCommand request, CancellationToken cancellationToken)
    {
        var stockCount = await _unitOfWork.StockCounts.GetByIdAsync(request.StockCountId, cancellationToken);
        if (stockCount == null)
        {
            return Result<bool>.Failure(new Error("StockCount.NotFound", $"Stock count with ID {request.StockCountId} not found", ErrorType.NotFound));
        }

        try
        {
            stockCount.Approve(request.ApprovedByUserId);
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
