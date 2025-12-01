using MediatR;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.PriceLists.Commands;

public class DeletePriceListCommand : IRequest<Result<bool>>
{
    public int TenantId { get; set; }
    public int PriceListId { get; set; }
}

public class DeletePriceListCommandHandler : IRequestHandler<DeletePriceListCommand, Result<bool>>
{
    private readonly IPriceListRepository _priceListRepository;

    public DeletePriceListCommandHandler(IPriceListRepository priceListRepository)
    {
        _priceListRepository = priceListRepository;
    }

    public async Task<Result<bool>> Handle(DeletePriceListCommand request, CancellationToken cancellationToken)
    {
        var priceList = await _priceListRepository.GetByIdAsync(request.PriceListId, cancellationToken);
        if (priceList == null)
        {
            return Result<bool>.Failure(new Error("PriceList.NotFound", $"Price list with ID {request.PriceListId} not found", ErrorType.NotFound));
        }

        if (priceList.IsDefault)
        {
            return Result<bool>.Failure(new Error("PriceList.CannotDeleteDefault", "Cannot delete default price list", ErrorType.Validation));
        }

        _priceListRepository.Remove(priceList);
        await _priceListRepository.SaveChangesAsync(cancellationToken);
        return Result<bool>.Success(true);
    }
}
