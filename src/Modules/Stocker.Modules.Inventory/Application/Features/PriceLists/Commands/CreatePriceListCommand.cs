using FluentValidation;
using MediatR;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Domain.Entities;
using Stocker.Modules.Inventory.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.PriceLists.Commands;

public class CreatePriceListCommand : IRequest<Result<PriceListDto>>
{
    public Guid TenantId { get; set; }
    public CreatePriceListDto Data { get; set; } = null!;
}

public class CreatePriceListCommandValidator : AbstractValidator<CreatePriceListCommand>
{
    public CreatePriceListCommandValidator()
    {
        RuleFor(x => x.TenantId).NotEmpty();
        RuleFor(x => x.Data).NotNull();
        RuleFor(x => x.Data.Code).NotEmpty().MaximumLength(50);
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

public class CreatePriceListCommandHandler : IRequestHandler<CreatePriceListCommand, Result<PriceListDto>>
{
    private readonly IInventoryUnitOfWork _unitOfWork;

    public CreatePriceListCommandHandler(IInventoryUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<PriceListDto>> Handle(CreatePriceListCommand request, CancellationToken cancellationToken)
    {
        var data = request.Data;

        if (await _unitOfWork.PriceLists.ExistsWithCodeAsync(data.Code, null, cancellationToken))
        {
            return Result<PriceListDto>.Failure(new Error("PriceList.DuplicateCode", $"Price list with code '{data.Code}' already exists", ErrorType.Conflict));
        }

        var priceList = new PriceList(data.Code, data.Name, data.Currency);
        priceList.SetTenantId(request.TenantId);
        priceList.UpdatePriceList(data.Name, data.Description, data.Currency);

        if (data.GlobalDiscountPercentage.HasValue)
            priceList.SetGlobalDiscount(data.GlobalDiscountPercentage);

        if (data.GlobalMarkupPercentage.HasValue)
            priceList.SetGlobalMarkup(data.GlobalMarkupPercentage);

        if (data.ValidFrom.HasValue || data.ValidTo.HasValue)
            priceList.SetValidityPeriod(data.ValidFrom, data.ValidTo);

        if (data.CustomerGroupId.HasValue)
            priceList.SetCustomerGroup(data.CustomerGroupId);

        priceList.SetPriority(data.Priority);

        await _unitOfWork.PriceLists.AddAsync(priceList, cancellationToken);
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
            ItemCount = 0,
            IsValid = priceList.IsValid(),
            CreatedAt = priceList.CreatedDate
        });
    }
}
