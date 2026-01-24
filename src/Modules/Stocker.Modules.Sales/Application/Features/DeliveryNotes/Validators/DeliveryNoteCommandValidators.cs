using FluentValidation;
using Stocker.Modules.Sales.Application.DTOs;
using Stocker.Modules.Sales.Application.Features.DeliveryNotes.Commands;

namespace Stocker.Modules.Sales.Application.Features.DeliveryNotes.Validators;

public class CreateDeliveryNoteCommandValidator : AbstractValidator<CreateDeliveryNoteCommand>
{
    public CreateDeliveryNoteCommandValidator()
    {
        RuleFor(x => x.Dto.Series)
            .NotEmpty().WithMessage("Series is required")
            .MaximumLength(10).WithMessage("Series must not exceed 10 characters");

        RuleFor(x => x.Dto.SenderTaxId)
            .NotEmpty().WithMessage("Sender tax ID is required")
            .MaximumLength(11).WithMessage("Sender tax ID must not exceed 11 characters");

        RuleFor(x => x.Dto.SenderName)
            .NotEmpty().WithMessage("Sender name is required")
            .MaximumLength(300).WithMessage("Sender name must not exceed 300 characters");

        RuleFor(x => x.Dto.SenderAddress)
            .NotEmpty().WithMessage("Sender address is required")
            .MaximumLength(500).WithMessage("Sender address must not exceed 500 characters");

        RuleFor(x => x.Dto.ReceiverTaxId)
            .NotEmpty().WithMessage("Receiver tax ID is required")
            .MaximumLength(11).WithMessage("Receiver tax ID must not exceed 11 characters");

        RuleFor(x => x.Dto.ReceiverName)
            .NotEmpty().WithMessage("Receiver name is required")
            .MaximumLength(300).WithMessage("Receiver name must not exceed 300 characters");

        RuleFor(x => x.Dto.ReceiverAddress)
            .NotEmpty().WithMessage("Receiver address is required")
            .MaximumLength(500).WithMessage("Receiver address must not exceed 500 characters");

        RuleFor(x => x.Dto.Items)
            .NotEmpty().WithMessage("At least one delivery note item is required");

        RuleForEach(x => x.Dto.Items)
            .SetValidator(new CreateDeliveryNoteItemDtoValidator());

        RuleFor(x => x.Dto.Description)
            .MaximumLength(500).WithMessage("Description must not exceed 500 characters")
            .When(x => !string.IsNullOrEmpty(x.Dto.Description));
    }
}

public class CreateDeliveryNoteItemDtoValidator : AbstractValidator<CreateDeliveryNoteItemDto>
{
    public CreateDeliveryNoteItemDtoValidator()
    {
        RuleFor(x => x.ProductId)
            .NotEmpty().WithMessage("Product ID is required");

        RuleFor(x => x.ProductCode)
            .NotEmpty().WithMessage("Product code is required")
            .MaximumLength(50).WithMessage("Product code must not exceed 50 characters");

        RuleFor(x => x.ProductName)
            .NotEmpty().WithMessage("Product name is required")
            .MaximumLength(200).WithMessage("Product name must not exceed 200 characters");

        RuleFor(x => x.Quantity)
            .GreaterThan(0).WithMessage("Quantity must be greater than 0");

        RuleFor(x => x.Unit)
            .NotEmpty().WithMessage("Unit is required")
            .MaximumLength(20).WithMessage("Unit must not exceed 20 characters");
    }
}

public class AddDeliveryNoteItemCommandValidator : AbstractValidator<AddDeliveryNoteItemCommand>
{
    public AddDeliveryNoteItemCommandValidator()
    {
        RuleFor(x => x.DeliveryNoteId)
            .NotEmpty().WithMessage("Delivery note ID is required");

        RuleFor(x => x.Dto.ProductId)
            .NotEmpty().WithMessage("Product ID is required");

        RuleFor(x => x.Dto.ProductCode)
            .NotEmpty().WithMessage("Product code is required")
            .MaximumLength(50).WithMessage("Product code must not exceed 50 characters");

        RuleFor(x => x.Dto.ProductName)
            .NotEmpty().WithMessage("Product name is required")
            .MaximumLength(200).WithMessage("Product name must not exceed 200 characters");

        RuleFor(x => x.Dto.Quantity)
            .GreaterThan(0).WithMessage("Quantity must be greater than 0");

        RuleFor(x => x.Dto.Unit)
            .NotEmpty().WithMessage("Unit is required")
            .MaximumLength(20).WithMessage("Unit must not exceed 20 characters");
    }
}

public class CancelDeliveryNoteCommandValidator : AbstractValidator<CancelDeliveryNoteCommand>
{
    public CancelDeliveryNoteCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Delivery note ID is required");

        RuleFor(x => x.Dto.Reason)
            .NotEmpty().WithMessage("Cancellation reason is required")
            .MaximumLength(500).WithMessage("Cancellation reason must not exceed 500 characters");
    }
}

public class LinkInvoiceCommandValidator : AbstractValidator<LinkInvoiceCommand>
{
    public LinkInvoiceCommandValidator()
    {
        RuleFor(x => x.DeliveryNoteId)
            .NotEmpty().WithMessage("Delivery note ID is required");

        RuleFor(x => x.InvoiceId)
            .NotEmpty().WithMessage("Invoice ID is required");

        RuleFor(x => x.InvoiceNumber)
            .NotEmpty().WithMessage("Invoice number is required")
            .MaximumLength(50).WithMessage("Invoice number must not exceed 50 characters");
    }
}
