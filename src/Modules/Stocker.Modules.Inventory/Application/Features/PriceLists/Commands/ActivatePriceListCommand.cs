using MediatR;
using Stocker.Modules.Inventory.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.PriceLists.Commands;

public class ActivatePriceListCommand : IRequest<Result<bool>>
{
    public Guid TenantId { get; set; }
    public int PriceListId { get; set; }
}

public class ActivatePriceListCommandHandler : IRequestHandler<ActivatePriceListCommand, Result<bool>>
{
    private readonly IInventoryUnitOfWork _unitOfWork;

    public ActivatePriceListCommandHandler(IInventoryUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(ActivatePriceListCommand request, CancellationToken cancellationToken)
    {
        var priceList = await _unitOfWork.PriceLists.GetByIdAsync(request.PriceListId, cancellationToken);
        if (priceList == null)
        {
            return Result<bool>.Failure(new Error("PriceList.NotFound", $"Price list with ID {request.PriceListId} not found", ErrorType.NotFound));
        }

        priceList.Activate();
        await _unitOfWork.PriceLists.UpdateAsync(priceList, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
