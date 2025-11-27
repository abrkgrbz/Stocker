using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Infrastructure.Persistence;
using Stocker.SharedKernel.MultiTenancy;

namespace Stocker.Modules.CRM.Application.Features.Opportunities.Queries;

public class GetOpportunityByIdQuery : IRequest<OpportunityDto?>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public Guid Id { get; set; }
}

public class GetOpportunityByIdQueryHandler : IRequestHandler<GetOpportunityByIdQuery, OpportunityDto?>
{
    private readonly CRMDbContext _context;

    public GetOpportunityByIdQueryHandler(CRMDbContext context)
    {
        _context = context;
    }

    public async Task<OpportunityDto?> Handle(GetOpportunityByIdQuery request, CancellationToken cancellationToken)
    {
        var opportunity = await _context.Opportunities
            .Include(o => o.Pipeline)
            .Include(o => o.Stage)
            .Include(o => o.Products)
            .FirstOrDefaultAsync(o => o.Id == request.Id && o.TenantId == request.TenantId, cancellationToken);

        if (opportunity == null)
            return null;

        return new OpportunityDto
        {
            Id = opportunity.Id,
            Name = opportunity.Name,
            Description = opportunity.Description,
            CustomerId = opportunity.CustomerId ?? Guid.Empty,
            Amount = opportunity.Amount.Amount,
            Currency = opportunity.Amount.Currency,
            Probability = opportunity.Probability,
            ExpectedCloseDate = opportunity.ExpectedCloseDate,
            Status = opportunity.Status,
            PipelineId = opportunity.PipelineId,
            PipelineName = opportunity.Pipeline?.Name,
            CurrentStageId = opportunity.StageId,
            CurrentStageName = opportunity.Stage?.Name,
            LostReason = opportunity.LostReason,
            CompetitorName = opportunity.CompetitorName,
            OwnerId = opportunity.OwnerId.ToString(),
            Products = opportunity.Products.Select(p => new OpportunityProductDto
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
                SortOrder = p.SortOrder
            }).ToList(),
            CreatedAt = opportunity.CreatedAt,
            UpdatedAt = opportunity.UpdatedAt
        };
    }
}