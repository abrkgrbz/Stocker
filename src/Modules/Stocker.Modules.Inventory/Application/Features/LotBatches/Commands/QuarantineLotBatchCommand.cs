using FluentValidation;
using MediatR;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.LotBatches.Commands;

public class QuarantineLotBatchCommand : IRequest<Result<bool>>
{
    public int TenantId { get; set; }
    public int LotBatchId { get; set; }
    public string Reason { get; set; } = string.Empty;
}

public class QuarantineLotBatchCommandValidator : AbstractValidator<QuarantineLotBatchCommand>
{
    public QuarantineLotBatchCommandValidator()
    {
        RuleFor(x => x.LotBatchId).GreaterThan(0);
        RuleFor(x => x.Reason).NotEmpty().MaximumLength(500);
    }
}

public class QuarantineLotBatchCommandHandler : IRequestHandler<QuarantineLotBatchCommand, Result<bool>>
{
    private readonly ILotBatchRepository _lotBatchRepository;

    public QuarantineLotBatchCommandHandler(ILotBatchRepository lotBatchRepository)
    {
        _lotBatchRepository = lotBatchRepository;
    }

    public async Task<Result<bool>> Handle(QuarantineLotBatchCommand request, CancellationToken cancellationToken)
    {
        var lotBatch = await _lotBatchRepository.GetByIdAsync(request.LotBatchId, cancellationToken);
        if (lotBatch == null)
        {
            return Result<bool>.Failure(new Error("LotBatch.NotFound", $"Lot batch with ID {request.LotBatchId} not found", ErrorType.NotFound));
        }

        try
        {
            lotBatch.Quarantine(request.Reason);
            await _lotBatchRepository.UpdateAsync(lotBatch, cancellationToken);
            return Result<bool>.Success(true);
        }
        catch (InvalidOperationException ex)
        {
            return Result<bool>.Failure(new Error("LotBatch.InvalidOperation", ex.Message, ErrorType.Validation));
        }
    }
}
