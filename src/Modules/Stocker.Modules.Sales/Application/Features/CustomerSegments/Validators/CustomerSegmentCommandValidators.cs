using FluentValidation;
using Stocker.Modules.Sales.Application.DTOs;
using Stocker.Modules.Sales.Application.Features.CustomerSegments.Commands;

namespace Stocker.Modules.Sales.Application.Features.CustomerSegments.Validators;

public class CreateCustomerSegmentCommandValidator : AbstractValidator<CreateCustomerSegmentCommand>
{
    public CreateCustomerSegmentCommandValidator()
    {
        RuleFor(x => x.Dto.Code)
            .NotEmpty().WithMessage("Segment code is required")
            .MaximumLength(20).WithMessage("Segment code must not exceed 20 characters");

        RuleFor(x => x.Dto.Name)
            .NotEmpty().WithMessage("Segment name is required")
            .MaximumLength(100).WithMessage("Segment name must not exceed 100 characters");

        RuleFor(x => x.Dto.Priority)
            .NotEmpty().WithMessage("Priority is required");

        RuleFor(x => x.Dto.Description)
            .MaximumLength(500).WithMessage("Description must not exceed 500 characters")
            .When(x => !string.IsNullOrEmpty(x.Dto.Description));
    }
}

public class SetSegmentPricingCommandValidator : AbstractValidator<SetSegmentPricingCommand>
{
    public SetSegmentPricingCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Segment ID is required");

        RuleFor(x => x.Dto.DiscountPercentage)
            .InclusiveBetween(0, 100).WithMessage("Discount percentage must be between 0 and 100");

        RuleFor(x => x.Dto.MinimumOrderAmount)
            .GreaterThanOrEqualTo(0).WithMessage("Minimum order amount cannot be negative")
            .When(x => x.Dto.MinimumOrderAmount.HasValue);

        RuleFor(x => x.Dto.MaximumOrderAmount)
            .GreaterThanOrEqualTo(x => x.Dto.MinimumOrderAmount ?? 0)
            .WithMessage("Maximum order amount must be greater than or equal to minimum order amount")
            .When(x => x.Dto.MaximumOrderAmount.HasValue);
    }
}

public class SetSegmentCreditTermsCommandValidator : AbstractValidator<SetSegmentCreditTermsCommand>
{
    public SetSegmentCreditTermsCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Segment ID is required");

        RuleFor(x => x.Dto.CreditLimit)
            .GreaterThanOrEqualTo(0).WithMessage("Credit limit cannot be negative")
            .When(x => x.Dto.CreditLimit.HasValue);

        RuleFor(x => x.Dto.PaymentTermDays)
            .InclusiveBetween(0, 365).WithMessage("Payment term days must be between 0 and 365");

        RuleFor(x => x.Dto.AdvancePaymentPercentage)
            .InclusiveBetween(0, 100).WithMessage("Advance payment percentage must be between 0 and 100")
            .When(x => x.Dto.AdvancePaymentPercentage.HasValue);
    }
}

public class SetSegmentServiceLevelCommandValidator : AbstractValidator<SetSegmentServiceLevelCommand>
{
    public SetSegmentServiceLevelCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Segment ID is required");

        RuleFor(x => x.Dto.Priority)
            .NotEmpty().WithMessage("Priority is required");

        RuleFor(x => x.Dto.ServiceLevel)
            .NotEmpty().WithMessage("Service level is required");

        RuleFor(x => x.Dto.MaxResponseTimeHours)
            .GreaterThan(0).WithMessage("Max response time must be greater than 0 hours")
            .When(x => x.Dto.MaxResponseTimeHours.HasValue);
    }
}

public class SetSegmentEligibilityCommandValidator : AbstractValidator<SetSegmentEligibilityCommand>
{
    public SetSegmentEligibilityCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Segment ID is required");

        RuleFor(x => x.Dto.MinimumAnnualRevenue)
            .GreaterThanOrEqualTo(0).WithMessage("Minimum annual revenue cannot be negative")
            .When(x => x.Dto.MinimumAnnualRevenue.HasValue);

        RuleFor(x => x.Dto.MinimumOrderCount)
            .GreaterThanOrEqualTo(0).WithMessage("Minimum order count cannot be negative")
            .When(x => x.Dto.MinimumOrderCount.HasValue);

        RuleFor(x => x.Dto.MinimumMonthsAsCustomer)
            .GreaterThanOrEqualTo(0).WithMessage("Minimum months as customer cannot be negative")
            .When(x => x.Dto.MinimumMonthsAsCustomer.HasValue);
    }
}

public class SetSegmentBenefitsCommandValidator : AbstractValidator<SetSegmentBenefitsCommand>
{
    public SetSegmentBenefitsCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Segment ID is required");

        RuleFor(x => x.Dto.FreeShippingThreshold)
            .GreaterThanOrEqualTo(0).WithMessage("Free shipping threshold cannot be negative")
            .When(x => x.Dto.FreeShippingThreshold.HasValue);

        RuleFor(x => x.Dto.BenefitsDescription)
            .MaximumLength(1000).WithMessage("Benefits description must not exceed 1000 characters")
            .When(x => !string.IsNullOrEmpty(x.Dto.BenefitsDescription));
    }
}

public class AssignCustomerToSegmentCommandValidator : AbstractValidator<AssignCustomerCommand>
{
    public AssignCustomerToSegmentCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Segment ID is required");

        RuleFor(x => x.Dto.CustomerId)
            .NotEmpty().WithMessage("Customer ID is required");
    }
}
