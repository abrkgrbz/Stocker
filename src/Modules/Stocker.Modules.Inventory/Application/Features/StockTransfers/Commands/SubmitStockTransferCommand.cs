using MediatR;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.StockTransfers.Commands;

public class SubmitStockTransferCommand : IRequest<Result<bool>>
{
    public int TenantId { get; set; }
    public int TransferId { get; set; }
}

public class SubmitStockTransferCommandHandler : IRequestHandler<SubmitStockTransferCommand, Result<bool>>
{
    private readonly IStockTransferRepository _stockTransferRepository;
    private readonly IUnitOfWork _unitOfWork;

    public SubmitStockTransferCommandHandler(IStockTransferRepository stockTransferRepository, IUnitOfWork unitOfWork)
    {
        _stockTransferRepository = stockTransferRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(SubmitStockTransferCommand request, CancellationToken cancellationToken)
    {
        var transfer = await _stockTransferRepository.GetByIdAsync(request.TransferId, cancellationToken);
        if (transfer == null)
        {
            return Result<bool>.Failure(new Error("StockTransfer.NotFound", $"Transfer with ID {request.TransferId} not found", ErrorType.NotFound));
        }

        try
        {
            transfer.Submit();
            await _stockTransferRepository.UpdateAsync(transfer, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            return Result<bool>.Success(true);
        }
        catch (InvalidOperationException ex)
        {
            return Result<bool>.Failure(new Error("StockTransfer.InvalidOperation", ex.Message, ErrorType.Validation));
        }
    }
}
