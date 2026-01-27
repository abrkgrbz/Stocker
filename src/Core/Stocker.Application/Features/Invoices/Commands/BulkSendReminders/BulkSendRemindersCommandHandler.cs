using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Interfaces;
using Stocker.Application.Features.Invoices.Commands.SendReminder;
using Stocker.Domain.Master.Enums;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Invoices.Commands.BulkSendReminders;

public class BulkSendRemindersCommandHandler : IRequestHandler<BulkSendRemindersCommand, Result<BulkSendRemindersResponse>>
{
    private readonly IMasterDbContext _context;
    private readonly IMediator _mediator;
    private readonly ILogger<BulkSendRemindersCommandHandler> _logger;

    public BulkSendRemindersCommandHandler(
        IMasterDbContext context,
        IMediator mediator,
        ILogger<BulkSendRemindersCommandHandler> logger)
    {
        _context = context;
        _mediator = mediator;
        _logger = logger;
    }

    public async Task<Result<BulkSendRemindersResponse>> Handle(BulkSendRemindersCommand request, CancellationToken cancellationToken)
    {
        try
        {
            List<Domain.Master.Entities.Invoice> invoicesToProcess;

            if (request.SendToAllOverdue)
            {
                var overdueDate = DateTime.UtcNow.AddDays(-(request.DaysOverdue ?? 0));

                invoicesToProcess = await _context.Invoices
                    .Where(i => i.Status == InvoiceStatus.Gonderildi || i.Status == InvoiceStatus.Gecikti)
                    .Where(i => i.DueDate < overdueDate)
                    .ToListAsync(cancellationToken);
            }
            else if (request.InvoiceIds?.Any() == true)
            {
                invoicesToProcess = await _context.Invoices
                    .Where(i => request.InvoiceIds.Contains(i.Id))
                    .Where(i => i.Status == InvoiceStatus.Gonderildi || i.Status == InvoiceStatus.Gecikti)
                    .ToListAsync(cancellationToken);
            }
            else
            {
                return Result<BulkSendRemindersResponse>.Failure(Error.Validation("Invoice.BulkReminder.NoSelection", "No invoices selected for reminder"));
            }

            var results = new List<BulkReminderResult>();
            var successCount = 0;
            var failedCount = 0;

            foreach (var invoice in invoicesToProcess)
            {
                try
                {
                    var reminderCommand = new SendInvoiceReminderCommand { InvoiceId = invoice.Id };
                    var result = await _mediator.Send(reminderCommand, cancellationToken);

                    if (result.IsSuccess)
                    {
                        successCount++;
                        results.Add(new BulkReminderResult(
                            InvoiceId: invoice.Id,
                            InvoiceNumber: invoice.InvoiceNumber,
                            Success: true,
                            ErrorMessage: null
                        ));
                    }
                    else
                    {
                        failedCount++;
                        results.Add(new BulkReminderResult(
                            InvoiceId: invoice.Id,
                            InvoiceNumber: invoice.InvoiceNumber,
                            Success: false,
                            ErrorMessage: result.Error?.Description ?? "Unknown error"
                        ));
                    }
                }
                catch (Exception ex)
                {
                    failedCount++;
                    results.Add(new BulkReminderResult(
                        InvoiceId: invoice.Id,
                        InvoiceNumber: invoice.InvoiceNumber,
                        Success: false,
                        ErrorMessage: ex.Message
                    ));
                }
            }

            _logger.LogInformation(
                "Bulk reminder completed. Processed: {Total}, Success: {Success}, Failed: {Failed}",
                invoicesToProcess.Count, successCount, failedCount);

            return Result<BulkSendRemindersResponse>.Success(new BulkSendRemindersResponse(
                TotalProcessed: invoicesToProcess.Count,
                SuccessCount: successCount,
                FailedCount: failedCount,
                Results: results
            ));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing bulk reminders");
            return Result<BulkSendRemindersResponse>.Failure(Error.Failure("Invoice.BulkReminder.Error", ex.Message));
        }
    }
}
