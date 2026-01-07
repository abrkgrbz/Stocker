using MediatR;
using Stocker.Modules.Inventory.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.PriceLists.Commands;

public class DeletePriceListCommand : IRequest<Result<bool>>
{
    public Guid TenantId { get; set; }
    public int PriceListId { get; set; }
}

public class DeletePriceListCommandHandler : IRequestHandler<DeletePriceListCommand, Result<bool>>
{
    private readonly IInventoryUnitOfWork _unitOfWork;

    public DeletePriceListCommandHandler(IInventoryUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(DeletePriceListCommand request, CancellationToken cancellationToken)
    {
        var priceList = await _unitOfWork.PriceLists.GetByIdAsync(request.PriceListId, cancellationToken);
        if (priceList == null)
        {
            return Result<bool>.Failure(new Error("PriceList.NotFound", $"Price list with ID {request.PriceListId} not found", ErrorType.NotFound));
        }

        if (priceList.IsDefault)
        {
            return Result<bool>.Failure(new Error("PriceList.CannotDeleteDefault", "Cannot delete default price list", ErrorType.Validation));
        }

        _unitOfWork.PriceLists.Remove(priceList);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return Result<bool>.Success(true);
    }
}
