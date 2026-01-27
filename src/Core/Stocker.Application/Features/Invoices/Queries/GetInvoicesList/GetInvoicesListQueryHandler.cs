using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Application.DTOs.Invoice;
using Stocker.Application.Extensions;
using Stocker.Domain.Master.Entities;
using Stocker.SharedKernel.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Invoices.Queries.GetInvoicesList;

public class GetInvoicesListQueryHandler : IRequestHandler<GetInvoicesListQuery, Result<InvoicesListResponse>>
{
    private readonly IMasterUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly ILogger<GetInvoicesListQueryHandler> _logger;

    public GetInvoicesListQueryHandler(
        IMasterUnitOfWork unitOfWork,
        IMapper mapper,
        ILogger<GetInvoicesListQueryHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<Result<InvoicesListResponse>> Handle(GetInvoicesListQuery request, CancellationToken cancellationToken)
    {
        try
        {
            var query = _unitOfWork.Repository<Invoice>()
                .AsQueryable()
                .Include(i => i.Items)
                .AsQueryable();

            // Apply filters
            if (request.TenantId.HasValue)
            {
                query = query.Where(i => i.TenantId == request.TenantId.Value);
            }

            if (request.Status.HasValue)
            {
                query = query.Where(i => i.Status == request.Status.Value);
            }

            if (request.FromDate.HasValue)
            {
                query = query.Where(i => i.IssueDate >= request.FromDate.Value);
            }

            if (request.ToDate.HasValue)
            {
                query = query.Where(i => i.IssueDate <= request.ToDate.Value);
            }

            // Get total count
            var totalCount = await query.CountAsync(cancellationToken);

            // Calculate summary
            var allInvoices = await query.ToListAsync(cancellationToken);
            var summary = new InvoiceSummary
            {
                TotalInvoices = totalCount,
                TotalAmount = allInvoices.Sum(i => i.TotalAmount.Amount),
                TotalPaid = allInvoices.Where(i => i.Status == Domain.Master.Enums.InvoiceStatus.Odendi).Sum(i => i.TotalAmount.Amount),
                TotalPending = allInvoices.Where(i => i.Status == Domain.Master.Enums.InvoiceStatus.Gonderildi || i.Status == Domain.Master.Enums.InvoiceStatus.KismiOdendi).Sum(i => i.TotalAmount.Amount),
                TotalOverdue = allInvoices.Where(i => i.Status == Domain.Master.Enums.InvoiceStatus.Gecikti).Sum(i => i.TotalAmount.Amount)
            };

            // Apply pagination
            var invoices = await query
                .OrderByDescending(i => i.IssueDate)
                .Skip((request.PageNumber - 1) * request.PageSize)
                .Take(request.PageSize)
                .ToListAsync(cancellationToken);

            // Map to DTOs
            var invoiceDtos = invoices.Select(i => new InvoiceDto
            {
                Id = i.Id,
                InvoiceNumber = i.InvoiceNumber,
                TenantId = i.TenantId,
                SubscriptionId = i.SubscriptionId,
                InvoiceDate = i.IssueDate,
                DueDate = i.DueDate,
                Subtotal = i.Subtotal.Amount,
                TaxAmount = i.TaxAmount.Amount,
                TotalAmount = i.TotalAmount.Amount,
                PaidAmount = i.PaidAmount.Amount,
                Status = i.Status,
                PaymentDate = i.PaidDate,
                ItemCount = i.Items.Count
            }).ToList();

            var response = new InvoicesListResponse
            {
                Data = invoiceDtos,
                TotalCount = totalCount,
                Summary = summary
            };

            return Result<InvoicesListResponse>.Success(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving invoices list");
            return Result<InvoicesListResponse>.Failure(DomainErrors.General.UnProcessableRequest);
        }
    }
}
