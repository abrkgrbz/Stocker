using Stocker.Modules.CRM.Domain.Entities;

namespace Stocker.Modules.CRM.Application.DTOs;

public class LoyaltyMembershipDto
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public Guid LoyaltyProgramId { get; set; }
    public Guid CustomerId { get; set; }
    public string MembershipNumber { get; set; } = string.Empty;
    public Guid? CurrentTierId { get; set; }
    public int TotalPointsEarned { get; set; }
    public int TotalPointsRedeemed { get; set; }
    public int CurrentPoints { get; set; }
    public int LifetimePoints { get; set; }
    public DateTime EnrollmentDate { get; set; }
    public DateTime? LastActivityDate { get; set; }
    public DateTime? PointsExpiryDate { get; set; }
    public bool IsActive { get; set; }

    // Related data
    public string? ProgramName { get; set; }
    public string? CustomerName { get; set; }
    public string? TierName { get; set; }

    // Transactions
    public List<LoyaltyTransactionDto> Transactions { get; set; } = new();
}

public class LoyaltyTransactionDto
{
    public Guid Id { get; set; }
    public Guid LoyaltyMembershipId { get; set; }
    public LoyaltyTransactionType TransactionType { get; set; }
    public int Points { get; set; }
    public int BalanceAfter { get; set; }
    public string Description { get; set; } = string.Empty;
    public string? ReferenceNumber { get; set; }
    public DateTime TransactionDate { get; set; }
    public Guid? OrderId { get; set; }
    public Guid? RewardId { get; set; }
}
