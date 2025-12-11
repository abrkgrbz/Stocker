using Stocker.Modules.CRM.Domain.Entities;

namespace Stocker.Modules.CRM.Application.DTOs;

public class SocialMediaProfileDto
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public SocialMediaPlatform Platform { get; set; }
    public string ProfileUrl { get; set; } = string.Empty;
    public string? Username { get; set; }
    public string? ProfileId { get; set; }
    public bool IsActive { get; set; }
    public bool IsVerified { get; set; }

    // Relationships
    public Guid? CustomerId { get; set; }
    public Guid? ContactId { get; set; }
    public Guid? LeadId { get; set; }

    // Profile Information
    public string? DisplayName { get; set; }
    public string? Bio { get; set; }
    public string? ProfileImageUrl { get; set; }
    public string? CoverImageUrl { get; set; }
    public string? Website { get; set; }
    public string? Location { get; set; }

    // Statistics
    public int? FollowersCount { get; set; }
    public int? FollowingCount { get; set; }
    public int? PostsCount { get; set; }
    public int? LikesCount { get; set; }
    public DateTime? StatsUpdatedAt { get; set; }

    // Engagement
    public decimal? EngagementRate { get; set; }
    public decimal? AverageLikesPerPost { get; set; }
    public decimal? AverageCommentsPerPost { get; set; }
    public decimal? AverageSharesPerPost { get; set; }

    // Influence
    public InfluencerLevel? InfluencerLevel { get; set; }
    public int? InfluenceScore { get; set; }
    public string? TargetAudience { get; set; }
    public string? ContentCategories { get; set; }

    // Interaction History
    public DateTime? LastInteractionDate { get; set; }
    public string? LastInteractionType { get; set; }
    public int TotalInteractionsCount { get; set; }
    public bool FollowsOurBrand { get; set; }
    public bool MentionedOurBrand { get; set; }
    public DateTime? LastBrandMentionDate { get; set; }

    // Campaign
    public bool HasActiveCampaign { get; set; }
    public Guid? CampaignId { get; set; }
    public CollaborationStatus? CollaborationStatus { get; set; }

    // Notes
    public string? Notes { get; set; }
    public string? Tags { get; set; }
}
