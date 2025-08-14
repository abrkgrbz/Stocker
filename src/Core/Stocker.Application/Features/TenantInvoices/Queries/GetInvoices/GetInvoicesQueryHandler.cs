using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Application.DTOs.TenantInvoice;
using Stocker.Application.Extensions;
using Stocker.Domain.Tenant.Enums;
using Stocker.SharedKernel.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.TenantInvoices.Queries.GetInvoices;

public class GetInvoicesQueryHandler : IRequestHandler<GetInvoicesQuery, Result<List<TenantInvoiceDto>>>
{
    private readonly ITenantUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly ILogger<GetInvoicesQueryHandler> _logger;

    public GetInvoicesQueryHandler(
        ITenantUnitOfWork unitOfWork,
        IMapper mapper,
        ILogger<GetInvoicesQueryHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<Result<List<TenantInvoiceDto>>> Handle(GetInvoicesQuery request, CancellationToken cancellationToken)
    {
        try
        {
            var tenantId = _unitOfWork.TenantId;

            var query = _unitOfWork.Invoices()
                .AsQueryable()
                .Include(i => i.Items)
                .Where(i => i.TenantId == tenantId);

            // Apply filters
            if (!string.IsNullOrEmpty(request.Status))
            {
                if (Enum.TryParse<InvoiceStatus>(request.Status, out var status))
                {
                    query = query.Where(i => i.Status == status);
                }
            }

            if (request.CustomerId.HasValue)
            {
                query = query.Where(i => i.CustomerId == request.CustomerId.Value);
            }

            if (request.StartDate.HasValue)
            {
                query = query.Where(i => i.InvoiceDate >= request.StartDate.Value);
            }

            if (request.EndDate.HasValue)
            {
                query = query.Where(i => i.InvoiceDate <= request.EndDate.Value);
            }

            // Apply pagination
            var skip = (request.PageNumber - 1) * request.PageSize;
            var invoices = await query
                .OrderByDescending(i => i.InvoiceDate)
                .Skip(skip)
                .Take(request.PageSize)
                .ToListAsync(cancellationToken);

            // Map to DTOs
            var dtos = _mapper.Map<List<TenantInvoiceDto>>(invoices);

            return Result<List<TenantInvoiceDto>>.Success(dtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting invoices");
            return Result<List<TenantInvoiceDto>>.Failure(
                Error.Failure("Invoice.GetFailed", "Faturalar alınırken hata oluştu"));
        }
    }
}