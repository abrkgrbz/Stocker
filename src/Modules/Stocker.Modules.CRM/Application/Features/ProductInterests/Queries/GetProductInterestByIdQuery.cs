using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.Modules.CRM.Interfaces;

namespace Stocker.Modules.CRM.Application.Features.ProductInterests.Queries;

public class GetProductInterestByIdQuery : IRequest<ProductInterestDto?>
{
    public Guid Id { get; set; }
}

/// <summary>
/// Uses ICRMUnitOfWork for consistent data access
/// </summary>
public class GetProductInterestByIdQueryHandler : IRequestHandler<GetProductInterestByIdQuery, ProductInterestDto?>
{
    private readonly ICRMUnitOfWork _unitOfWork;

    public GetProductInterestByIdQueryHandler(ICRMUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async System.Threading.Tasks.Task<ProductInterestDto?> Handle(GetProductInterestByIdQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var entity = await _unitOfWork.ReadRepository<ProductInterest>().AsQueryable()
            .Include(p => p.Customer)
            .Include(p => p.Contact)
            .Include(p => p.Lead)
            .Include(p => p.Opportunity)
            .Include(p => p.Campaign)
            .FirstOrDefaultAsync(p => p.Id == request.Id && p.TenantId == tenantId, cancellationToken);

        if (entity == null)
            return null;

        return new ProductInterestDto
        {
            Id = entity.Id,
            InterestLevel = entity.InterestLevel,
            Status = entity.Status,
            Source = entity.Source,
            CustomerId = entity.CustomerId,
            CustomerName = entity.Customer?.CompanyName,
            ContactId = entity.ContactId,
            ContactName = entity.Contact?.FullName,
            LeadId = entity.LeadId,
            LeadName = entity.Lead != null ? entity.Lead.FirstName + " " + entity.Lead.LastName : null,
            OpportunityId = entity.OpportunityId,
            OpportunityName = entity.Opportunity?.Name,
            ProductId = entity.ProductId,
            ProductName = entity.ProductName,
            ProductCategory = entity.ProductCategory,
            InterestedQuantity = entity.InterestedQuantity,
            Unit = entity.Unit,
            EstimatedBudget = entity.EstimatedBudget,
            Currency = entity.Currency,
            QuotedPrice = entity.QuotedPrice,
            InterestDate = entity.InterestDate,
            ExpectedPurchaseDate = entity.ExpectedPurchaseDate,
            LastInteractionDate = entity.LastInteractionDate,
            FollowUpDate = entity.FollowUpDate,
            InterestReason = entity.InterestReason,
            Requirements = entity.Requirements,
            Notes = entity.Notes,
            CompetitorProducts = entity.CompetitorProducts,
            NotPurchasedReason = entity.NotPurchasedReason,
            InterestScore = entity.InterestScore,
            PurchaseProbability = entity.PurchaseProbability,
            CampaignId = entity.CampaignId,
            CampaignName = entity.Campaign?.Name,
            PromoCode = entity.PromoCode
        };
    }
}
