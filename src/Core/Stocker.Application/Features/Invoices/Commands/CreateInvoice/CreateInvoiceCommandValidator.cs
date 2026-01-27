using FluentValidation;

namespace Stocker.Application.Features.Invoices.Commands.CreateInvoice;

public class CreateInvoiceCommandValidator : AbstractValidator<CreateInvoiceCommand>
{
    public CreateInvoiceCommandValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Tenant ID zorunludur");

        RuleFor(x => x.Amount)
            .GreaterThan(0).WithMessage("Fatura tutarı sıfırdan büyük olmalıdır");

        RuleFor(x => x.Tax)
            .GreaterThanOrEqualTo(0).WithMessage("Vergi tutarı negatif olamaz");

        RuleFor(x => x.Description)
            .MaximumLength(500).WithMessage("Açıklama en fazla 500 karakter olabilir");

        RuleFor(x => x.DueDate)
            .GreaterThan(DateTime.UtcNow.Date)
            .WithMessage("Vade tarihi gelecekte bir tarih olmalıdır");

        RuleFor(x => x.Items)
            .NotEmpty().WithMessage("En az bir fatura kalemi zorunludur");

        RuleForEach(x => x.Items).SetValidator(new CreateInvoiceItemDtoValidator());
    }
}

public class CreateInvoiceItemDtoValidator : AbstractValidator<CreateInvoiceItemDto>
{
    public CreateInvoiceItemDtoValidator()
    {
        RuleFor(x => x.Description)
            .NotEmpty().WithMessage("Kalem açıklaması zorunludur")
            .MaximumLength(200).WithMessage("Kalem açıklaması en fazla 200 karakter olabilir");

        RuleFor(x => x.Quantity)
            .GreaterThan(0).WithMessage("Miktar sıfırdan büyük olmalıdır");

        RuleFor(x => x.UnitPrice)
            .GreaterThanOrEqualTo(0).WithMessage("Birim fiyat negatif olamaz");
    }
}
