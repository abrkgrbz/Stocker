using MediatR;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.PriceLists.Commands;

public class ActivatePriceListCommand : IRequest<Result<bool>>
{
    public int TenantId { get; set; }
    public int PriceListId { get; set; }
}

public class ActivatePriceListCommandHandler : IRequestHandler<ActivatePriceListCommand, Result<bool>>
{
    private readonly IPriceListRepository _priceListRepository;

    public ActivatePriceListCommandHandler(IPriceListRepository priceListRepository)
    {
        _priceListRepository = priceListRepository;
    }

    public async Task<Result<bool>> Handle(ActivatePriceListCommand request, CancellationToken cancellationToken)
    {
        var priceList = await _priceListRepository.GetByIdAsync(request.PriceListId, cancellationToken);
        if (priceList == null)
        {
            return Result<bool>.Failure(new Error("PriceList.NotFound", $"Price list with ID {request.PriceListId} not found", ErrorType.NotFound));
        }

        priceList.Activate();
        await _priceListRepository.UpdateAsync(priceList, cancellationToken);

        return Result<bool>.Success(true);
    }
}
