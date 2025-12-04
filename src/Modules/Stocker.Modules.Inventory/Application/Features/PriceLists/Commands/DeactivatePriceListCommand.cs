using MediatR;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.PriceLists.Commands;

public class DeactivatePriceListCommand : IRequest<Result<bool>>
{
    public int TenantId { get; set; }
    public int PriceListId { get; set; }
}

public class DeactivatePriceListCommandHandler : IRequestHandler<DeactivatePriceListCommand, Result<bool>>
{
    private readonly IPriceListRepository _priceListRepository;
    private readonly IUnitOfWork _unitOfWork;

    public DeactivatePriceListCommandHandler(IPriceListRepository priceListRepository, IUnitOfWork unitOfWork)
    {
        _priceListRepository = priceListRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(DeactivatePriceListCommand request, CancellationToken cancellationToken)
    {
        var priceList = await _priceListRepository.GetByIdAsync(request.PriceListId, cancellationToken);
        if (priceList == null)
        {
            return Result<bool>.Failure(new Error("PriceList.NotFound", $"Price list with ID {request.PriceListId} not found", ErrorType.NotFound));
        }

        if (priceList.IsDefault)
        {
            return Result<bool>.Failure(new Error("PriceList.CannotDeactivateDefault", "Cannot deactivate default price list", ErrorType.Validation));
        }

        priceList.Deactivate();
        await _priceListRepository.UpdateAsync(priceList, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
