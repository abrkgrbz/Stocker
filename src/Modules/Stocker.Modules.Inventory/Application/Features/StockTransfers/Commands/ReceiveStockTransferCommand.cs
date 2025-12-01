using FluentValidation;
using MediatR;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.StockTransfers.Commands;

public class ReceiveStockTransferCommand : IRequest<Result<bool>>
{
    public int TenantId { get; set; }
    public int TransferId { get; set; }
    public int ReceivedByUserId { get; set; }
}

public class ReceiveStockTransferCommandValidator : AbstractValidator<ReceiveStockTransferCommand>
{
    public ReceiveStockTransferCommandValidator()
    {
        RuleFor(x => x.TransferId).GreaterThan(0);
        RuleFor(x => x.ReceivedByUserId).GreaterThan(0);
    }
}

public class ReceiveStockTransferCommandHandler : IRequestHandler<ReceiveStockTransferCommand, Result<bool>>
{
    private readonly IStockTransferRepository _stockTransferRepository;

    public ReceiveStockTransferCommandHandler(IStockTransferRepository stockTransferRepository)
    {
        _stockTransferRepository = stockTransferRepository;
    }

    public async Task<Result<bool>> Handle(ReceiveStockTransferCommand request, CancellationToken cancellationToken)
    {
        var transfer = await _stockTransferRepository.GetByIdAsync(request.TransferId, cancellationToken);
        if (transfer == null)
        {
            return Result<bool>.Failure(new Error("StockTransfer.NotFound", $"Transfer with ID {request.TransferId} not found", ErrorType.NotFound));
        }

        try
        {
            transfer.Receive(request.ReceivedByUserId);
            await _stockTransferRepository.UpdateAsync(transfer, cancellationToken);
            return Result<bool>.Success(true);
        }
        catch (InvalidOperationException ex)
        {
            return Result<bool>.Failure(new Error("StockTransfer.InvalidOperation", ex.Message, ErrorType.Validation));
        }
    }
}
