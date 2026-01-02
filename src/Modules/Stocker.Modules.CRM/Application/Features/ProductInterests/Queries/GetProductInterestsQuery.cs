using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.Modules.CRM.Interfaces;
using Stocker.SharedKernel.Pagination;

namespace Stocker.Modules.CRM.Application.Features.ProductInterests.Queries;

public class GetProductInterestsQuery : IRequest<PagedResult<ProductInterestDto>>
{
    public InterestLevel? InterestLevel { get; set; }
    public InterestStatus? Status { get; set; }
    public InterestSource? Source { get; set; }
    public Guid? CustomerId { get; set; }
    public Guid? ContactId { get; set; }
    public Guid? LeadId { get; set; }
    public Guid? OpportunityId { get; set; }
    public int? ProductId { get; set; }
    public Guid? CampaignId { get; set; }
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 10;
}

/// <summary>
/// Uses ICRMUnitOfWork for consistent data access
/// </summary>
public class GetProductInterestsQueryHandler : IRequestHandler<GetProductInterestsQuery, PagedResult<ProductInterestDto>>
{
    private readonly ICRMUnitOfWork _unitOfWork;

    public GetProductInterestsQueryHandler(ICRMUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async System.Threading.Tasks.Task<PagedResult<ProductInterestDto>> Handle(GetProductInterestsQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var query = _unitOfWork.ReadRepository<ProductInterest>().AsQueryable()
            .Include(p => p.Customer)
            .Include(p => p.Contact)
            .Include(p => p.Lead)
            .Include(p => p.Opportunity)
            .Include(p => p.Campaign)
            .Where(p => p.TenantId == tenantId);

        if (request.InterestLevel.HasValue)
            query = query.Where(p => p.InterestLevel == request.InterestLevel.Value);

        if (request.Status.HasValue)
            query = query.Where(p => p.Status == request.Status.Value);

        if (request.Source.HasValue)
            query = query.Where(p => p.Source == request.Source.Value);

        if (request.CustomerId.HasValue)
            query = query.Where(p => p.CustomerId == request.CustomerId.Value);

        if (request.ContactId.HasValue)
            query = query.Where(p => p.ContactId == request.ContactId.Value);

        if (request.LeadId.HasValue)
            query = query.Where(p => p.LeadId == request.LeadId.Value);

        if (request.OpportunityId.HasValue)
            query = query.Where(p => p.OpportunityId == request.OpportunityId.Value);

        if (request.ProductId.HasValue)
            query = query.Where(p => p.ProductId == request.ProductId.Value);

        if (request.CampaignId.HasValue)
            query = query.Where(p => p.CampaignId == request.CampaignId.Value);

        if (request.FromDate.HasValue)
            query = query.Where(p => p.InterestDate >= request.FromDate.Value);

        if (request.ToDate.HasValue)
            query = query.Where(p => p.InterestDate <= request.ToDate.Value);

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderByDescending(p => p.InterestDate)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(p => new ProductInterestDto
            {
                Id = p.Id,
                InterestLevel = p.InterestLevel,
                Status = p.Status,
                Source = p.Source,
                CustomerId = p.CustomerId,
                CustomerName = p.Customer != null ? p.Customer.CompanyName : null,
                ContactId = p.ContactId,
                ContactName = p.Contact != null ? p.Contact.FullName : null,
                LeadId = p.LeadId,
                LeadName = p.Lead != null ? p.Lead.FirstName + " " + p.Lead.LastName : null,
                OpportunityId = p.OpportunityId,
                OpportunityName = p.Opportunity != null ? p.Opportunity.Name : null,
                ProductId = p.ProductId,
                ProductName = p.ProductName,
                ProductCategory = p.ProductCategory,
                InterestedQuantity = p.InterestedQuantity,
                Unit = p.Unit,
                EstimatedBudget = p.EstimatedBudget,
                Currency = p.Currency,
                QuotedPrice = p.QuotedPrice,
                InterestDate = p.InterestDate,
                ExpectedPurchaseDate = p.ExpectedPurchaseDate,
                LastInteractionDate = p.LastInteractionDate,
                FollowUpDate = p.FollowUpDate,
                InterestReason = p.InterestReason,
                Requirements = p.Requirements,
                Notes = p.Notes,
                CompetitorProducts = p.CompetitorProducts,
                NotPurchasedReason = p.NotPurchasedReason,
                InterestScore = p.InterestScore,
                PurchaseProbability = p.PurchaseProbability,
                CampaignId = p.CampaignId,
                CampaignName = p.Campaign != null ? p.Campaign.Name : null,
                PromoCode = p.PromoCode
            })
            .ToListAsync(cancellationToken);

        return new PagedResult<ProductInterestDto>(items, request.Page, request.PageSize, totalCount);
    }
}
