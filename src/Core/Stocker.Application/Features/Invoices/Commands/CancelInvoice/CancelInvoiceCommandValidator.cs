using FluentValidation;

namespace Stocker.Application.Features.Invoices.Commands.CancelInvoice;

public class CancelInvoiceCommandValidator : AbstractValidator<CancelInvoiceCommand>
{
    public CancelInvoiceCommandValidator()
    {
        RuleFor(x => x.InvoiceId)
            .NotEmpty().WithMessage("Fatura ID zorunludur");

        RuleFor(x => x.Reason)
            .NotEmpty().WithMessage("İptal nedeni zorunludur")
            .MaximumLength(500).WithMessage("Neden en fazla 500 karakter olabilir");
    }
}
