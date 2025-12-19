using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.Modules.CRM.Domain.Enums;
using Stocker.Modules.CRM.Interfaces;

namespace Stocker.Modules.CRM.Application.Features.Deals.Queries;

public class GetDealByIdQuery : IRequest<DealDto?>
{
    public Guid Id { get; set; }
}

/// <summary>
/// Uses ICRMUnitOfWork for consistent data access
/// </summary>
public class GetDealByIdQueryHandler : IRequestHandler<GetDealByIdQuery, DealDto?>
{
    private readonly ICRMUnitOfWork _unitOfWork;

    public GetDealByIdQueryHandler(ICRMUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<DealDto?> Handle(GetDealByIdQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;
        var deal = await _unitOfWork.ReadRepository<Deal>().AsQueryable()
            .Include(d => d.Pipeline)
            .Include(d => d.Stage)
            .Include(d => d.Products)
            .FirstOrDefaultAsync(d => d.Id == request.Id && d.TenantId == tenantId && d.Status != DealStatus.Deleted, cancellationToken);

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
