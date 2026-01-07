using FluentValidation;
using MediatR;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.PriceLists.Commands;

public class UpdatePriceListCommand : IRequest<Result<PriceListDto>>
{
    public Guid TenantId { get; set; }
    public int PriceListId { get; set; }
    public UpdatePriceListDto Data { get; set; } = null!;
}

public class UpdatePriceListCommandValidator : AbstractValidator<UpdatePriceListCommand>
{
    public UpdatePriceListCommandValidator()
    {
        RuleFor(x => x.TenantId).NotEmpty();
        RuleFor(x => x.PriceListId).NotEmpty();
        RuleFor(x => x.Data).NotNull();
        RuleFor(x => x.Data.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Data.Currency).NotEmpty().MaximumLength(3);
        RuleFor(x => x.Data.GlobalDiscountPercentage)
            .InclusiveBetween(0, 100)
            .When(x => x.Data.GlobalDiscountPercentage.HasValue);
        RuleFor(x => x.Data.GlobalMarkupPercentage)
            .GreaterThanOrEqualTo(0)
            .When(x => x.Data.GlobalMarkupPercentage.HasValue);
    }
}

public class UpdatePriceListCommandHandler : IRequestHandler<UpdatePriceListCommand, Result<PriceListDto>>
{
    private readonly IInventoryUnitOfWork _unitOfWork;

    public UpdatePriceListCommandHandler(IInventoryUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<PriceListDto>> Handle(UpdatePriceListCommand request, CancellationToken cancellationToken)
    {
        var priceList = await _unitOfWork.PriceLists.GetByIdAsync(request.PriceListId, cancellationToken);
        if (priceList == null)
        {
            return Result<PriceListDto>.Failure(new Error("PriceList.NotFound", $"Price list with ID {request.PriceListId} not found", ErrorType.NotFound));
        }

        var data = request.Data;

        priceList.UpdatePriceList(data.Name, data.Description, data.Currency);
        priceList.SetGlobalDiscount(data.GlobalDiscountPercentage);
        priceList.SetGlobalMarkup(data.GlobalMarkupPercentage);
        priceList.SetValidityPeriod(data.ValidFrom, data.ValidTo);
        priceList.SetCustomerGroup(data.CustomerGroupId);
        priceList.SetPriority(data.Priority);

        await _unitOfWork.PriceLists.UpdateAsync(priceList, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<PriceListDto>.Success(new PriceListDto
        {
            Id = priceList.Id,
            Code = priceList.Code,
            Name = priceList.Name,
            Description = priceList.Description,
            Currency = priceList.Currency,
            IsDefault = priceList.IsDefault,
            IsActive = priceList.IsActive,
            GlobalDiscountPercentage = priceList.GlobalDiscountPercentage,
            GlobalMarkupPercentage = priceList.GlobalMarkupPercentage,
            ValidFrom = priceList.ValidFrom,
            ValidTo = priceList.ValidTo,
            CustomerGroupId = priceList.CustomerGroupId,
            Priority = priceList.Priority,
            ItemCount = priceList.Items?.Count ?? 0,
            IsValid = priceList.IsValid(),
            CreatedAt = priceList.CreatedDate,
            UpdatedAt = priceList.UpdatedDate
        });
    }
}
