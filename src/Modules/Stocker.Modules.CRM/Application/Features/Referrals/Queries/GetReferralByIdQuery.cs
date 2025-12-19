using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.Modules.CRM.Interfaces;

namespace Stocker.Modules.CRM.Application.Features.Referrals.Queries;

public class GetReferralByIdQuery : IRequest<ReferralDto?>
{
    public Guid Id { get; set; }
}

/// <summary>
/// Uses ICRMUnitOfWork for consistent data access
/// </summary>
public class GetReferralByIdQueryHandler : IRequestHandler<GetReferralByIdQuery, ReferralDto?>
{
    private readonly ICRMUnitOfWork _unitOfWork;

    public GetReferralByIdQueryHandler(ICRMUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async System.Threading.Tasks.Task<ReferralDto?> Handle(GetReferralByIdQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var entity = await _unitOfWork.ReadRepository<Referral>().AsQueryable()
            .Include(r => r.ReferrerCustomer)
            .Include(r => r.ReferrerContact)
            .Include(r => r.ReferredCustomer)
            .Include(r => r.ReferredLead)
            .Include(r => r.Campaign)
            .Include(r => r.Opportunity)
            .Include(r => r.Deal)
            .FirstOrDefaultAsync(r => r.Id == request.Id && r.TenantId == tenantId, cancellationToken);

        if (entity == null)
            return null;

        return new ReferralDto
        {
            Id = entity.Id,
            ReferralCode = entity.ReferralCode,
            Status = entity.Status,
            ReferralType = entity.ReferralType,
            ReferrerCustomerId = entity.ReferrerCustomerId,
            ReferrerCustomerName = entity.ReferrerCustomer?.CompanyName,
            ReferrerContactId = entity.ReferrerContactId,
            ReferrerContactName = entity.ReferrerContact?.FullName,
            ReferrerName = entity.ReferrerName,
            ReferrerEmail = entity.ReferrerEmail,
            ReferrerPhone = entity.ReferrerPhone,
            ReferredCustomerId = entity.ReferredCustomerId,
            ReferredCustomerName = entity.ReferredCustomer?.CompanyName,
            ReferredLeadId = entity.ReferredLeadId,
            ReferredLeadName = entity.ReferredLead != null ? entity.ReferredLead.FirstName + " " + entity.ReferredLead.LastName : null,
            ReferredName = entity.ReferredName,
            ReferredEmail = entity.ReferredEmail,
            ReferredPhone = entity.ReferredPhone,
            ReferredCompany = entity.ReferredCompany,
            ReferralDate = entity.ReferralDate,
            ContactedDate = entity.ContactedDate,
            ConversionDate = entity.ConversionDate,
            ExpiryDate = entity.ExpiryDate,
            ReferrerReward = entity.ReferrerReward,
            ReferredReward = entity.ReferredReward,
            RewardType = entity.RewardType.HasValue ? (DTOs.RewardType?)(int)entity.RewardType.Value : null,
            Currency = entity.Currency,
            RewardPaid = entity.RewardPaid,
            RewardPaidDate = entity.RewardPaidDate,
            CampaignId = entity.CampaignId,
            CampaignName = entity.Campaign?.Name,
            ProgramName = entity.ProgramName,
            OpportunityId = entity.OpportunityId,
            OpportunityName = entity.Opportunity?.Name,
            DealId = entity.DealId,
            DealTitle = entity.Deal?.Name,
            TotalSalesAmount = entity.TotalSalesAmount,
            ConversionValue = entity.ConversionValue,
            ReferralMessage = entity.ReferralMessage,
            InternalNotes = entity.InternalNotes,
            RejectionReason = entity.RejectionReason,
            AssignedToUserId = entity.AssignedToUserId,
            FollowUpCount = entity.FollowUpCount,
            LastFollowUpDate = entity.LastFollowUpDate
        };
    }
}
