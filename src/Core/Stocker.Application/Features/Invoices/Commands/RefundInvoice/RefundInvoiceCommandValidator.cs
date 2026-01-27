using FluentValidation;

namespace Stocker.Application.Features.Invoices.Commands.RefundInvoice;

public class RefundInvoiceCommandValidator : AbstractValidator<RefundInvoiceCommand>
{
    public RefundInvoiceCommandValidator()
    {
        RuleFor(x => x.InvoiceId)
            .NotEmpty().WithMessage("Fatura ID zorunludur");

        RuleFor(x => x.RefundAmount)
            .GreaterThan(0)
            .When(x => !x.IsFullRefund)
            .WithMessage("Kısmi iade için iade tutarı sıfırdan büyük olmalıdır");

        RuleFor(x => x.Reason)
            .NotEmpty().WithMessage("İade nedeni zorunludur")
            .MaximumLength(500).WithMessage("Neden en fazla 500 karakter olabilir");
    }
}
