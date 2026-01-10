using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.CRM.Domain.Events;

#region Loyalty Program Events

/// <summary>
/// Raised when a loyalty program is created
/// </summary>
public sealed record LoyaltyProgramCreatedDomainEvent(
    Guid ProgramId,
    Guid TenantId,
    string Name,
    string ProgramType) : DomainEvent;

/// <summary>
/// Raised when a loyalty program is activated
/// </summary>
public sealed record LoyaltyProgramActivatedDomainEvent(
    Guid ProgramId,
    Guid TenantId,
    string Name) : DomainEvent;

/// <summary>
/// Raised when a loyalty program is deactivated
/// </summary>
public sealed record LoyaltyProgramDeactivatedDomainEvent(
    Guid ProgramId,
    Guid TenantId,
    string Name) : DomainEvent;

#endregion

#region Loyalty Membership Events

/// <summary>
/// Raised when a customer joins a loyalty program
/// </summary>
public sealed record LoyaltyMembershipCreatedDomainEvent(
    Guid MembershipId,
    Guid TenantId,
    Guid CustomerId,
    Guid ProgramId,
    string MemberNumber) : DomainEvent;

/// <summary>
/// Raised when loyalty points are earned
/// </summary>
public sealed record LoyaltyPointsEarnedDomainEvent(
    Guid MembershipId,
    Guid TenantId,
    Guid CustomerId,
    int PointsEarned,
    int NewBalance,
    string Source) : DomainEvent;

/// <summary>
/// Raised when loyalty points are redeemed
/// </summary>
public sealed record LoyaltyPointsRedeemedDomainEvent(
    Guid MembershipId,
    Guid TenantId,
    Guid CustomerId,
    int PointsRedeemed,
    int NewBalance,
    string RedemptionType) : DomainEvent;

/// <summary>
/// Raised when loyalty tier changes
/// </summary>
public sealed record LoyaltyTierChangedDomainEvent(
    Guid MembershipId,
    Guid TenantId,
    Guid CustomerId,
    string CustomerName,
    string OldTier,
    string NewTier) : DomainEvent;

/// <summary>
/// Raised when loyalty points are about to expire
/// </summary>
public sealed record LoyaltyPointsExpiringDomainEvent(
    Guid MembershipId,
    Guid TenantId,
    Guid CustomerId,
    string CustomerName,
    int PointsExpiring,
    DateTime ExpiryDate) : DomainEvent;

#endregion
