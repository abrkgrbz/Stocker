using FluentValidation;
using MediatR;
using Stocker.Modules.Inventory.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.StockTransfers.Commands;

public class ApproveStockTransferCommand : IRequest<Result<bool>>
{
    public Guid TenantId { get; set; }
    public int TransferId { get; set; }
    public int ApprovedByUserId { get; set; }
}

public class ApproveStockTransferCommandValidator : AbstractValidator<ApproveStockTransferCommand>
{
    public ApproveStockTransferCommandValidator()
    {
        RuleFor(x => x.TransferId).NotEmpty();
        RuleFor(x => x.ApprovedByUserId).NotEmpty();
    }
}

public class ApproveStockTransferCommandHandler : IRequestHandler<ApproveStockTransferCommand, Result<bool>>
{
    private readonly IInventoryUnitOfWork _unitOfWork;

    public ApproveStockTransferCommandHandler(IInventoryUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(ApproveStockTransferCommand request, CancellationToken cancellationToken)
    {
        var transfer = await _unitOfWork.StockTransfers.GetByIdAsync(request.TransferId, cancellationToken);
        if (transfer == null)
        {
            return Result<bool>.Failure(new Error("StockTransfer.NotFound", $"Transfer with ID {request.TransferId} not found", ErrorType.NotFound));
        }

        try
        {
            transfer.Approve(request.ApprovedByUserId);
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
