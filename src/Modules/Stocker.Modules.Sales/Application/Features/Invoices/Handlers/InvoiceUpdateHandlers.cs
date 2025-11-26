using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Modules.Sales.Application.DTOs;
using Stocker.Modules.Sales.Application.Features.Invoices.Commands;
using Stocker.Modules.Sales.Domain.Entities;
using Stocker.Modules.Sales.Infrastructure.Persistence;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Sales.Application.Features.Invoices.Handlers;

public class UpdateInvoiceHandler : IRequestHandler<UpdateInvoiceCommand, Result<InvoiceDto>>
{
    private readonly SalesDbContext _context;
    private readonly ITenantService _tenantService;
    private readonly ILogger<UpdateInvoiceHandler> _logger;

    public UpdateInvoiceHandler(
        SalesDbContext context,
        ITenantService tenantService,
        ILogger<UpdateInvoiceHandler> logger)
    {
        _context = context;
        _tenantService = tenantService;
        _logger = logger;
    }

    public async Task<Result<InvoiceDto>> Handle(UpdateInvoiceCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue)
            return Result<InvoiceDto>.Failure(Error.Unauthorized("Tenant", "Tenant not found"));

        var invoice = await _context.Invoices
            .Include(i => i.Items)
            .FirstOrDefaultAsync(i => i.Id == request.Id && i.TenantId == tenantId.Value, cancellationToken);

        if (invoice == null)
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

        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Invoice {InvoiceId} updated for tenant {TenantId}", invoice.Id, tenantId.Value);

        return Result<InvoiceDto>.Success(InvoiceDto.FromEntity(invoice));
    }
}

public class AddInvoiceItemHandler : IRequestHandler<AddInvoiceItemCommand, Result<InvoiceDto>>
{
    private readonly SalesDbContext _context;
    private readonly ITenantService _tenantService;

    public AddInvoiceItemHandler(SalesDbContext context, ITenantService tenantService)
    {
        _context = context;
        _tenantService = tenantService;
    }

    public async Task<Result<InvoiceDto>> Handle(AddInvoiceItemCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue)
            return Result<InvoiceDto>.Failure(Error.Unauthorized("Tenant", "Tenant not found"));

        var invoice = await _context.Invoices
            .Include(i => i.Items)
            .FirstOrDefaultAsync(i => i.Id == request.InvoiceId && i.TenantId == tenantId.Value, cancellationToken);

        if (invoice == null)
            return Result<InvoiceDto>.Failure(Error.NotFound("Invoice", "Invoice not found"));

        var lineNumber = invoice.Items.Any() ? invoice.Items.Max(i => i.LineNumber) + 1 : 1;

        var itemResult = InvoiceItem.Create(
            tenantId.Value,
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

        await _context.SaveChangesAsync(cancellationToken);

        return Result<InvoiceDto>.Success(InvoiceDto.FromEntity(invoice));
    }
}

public class RemoveInvoiceItemHandler : IRequestHandler<RemoveInvoiceItemCommand, Result<InvoiceDto>>
{
    private readonly SalesDbContext _context;
    private readonly ITenantService _tenantService;

    public RemoveInvoiceItemHandler(SalesDbContext context, ITenantService tenantService)
    {
        _context = context;
        _tenantService = tenantService;
    }

    public async Task<Result<InvoiceDto>> Handle(RemoveInvoiceItemCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue)
            return Result<InvoiceDto>.Failure(Error.Unauthorized("Tenant", "Tenant not found"));

        var invoice = await _context.Invoices
            .Include(i => i.Items)
            .FirstOrDefaultAsync(i => i.Id == request.InvoiceId && i.TenantId == tenantId.Value, cancellationToken);

        if (invoice == null)
            return Result<InvoiceDto>.Failure(Error.NotFound("Invoice", "Invoice not found"));

        var removeResult = invoice.RemoveItem(request.ItemId);
        if (!removeResult.IsSuccess)
            return Result<InvoiceDto>.Failure(removeResult.Error);

        var item = await _context.InvoiceItems
            .FirstOrDefaultAsync(i => i.Id == request.ItemId, cancellationToken);
        if (item != null)
            _context.InvoiceItems.Remove(item);

        await _context.SaveChangesAsync(cancellationToken);

        return Result<InvoiceDto>.Success(InvoiceDto.FromEntity(invoice));
    }
}

public class SendInvoiceHandler : IRequestHandler<SendInvoiceCommand, Result<InvoiceDto>>
{
    private readonly SalesDbContext _context;
    private readonly ITenantService _tenantService;
    private readonly ILogger<SendInvoiceHandler> _logger;

    public SendInvoiceHandler(
        SalesDbContext context,
        ITenantService tenantService,
        ILogger<SendInvoiceHandler> logger)
    {
        _context = context;
        _tenantService = tenantService;
        _logger = logger;
    }

    public async Task<Result<InvoiceDto>> Handle(SendInvoiceCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue)
            return Result<InvoiceDto>.Failure(Error.Unauthorized("Tenant", "Tenant not found"));

        var invoice = await _context.Invoices
            .Include(i => i.Items)
            .FirstOrDefaultAsync(i => i.Id == request.Id && i.TenantId == tenantId.Value, cancellationToken);

        if (invoice == null)
            return Result<InvoiceDto>.Failure(Error.NotFound("Invoice", "Invoice not found"));

        var result = invoice.Send();
        if (!result.IsSuccess)
            return Result<InvoiceDto>.Failure(result.Error);

        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Invoice {InvoiceId} sent for tenant {TenantId}", invoice.Id, tenantId.Value);

        return Result<InvoiceDto>.Success(InvoiceDto.FromEntity(invoice));
    }
}

public class RecordPaymentHandler : IRequestHandler<RecordPaymentCommand, Result<InvoiceDto>>
{
    private readonly SalesDbContext _context;
    private readonly ITenantService _tenantService;
    private readonly ILogger<RecordPaymentHandler> _logger;

    public RecordPaymentHandler(
        SalesDbContext context,
        ITenantService tenantService,
        ILogger<RecordPaymentHandler> logger)
    {
        _context = context;
        _tenantService = tenantService;
        _logger = logger;
    }

    public async Task<Result<InvoiceDto>> Handle(RecordPaymentCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue)
            return Result<InvoiceDto>.Failure(Error.Unauthorized("Tenant", "Tenant not found"));

        var invoice = await _context.Invoices
            .Include(i => i.Items)
            .FirstOrDefaultAsync(i => i.Id == request.InvoiceId && i.TenantId == tenantId.Value, cancellationToken);

        if (invoice == null)
            return Result<InvoiceDto>.Failure(Error.NotFound("Invoice", "Invoice not found"));

        var result = invoice.RecordPayment(request.Amount);
        if (!result.IsSuccess)
            return Result<InvoiceDto>.Failure(result.Error);

        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Payment of {Amount} recorded for invoice {InvoiceId} for tenant {TenantId}",
            request.Amount, invoice.Id, tenantId.Value);

        return Result<InvoiceDto>.Success(InvoiceDto.FromEntity(invoice));
    }
}

public class SetEInvoiceHandler : IRequestHandler<SetEInvoiceCommand, Result<InvoiceDto>>
{
    private readonly SalesDbContext _context;
    private readonly ITenantService _tenantService;
    private readonly ILogger<SetEInvoiceHandler> _logger;

    public SetEInvoiceHandler(
        SalesDbContext context,
        ITenantService tenantService,
        ILogger<SetEInvoiceHandler> logger)
    {
        _context = context;
        _tenantService = tenantService;
        _logger = logger;
    }

    public async Task<Result<InvoiceDto>> Handle(SetEInvoiceCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue)
            return Result<InvoiceDto>.Failure(Error.Unauthorized("Tenant", "Tenant not found"));

        var invoice = await _context.Invoices
            .Include(i => i.Items)
            .FirstOrDefaultAsync(i => i.Id == request.Id && i.TenantId == tenantId.Value, cancellationToken);

        if (invoice == null)
            return Result<InvoiceDto>.Failure(Error.NotFound("Invoice", "Invoice not found"));

        var result = invoice.SetEInvoice(request.EInvoiceId);
        if (!result.IsSuccess)
            return Result<InvoiceDto>.Failure(result.Error);

        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("E-Invoice ID {EInvoiceId} set for invoice {InvoiceId} for tenant {TenantId}",
            request.EInvoiceId, invoice.Id, tenantId.Value);

        return Result<InvoiceDto>.Success(InvoiceDto.FromEntity(invoice));
    }
}
