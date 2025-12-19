using FluentValidation;
using MediatR;
using Stocker.Modules.Inventory.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.StockTransfers.Commands;

public class ReceiveStockTransferCommand : IRequest<Result<bool>>
{
    public Guid TenantId { get; set; }
    public int TransferId { get; set; }
    public int ReceivedByUserId { get; set; }
}

public class ReceiveStockTransferCommandValidator : AbstractValidator<ReceiveStockTransferCommand>
{
    public ReceiveStockTransferCommandValidator()
    {
        RuleFor(x => x.TransferId).NotEmpty();
        RuleFor(x => x.ReceivedByUserId).NotEmpty();
    }
}

public class ReceiveStockTransferCommandHandler : IRequestHandler<ReceiveStockTransferCommand, Result<bool>>
{
    private readonly IInventoryUnitOfWork _unitOfWork;

    public ReceiveStockTransferCommandHandler(IInventoryUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(ReceiveStockTransferCommand request, CancellationToken cancellationToken)
    {
        var transfer = await _unitOfWork.StockTransfers.GetByIdAsync(request.TransferId, cancellationToken);
        if (transfer == null)
        {
            return Result<bool>.Failure(new Error("StockTransfer.NotFound", $"Transfer with ID {request.TransferId} not found", ErrorType.NotFound));
        }

        try
        {
            transfer.Receive(request.ReceivedByUserId);
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
