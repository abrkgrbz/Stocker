using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Modules.Sales.Application.DTOs;
using Stocker.Modules.Sales.Application.Features.Invoices.Commands;
using Stocker.Modules.Sales.Application.Features.Invoices.Queries;
using Stocker.Modules.Sales.Domain.Entities;
using Stocker.Modules.Sales.Interfaces;
using Stocker.SharedKernel.Pagination;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Sales.Application.Features.Invoices.Handlers;

/// <summary>
/// Handler for CreateInvoiceCommand
/// Uses ISalesUnitOfWork for consistent data access
/// </summary>
public class CreateInvoiceHandler : IRequestHandler<CreateInvoiceCommand, Result<InvoiceDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;
    private readonly ILogger<CreateInvoiceHandler> _logger;

    public CreateInvoiceHandler(
        ISalesUnitOfWork unitOfWork,
        ILogger<CreateInvoiceHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<Result<InvoiceDto>> Handle(CreateInvoiceCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var invoiceNumber = await _unitOfWork.Invoices.GenerateInvoiceNumberAsync(cancellationToken);

        var invoiceResult = Invoice.Create(
            tenantId,
            invoiceNumber,
            request.InvoiceDate,
            request.Type,
            request.SalesOrderId,
            null, // salesOrderNumber - will be set separately if needed
            request.CustomerId,
            request.CustomerName,
            request.CustomerEmail,
            null, // customerPhone
            request.CustomerTaxNumber,
            null, // customerTaxOffice
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
                tenantId,
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

        await _unitOfWork.Invoices.AddAsync(invoice, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Invoice {InvoiceNumber} created for tenant {TenantId}", invoiceNumber, tenantId);

        var savedInvoice = await _unitOfWork.Invoices.GetWithItemsAsync(invoice.Id, cancellationToken);

        return Result<InvoiceDto>.Success(InvoiceDto.FromEntity(savedInvoice!));
    }
}

/// <summary>
/// Handler for CreateInvoiceFromOrderCommand
/// Uses ISalesUnitOfWork for consistent data access
/// </summary>
public class CreateInvoiceFromOrderHandler : IRequestHandler<CreateInvoiceFromOrderCommand, Result<InvoiceDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;
    private readonly IMediator _mediator;
    private readonly ILogger<CreateInvoiceFromOrderHandler> _logger;

    public CreateInvoiceFromOrderHandler(
        ISalesUnitOfWork unitOfWork,
        IMediator mediator,
        ILogger<CreateInvoiceFromOrderHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _mediator = mediator;
        _logger = logger;
    }

    public async Task<Result<InvoiceDto>> Handle(CreateInvoiceFromOrderCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var order = await _unitOfWork.SalesOrders.GetWithItemsAsync(request.SalesOrderId, cancellationToken);

        if (order == null || order.TenantId != tenantId)
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

/// <summary>
/// Handler for GetInvoicesQuery
/// Uses ISalesUnitOfWork for consistent data access
/// </summary>
public class GetInvoicesHandler : IRequestHandler<GetInvoicesQuery, Result<PagedResult<InvoiceListDto>>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public GetInvoicesHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<PagedResult<InvoiceListDto>>> Handle(GetInvoicesQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var query = _unitOfWork.Invoices.AsQueryable()
            .Include(i => i.Items)
            .Where(i => i.TenantId == tenantId)
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

        var result = new PagedResult<InvoiceListDto>(
            items.Select(InvoiceListDto.FromEntity),
            request.Page,
            request.PageSize,
            totalCount);

        return Result<PagedResult<InvoiceListDto>>.Success(result);
    }
}

/// <summary>
/// Handler for GetInvoiceByIdQuery
/// Uses ISalesUnitOfWork for consistent data access
/// </summary>
public class GetInvoiceByIdHandler : IRequestHandler<GetInvoiceByIdQuery, Result<InvoiceDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public GetInvoiceByIdHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<InvoiceDto>> Handle(GetInvoiceByIdQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var invoice = await _unitOfWork.Invoices.GetWithItemsAsync(request.Id, cancellationToken);

        if (invoice == null || invoice.TenantId != tenantId)
            return Result<InvoiceDto>.Failure(Error.NotFound("Invoice", "Invoice not found"));

        return Result<InvoiceDto>.Success(InvoiceDto.FromEntity(invoice));
    }
}

/// <summary>
/// Handler for IssueInvoiceCommand
/// Uses ISalesUnitOfWork for consistent data access
/// </summary>
public class IssueInvoiceHandler : IRequestHandler<IssueInvoiceCommand, Result<InvoiceDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;
    private readonly ILogger<IssueInvoiceHandler> _logger;

    public IssueInvoiceHandler(
        ISalesUnitOfWork unitOfWork,
        ILogger<IssueInvoiceHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<Result<InvoiceDto>> Handle(IssueInvoiceCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var invoice = await _unitOfWork.Invoices.GetWithItemsAsync(request.Id, cancellationToken);

        if (invoice == null || invoice.TenantId != tenantId)
            return Result<InvoiceDto>.Failure(Error.NotFound("Invoice", "Invoice not found"));

        var result = invoice.Issue();
        if (!result.IsSuccess)
            return Result<InvoiceDto>.Failure(result.Error);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Invoice {InvoiceId} issued for tenant {TenantId}", invoice.Id, tenantId);

        return Result<InvoiceDto>.Success(InvoiceDto.FromEntity(invoice));
    }
}

/// <summary>
/// Handler for CancelInvoiceCommand
/// Uses ISalesUnitOfWork for consistent data access
/// </summary>
public class CancelInvoiceHandler : IRequestHandler<CancelInvoiceCommand, Result<InvoiceDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;
    private readonly ILogger<CancelInvoiceHandler> _logger;

    public CancelInvoiceHandler(
        ISalesUnitOfWork unitOfWork,
        ILogger<CancelInvoiceHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<Result<InvoiceDto>> Handle(CancelInvoiceCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var invoice = await _unitOfWork.Invoices.GetWithItemsAsync(request.Id, cancellationToken);

        if (invoice == null || invoice.TenantId != tenantId)
            return Result<InvoiceDto>.Failure(Error.NotFound("Invoice", "Invoice not found"));

        var result = invoice.Cancel(request.Reason);
        if (!result.IsSuccess)
            return Result<InvoiceDto>.Failure(result.Error);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Invoice {InvoiceId} cancelled for tenant {TenantId}", invoice.Id, tenantId);

        return Result<InvoiceDto>.Success(InvoiceDto.FromEntity(invoice));
    }
}

/// <summary>
/// Handler for GetInvoiceStatisticsQuery
/// Uses ISalesUnitOfWork for consistent data access
/// </summary>
public class GetInvoiceStatisticsHandler : IRequestHandler<GetInvoiceStatisticsQuery, Result<InvoiceStatisticsDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public GetInvoiceStatisticsHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<InvoiceStatisticsDto>> Handle(GetInvoiceStatisticsQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var query = _unitOfWork.Invoices.AsQueryable()
            .Where(i => i.TenantId == tenantId);

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

/// <summary>
/// Handler for DeleteInvoiceCommand
/// Uses ISalesUnitOfWork for consistent data access
/// </summary>
public class DeleteInvoiceHandler : IRequestHandler<DeleteInvoiceCommand, Result>
{
    private readonly ISalesUnitOfWork _unitOfWork;
    private readonly ILogger<DeleteInvoiceHandler> _logger;

    public DeleteInvoiceHandler(
        ISalesUnitOfWork unitOfWork,
        ILogger<DeleteInvoiceHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<Result> Handle(DeleteInvoiceCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var invoice = await _unitOfWork.Invoices.GetWithItemsAsync(request.Id, cancellationToken);

        if (invoice == null || invoice.TenantId != tenantId)
            return Result.Failure(Error.NotFound("Invoice", "Invoice not found"));

        if (invoice.Status != InvoiceStatus.Draft && invoice.Status != InvoiceStatus.Cancelled)
            return Result.Failure(Error.Conflict("Invoice", "Only draft or cancelled invoices can be deleted"));

        _unitOfWork.Invoices.Remove(invoice);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Invoice {InvoiceId} deleted for tenant {TenantId}", invoice.Id, tenantId);

        return Result.Success();
    }
}
