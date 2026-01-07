using MediatR;
using Stocker.Modules.Inventory.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.PriceLists.Commands;

public class DeactivatePriceListCommand : IRequest<Result<bool>>
{
    public Guid TenantId { get; set; }
    public int PriceListId { get; set; }
}

public class DeactivatePriceListCommandHandler : IRequestHandler<DeactivatePriceListCommand, Result<bool>>
{
    private readonly IInventoryUnitOfWork _unitOfWork;

    public DeactivatePriceListCommandHandler(IInventoryUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(DeactivatePriceListCommand request, CancellationToken cancellationToken)
    {
        var priceList = await _unitOfWork.PriceLists.GetByIdAsync(request.PriceListId, cancellationToken);
        if (priceList == null)
        {
            return Result<bool>.Failure(new Error("PriceList.NotFound", $"Price list with ID {request.PriceListId} not found", ErrorType.NotFound));
        }

        if (priceList.IsDefault)
        {
            return Result<bool>.Failure(new Error("PriceList.CannotDeactivateDefault", "Cannot deactivate default price list", ErrorType.Validation));
        }

        priceList.Deactivate();
        await _unitOfWork.PriceLists.UpdateAsync(priceList, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
