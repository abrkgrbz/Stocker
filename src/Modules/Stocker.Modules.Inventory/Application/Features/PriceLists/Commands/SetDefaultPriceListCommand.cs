using MediatR;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.PriceLists.Commands;

public class SetDefaultPriceListCommand : IRequest<Result<bool>>
{
    public int TenantId { get; set; }
    public int PriceListId { get; set; }
}

public class SetDefaultPriceListCommandHandler : IRequestHandler<SetDefaultPriceListCommand, Result<bool>>
{
    private readonly IPriceListRepository _priceListRepository;

    public SetDefaultPriceListCommandHandler(IPriceListRepository priceListRepository)
    {
        _priceListRepository = priceListRepository;
    }

    public async Task<Result<bool>> Handle(SetDefaultPriceListCommand request, CancellationToken cancellationToken)
    {
        var priceList = await _priceListRepository.GetByIdAsync(request.PriceListId, cancellationToken);
        if (priceList == null)
        {
            return Result<bool>.Failure(new Error("PriceList.NotFound", $"Price list with ID {request.PriceListId} not found", ErrorType.NotFound));
        }

        // Unset current default if any
        var currentDefault = await _priceListRepository.GetDefaultPriceListAsync(cancellationToken);
        if (currentDefault != null && currentDefault.Id != priceList.Id)
        {
            currentDefault.UnsetDefault();
            await _priceListRepository.UpdateAsync(currentDefault, cancellationToken);
        }

        priceList.SetAsDefault();
        await _priceListRepository.UpdateAsync(priceList, cancellationToken);

        return Result<bool>.Success(true);
    }
}
