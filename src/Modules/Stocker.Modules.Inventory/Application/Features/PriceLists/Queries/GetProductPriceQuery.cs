using MediatR;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.PriceLists.Queries;

/// <summary>
/// Query to get the price for a product from price lists
/// </summary>
public class GetProductPriceQuery : IRequest<Result<ProductPriceDto>>
{
    public Guid TenantId { get; set; }
    public int ProductId { get; set; }
    public int? PriceListId { get; set; }
    public int? CustomerGroupId { get; set; }
    public decimal? Quantity { get; set; }
}

/// <summary>
/// Handler for GetProductPriceQuery
/// </summary>
public class GetProductPriceQueryHandler : IRequestHandler<GetProductPriceQuery, Result<ProductPriceDto>>
{
    private readonly IProductRepository _productRepository;
    private readonly IPriceListRepository _priceListRepository;

    public GetProductPriceQueryHandler(
        IProductRepository productRepository,
        IPriceListRepository priceListRepository)
    {
        _productRepository = productRepository;
        _priceListRepository = priceListRepository;
    }

    public async Task<Result<ProductPriceDto>> Handle(GetProductPriceQuery request, CancellationToken cancellationToken)
    {
        var product = await _productRepository.GetByIdAsync(request.ProductId, cancellationToken);
        if (product == null)
        {
            return Result<ProductPriceDto>.Failure(
                Error.NotFound("Product", $"Product with ID {request.ProductId} not found"));
        }

        var basePrice = product.UnitPrice?.Amount ?? 0;
        var currency = product.UnitPrice?.Currency ?? "TRY";

        // Try to find applicable price list
        Domain.Entities.PriceList? applicablePriceList = null;
        Domain.Entities.PriceListItem? applicableItem = null;

        if (request.PriceListId.HasValue)
        {
            // Specific price list requested
            applicablePriceList = await _priceListRepository.GetWithItemsAsync(request.PriceListId.Value, cancellationToken);
            if (applicablePriceList != null && applicablePriceList.IsValid())
            {
                applicableItem = applicablePriceList.Items
                    .FirstOrDefault(i => i.ProductId == request.ProductId && i.IsValid() &&
                        (!request.Quantity.HasValue || i.IsValidForQuantity(request.Quantity.Value)));
            }
        }
        else
        {
            // Find best applicable price list
            var allPriceLists = await _priceListRepository.GetActivePriceListsAsync(cancellationToken);

            // Filter by customer group if specified
            if (request.CustomerGroupId.HasValue)
            {
                allPriceLists = allPriceLists
                    .Where(pl => pl.CustomerGroupId == request.CustomerGroupId || pl.CustomerGroupId == null)
                    .ToList();
            }

            // Order by priority and find first with matching product
            foreach (var priceList in allPriceLists.OrderByDescending(pl => pl.Priority))
            {
                if (!priceList.IsValid()) continue;

                var item = priceList.Items
                    .FirstOrDefault(i => i.ProductId == request.ProductId && i.IsValid() &&
                        (!request.Quantity.HasValue || i.IsValidForQuantity(request.Quantity.Value)));

                if (item != null)
                {
                    applicablePriceList = priceList;
                    applicableItem = item;
                    break;
                }
            }

            // Fall back to default price list if no match found
            if (applicableItem == null)
            {
                var defaultPriceList = await _priceListRepository.GetDefaultPriceListAsync(cancellationToken);
                if (defaultPriceList != null && defaultPriceList.IsValid())
                {
                    applicableItem = defaultPriceList.Items
                        .FirstOrDefault(i => i.ProductId == request.ProductId && i.IsValid() &&
                            (!request.Quantity.HasValue || i.IsValidForQuantity(request.Quantity.Value)));

                    if (applicableItem != null)
                    {
                        applicablePriceList = defaultPriceList;
                    }
                }
            }
        }

        // Calculate final price
        decimal? listPrice = applicableItem?.Price.Amount;
        decimal? discountPercentage = applicableItem?.DiscountPercentage;
        decimal finalPrice = basePrice;

        if (applicableItem != null)
        {
            var effectivePrice = applicableItem.GetEffectivePrice();
            finalPrice = effectivePrice.Amount;
            currency = effectivePrice.Currency;
        }

        var dto = new ProductPriceDto
        {
            ProductId = product.Id,
            ProductCode = product.Code,
            ProductName = product.Name,
            BasePrice = basePrice,
            ListPrice = listPrice,
            PriceListName = applicablePriceList?.Name,
            DiscountPercentage = discountPercentage,
            FinalPrice = finalPrice,
            Currency = currency
        };

        return Result<ProductPriceDto>.Success(dto);
    }
}
