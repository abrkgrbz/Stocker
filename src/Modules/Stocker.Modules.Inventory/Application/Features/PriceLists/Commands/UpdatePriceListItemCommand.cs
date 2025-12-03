using FluentValidation;
using MediatR;
using Stocker.Domain.Common.ValueObjects;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.PriceLists.Commands;

/// <summary>
/// Command to update an item in a price list
/// </summary>
public class UpdatePriceListItemCommand : IRequest<Result<PriceListItemDto>>
{
    public int TenantId { get; set; }
    public int PriceListId { get; set; }
    public int ItemId { get; set; }
    public CreatePriceListItemDto Data { get; set; } = null!;
}

/// <summary>
/// Validator for UpdatePriceListItemCommand
/// </summary>
public class UpdatePriceListItemCommandValidator : AbstractValidator<UpdatePriceListItemCommand>
{
    public UpdatePriceListItemCommandValidator()
    {
        RuleFor(x => x.TenantId)
            .GreaterThan(0).WithMessage("Tenant ID is required");

        RuleFor(x => x.PriceListId)
            .GreaterThan(0).WithMessage("Price list ID is required");

        RuleFor(x => x.ItemId)
            .GreaterThan(0).WithMessage("Item ID is required");

        RuleFor(x => x.Data)
            .NotNull().WithMessage("Item data is required");

        When(x => x.Data != null, () =>
        {
            RuleFor(x => x.Data.Price)
                .GreaterThanOrEqualTo(0).WithMessage("Price must be non-negative");
        });
    }
}

/// <summary>
/// Handler for UpdatePriceListItemCommand
/// </summary>
public class UpdatePriceListItemCommandHandler : IRequestHandler<UpdatePriceListItemCommand, Result<PriceListItemDto>>
{
    private readonly IPriceListRepository _priceListRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdatePriceListItemCommandHandler(
        IPriceListRepository priceListRepository,
        IUnitOfWork unitOfWork)
    {
        _priceListRepository = priceListRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<PriceListItemDto>> Handle(UpdatePriceListItemCommand request, CancellationToken cancellationToken)
    {
        var priceList = await _priceListRepository.GetWithItemsAsync(request.PriceListId, cancellationToken);
        if (priceList == null)
        {
            return Result<PriceListItemDto>.Failure(
                Error.NotFound("PriceList", $"Price list with ID {request.PriceListId} not found"));
        }

        var item = priceList.Items.FirstOrDefault(i => i.Id == request.ItemId);
        if (item == null)
        {
            return Result<PriceListItemDto>.Failure(
                Error.NotFound("PriceListItem", $"Price list item with ID {request.ItemId} not found"));
        }

        try
        {
            var price = Money.Create(request.Data.Price, priceList.Currency);
            item.UpdatePrice(price);

            item.SetQuantityRange(request.Data.MinQuantity, request.Data.MaxQuantity);
            item.SetDiscount(request.Data.DiscountPercentage);
            item.SetValidityPeriod(request.Data.ValidFrom, request.Data.ValidTo);

            await _unitOfWork.SaveChangesAsync(cancellationToken);

            var dto = new PriceListItemDto
            {
                Id = item.Id,
                PriceListId = item.PriceListId,
                ProductId = item.ProductId,
                ProductCode = item.Product?.Code ?? string.Empty,
                ProductName = item.Product?.Name ?? string.Empty,
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
        catch (ArgumentException ex)
        {
            return Result<PriceListItemDto>.Failure(
                Error.Validation("PriceListItem.InvalidArgument", ex.Message));
        }
    }
}
