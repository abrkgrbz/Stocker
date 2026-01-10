using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.CRM.Domain.Events;

#region SocialMediaProfile Events

/// <summary>
/// Raised when a social media profile is added
/// </summary>
public sealed record SocialMediaProfileAddedDomainEvent(
    Guid ProfileId,
    Guid TenantId,
    string Platform,
    string ProfileUrl,
    string? Username,
    Guid? CustomerId,
    Guid? ContactId,
    Guid? LeadId,
    int AddedById) : DomainEvent;

/// <summary>
/// Raised when a social media profile is verified
/// </summary>
public sealed record SocialMediaProfileVerifiedDomainEvent(
    Guid ProfileId,
    Guid TenantId,
    string Platform,
    string? Username,
    int VerifiedById) : DomainEvent;

/// <summary>
/// Raised when social media profile metrics are updated
/// </summary>
public sealed record SocialMediaMetricsUpdatedDomainEvent(
    Guid ProfileId,
    Guid TenantId,
    string Platform,
    string? Username,
    int? FollowerCount,
    int? FollowingCount,
    int? PostCount,
    decimal? EngagementRate) : DomainEvent;

/// <summary>
/// Raised when a social media interaction is tracked
/// </summary>
public sealed record SocialMediaInteractionTrackedDomainEvent(
    Guid ProfileId,
    Guid TenantId,
    string Platform,
    string InteractionType,
    string? PostUrl,
    string? Content,
    int? TrackedById) : DomainEvent;

/// <summary>
/// Raised when a social media mention is detected
/// </summary>
public sealed record SocialMediaMentionDetectedDomainEvent(
    Guid ProfileId,
    Guid TenantId,
    string Platform,
    string MentionType,
    string? SourceUrl,
    string? Content,
    string? Sentiment) : DomainEvent;

/// <summary>
/// Raised when social media profile is linked to contact/customer
/// </summary>
public sealed record SocialMediaProfileLinkedDomainEvent(
    Guid ProfileId,
    Guid TenantId,
    string Platform,
    string? Username,
    string EntityType,
    Guid EntityId,
    int LinkedById) : DomainEvent;

/// <summary>
/// Raised when social media campaign tracking is enabled
/// </summary>
public sealed record SocialMediaCampaignTrackingEnabledDomainEvent(
    Guid ProfileId,
    Guid TenantId,
    string Platform,
    Guid CampaignId,
    string CampaignName,
    int EnabledById) : DomainEvent;

/// <summary>
/// Raised when social media profile becomes inactive
/// </summary>
public sealed record SocialMediaProfileInactiveDomainEvent(
    Guid ProfileId,
    Guid TenantId,
    string Platform,
    string? Username,
    DateTime LastActivityDate,
    int DaysInactive) : DomainEvent;

/// <summary>
/// Raised when social media profile is removed
/// </summary>
public sealed record SocialMediaProfileRemovedDomainEvent(
    Guid ProfileId,
    Guid TenantId,
    string Platform,
    string? Username,
    int RemovedById) : DomainEvent;

#endregion
