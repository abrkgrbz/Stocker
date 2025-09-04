using FluentValidation;
using MediatR;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Opportunities.Commands;

/// <summary>
/// Command to add a product to an opportunity
/// </summary>
public class AddOpportunityProductCommand : IRequest<Result<OpportunityProductDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public Guid OpportunityId { get; set; }
    public CreateOpportunityProductDto ProductData { get; set; } = null!;
}

/// <summary>
/// Validator for AddOpportunityProductCommand
/// </summary>
public class AddOpportunityProductCommandValidator : AbstractValidator<AddOpportunityProductCommand>
{
    public AddOpportunityProductCommandValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Tenant ID is required");

        RuleFor(x => x.OpportunityId)
            .NotEmpty().WithMessage("Opportunity ID is required");

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

            RuleFor(x => x.ProductData.SortOrder)
                .GreaterThanOrEqualTo(0).WithMessage("Sort order must be greater than or equal to 0");
        });
    }
}