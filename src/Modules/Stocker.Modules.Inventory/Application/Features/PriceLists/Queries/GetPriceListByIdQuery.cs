using MediatR;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.PriceLists.Queries;

/// <summary>
/// Query to get a price list by ID
/// </summary>
public class GetPriceListByIdQuery : IRequest<Result<PriceListDto>>
{
    public Guid TenantId { get; set; }
    public int PriceListId { get; set; }
}

/// <summary>
/// Handler for GetPriceListByIdQuery
/// </summary>
public class GetPriceListByIdQueryHandler : IRequestHandler<GetPriceListByIdQuery, Result<PriceListDto>>
{
    private readonly IPriceListRepository _priceListRepository;

    public GetPriceListByIdQueryHandler(IPriceListRepository priceListRepository)
    {
        _priceListRepository = priceListRepository;
    }

    public async Task<Result<PriceListDto>> Handle(GetPriceListByIdQuery request, CancellationToken cancellationToken)
    {
        var priceList = await _priceListRepository.GetWithItemsAsync(request.PriceListId, cancellationToken);

        if (priceList == null)
        {
            return Result<PriceListDto>.Failure(new Error("PriceList.NotFound", $"Price list with ID {request.PriceListId} not found", ErrorType.NotFound));
        }

        var dto = new PriceListDto
        {
            Id = priceList.Id,
            Code = priceList.Code,
            Name = priceList.Name,
            Description = priceList.Description,
            Currency = priceList.Currency,
            ValidFrom = priceList.ValidFrom,
            ValidTo = priceList.ValidTo,
            IsActive = priceList.IsActive,
            IsDefault = priceList.IsDefault,
            CustomerGroupId = priceList.CustomerGroupId,
            GlobalDiscountPercentage = priceList.GlobalDiscountPercentage,
            GlobalMarkupPercentage = priceList.GlobalMarkupPercentage,
            CreatedAt = priceList.CreatedDate,
            UpdatedAt = priceList.UpdatedDate,
            ItemCount = priceList.Items?.Count ?? 0,
            Items = priceList.Items?.Select(i => new PriceListItemDto
            {
                Id = i.Id,
                PriceListId = i.PriceListId,
                ProductId = i.ProductId,
                ProductCode = i.Product?.Code ?? string.Empty,
                ProductName = i.Product?.Name ?? string.Empty,
                Price = i.Price.Amount,
                Currency = i.Price.Currency,
                MinQuantity = i.MinQuantity,
                MaxQuantity = i.MaxQuantity,
                DiscountPercentage = i.DiscountPercentage,
                ValidFrom = i.ValidFrom,
                ValidTo = i.ValidTo,
                IsActive = i.IsValid()
            }).ToList() ?? new List<PriceListItemDto>()
        };

        return Result<PriceListDto>.Success(dto);
    }
}
