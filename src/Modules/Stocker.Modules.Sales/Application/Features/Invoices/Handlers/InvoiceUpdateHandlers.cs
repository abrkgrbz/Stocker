using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Modules.Sales.Application.DTOs;
using Stocker.Modules.Sales.Application.Features.Invoices.Commands;
using Stocker.Modules.Sales.Domain.Entities;
using Stocker.Modules.Sales.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Sales.Application.Features.Invoices.Handlers;

/// <summary>
/// Handler for UpdateInvoiceCommand
/// Uses ISalesUnitOfWork for consistent data access
/// </summary>
public class UpdateInvoiceHandler : IRequestHandler<UpdateInvoiceCommand, Result<InvoiceDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;
    private readonly ILogger<UpdateInvoiceHandler> _logger;

    public UpdateInvoiceHandler(
        ISalesUnitOfWork unitOfWork,
        ILogger<UpdateInvoiceHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<Result<InvoiceDto>> Handle(UpdateInvoiceCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var invoice = await _unitOfWork.Invoices.GetWithItemsAsync(request.Id, cancellationToken);

        if (invoice == null || invoice.TenantId != tenantId)
            return Result<InvoiceDto>.Failure(Error.NotFound("Invoice", "Invoice not found"));

        if (invoice.Status != InvoiceStatus.Draft)
            return Result<InvoiceDto>.Failure(Error.Conflict("Invoice", "Only draft invoices can be updated"));

        if (request.DueDate.HasValue)
        {
            var dueDateResult = invoice.SetDueDate(request.DueDate.Value);
            if (!dueDateResult.IsSuccess)
                return Result<InvoiceDto>.Failure(dueDateResult.Error);
        }

        invoice.SetNotes(request.Notes);

        var discountResult = invoice.ApplyDiscount(request.DiscountAmount, request.DiscountRate);
        if (!discountResult.IsSuccess)
            return Result<InvoiceDto>.Failure(discountResult.Error);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Invoice {InvoiceId} updated for tenant {TenantId}", invoice.Id, tenantId);

        return Result<InvoiceDto>.Success(InvoiceDto.FromEntity(invoice));
    }
}

/// <summary>
/// Handler for AddInvoiceItemCommand
/// Uses ISalesUnitOfWork for consistent data access
/// </summary>
public class AddInvoiceItemHandler : IRequestHandler<AddInvoiceItemCommand, Result<InvoiceDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public AddInvoiceItemHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<InvoiceDto>> Handle(AddInvoiceItemCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var invoice = await _unitOfWork.Invoices.GetWithItemsAsync(request.InvoiceId, cancellationToken);

        if (invoice == null || invoice.TenantId != tenantId)
            return Result<InvoiceDto>.Failure(Error.NotFound("Invoice", "Invoice not found"));

        var lineNumber = invoice.Items.Any() ? invoice.Items.Max(i => i.LineNumber) + 1 : 1;

        var itemResult = InvoiceItem.Create(
            tenantId,
            invoice.Id,
            lineNumber,
            request.ProductId,
            request.ProductCode,
            request.ProductName,
            request.Unit,
            request.Quantity,
            request.UnitPrice,
            request.VatRate,
            null,
            request.Description);

        if (!itemResult.IsSuccess)
            return Result<InvoiceDto>.Failure(itemResult.Error);

        var item = itemResult.Value;
        if (request.DiscountRate > 0)
            item.ApplyDiscount(request.DiscountRate);

        var addResult = invoice.AddItem(item);
        if (!addResult.IsSuccess)
            return Result<InvoiceDto>.Failure(addResult.Error);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<InvoiceDto>.Success(InvoiceDto.FromEntity(invoice));
    }
}

/// <summary>
/// Handler for RemoveInvoiceItemCommand
/// Uses ISalesUnitOfWork for consistent data access
/// </summary>
public class RemoveInvoiceItemHandler : IRequestHandler<RemoveInvoiceItemCommand, Result<InvoiceDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public RemoveInvoiceItemHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<InvoiceDto>> Handle(RemoveInvoiceItemCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var invoice = await _unitOfWork.Invoices.GetWithItemsAsync(request.InvoiceId, cancellationToken);

        if (invoice == null || invoice.TenantId != tenantId)
            return Result<InvoiceDto>.Failure(Error.NotFound("Invoice", "Invoice not found"));

        var removeResult = invoice.RemoveItem(request.ItemId);
        if (!removeResult.IsSuccess)
            return Result<InvoiceDto>.Failure(removeResult.Error);

        // The item removal is handled by EF Core change tracking when we save
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<InvoiceDto>.Success(InvoiceDto.FromEntity(invoice));
    }
}

/// <summary>
/// Handler for SendInvoiceCommand
/// Uses ISalesUnitOfWork for consistent data access
/// </summary>
public class SendInvoiceHandler : IRequestHandler<SendInvoiceCommand, Result<InvoiceDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;
    private readonly ILogger<SendInvoiceHandler> _logger;

    public SendInvoiceHandler(
        ISalesUnitOfWork unitOfWork,
        ILogger<SendInvoiceHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<Result<InvoiceDto>> Handle(SendInvoiceCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var invoice = await _unitOfWork.Invoices.GetWithItemsAsync(request.Id, cancellationToken);

        if (invoice == null || invoice.TenantId != tenantId)
            return Result<InvoiceDto>.Failure(Error.NotFound("Invoice", "Invoice not found"));

        var result = invoice.Send();
        if (!result.IsSuccess)
            return Result<InvoiceDto>.Failure(result.Error);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Invoice {InvoiceId} sent for tenant {TenantId}", invoice.Id, tenantId);

        return Result<InvoiceDto>.Success(InvoiceDto.FromEntity(invoice));
    }
}

/// <summary>
/// Handler for RecordPaymentCommand
/// Uses ISalesUnitOfWork for consistent data access
/// </summary>
public class RecordPaymentHandler : IRequestHandler<RecordPaymentCommand, Result<InvoiceDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;
    private readonly ILogger<RecordPaymentHandler> _logger;

    public RecordPaymentHandler(
        ISalesUnitOfWork unitOfWork,
        ILogger<RecordPaymentHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<Result<InvoiceDto>> Handle(RecordPaymentCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var invoice = await _unitOfWork.Invoices.GetWithItemsAsync(request.InvoiceId, cancellationToken);

        if (invoice == null || invoice.TenantId != tenantId)
            return Result<InvoiceDto>.Failure(Error.NotFound("Invoice", "Invoice not found"));

        var result = invoice.RecordPayment(request.Amount);
        if (!result.IsSuccess)
            return Result<InvoiceDto>.Failure(result.Error);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Payment of {Amount} recorded for invoice {InvoiceId} for tenant {TenantId}",
            request.Amount, invoice.Id, tenantId);

        return Result<InvoiceDto>.Success(InvoiceDto.FromEntity(invoice));
    }
}

/// <summary>
/// Handler for SetEInvoiceCommand
/// Uses ISalesUnitOfWork for consistent data access
/// </summary>
public class SetEInvoiceHandler : IRequestHandler<SetEInvoiceCommand, Result<InvoiceDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;
    private readonly ILogger<SetEInvoiceHandler> _logger;

    public SetEInvoiceHandler(
        ISalesUnitOfWork unitOfWork,
        ILogger<SetEInvoiceHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<Result<InvoiceDto>> Handle(SetEInvoiceCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var invoice = await _unitOfWork.Invoices.GetWithItemsAsync(request.Id, cancellationToken);

        if (invoice == null || invoice.TenantId != tenantId)
            return Result<InvoiceDto>.Failure(Error.NotFound("Invoice", "Invoice not found"));

        var result = invoice.SetEInvoice(request.EInvoiceId);
        if (!result.IsSuccess)
            return Result<InvoiceDto>.Failure(result.Error);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("E-Invoice ID {EInvoiceId} set for invoice {InvoiceId} for tenant {TenantId}",
            request.EInvoiceId, invoice.Id, tenantId);

        return Result<InvoiceDto>.Success(InvoiceDto.FromEntity(invoice));
    }
}
