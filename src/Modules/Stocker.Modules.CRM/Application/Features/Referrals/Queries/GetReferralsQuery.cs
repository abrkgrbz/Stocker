using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.Modules.CRM.Infrastructure.Persistence;
using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Pagination;

namespace Stocker.Modules.CRM.Application.Features.Referrals.Queries;

public class GetReferralsQuery : IRequest<PagedResult<ReferralDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public ReferralStatus? Status { get; set; }
    public ReferralType? ReferralType { get; set; }
    public Guid? ReferrerCustomerId { get; set; }
    public Guid? ReferredCustomerId { get; set; }
    public Guid? ReferredLeadId { get; set; }
    public Guid? CampaignId { get; set; }
    public Guid? OpportunityId { get; set; }
    public Guid? DealId { get; set; }
    public int? AssignedToUserId { get; set; }
    public bool? RewardPaid { get; set; }
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
    public string? SearchTerm { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 10;
}

public class GetReferralsQueryHandler : IRequestHandler<GetReferralsQuery, PagedResult<ReferralDto>>
{
    private readonly CRMDbContext _context;

    public GetReferralsQueryHandler(CRMDbContext context)
    {
        _context = context;
    }

    public async System.Threading.Tasks.Task<PagedResult<ReferralDto>> Handle(GetReferralsQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Referrals
            .Include(r => r.ReferrerCustomer)
            .Include(r => r.ReferrerContact)
            .Include(r => r.ReferredCustomer)
            .Include(r => r.ReferredLead)
            .Include(r => r.Campaign)
            .Include(r => r.Opportunity)
            .Include(r => r.Deal)
            .Where(r => r.TenantId == request.TenantId);

        if (request.Status.HasValue)
            query = query.Where(r => r.Status == request.Status.Value);

        if (request.ReferralType.HasValue)
            query = query.Where(r => r.ReferralType == request.ReferralType.Value);

        if (request.ReferrerCustomerId.HasValue)
            query = query.Where(r => r.ReferrerCustomerId == request.ReferrerCustomerId.Value);

        if (request.ReferredCustomerId.HasValue)
            query = query.Where(r => r.ReferredCustomerId == request.ReferredCustomerId.Value);

        if (request.ReferredLeadId.HasValue)
            query = query.Where(r => r.ReferredLeadId == request.ReferredLeadId.Value);

        if (request.CampaignId.HasValue)
            query = query.Where(r => r.CampaignId == request.CampaignId.Value);

        if (request.OpportunityId.HasValue)
            query = query.Where(r => r.OpportunityId == request.OpportunityId.Value);

        if (request.DealId.HasValue)
            query = query.Where(r => r.DealId == request.DealId.Value);

        if (request.AssignedToUserId.HasValue)
            query = query.Where(r => r.AssignedToUserId == request.AssignedToUserId.Value);

        if (request.RewardPaid.HasValue)
            query = query.Where(r => r.RewardPaid == request.RewardPaid.Value);

        if (request.FromDate.HasValue)
            query = query.Where(r => r.ReferralDate >= request.FromDate.Value);

        if (request.ToDate.HasValue)
            query = query.Where(r => r.ReferralDate <= request.ToDate.Value);

        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            var searchTerm = request.SearchTerm.ToLower();
            query = query.Where(r => r.ReferralCode.ToLower().Contains(searchTerm) ||
                                   r.ReferrerName.ToLower().Contains(searchTerm) ||
                                   r.ReferredName.ToLower().Contains(searchTerm));
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderByDescending(r => r.ReferralDate)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(r => new ReferralDto
            {
                Id = r.Id,
                ReferralCode = r.ReferralCode,
                Status = r.Status,
                ReferralType = r.ReferralType,
                ReferrerCustomerId = r.ReferrerCustomerId,
                ReferrerCustomerName = r.ReferrerCustomer != null ? r.ReferrerCustomer.CompanyName : null,
                ReferrerContactId = r.ReferrerContactId,
                ReferrerContactName = r.ReferrerContact != null ? r.ReferrerContact.FullName : null,
                ReferrerName = r.ReferrerName,
                ReferrerEmail = r.ReferrerEmail,
                ReferrerPhone = r.ReferrerPhone,
                ReferredCustomerId = r.ReferredCustomerId,
                ReferredCustomerName = r.ReferredCustomer != null ? r.ReferredCustomer.CompanyName : null,
                ReferredLeadId = r.ReferredLeadId,
                ReferredLeadName = r.ReferredLead != null ? r.ReferredLead.FirstName + " " + r.ReferredLead.LastName : null,
                ReferredName = r.ReferredName,
                ReferredEmail = r.ReferredEmail,
                ReferredPhone = r.ReferredPhone,
                ReferredCompany = r.ReferredCompany,
                ReferralDate = r.ReferralDate,
                ContactedDate = r.ContactedDate,
                ConversionDate = r.ConversionDate,
                ExpiryDate = r.ExpiryDate,
                ReferrerReward = r.ReferrerReward,
                ReferredReward = r.ReferredReward,
                RewardType = r.RewardType.HasValue ? (DTOs.RewardType?)(int)r.RewardType.Value : null,
                Currency = r.Currency,
                RewardPaid = r.RewardPaid,
                RewardPaidDate = r.RewardPaidDate,
                CampaignId = r.CampaignId,
                CampaignName = r.Campaign != null ? r.Campaign.Name : null,
                ProgramName = r.ProgramName,
                OpportunityId = r.OpportunityId,
                OpportunityName = r.Opportunity != null ? r.Opportunity.Name : null,
                DealId = r.DealId,
                DealTitle = r.Deal != null ? r.Deal.Name : null,
                TotalSalesAmount = r.TotalSalesAmount,
                ConversionValue = r.ConversionValue,
                ReferralMessage = r.ReferralMessage,
                InternalNotes = r.InternalNotes,
                RejectionReason = r.RejectionReason,
                AssignedToUserId = r.AssignedToUserId,
                FollowUpCount = r.FollowUpCount,
                LastFollowUpDate = r.LastFollowUpDate
            })
            .ToListAsync(cancellationToken);

        return new PagedResult<ReferralDto>(items, totalCount, request.Page, request.PageSize);
    }
}
