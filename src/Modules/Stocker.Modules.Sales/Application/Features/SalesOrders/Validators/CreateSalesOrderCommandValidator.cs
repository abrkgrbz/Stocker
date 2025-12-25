using FluentValidation;
using Stocker.Modules.Sales.Application.Features.SalesOrders.Commands;

namespace Stocker.Modules.Sales.Application.Features.SalesOrders.Validators;

public class CreateSalesOrderCommandValidator : AbstractValidator<CreateSalesOrderCommand>
{
    public CreateSalesOrderCommandValidator()
    {
        RuleFor(x => x.OrderDate)
            .NotEmpty().WithMessage("Order date is required");

        RuleFor(x => x.Currency)
            .NotEmpty().WithMessage("Currency is required")
            .MaximumLength(3).WithMessage("Currency must not exceed 3 characters");

        RuleFor(x => x.CustomerName)
            .MaximumLength(200).WithMessage("Customer name must not exceed 200 characters")
            .When(x => !string.IsNullOrEmpty(x.CustomerName));

        RuleFor(x => x.CustomerEmail)
            .EmailAddress().WithMessage("Invalid email address")
            .When(x => !string.IsNullOrEmpty(x.CustomerEmail));

        RuleFor(x => x.ShippingAddress)
            .MaximumLength(500).WithMessage("Shipping address must not exceed 500 characters")
            .When(x => !string.IsNullOrEmpty(x.ShippingAddress));

        RuleFor(x => x.BillingAddress)
            .MaximumLength(500).WithMessage("Billing address must not exceed 500 characters")
            .When(x => !string.IsNullOrEmpty(x.BillingAddress));

        RuleFor(x => x.Notes)
            .MaximumLength(1000).WithMessage("Notes must not exceed 1000 characters")
            .When(x => !string.IsNullOrEmpty(x.Notes));

        RuleFor(x => x.SalesPersonName)
            .MaximumLength(200).WithMessage("Sales person name must not exceed 200 characters")
            .When(x => !string.IsNullOrEmpty(x.SalesPersonName));

        // Items validation - at least one item required
        RuleFor(x => x.Items)
            .NotEmpty().WithMessage("At least one order item is required");

        RuleForEach(x => x.Items)
            .SetValidator(new CreateSalesOrderItemCommandValidator());

        #region Phase 3: Enhanced Validation Rules

        RuleFor(x => x.ReservationExpiryHours)
            .InclusiveBetween(1, 720).WithMessage("Reservation expiry must be between 1 and 720 hours (30 days)");

        RuleFor(x => x.PaymentDueDays)
            .InclusiveBetween(0, 365).WithMessage("Payment due days must be between 0 and 365")
            .When(x => x.PaymentDueDays.HasValue);

        RuleFor(x => x.CurrentOutstandingBalance)
            .GreaterThanOrEqualTo(0).WithMessage("Outstanding balance cannot be negative")
            .When(x => x.CurrentOutstandingBalance.HasValue);

        // If ValidateCreditLimit is true, CustomerId must be provided when contract is specified
        RuleFor(x => x.CustomerId)
            .NotEmpty().WithMessage("Customer ID is required when credit limit validation is enabled")
            .When(x => x.ValidateCreditLimit && x.CustomerContractId.HasValue);

        #endregion
    }
}

public class CreateSalesOrderItemCommandValidator : AbstractValidator<CreateSalesOrderItemCommand>
{
    public CreateSalesOrderItemCommandValidator()
    {
        RuleFor(x => x.ProductCode)
            .NotEmpty().WithMessage("Product code is required")
            .MaximumLength(50).WithMessage("Product code must not exceed 50 characters");

        RuleFor(x => x.ProductName)
            .NotEmpty().WithMessage("Product name is required")
            .MaximumLength(200).WithMessage("Product name must not exceed 200 characters");

        RuleFor(x => x.Description)
            .MaximumLength(500).WithMessage("Description must not exceed 500 characters")
            .When(x => !string.IsNullOrEmpty(x.Description));

        RuleFor(x => x.Unit)
            .NotEmpty().WithMessage("Unit is required")
            .MaximumLength(20).WithMessage("Unit must not exceed 20 characters");

        RuleFor(x => x.Quantity)
            .GreaterThan(0).WithMessage("Quantity must be greater than 0");

        RuleFor(x => x.UnitPrice)
            .GreaterThanOrEqualTo(0).WithMessage("Unit price cannot be negative");

        RuleFor(x => x.VatRate)
            .InclusiveBetween(0, 100).WithMessage("VAT rate must be between 0 and 100");

        RuleFor(x => x.DiscountRate)
            .InclusiveBetween(0, 100).WithMessage("Discount rate must be between 0 and 100");
    }
}

public class UpdateSalesOrderCommandValidator : AbstractValidator<UpdateSalesOrderCommand>
{
    public UpdateSalesOrderCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Order ID is required");

        RuleFor(x => x.CustomerName)
            .MaximumLength(200).WithMessage("Customer name must not exceed 200 characters")
            .When(x => !string.IsNullOrEmpty(x.CustomerName));

        RuleFor(x => x.CustomerEmail)
            .EmailAddress().WithMessage("Invalid email address")
            .When(x => !string.IsNullOrEmpty(x.CustomerEmail));

        RuleFor(x => x.ShippingAddress)
            .MaximumLength(500).WithMessage("Shipping address must not exceed 500 characters")
            .When(x => !string.IsNullOrEmpty(x.ShippingAddress));

        RuleFor(x => x.BillingAddress)
            .MaximumLength(500).WithMessage("Billing address must not exceed 500 characters")
            .When(x => !string.IsNullOrEmpty(x.BillingAddress));

        RuleFor(x => x.Notes)
            .MaximumLength(1000).WithMessage("Notes must not exceed 1000 characters")
            .When(x => !string.IsNullOrEmpty(x.Notes));

        RuleFor(x => x.DiscountAmount)
            .GreaterThanOrEqualTo(0).WithMessage("Discount amount cannot be negative");

        RuleFor(x => x.DiscountRate)
            .InclusiveBetween(0, 100).WithMessage("Discount rate must be between 0 and 100");
    }
}

public class AddSalesOrderItemCommandValidator : AbstractValidator<AddSalesOrderItemCommand>
{
    public AddSalesOrderItemCommandValidator()
    {
        RuleFor(x => x.SalesOrderId)
            .NotEmpty().WithMessage("Sales order ID is required");

        RuleFor(x => x.ProductCode)
            .NotEmpty().WithMessage("Product code is required")
            .MaximumLength(50).WithMessage("Product code must not exceed 50 characters");

        RuleFor(x => x.ProductName)
            .NotEmpty().WithMessage("Product name is required")
            .MaximumLength(200).WithMessage("Product name must not exceed 200 characters");

        RuleFor(x => x.Unit)
            .NotEmpty().WithMessage("Unit is required")
            .MaximumLength(20).WithMessage("Unit must not exceed 20 characters");

        RuleFor(x => x.Quantity)
            .GreaterThan(0).WithMessage("Quantity must be greater than 0");

        RuleFor(x => x.UnitPrice)
            .GreaterThanOrEqualTo(0).WithMessage("Unit price cannot be negative");

        RuleFor(x => x.VatRate)
            .InclusiveBetween(0, 100).WithMessage("VAT rate must be between 0 and 100");

        RuleFor(x => x.DiscountRate)
            .InclusiveBetween(0, 100).WithMessage("Discount rate must be between 0 and 100");
    }
}

public class CancelSalesOrderCommandValidator : AbstractValidator<CancelSalesOrderCommand>
{
    public CancelSalesOrderCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Order ID is required");

        RuleFor(x => x.Reason)
            .NotEmpty().WithMessage("Cancellation reason is required")
            .MaximumLength(500).WithMessage("Cancellation reason must not exceed 500 characters");
    }
}
