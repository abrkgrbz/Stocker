using FluentValidation;
using MediatR;
using Stocker.Modules.Inventory.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.LotBatches.Commands;

public class QuarantineLotBatchCommand : IRequest<Result<bool>>
{
    public Guid TenantId { get; set; }
    public int LotBatchId { get; set; }
    public string Reason { get; set; } = string.Empty;
}

public class QuarantineLotBatchCommandValidator : AbstractValidator<QuarantineLotBatchCommand>
{
    public QuarantineLotBatchCommandValidator()
    {
        RuleFor(x => x.LotBatchId).NotEmpty();
        RuleFor(x => x.Reason).NotEmpty().MaximumLength(500);
    }
}

public class QuarantineLotBatchCommandHandler : IRequestHandler<QuarantineLotBatchCommand, Result<bool>>
{
    private readonly IInventoryUnitOfWork _unitOfWork;

    public QuarantineLotBatchCommandHandler(IInventoryUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(QuarantineLotBatchCommand request, CancellationToken cancellationToken)
    {
        var lotBatch = await _unitOfWork.LotBatches.GetByIdAsync(request.LotBatchId, cancellationToken);
        if (lotBatch == null)
        {
            return Result<bool>.Failure(new Error("LotBatch.NotFound", $"Lot batch with ID {request.LotBatchId} not found", ErrorType.NotFound));
        }

        try
        {
            lotBatch.Quarantine(request.Reason);
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
