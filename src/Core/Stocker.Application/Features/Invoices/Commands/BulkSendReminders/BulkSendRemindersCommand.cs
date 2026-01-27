using MediatR;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Invoices.Commands.BulkSendReminders;

public record BulkSendRemindersCommand : IRequest<Result<BulkSendRemindersResponse>>
{
    public List<Guid>? InvoiceIds { get; init; }
    public bool SendToAllOverdue { get; init; }
    public int? DaysOverdue { get; init; }
}

public record BulkSendRemindersResponse(
    int TotalProcessed,
    int SuccessCount,
    int FailedCount,
    List<BulkReminderResult> Results
);

public record BulkReminderResult(
    Guid InvoiceId,
    string InvoiceNumber,
    bool Success,
    string? ErrorMessage
);
