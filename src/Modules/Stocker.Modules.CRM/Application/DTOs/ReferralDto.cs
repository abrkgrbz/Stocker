using Stocker.Modules.CRM.Domain.Entities;

namespace Stocker.Modules.CRM.Application.DTOs;

public class ReferralDto
{
    public Guid Id { get; set; }
    public string ReferralCode { get; set; } = string.Empty;
    public ReferralStatus Status { get; set; }
    public ReferralType ReferralType { get; set; }

    // Referrer
    public Guid? ReferrerCustomerId { get; set; }
    public string? ReferrerCustomerName { get; set; }
    public Guid? ReferrerContactId { get; set; }
    public string? ReferrerContactName { get; set; }
    public string ReferrerName { get; set; } = string.Empty;
    public string? ReferrerEmail { get; set; }
    public string? ReferrerPhone { get; set; }

    // Referred
    public Guid? ReferredCustomerId { get; set; }
    public string? ReferredCustomerName { get; set; }
    public Guid? ReferredLeadId { get; set; }
    public string? ReferredLeadName { get; set; }
    public string ReferredName { get; set; } = string.Empty;
    public string? ReferredEmail { get; set; }
    public string? ReferredPhone { get; set; }
    public string? ReferredCompany { get; set; }

    // Dates
    public DateTime ReferralDate { get; set; }
    public DateTime? ContactedDate { get; set; }
    public DateTime? ConversionDate { get; set; }
    public DateTime? ExpiryDate { get; set; }

    // Reward Information
    public decimal? ReferrerReward { get; set; }
    public decimal? ReferredReward { get; set; }
    public RewardType? RewardType { get; set; }
    public string Currency { get; set; } = "TRY";
    public bool RewardPaid { get; set; }
    public DateTime? RewardPaidDate { get; set; }

    // Program Information
    public Guid? CampaignId { get; set; }
    public string? CampaignName { get; set; }
    public string? ProgramName { get; set; }

    // Result Information
    public Guid? OpportunityId { get; set; }
    public string? OpportunityName { get; set; }
    public Guid? DealId { get; set; }
    public string? DealTitle { get; set; }
    public decimal? TotalSalesAmount { get; set; }
    public decimal? ConversionValue { get; set; }

    // Notes
    public string? ReferralMessage { get; set; }
    public string? InternalNotes { get; set; }
    public string? RejectionReason { get; set; }

    // Tracking
    public int? AssignedToUserId { get; set; }
    public string? AssignedToUserName { get; set; }
    public int FollowUpCount { get; set; }
    public DateTime? LastFollowUpDate { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    public bool IsExpired => ExpiryDate.HasValue && ExpiryDate.Value < DateTime.UtcNow;
}
