using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.CRM.Domain.Events;

#region Referral Events

/// <summary>
/// Raised when a new referral is created
/// </summary>
public sealed record ReferralCreatedDomainEvent(
    Guid ReferralId,
    Guid TenantId,
    string ReferralCode,
    Guid ReferrerId,
    string ReferrerName,
    string? ReferredEmail,
    int CreatedById) : DomainEvent;

/// <summary>
/// Raised when a referral link is clicked
/// </summary>
public sealed record ReferralLinkClickedDomainEvent(
    Guid ReferralId,
    Guid TenantId,
    string ReferralCode,
    string ClickedByIp,
    DateTime ClickedAt) : DomainEvent;

/// <summary>
/// Raised when a referral is converted (referred person becomes customer)
/// </summary>
public sealed record ReferralConvertedDomainEvent(
    Guid ReferralId,
    Guid TenantId,
    string ReferralCode,
    Guid ReferrerId,
    string ReferrerName,
    Guid NewCustomerId,
    string NewCustomerName,
    DateTime ConvertedAt) : DomainEvent;

/// <summary>
/// Raised when referral reward is earned
/// </summary>
public sealed record ReferralRewardEarnedDomainEvent(
    Guid ReferralId,
    Guid TenantId,
    Guid ReferrerId,
    string ReferrerName,
    string RewardType,
    decimal? RewardAmount,
    string? RewardDescription) : DomainEvent;

/// <summary>
/// Raised when referral reward is claimed
/// </summary>
public sealed record ReferralRewardClaimedDomainEvent(
    Guid ReferralId,
    Guid TenantId,
    Guid ReferrerId,
    string ReferrerName,
    string RewardType,
    decimal? RewardAmount,
    DateTime ClaimedAt) : DomainEvent;

/// <summary>
/// Raised when a referral expires
/// </summary>
public sealed record ReferralExpiredDomainEvent(
    Guid ReferralId,
    Guid TenantId,
    string ReferralCode,
    Guid ReferrerId,
    DateTime ExpiredAt) : DomainEvent;

#endregion
