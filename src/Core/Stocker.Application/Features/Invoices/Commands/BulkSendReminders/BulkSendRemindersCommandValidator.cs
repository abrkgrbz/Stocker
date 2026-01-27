using FluentValidation;

namespace Stocker.Application.Features.Invoices.Commands.BulkSendReminders;

public class BulkSendRemindersCommandValidator : AbstractValidator<BulkSendRemindersCommand>
{
    public BulkSendRemindersCommandValidator()
    {
        RuleFor(x => x)
            .Must(x => x.SendToAllOverdue || (x.InvoiceIds != null && x.InvoiceIds.Count > 0))
            .WithMessage("SendToAllOverdue true olmalı veya InvoiceIds en az bir fatura içermelidir");

        RuleFor(x => x.DaysOverdue)
            .GreaterThanOrEqualTo(0)
            .When(x => x.DaysOverdue.HasValue)
            .WithMessage("Gecikme gün sayısı negatif olamaz");

        RuleFor(x => x.InvoiceIds)
            .Must(ids => ids == null || ids.Count <= 100)
            .WithMessage("Tek seferde en fazla 100 fatura işlenebilir");
    }
}
