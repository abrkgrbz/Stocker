using MediatR;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.PriceLists.Commands;

/// <summary>
/// Command to remove an item from a price list
/// </summary>
public class RemovePriceListItemCommand : IRequest<Result>
{
    public int TenantId { get; set; }
    public int PriceListId { get; set; }
    public int ItemId { get; set; }
}

/// <summary>
/// Handler for RemovePriceListItemCommand
/// </summary>
public class RemovePriceListItemCommandHandler : IRequestHandler<RemovePriceListItemCommand, Result>
{
    private readonly IPriceListRepository _priceListRepository;
    private readonly IUnitOfWork _unitOfWork;

    public RemovePriceListItemCommandHandler(
        IPriceListRepository priceListRepository,
        IUnitOfWork unitOfWork)
    {
        _priceListRepository = priceListRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> Handle(RemovePriceListItemCommand request, CancellationToken cancellationToken)
    {
        var priceList = await _priceListRepository.GetWithItemsAsync(request.PriceListId, cancellationToken);
        if (priceList == null)
        {
            return Result.Failure(Error.NotFound("PriceList", $"Price list with ID {request.PriceListId} not found"));
        }

        var item = priceList.Items.FirstOrDefault(i => i.Id == request.ItemId);
        if (item == null)
        {
            return Result.Failure(Error.NotFound("PriceListItem", $"Price list item with ID {request.ItemId} not found"));
        }

        priceList.RemoveItem(item.ProductId);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
