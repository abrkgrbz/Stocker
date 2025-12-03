using FluentValidation;
using MediatR;
using Stocker.Domain.Common.ValueObjects;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.PriceLists.Commands;

/// <summary>
/// Command to add an item to a price list
/// </summary>
public class AddPriceListItemCommand : IRequest<Result<PriceListItemDto>>
{
    public int TenantId { get; set; }
    public int PriceListId { get; set; }
    public CreatePriceListItemDto Data { get; set; } = null!;
}

/// <summary>
/// Validator for AddPriceListItemCommand
/// </summary>
public class AddPriceListItemCommandValidator : AbstractValidator<AddPriceListItemCommand>
{
    public AddPriceListItemCommandValidator()
    {
        RuleFor(x => x.TenantId)
            .GreaterThan(0).WithMessage("Tenant ID is required");

        RuleFor(x => x.PriceListId)
            .GreaterThan(0).WithMessage("Price list ID is required");

        RuleFor(x => x.Data)
            .NotNull().WithMessage("Item data is required");

        When(x => x.Data != null, () =>
        {
            RuleFor(x => x.Data.ProductId)
                .GreaterThan(0).WithMessage("Product ID is required");

            RuleFor(x => x.Data.Price)
                .GreaterThanOrEqualTo(0).WithMessage("Price must be non-negative");
        });
    }
}

/// <summary>
/// Handler for AddPriceListItemCommand
/// </summary>
public class AddPriceListItemCommandHandler : IRequestHandler<AddPriceListItemCommand, Result<PriceListItemDto>>
{
    private readonly IPriceListRepository _priceListRepository;
    private readonly IProductRepository _productRepository;
    private readonly IUnitOfWork _unitOfWork;

    public AddPriceListItemCommandHandler(
        IPriceListRepository priceListRepository,
        IProductRepository productRepository,
        IUnitOfWork unitOfWork)
    {
        _priceListRepository = priceListRepository;
        _productRepository = productRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<PriceListItemDto>> Handle(AddPriceListItemCommand request, CancellationToken cancellationToken)
    {
        var priceList = await _priceListRepository.GetWithItemsAsync(request.PriceListId, cancellationToken);
        if (priceList == null)
        {
            return Result<PriceListItemDto>.Failure(
                Error.NotFound("PriceList", $"Price list with ID {request.PriceListId} not found"));
        }

        var product = await _productRepository.GetByIdAsync(request.Data.ProductId, cancellationToken);
        if (product == null)
        {
            return Result<PriceListItemDto>.Failure(
                Error.NotFound("Product", $"Product with ID {request.Data.ProductId} not found"));
        }

        try
        {
            var price = Money.Create(request.Data.Price, priceList.Currency);
            var item = priceList.AddItem(request.Data.ProductId, price);

            if (request.Data.MinQuantity.HasValue || request.Data.MaxQuantity.HasValue)
            {
                item.SetQuantityRange(request.Data.MinQuantity, request.Data.MaxQuantity);
            }

            if (request.Data.DiscountPercentage.HasValue)
            {
                item.SetDiscount(request.Data.DiscountPercentage);
            }

            if (request.Data.ValidFrom.HasValue || request.Data.ValidTo.HasValue)
            {
                item.SetValidityPeriod(request.Data.ValidFrom, request.Data.ValidTo);
            }

            await _unitOfWork.SaveChangesAsync(cancellationToken);

            var dto = new PriceListItemDto
            {
                Id = item.Id,
                PriceListId = item.PriceListId,
                ProductId = item.ProductId,
                ProductCode = product.Code,
                ProductName = product.Name,
                Price = item.Price.Amount,
                Currency = item.Price.Currency,
                MinQuantity = item.MinQuantity,
                MaxQuantity = item.MaxQuantity,
                DiscountPercentage = item.DiscountPercentage,
                ValidFrom = item.ValidFrom,
                ValidTo = item.ValidTo,
                IsActive = item.IsValid()
            };

            return Result<PriceListItemDto>.Success(dto);
        }
        catch (InvalidOperationException ex)
        {
            return Result<PriceListItemDto>.Failure(
                Error.Validation("PriceListItem.AlreadyExists", ex.Message));
        }
        catch (ArgumentException ex)
        {
            return Result<PriceListItemDto>.Failure(
                Error.Validation("PriceListItem.InvalidArgument", ex.Message));
        }
    }
}
