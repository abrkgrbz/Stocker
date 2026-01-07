using MediatR;
using Stocker.Modules.Inventory.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.PriceLists.Commands;

public class SetDefaultPriceListCommand : IRequest<Result<bool>>
{
    public Guid TenantId { get; set; }
    public int PriceListId { get; set; }
}

public class SetDefaultPriceListCommandHandler : IRequestHandler<SetDefaultPriceListCommand, Result<bool>>
{
    private readonly IInventoryUnitOfWork _unitOfWork;

    public SetDefaultPriceListCommandHandler(IInventoryUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(SetDefaultPriceListCommand request, CancellationToken cancellationToken)
    {
        var priceList = await _unitOfWork.PriceLists.GetByIdAsync(request.PriceListId, cancellationToken);
        if (priceList == null)
        {
            return Result<bool>.Failure(new Error("PriceList.NotFound", $"Price list with ID {request.PriceListId} not found", ErrorType.NotFound));
        }

        // Unset current default if any
        var currentDefault = await _unitOfWork.PriceLists.GetDefaultPriceListAsync(cancellationToken);
        if (currentDefault != null && currentDefault.Id != priceList.Id)
        {
            currentDefault.UnsetDefault();
            await _unitOfWork.PriceLists.UpdateAsync(currentDefault, cancellationToken);
        }

        priceList.SetAsDefault();
        await _unitOfWork.PriceLists.UpdateAsync(priceList, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
