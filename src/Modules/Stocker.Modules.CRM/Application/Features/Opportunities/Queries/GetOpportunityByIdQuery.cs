using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Interfaces;

namespace Stocker.Modules.CRM.Application.Features.Opportunities.Queries;

public class GetOpportunityByIdQuery : IRequest<OpportunityDto?>
{
    public Guid Id { get; set; }
}

/// <summary>
/// Uses ICRMUnitOfWork for consistent data access
/// </summary>
public class GetOpportunityByIdQueryHandler : IRequestHandler<GetOpportunityByIdQuery, OpportunityDto?>
{
    private readonly ICRMUnitOfWork _unitOfWork;

    public GetOpportunityByIdQueryHandler(ICRMUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<OpportunityDto?> Handle(GetOpportunityByIdQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var opportunity = await _unitOfWork.ReadRepository<Domain.Entities.Opportunity>().AsQueryable()
            .Include(o => o.Pipeline)
            .Include(o => o.Stage)
            .Include(o => o.Products)
            .FirstOrDefaultAsync(o => o.Id == request.Id && o.TenantId == tenantId, cancellationToken);

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