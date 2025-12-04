using MediatR;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.StockTransfers.Commands;

/// <summary>
/// Command to reject a stock transfer
/// </summary>
public class RejectStockTransferCommand : IRequest<Result>
{
    public Guid TenantId { get; set; }
    public int TransferId { get; set; }
    public int RejectedByUserId { get; set; }
    public string? Reason { get; set; }
}

/// <summary>
/// Handler for RejectStockTransferCommand
/// </summary>
public class RejectStockTransferCommandHandler : IRequestHandler<RejectStockTransferCommand, Result>
{
    private readonly IStockTransferRepository _stockTransferRepository;
    private readonly IUnitOfWork _unitOfWork;

    public RejectStockTransferCommandHandler(
        IStockTransferRepository stockTransferRepository,
        IUnitOfWork unitOfWork)
    {
        _stockTransferRepository = stockTransferRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> Handle(RejectStockTransferCommand request, CancellationToken cancellationToken)
    {
        var transfer = await _stockTransferRepository.GetByIdAsync(request.TransferId, cancellationToken);
        if (transfer == null)
        {
            return Result.Failure(Error.NotFound("StockTransfer", $"Stock transfer with ID {request.TransferId} not found"));
        }

        try
        {
            transfer.Reject(request.RejectedByUserId, request.Reason);
        }
        catch (InvalidOperationException ex)
        {
            return Result.Failure(Error.Validation("StockTransfer.InvalidOperation", ex.Message));
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
