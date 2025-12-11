using Stocker.Modules.CRM.Domain.Entities;

namespace Stocker.Modules.CRM.Application.DTOs;

public class LoyaltyProgramDto
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsActive { get; set; }
    public LoyaltyProgramType ProgramType { get; set; }

    // Dates
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }

    // Points Rules
    public decimal PointsPerSpend { get; set; }
    public decimal SpendUnit { get; set; }
    public string Currency { get; set; } = "TRY";
    public decimal? MinimumSpendForPoints { get; set; }
    public int? MaxPointsPerTransaction { get; set; }

    // Redemption Rules
    public decimal PointValue { get; set; }
    public int MinimumRedemptionPoints { get; set; }
    public decimal? MaxRedemptionPercentage { get; set; }

    // Expiry Rules
    public int? PointsValidityMonths { get; set; }
    public bool ResetPointsYearly { get; set; }

    // Bonus Rules
    public int? BirthdayBonusPoints { get; set; }
    public int? SignUpBonusPoints { get; set; }
    public int? ReferralBonusPoints { get; set; }
    public int? ReviewBonusPoints { get; set; }

    // Terms
    public string? TermsAndConditions { get; set; }
    public string? PrivacyPolicy { get; set; }

    // Children
    public List<LoyaltyTierDto> Tiers { get; set; } = new();
    public List<LoyaltyRewardDto> Rewards { get; set; } = new();
}

public class LoyaltyTierDto
{
    public Guid Id { get; set; }
    public Guid LoyaltyProgramId { get; set; }
    public string Name { get; set; } = string.Empty;
    public int Order { get; set; }
    public int MinimumPoints { get; set; }
    public decimal DiscountPercentage { get; set; }
    public decimal? BonusPointsMultiplier { get; set; }
    public string? Benefits { get; set; }
    public string? IconUrl { get; set; }
    public string? Color { get; set; }
    public bool IsActive { get; set; }
}

public class LoyaltyRewardDto
{
    public Guid Id { get; set; }
    public Guid LoyaltyProgramId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int PointsCost { get; set; }
    public RewardType RewardType { get; set; }
    public decimal? DiscountValue { get; set; }
    public decimal? DiscountPercentage { get; set; }
    public int? ProductId { get; set; }
    public string? ProductName { get; set; }
    public int? StockQuantity { get; set; }
    public DateTime? ValidFrom { get; set; }
    public DateTime? ValidUntil { get; set; }
    public string? ImageUrl { get; set; }
    public string? Terms { get; set; }
    public bool IsActive { get; set; }
    public int RedemptionCount { get; set; }
}

public enum RewardType
{
    Discount = 1,
    FreeProduct = 2,
    FreeShipping = 3,
    GiftCard = 4,
    Experience = 5,
    Upgrade = 6,
    Other = 99
}
