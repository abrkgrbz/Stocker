using FluentValidation;
using Stocker.Modules.Sales.Application.DTOs;
using Stocker.Modules.Sales.Application.Features.PriceLists.Commands;

namespace Stocker.Modules.Sales.Application.Features.PriceLists.Validators;

public class CreatePriceListCommandValidator : AbstractValidator<CreatePriceListCommand>
{
    public CreatePriceListCommandValidator()
    {
        RuleFor(x => x.Dto.Code)
            .NotEmpty().WithMessage("Price list code is required")
            .MaximumLength(20).WithMessage("Price list code must not exceed 20 characters");

        RuleFor(x => x.Dto.Name)
            .NotEmpty().WithMessage("Price list name is required")
            .MaximumLength(100).WithMessage("Price list name must not exceed 100 characters");

        RuleFor(x => x.Dto.CurrencyCode)
            .NotEmpty().WithMessage("Currency is required")
            .MaximumLength(3).WithMessage("Currency must not exceed 3 characters");

        RuleFor(x => x.Dto.Description)
            .MaximumLength(500).WithMessage("Description must not exceed 500 characters")
            .When(x => !string.IsNullOrEmpty(x.Dto.Description));

        RuleFor(x => x.Dto.ValidFrom)
            .NotEmpty().WithMessage("Effective from date is required");

        RuleFor(x => x.Dto.ValidTo)
            .GreaterThan(x => x.Dto.ValidFrom)
            .WithMessage("Effective to date must be after effective from date")
            .When(x => x.Dto.ValidTo.HasValue);
    }
}

public class AddPriceListItemCommandValidator : AbstractValidator<AddPriceListItemCommand>
{
    public AddPriceListItemCommandValidator()
    {
        RuleFor(x => x.PriceListId)
            .NotEmpty().WithMessage("Price list ID is required");

        RuleFor(x => x.Dto.ProductId)
            .NotEmpty().WithMessage("Product ID is required");

        RuleFor(x => x.Dto.ProductCode)
            .NotEmpty().WithMessage("Product code is required")
            .MaximumLength(50).WithMessage("Product code must not exceed 50 characters");

        RuleFor(x => x.Dto.ProductName)
            .NotEmpty().WithMessage("Product name is required")
            .MaximumLength(200).WithMessage("Product name must not exceed 200 characters");

        RuleFor(x => x.Dto.UnitPrice)
            .GreaterThan(0).WithMessage("Unit price must be greater than 0");

        RuleFor(x => x.Dto.Currency)
            .MaximumLength(3).WithMessage("Currency must not exceed 3 characters")
            .When(x => !string.IsNullOrEmpty(x.Dto.Currency));

        RuleFor(x => x.Dto.MinimumQuantity)
            .GreaterThanOrEqualTo(0).WithMessage("Minimum quantity cannot be negative")
            .When(x => x.Dto.MinimumQuantity.HasValue);
    }
}

public class UpdatePriceListItemPriceCommandValidator : AbstractValidator<UpdatePriceListItemPriceCommand>
{
    public UpdatePriceListItemPriceCommandValidator()
    {
        RuleFor(x => x.PriceListId)
            .NotEmpty().WithMessage("Price list ID is required");

        RuleFor(x => x.ProductId)
            .NotEmpty().WithMessage("Product ID is required");

        RuleFor(x => x.Dto.UnitPrice)
            .GreaterThan(0).WithMessage("Unit price must be greater than 0");
    }
}

public class UpdatePriceListCommandValidator : AbstractValidator<UpdatePriceListCommand>
{
    public UpdatePriceListCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Price list ID is required");

        RuleFor(x => x.Dto.Name)
            .NotEmpty().WithMessage("Price list name is required")
            .MaximumLength(100).WithMessage("Price list name must not exceed 100 characters");

        RuleFor(x => x.Dto.CurrencyCode)
            .NotEmpty().WithMessage("Currency is required")
            .MaximumLength(3).WithMessage("Currency must not exceed 3 characters");

        RuleFor(x => x.Dto.ValidFrom)
            .NotEmpty().WithMessage("Effective from date is required");

        RuleFor(x => x.Dto.ValidTo)
            .GreaterThan(x => x.Dto.ValidFrom)
            .WithMessage("Effective to date must be after effective from date")
            .When(x => x.Dto.ValidTo.HasValue);
    }
}

public class AssignCustomerCommandValidator : AbstractValidator<AssignCustomerCommand>
{
    public AssignCustomerCommandValidator()
    {
        RuleFor(x => x.PriceListId)
            .NotEmpty().WithMessage("Price list ID is required");

        RuleFor(x => x.Dto.CustomerId)
            .NotEmpty().WithMessage("Customer ID is required");

        RuleFor(x => x.Dto.CustomerName)
            .NotEmpty().WithMessage("Customer name is required")
            .MaximumLength(200).WithMessage("Customer name must not exceed 200 characters");
    }
}

public class ApplyBulkAdjustmentCommandValidator : AbstractValidator<ApplyBulkAdjustmentCommand>
{
    public ApplyBulkAdjustmentCommandValidator()
    {
        RuleFor(x => x.PriceListId)
            .NotEmpty().WithMessage("Price list ID is required");

        RuleFor(x => x.Dto.PercentageChange)
            .InclusiveBetween(-100, 1000).WithMessage("Percentage change must be between -100 and 1000");
    }
}
