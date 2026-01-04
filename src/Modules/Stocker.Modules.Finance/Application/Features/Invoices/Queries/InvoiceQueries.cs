using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Finance.Application.DTOs;
using Stocker.Modules.Finance.Application.Features.Invoices.Commands;
using Stocker.Modules.Finance.Domain.Entities;
using Stocker.Modules.Finance.Domain.Enums;
using Stocker.Modules.Finance.Interfaces;
using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Pagination;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Finance.Application.Features.Invoices.Queries;

/// <summary>
/// Query to get paginated invoices
/// </summary>
public class GetInvoicesQuery : IRequest<Result<PagedResult<InvoiceSummaryDto>>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public InvoiceFilterDto? Filter { get; set; }
}

/// <summary>
/// Handler for GetInvoicesQuery
/// </summary>
public class GetInvoicesQueryHandler : IRequestHandler<GetInvoicesQuery, Result<PagedResult<InvoiceSummaryDto>>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public GetInvoicesQueryHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<PagedResult<InvoiceSummaryDto>>> Handle(GetInvoicesQuery request, CancellationToken cancellationToken)
    {
        var pageNumber = request.Filter?.PageNumber ?? 1;
        var pageSize = request.Filter?.PageSize ?? 20;

        var query = _unitOfWork.Invoices.AsQueryable();

        // Apply filters
        if (request.Filter != null)
        {
            if (!string.IsNullOrEmpty(request.Filter.SearchTerm))
            {
                var searchTerm = request.Filter.SearchTerm.ToLower();
                query = query.Where(i =>
                    i.InvoiceNumber.ToLower().Contains(searchTerm) ||
                    i.CurrentAccountName.ToLower().Contains(searchTerm));
            }

            if (request.Filter.InvoiceType.HasValue)
            {
                query = query.Where(i => i.InvoiceType == request.Filter.InvoiceType.Value);
            }

            if (request.Filter.EInvoiceType.HasValue)
            {
                query = query.Where(i => i.EInvoiceType == request.Filter.EInvoiceType.Value);
            }

            if (request.Filter.Status.HasValue)
            {
                query = query.Where(i => i.Status == request.Filter.Status.Value);
            }

            if (request.Filter.CurrentAccountId.HasValue)
            {
                query = query.Where(i => i.CurrentAccountId == request.Filter.CurrentAccountId.Value);
            }

            if (request.Filter.StartDate.HasValue)
            {
                query = query.Where(i => i.InvoiceDate >= request.Filter.StartDate.Value);
            }

            if (request.Filter.EndDate.HasValue)
            {
                query = query.Where(i => i.InvoiceDate <= request.Filter.EndDate.Value);
            }

            if (request.Filter.DueDateStart.HasValue)
            {
                query = query.Where(i => i.DueDate >= request.Filter.DueDateStart.Value);
            }

            if (request.Filter.DueDateEnd.HasValue)
            {
                query = query.Where(i => i.DueDate <= request.Filter.DueDateEnd.Value);
            }

            if (request.Filter.IsOverdue.HasValue && request.Filter.IsOverdue.Value)
            {
                var today = DateTime.Today;
                query = query.Where(i => i.DueDate < today && i.RemainingAmount.Amount > 0);
            }
        }

        // Get total count
        var totalCount = await query.CountAsync(cancellationToken);

        // Apply sorting
        query = request.Filter?.SortBy?.ToLower() switch
        {
            "invoicenumber" => request.Filter.SortDescending ? query.OrderByDescending(i => i.InvoiceNumber) : query.OrderBy(i => i.InvoiceNumber),
            "currentaccountname" => request.Filter.SortDescending ? query.OrderByDescending(i => i.CurrentAccountName) : query.OrderBy(i => i.CurrentAccountName),
            "grandtotal" => request.Filter.SortDescending ? query.OrderByDescending(i => i.GrandTotal.Amount) : query.OrderBy(i => i.GrandTotal.Amount),
            "duedate" => request.Filter.SortDescending ? query.OrderByDescending(i => i.DueDate) : query.OrderBy(i => i.DueDate),
            "status" => request.Filter.SortDescending ? query.OrderByDescending(i => i.Status) : query.OrderBy(i => i.Status),
            _ => request.Filter?.SortDescending == true ? query.OrderByDescending(i => i.InvoiceDate) : query.OrderBy(i => i.InvoiceDate)
        };

        // Apply pagination
        var invoices = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        // Map to DTOs
        var dtos = invoices.Select(MapToSummaryDto).ToList();

        var result = new PagedResult<InvoiceSummaryDto>(dtos, totalCount, pageNumber, pageSize);
        return Result<PagedResult<InvoiceSummaryDto>>.Success(result);
    }

    private static InvoiceSummaryDto MapToSummaryDto(Invoice invoice)
    {
        return new InvoiceSummaryDto
        {
            Id = invoice.Id,
            InvoiceNumber = invoice.InvoiceNumber,
            InvoiceDate = invoice.InvoiceDate,
            InvoiceType = invoice.InvoiceType,
            EInvoiceType = invoice.EInvoiceType,
            Status = invoice.Status,
            CurrentAccountName = invoice.CurrentAccountName,
            GrandTotal = invoice.GrandTotal.Amount,
            RemainingAmount = invoice.RemainingAmount.Amount,
            Currency = invoice.Currency,
            DueDate = invoice.DueDate
        };
    }
}

/// <summary>
/// Query to get an invoice by ID
/// </summary>
public class GetInvoiceByIdQuery : IRequest<Result<InvoiceDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
}

/// <summary>
/// Handler for GetInvoiceByIdQuery
/// </summary>
public class GetInvoiceByIdQueryHandler : IRequestHandler<GetInvoiceByIdQuery, Result<InvoiceDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public GetInvoiceByIdQueryHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<InvoiceDto>> Handle(GetInvoiceByIdQuery request, CancellationToken cancellationToken)
    {
        var invoice = await _unitOfWork.Invoices.GetWithDetailsAsync(request.Id, cancellationToken);
        if (invoice == null)
        {
            return Result<InvoiceDto>.Failure(
                Error.NotFound("Invoice", $"ID {request.Id} ile fatura bulunamadı"));
        }

        var dto = CreateInvoiceCommandHandler.MapToDto(invoice);
        return Result<InvoiceDto>.Success(dto);
    }
}

/// <summary>
/// Query to get an invoice by invoice number
/// </summary>
public class GetInvoiceByNumberQuery : IRequest<Result<InvoiceDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public string InvoiceNumber { get; set; } = null!;
}

/// <summary>
/// Handler for GetInvoiceByNumberQuery
/// </summary>
public class GetInvoiceByNumberQueryHandler : IRequestHandler<GetInvoiceByNumberQuery, Result<InvoiceDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public GetInvoiceByNumberQueryHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<InvoiceDto>> Handle(GetInvoiceByNumberQuery request, CancellationToken cancellationToken)
    {
        var invoice = await _unitOfWork.Invoices.GetByInvoiceNumberAsync(request.InvoiceNumber, cancellationToken);
        if (invoice == null)
        {
            return Result<InvoiceDto>.Failure(
                Error.NotFound("Invoice", $"Fatura numarası {request.InvoiceNumber} ile fatura bulunamadı"));
        }

        // Get with details
        var invoiceWithDetails = await _unitOfWork.Invoices.GetWithDetailsAsync(invoice.Id, cancellationToken);
        var dto = CreateInvoiceCommandHandler.MapToDto(invoiceWithDetails!);
        return Result<InvoiceDto>.Success(dto);
    }
}

/// <summary>
/// Query to get overdue invoices
/// </summary>
public class GetOverdueInvoicesQuery : IRequest<Result<List<InvoiceSummaryDto>>>, ITenantRequest
{
    public Guid TenantId { get; set; }
}

/// <summary>
/// Handler for GetOverdueInvoicesQuery
/// </summary>
public class GetOverdueInvoicesQueryHandler : IRequestHandler<GetOverdueInvoicesQuery, Result<List<InvoiceSummaryDto>>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public GetOverdueInvoicesQueryHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<List<InvoiceSummaryDto>>> Handle(GetOverdueInvoicesQuery request, CancellationToken cancellationToken)
    {
        var invoices = await _unitOfWork.Invoices.GetOverdueInvoicesAsync(cancellationToken);
        var dtos = invoices.Select(i => new InvoiceSummaryDto
        {
            Id = i.Id,
            InvoiceNumber = i.InvoiceNumber,
            InvoiceDate = i.InvoiceDate,
            InvoiceType = i.InvoiceType,
            EInvoiceType = i.EInvoiceType,
            Status = i.Status,
            CurrentAccountName = i.CurrentAccountName,
            GrandTotal = i.GrandTotal.Amount,
            RemainingAmount = i.RemainingAmount.Amount,
            Currency = i.Currency,
            DueDate = i.DueDate
        }).ToList();

        return Result<List<InvoiceSummaryDto>>.Success(dtos);
    }
}
