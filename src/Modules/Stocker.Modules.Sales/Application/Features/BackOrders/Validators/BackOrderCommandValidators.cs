using FluentValidation;
using Stocker.Modules.Sales.Application.DTOs;
using Stocker.Modules.Sales.Application.Features.BackOrders.Commands;

namespace Stocker.Modules.Sales.Application.Features.BackOrders.Validators;

public class CreateBackOrderCommandValidator : AbstractValidator<CreateBackOrderCommand>
{
    public CreateBackOrderCommandValidator()
    {
        RuleFor(x => x.Dto.SalesOrderId)
            .NotEmpty().WithMessage("Sales order ID is required");

        RuleFor(x => x.Dto.SalesOrderNumber)
            .NotEmpty().WithMessage("Sales order number is required")
            .MaximumLength(50).WithMessage("Sales order number must not exceed 50 characters");

        RuleFor(x => x.Dto.CustomerName)
            .MaximumLength(200).WithMessage("Customer name must not exceed 200 characters")
            .When(x => !string.IsNullOrEmpty(x.Dto.CustomerName));

        RuleFor(x => x.Dto.Items)
            .NotEmpty().WithMessage("At least one back order item is required");

        RuleForEach(x => x.Dto.Items)
            .SetValidator(new CreateBackOrderItemDtoValidator());

        RuleFor(x => x.Dto.Notes)
            .MaximumLength(1000).WithMessage("Notes must not exceed 1000 characters")
            .When(x => !string.IsNullOrEmpty(x.Dto.Notes));
    }
}

public class CreateBackOrderItemDtoValidator : AbstractValidator<CreateBackOrderItemDto>
{
    public CreateBackOrderItemDtoValidator()
    {
        RuleFor(x => x.SalesOrderItemId)
            .NotEmpty().WithMessage("Sales order item ID is required");

        RuleFor(x => x.ProductCode)
            .NotEmpty().WithMessage("Product code is required")
            .MaximumLength(50).WithMessage("Product code must not exceed 50 characters");

        RuleFor(x => x.ProductName)
            .NotEmpty().WithMessage("Product name is required")
            .MaximumLength(200).WithMessage("Product name must not exceed 200 characters");

        RuleFor(x => x.OrderedQuantity)
            .GreaterThan(0).WithMessage("Ordered quantity must be greater than 0");

        RuleFor(x => x.AvailableQuantity)
            .GreaterThanOrEqualTo(0).WithMessage("Available quantity cannot be negative");

        RuleFor(x => x.Unit)
            .NotEmpty().WithMessage("Unit is required")
            .MaximumLength(20).WithMessage("Unit must not exceed 20 characters");

        RuleFor(x => x.UnitPrice)
            .GreaterThanOrEqualTo(0).WithMessage("Unit price cannot be negative");
    }
}

public class FulfillBackOrderItemCommandValidator : AbstractValidator<FulfillBackOrderItemCommand>
{
    public FulfillBackOrderItemCommandValidator()
    {
        RuleFor(x => x.BackOrderId)
            .NotEmpty().WithMessage("Back order ID is required");

        RuleFor(x => x.Dto.ItemId)
            .NotEmpty().WithMessage("Item ID is required");

        RuleFor(x => x.Dto.Quantity)
            .GreaterThan(0).WithMessage("Fulfill quantity must be greater than 0");
    }
}

public class CancelBackOrderCommandValidator : AbstractValidator<CancelBackOrderCommand>
{
    public CancelBackOrderCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Back order ID is required");

        RuleFor(x => x.Reason)
            .NotEmpty().WithMessage("Cancellation reason is required")
            .MaximumLength(500).WithMessage("Cancellation reason must not exceed 500 characters");
    }
}

public class SetBackOrderPriorityCommandValidator : AbstractValidator<SetBackOrderPriorityCommand>
{
    public SetBackOrderPriorityCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Back order ID is required");

        RuleFor(x => x.Priority)
            .NotEmpty().WithMessage("Priority is required")
            .MaximumLength(20).WithMessage("Priority must not exceed 20 characters");
    }
}
