using FluentValidation;
using MediatR;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.StockTransfers.Commands;

public class ShipStockTransferCommand : IRequest<Result<bool>>
{
    public int TenantId { get; set; }
    public int TransferId { get; set; }
    public int ShippedByUserId { get; set; }
}

public class ShipStockTransferCommandValidator : AbstractValidator<ShipStockTransferCommand>
{
    public ShipStockTransferCommandValidator()
    {
        RuleFor(x => x.TransferId).GreaterThan(0);
        RuleFor(x => x.ShippedByUserId).GreaterThan(0);
    }
}

public class ShipStockTransferCommandHandler : IRequestHandler<ShipStockTransferCommand, Result<bool>>
{
    private readonly IStockTransferRepository _stockTransferRepository;
    private readonly IUnitOfWork _unitOfWork;

    public ShipStockTransferCommandHandler(IStockTransferRepository stockTransferRepository, IUnitOfWork unitOfWork)
    {
        _stockTransferRepository = stockTransferRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(ShipStockTransferCommand request, CancellationToken cancellationToken)
    {
        var transfer = await _stockTransferRepository.GetByIdAsync(request.TransferId, cancellationToken);
        if (transfer == null)
        {
            return Result<bool>.Failure(new Error("StockTransfer.NotFound", $"Transfer with ID {request.TransferId} not found", ErrorType.NotFound));
        }

        try
        {
            transfer.Ship(request.ShippedByUserId);
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
