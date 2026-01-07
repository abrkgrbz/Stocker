using MediatR;
using Stocker.Modules.Inventory.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.LotBatches.Commands;

public class ApproveLotBatchCommand : IRequest<Result<bool>>
{
    public Guid TenantId { get; set; }
    public int LotBatchId { get; set; }
}

public class ApproveLotBatchCommandHandler : IRequestHandler<ApproveLotBatchCommand, Result<bool>>
{
    private readonly IInventoryUnitOfWork _unitOfWork;

    public ApproveLotBatchCommandHandler(IInventoryUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(ApproveLotBatchCommand request, CancellationToken cancellationToken)
    {
        var lotBatch = await _unitOfWork.LotBatches.GetByIdAsync(request.LotBatchId, cancellationToken);
        if (lotBatch == null)
        {
            return Result<bool>.Failure(new Error("LotBatch.NotFound", $"Lot batch with ID {request.LotBatchId} not found", ErrorType.NotFound));
        }

        try
        {
            lotBatch.Approve();
            await _unitOfWork.LotBatches.UpdateAsync(lotBatch, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            return Result<bool>.Success(true);
        }
        catch (InvalidOperationException ex)
        {
            return Result<bool>.Failure(new Error("LotBatch.InvalidOperation", ex.Message, ErrorType.Validation));
        }
    }
}
