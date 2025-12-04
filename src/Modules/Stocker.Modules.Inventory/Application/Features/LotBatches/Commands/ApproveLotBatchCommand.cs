using MediatR;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.LotBatches.Commands;

public class ApproveLotBatchCommand : IRequest<Result<bool>>
{
    public int TenantId { get; set; }
    public int LotBatchId { get; set; }
}

public class ApproveLotBatchCommandHandler : IRequestHandler<ApproveLotBatchCommand, Result<bool>>
{
    private readonly ILotBatchRepository _lotBatchRepository;
    private readonly IUnitOfWork _unitOfWork;

    public ApproveLotBatchCommandHandler(ILotBatchRepository lotBatchRepository, IUnitOfWork unitOfWork)
    {
        _lotBatchRepository = lotBatchRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(ApproveLotBatchCommand request, CancellationToken cancellationToken)
    {
        var lotBatch = await _lotBatchRepository.GetByIdAsync(request.LotBatchId, cancellationToken);
        if (lotBatch == null)
        {
            return Result<bool>.Failure(new Error("LotBatch.NotFound", $"Lot batch with ID {request.LotBatchId} not found", ErrorType.NotFound));
        }

        try
        {
            lotBatch.Approve();
            await _lotBatchRepository.UpdateAsync(lotBatch, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            return Result<bool>.Success(true);
        }
        catch (InvalidOperationException ex)
        {
            return Result<bool>.Failure(new Error("LotBatch.InvalidOperation", ex.Message, ErrorType.Validation));
        }
    }
}
