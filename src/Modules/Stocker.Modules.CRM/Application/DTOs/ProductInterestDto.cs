using Stocker.Modules.CRM.Domain.Entities;

namespace Stocker.Modules.CRM.Application.DTOs;

public class ProductInterestDto
{
    public Guid Id { get; set; }
    public InterestLevel InterestLevel { get; set; }
    public InterestStatus Status { get; set; }
    public InterestSource Source { get; set; }

    // Relationships
    public Guid? CustomerId { get; set; }
    public string? CustomerName { get; set; }
    public Guid? ContactId { get; set; }
    public string? ContactName { get; set; }
    public Guid? LeadId { get; set; }
    public string? LeadName { get; set; }
    public Guid? OpportunityId { get; set; }
    public string? OpportunityName { get; set; }
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string? ProductCategory { get; set; }

    // Quantity & Price
    public decimal? InterestedQuantity { get; set; }
    public string? Unit { get; set; }
    public decimal? EstimatedBudget { get; set; }
    public string Currency { get; set; } = "TRY";
    public decimal? QuotedPrice { get; set; }

    // Time Information
    public DateTime InterestDate { get; set; }
    public DateTime? ExpectedPurchaseDate { get; set; }
    public DateTime? LastInteractionDate { get; set; }
    public DateTime? FollowUpDate { get; set; }

    // Detail Information
    public string? InterestReason { get; set; }
    public string? Requirements { get; set; }
    public string? Notes { get; set; }
    public string? CompetitorProducts { get; set; }
    public string? NotPurchasedReason { get; set; }

    // Scoring
    public int InterestScore { get; set; }
    public decimal? PurchaseProbability { get; set; }

    // Campaign Information
    public Guid? CampaignId { get; set; }
    public string? CampaignName { get; set; }
    public string? PromoCode { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
