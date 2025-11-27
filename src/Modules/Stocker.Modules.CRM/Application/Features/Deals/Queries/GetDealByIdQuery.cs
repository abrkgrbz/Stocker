using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Domain.Enums;
using Stocker.Modules.CRM.Infrastructure.Persistence;
using Stocker.SharedKernel.MultiTenancy;

namespace Stocker.Modules.CRM.Application.Features.Deals.Queries;

public class GetDealByIdQuery : IRequest<DealDto?>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public Guid Id { get; set; }
}

public class GetDealByIdQueryHandler : IRequestHandler<GetDealByIdQuery, DealDto?>
{
    private readonly CRMDbContext _context;

    public GetDealByIdQueryHandler(CRMDbContext context)
    {
        _context = context;
    }

    public async Task<DealDto?> Handle(GetDealByIdQuery request, CancellationToken cancellationToken)
    {
        var deal = await _context.Deals
            .Include(d => d.Pipeline)
            .Include(d => d.Stage)
            .Include(d => d.Products)
            .FirstOrDefaultAsync(d => d.Id == request.Id && d.TenantId == request.TenantId && d.Status != DealStatus.Deleted, cancellationToken);

        if (deal == null)
            return null;

        return new DealDto
        {
            Id = deal.Id,
            Title = deal.Name,
            Description = deal.Description,
            CustomerId = deal.CustomerId ?? Guid.Empty,
            Amount = deal.Value.Amount,
            Currency = deal.Value.Currency,
            Status = deal.Status,
            Priority = deal.Priority,
            PipelineId = deal.PipelineId,
            PipelineName = deal.Pipeline?.Name,
            StageId = deal.StageId,
            StageName = deal.Stage?.Name,
            ExpectedCloseDate = deal.ExpectedCloseDate ?? DateTime.UtcNow,
            ActualCloseDate = deal.ActualCloseDate,
            Probability = deal.Probability,
            LostReason = deal.LostReason,
            CompetitorName = deal.CompetitorName,
            OwnerId = deal.OwnerId.ToString(),
            Products = deal.Products.Select(p => new DealProductDto
            {
                Id = p.Id,
                ProductName = p.ProductName,
                ProductCode = p.ProductCode,
                Description = p.Description,
                Quantity = p.Quantity,
                UnitPrice = p.UnitPrice.Amount,
                Currency = p.UnitPrice.Currency,
                DiscountPercent = p.DiscountPercent,
                DiscountAmount = p.DiscountAmount.Amount,
                TotalPrice = p.TotalPrice.Amount,
                Tax = p.Tax,
                TaxAmount = p.TaxAmount.Amount,
                SortOrder = p.SortOrder,
                IsRecurring = p.IsRecurring,
                RecurringPeriod = p.RecurringPeriod,
                RecurringCycles = p.RecurringCycles
            }).ToList(),
            CreatedAt = deal.CreatedAt,
            UpdatedAt = deal.UpdatedAt
        };
    }
}