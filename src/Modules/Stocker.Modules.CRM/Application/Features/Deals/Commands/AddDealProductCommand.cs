using FluentValidation;
using MediatR;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Deals.Commands;

/// <summary>
/// Command to add a product to a deal
/// </summary>
public class AddDealProductCommand : IRequest<Result<DealProductDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public Guid DealId { get; set; }
    public CreateDealProductDto ProductData { get; set; } = null!;
}

/// <summary>
/// Validator for AddDealProductCommand
/// </summary>
public class AddDealProductCommandValidator : AbstractValidator<AddDealProductCommand>
{
    public AddDealProductCommandValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Tenant ID is required");

        RuleFor(x => x.DealId)
            .NotEmpty().WithMessage("Deal ID is required");

        RuleFor(x => x.ProductData)
            .NotNull().WithMessage("Product data is required");

        When(x => x.ProductData != null, () =>
        {
            RuleFor(x => x.ProductData.ProductName)
                .NotEmpty().WithMessage("Product name is required")
                .MaximumLength(200).WithMessage("Product name must not exceed 200 characters");

            RuleFor(x => x.ProductData.ProductCode)
                .MaximumLength(50).WithMessage("Product code must not exceed 50 characters");

            RuleFor(x => x.ProductData.Description)
                .MaximumLength(1000).WithMessage("Description must not exceed 1000 characters");

            RuleFor(x => x.ProductData.Quantity)
                .GreaterThan(0).WithMessage("Quantity must be greater than 0");

            RuleFor(x => x.ProductData.UnitPrice)
                .GreaterThanOrEqualTo(0).WithMessage("Unit price must be greater than or equal to 0");

            RuleFor(x => x.ProductData.Currency)
                .NotEmpty().WithMessage("Currency is required")
                .MaximumLength(3).WithMessage("Currency must be a 3-letter code");

            RuleFor(x => x.ProductData.DiscountPercent)
                .InclusiveBetween(0, 100).WithMessage("Discount percent must be between 0 and 100");

            RuleFor(x => x.ProductData.DiscountAmount)
                .GreaterThanOrEqualTo(0).WithMessage("Discount amount must be greater than or equal to 0");

            RuleFor(x => x.ProductData.Tax)
                .InclusiveBetween(0, 100).WithMessage("Tax must be between 0 and 100");

            RuleFor(x => x.ProductData.SortOrder)
                .GreaterThanOrEqualTo(0).WithMessage("Sort order must be greater than or equal to 0");

            RuleFor(x => x.ProductData.RecurringPeriod)
                .MaximumLength(50).WithMessage("Recurring period must not exceed 50 characters")
                .When(x => x.ProductData.IsRecurring);

            RuleFor(x => x.ProductData.RecurringCycles)
                .GreaterThan(0).WithMessage("Recurring cycles must be greater than 0")
                .When(x => x.ProductData.IsRecurring && x.ProductData.RecurringCycles.HasValue);
        });
    }
}