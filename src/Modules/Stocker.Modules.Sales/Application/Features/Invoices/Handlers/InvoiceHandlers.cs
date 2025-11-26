using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Modules.Sales.Application.DTOs;
using Stocker.Modules.Sales.Application.Features.Invoices.Commands;
using Stocker.Modules.Sales.Application.Features.Invoices.Queries;
using Stocker.Modules.Sales.Application.Features.SalesOrders.Queries;
using Stocker.Modules.Sales.Domain.Entities;
using Stocker.Modules.Sales.Infrastructure.Persistence;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Sales.Application.Features.Invoices.Handlers;

public class CreateInvoiceHandler : IRequestHandler<CreateInvoiceCommand, Result<InvoiceDto>>
{
    private readonly SalesDbContext _context;
    private readonly ITenantService _tenantService;
    private readonly ILogger<CreateInvoiceHandler> _logger;

    public CreateInvoiceHandler(
        SalesDbContext context,
        ITenantService tenantService,
        ILogger<CreateInvoiceHandler> logger)
    {
        _context = context;
        _tenantService = tenantService;
        _logger = logger;
    }

    public async Task<Result<InvoiceDto>> Handle(CreateInvoiceCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue)
            return Result<InvoiceDto>.Failure(Error.Unauthorized("Tenant", "Tenant not found"));

        var invoiceNumber = await GenerateInvoiceNumberAsync(tenantId.Value, request.Type, cancellationToken);

        var invoiceResult = Invoice.Create(
            tenantId.Value,
            invoiceNumber,
            request.InvoiceDate,
            request.Type,
            request.SalesOrderId,
            request.CustomerId,
            request.CustomerName,
            request.CustomerEmail,
            request.CustomerTaxNumber,
            request.CustomerAddress,
            request.Currency);

        if (!invoiceResult.IsSuccess)
            return Result<InvoiceDto>.Failure(invoiceResult.Error);

        var invoice = invoiceResult.Value;

        if (request.DueDate.HasValue)
            invoice.SetDueDate(request.DueDate.Value);

        if (!string.IsNullOrEmpty(request.Notes))
            invoice.SetNotes(request.Notes);

        var lineNumber = 1;
        foreach (var itemCmd in request.Items)
        {
            var itemResult = InvoiceItem.Create(
                tenantId.Value,
                invoice.Id,
                lineNumber++,
                itemCmd.ProductId,
                itemCmd.ProductCode,
                itemCmd.ProductName,
                itemCmd.Unit,
                itemCmd.Quantity,
                itemCmd.UnitPrice,
                itemCmd.VatRate,
                itemCmd.SalesOrderItemId,
                itemCmd.Description);

            if (!itemResult.IsSuccess)
                return Result<InvoiceDto>.Failure(itemResult.Error);

            var item = itemResult.Value;
            if (itemCmd.DiscountRate > 0)
                item.ApplyDiscount(itemCmd.DiscountRate);

            invoice.AddItem(item);
        }

        _context.Invoices.Add(invoice);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Invoice {InvoiceNumber} created for tenant {TenantId}", invoiceNumber, tenantId.Value);

        var savedInvoice = await _context.Invoices
            .Include(i => i.Items)
            .FirstAsync(i => i.Id == invoice.Id, cancellationToken);

        return Result<InvoiceDto>.Success(InvoiceDto.FromEntity(savedInvoice));
    }

    private async Task<string> GenerateInvoiceNumberAsync(Guid tenantId, InvoiceType type, CancellationToken cancellationToken)
    {
        var today = DateTime.UtcNow;
        var prefix = type switch
        {
            InvoiceType.Sales => $"INV-{today:yyyyMMdd}",
            InvoiceType.Return => $"RET-{today:yyyyMMdd}",
            InvoiceType.Credit => $"CRN-{today:yyyyMMdd}",
            InvoiceType.Debit => $"DBN-{today:yyyyMMdd}",
            _ => $"INV-{today:yyyyMMdd}"
        };

        var lastInvoice = await _context.Invoices
            .Where(i => i.TenantId == tenantId && i.InvoiceNumber.StartsWith(prefix))
            .OrderByDescending(i => i.InvoiceNumber)
            .FirstOrDefaultAsync(cancellationToken);

        var sequence = 1;
        if (lastInvoice != null)
        {
            var lastSequence = lastInvoice.InvoiceNumber.Split('-').LastOrDefault();
            if (int.TryParse(lastSequence, out var parsed))
                sequence = parsed + 1;
        }

        return $"{prefix}-{sequence:D4}";
    }
}

public class CreateInvoiceFromOrderHandler : IRequestHandler<CreateInvoiceFromOrderCommand, Result<InvoiceDto>>
{
    private readonly SalesDbContext _context;
    private readonly ITenantService _tenantService;
    private readonly IMediator _mediator;
    private readonly ILogger<CreateInvoiceFromOrderHandler> _logger;

    public CreateInvoiceFromOrderHandler(
        SalesDbContext context,
        ITenantService tenantService,
        IMediator mediator,
        ILogger<CreateInvoiceFromOrderHandler> logger)
    {
        _context = context;
        _tenantService = tenantService;
        _mediator = mediator;
        _logger = logger;
    }

    public async Task<Result<InvoiceDto>> Handle(CreateInvoiceFromOrderCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue)
            return Result<InvoiceDto>.Failure(Error.Unauthorized("Tenant", "Tenant not found"));

        var order = await _context.SalesOrders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == request.SalesOrderId && o.TenantId == tenantId.Value, cancellationToken);

        if (order == null)
            return Result<InvoiceDto>.Failure(Error.NotFound("SalesOrder", "Sales order not found"));

        if (!order.IsApproved)
            return Result<InvoiceDto>.Failure(Error.Conflict("SalesOrder", "Sales order must be approved before creating invoice"));

        var createCommand = new CreateInvoiceCommand
        {
            InvoiceDate = DateTime.UtcNow,
            DueDate = request.DueDate ?? DateTime.UtcNow.AddDays(30),
            Type = InvoiceType.Sales,
            SalesOrderId = order.Id,
            CustomerId = order.CustomerId,
            CustomerName = order.CustomerName,
            CustomerEmail = order.CustomerEmail,
            Currency = order.Currency,
            Notes = request.Notes,
            Items = order.Items.Select(item => new CreateInvoiceItemCommand
            {
                SalesOrderItemId = item.Id,
                ProductId = item.ProductId,
                ProductCode = item.ProductCode,
                ProductName = item.ProductName,
                Description = item.Description,
                Unit = item.Unit,
                Quantity = item.Quantity,
                UnitPrice = item.UnitPrice,
                VatRate = item.VatRate,
                DiscountRate = item.DiscountRate
            }).ToList()
        };

        return await _mediator.Send(createCommand, cancellationToken);
    }
}

public class GetInvoicesHandler : IRequestHandler<GetInvoicesQuery, Result<PagedResult<InvoiceListDto>>>
{
    private readonly SalesDbContext _context;
    private readonly ITenantService _tenantService;

    public GetInvoicesHandler(SalesDbContext context, ITenantService tenantService)
    {
        _context = context;
        _tenantService = tenantService;
    }

    public async Task<Result<PagedResult<InvoiceListDto>>> Handle(GetInvoicesQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue)
            return Result<PagedResult<InvoiceListDto>>.Failure(Error.Unauthorized("Tenant", "Tenant not found"));

        var query = _context.Invoices
            .Include(i => i.Items)
            .Where(i => i.TenantId == tenantId.Value)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            var searchTerm = request.SearchTerm.ToLower();
            query = query.Where(i =>
                i.InvoiceNumber.ToLower().Contains(searchTerm) ||
                (i.CustomerName != null && i.CustomerName.ToLower().Contains(searchTerm)));
        }

        if (!string.IsNullOrWhiteSpace(request.Status))
        {
            if (Enum.TryParse<InvoiceStatus>(request.Status, true, out var status))
                query = query.Where(i => i.Status == status);
        }

        if (!string.IsNullOrWhiteSpace(request.Type))
        {
            if (Enum.TryParse<InvoiceType>(request.Type, true, out var type))
                query = query.Where(i => i.Type == type);
        }

        if (request.CustomerId.HasValue)
            query = query.Where(i => i.CustomerId == request.CustomerId.Value);

        if (request.SalesOrderId.HasValue)
            query = query.Where(i => i.SalesOrderId == request.SalesOrderId.Value);

        if (request.FromDate.HasValue)
            query = query.Where(i => i.InvoiceDate >= request.FromDate.Value);

        if (request.ToDate.HasValue)
            query = query.Where(i => i.InvoiceDate <= request.ToDate.Value);

        if (request.IsOverdue == true)
            query = query.Where(i => i.DueDate < DateTime.UtcNow && i.RemainingAmount > 0);

        query = request.SortBy?.ToLower() switch
        {
            "invoicenumber" => request.SortDescending
                ? query.OrderByDescending(i => i.InvoiceNumber)
                : query.OrderBy(i => i.InvoiceNumber),
            "customername" => request.SortDescending
                ? query.OrderByDescending(i => i.CustomerName)
                : query.OrderBy(i => i.CustomerName),
            "totalamount" => request.SortDescending
                ? query.OrderByDescending(i => i.TotalAmount)
                : query.OrderBy(i => i.TotalAmount),
            "duedate" => request.SortDescending
                ? query.OrderByDescending(i => i.DueDate)
                : query.OrderBy(i => i.DueDate),
            "status" => request.SortDescending
                ? query.OrderByDescending(i => i.Status)
                : query.OrderBy(i => i.Status),
            _ => request.SortDescending
                ? query.OrderByDescending(i => i.InvoiceDate)
                : query.OrderBy(i => i.InvoiceDate)
        };

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(cancellationToken);

        var result = new PagedResult<InvoiceListDto>
        {
            Items = items.Select(InvoiceListDto.FromEntity).ToList(),
            TotalCount = totalCount,
            Page = request.Page,
            PageSize = request.PageSize
        };

        return Result<PagedResult<InvoiceListDto>>.Success(result);
    }
}

public class GetInvoiceByIdHandler : IRequestHandler<GetInvoiceByIdQuery, Result<InvoiceDto>>
{
    private readonly SalesDbContext _context;
    private readonly ITenantService _tenantService;

    public GetInvoiceByIdHandler(SalesDbContext context, ITenantService tenantService)
    {
        _context = context;
        _tenantService = tenantService;
    }

    public async Task<Result<InvoiceDto>> Handle(GetInvoiceByIdQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue)
            return Result<InvoiceDto>.Failure(Error.Unauthorized("Tenant", "Tenant not found"));

        var invoice = await _context.Invoices
            .Include(i => i.Items.OrderBy(x => x.LineNumber))
            .FirstOrDefaultAsync(i => i.Id == request.Id && i.TenantId == tenantId.Value, cancellationToken);

        if (invoice == null)
            return Result<InvoiceDto>.Failure(Error.NotFound("Invoice", "Invoice not found"));

        return Result<InvoiceDto>.Success(InvoiceDto.FromEntity(invoice));
    }
}

public class IssueInvoiceHandler : IRequestHandler<IssueInvoiceCommand, Result<InvoiceDto>>
{
    private readonly SalesDbContext _context;
    private readonly ITenantService _tenantService;
    private readonly ILogger<IssueInvoiceHandler> _logger;

    public IssueInvoiceHandler(
        SalesDbContext context,
        ITenantService tenantService,
        ILogger<IssueInvoiceHandler> logger)
    {
        _context = context;
        _tenantService = tenantService;
        _logger = logger;
    }

    public async Task<Result<InvoiceDto>> Handle(IssueInvoiceCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue)
            return Result<InvoiceDto>.Failure(Error.Unauthorized("Tenant", "Tenant not found"));

        var invoice = await _context.Invoices
            .Include(i => i.Items)
            .FirstOrDefaultAsync(i => i.Id == request.Id && i.TenantId == tenantId.Value, cancellationToken);

        if (invoice == null)
            return Result<InvoiceDto>.Failure(Error.NotFound("Invoice", "Invoice not found"));

        var result = invoice.Issue();
        if (!result.IsSuccess)
            return Result<InvoiceDto>.Failure(result.Error);

        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Invoice {InvoiceId} issued for tenant {TenantId}", invoice.Id, tenantId.Value);

        return Result<InvoiceDto>.Success(InvoiceDto.FromEntity(invoice));
    }
}

public class CancelInvoiceHandler : IRequestHandler<CancelInvoiceCommand, Result<InvoiceDto>>
{
    private readonly SalesDbContext _context;
    private readonly ITenantService _tenantService;
    private readonly ILogger<CancelInvoiceHandler> _logger;

    public CancelInvoiceHandler(
        SalesDbContext context,
        ITenantService tenantService,
        ILogger<CancelInvoiceHandler> logger)
    {
        _context = context;
        _tenantService = tenantService;
        _logger = logger;
    }

    public async Task<Result<InvoiceDto>> Handle(CancelInvoiceCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue)
            return Result<InvoiceDto>.Failure(Error.Unauthorized("Tenant", "Tenant not found"));

        var invoice = await _context.Invoices
            .Include(i => i.Items)
            .FirstOrDefaultAsync(i => i.Id == request.Id && i.TenantId == tenantId.Value, cancellationToken);

        if (invoice == null)
            return Result<InvoiceDto>.Failure(Error.NotFound("Invoice", "Invoice not found"));

        var result = invoice.Cancel(request.Reason);
        if (!result.IsSuccess)
            return Result<InvoiceDto>.Failure(result.Error);

        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Invoice {InvoiceId} cancelled for tenant {TenantId}", invoice.Id, tenantId.Value);

        return Result<InvoiceDto>.Success(InvoiceDto.FromEntity(invoice));
    }
}

public class GetInvoiceStatisticsHandler : IRequestHandler<GetInvoiceStatisticsQuery, Result<InvoiceStatisticsDto>>
{
    private readonly SalesDbContext _context;
    private readonly ITenantService _tenantService;

    public GetInvoiceStatisticsHandler(SalesDbContext context, ITenantService tenantService)
    {
        _context = context;
        _tenantService = tenantService;
    }

    public async Task<Result<InvoiceStatisticsDto>> Handle(GetInvoiceStatisticsQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue)
            return Result<InvoiceStatisticsDto>.Failure(Error.Unauthorized("Tenant", "Tenant not found"));

        var query = _context.Invoices
            .Where(i => i.TenantId == tenantId.Value);

        if (request.FromDate.HasValue)
            query = query.Where(i => i.InvoiceDate >= request.FromDate.Value);

        if (request.ToDate.HasValue)
            query = query.Where(i => i.InvoiceDate <= request.ToDate.Value);

        var invoices = await query.ToListAsync(cancellationToken);

        var stats = new InvoiceStatisticsDto
        {
            TotalInvoices = invoices.Count,
            DraftInvoices = invoices.Count(i => i.Status == InvoiceStatus.Draft),
            IssuedInvoices = invoices.Count(i => i.Status == InvoiceStatus.Issued || i.Status == InvoiceStatus.Sent),
            PaidInvoices = invoices.Count(i => i.Status == InvoiceStatus.Paid),
            OverdueInvoices = invoices.Count(i => i.DueDate < DateTime.UtcNow && i.RemainingAmount > 0),
            CancelledInvoices = invoices.Count(i => i.Status == InvoiceStatus.Cancelled),
            TotalAmount = invoices.Where(i => i.Status != InvoiceStatus.Cancelled).Sum(i => i.TotalAmount),
            PaidAmount = invoices.Sum(i => i.PaidAmount),
            OutstandingAmount = invoices.Where(i => i.Status != InvoiceStatus.Cancelled && i.Status != InvoiceStatus.Paid).Sum(i => i.RemainingAmount),
            AverageInvoiceValue = invoices.Count > 0 ? invoices.Where(i => i.Status != InvoiceStatus.Cancelled).Average(i => i.TotalAmount) : 0,
            Currency = "TRY"
        };

        return Result<InvoiceStatisticsDto>.Success(stats);
    }
}

public class DeleteInvoiceHandler : IRequestHandler<DeleteInvoiceCommand, Result>
{
    private readonly SalesDbContext _context;
    private readonly ITenantService _tenantService;
    private readonly ILogger<DeleteInvoiceHandler> _logger;

    public DeleteInvoiceHandler(
        SalesDbContext context,
        ITenantService tenantService,
        ILogger<DeleteInvoiceHandler> logger)
    {
        _context = context;
        _tenantService = tenantService;
        _logger = logger;
    }

    public async Task<Result> Handle(DeleteInvoiceCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue)
            return Result.Failure(Error.Unauthorized("Tenant", "Tenant not found"));

        var invoice = await _context.Invoices
            .Include(i => i.Items)
            .FirstOrDefaultAsync(i => i.Id == request.Id && i.TenantId == tenantId.Value, cancellationToken);

        if (invoice == null)
            return Result.Failure(Error.NotFound("Invoice", "Invoice not found"));

        if (invoice.Status != InvoiceStatus.Draft && invoice.Status != InvoiceStatus.Cancelled)
            return Result.Failure(Error.Conflict("Invoice", "Only draft or cancelled invoices can be deleted"));

        _context.Invoices.Remove(invoice);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Invoice {InvoiceId} deleted for tenant {TenantId}", invoice.Id, tenantId.Value);

        return Result.Success();
    }
}
