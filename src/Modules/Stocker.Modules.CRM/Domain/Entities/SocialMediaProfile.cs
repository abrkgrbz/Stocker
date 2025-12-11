using Stocker.SharedKernel.MultiTenancy;

namespace Stocker.Modules.CRM.Domain.Entities;

/// <summary>
/// Sosyal medya profili entity'si - Müşteri sosyal medya takibi
/// Social Media Profile entity - Customer social media tracking
/// </summary>
public class SocialMediaProfile : TenantEntity
{
    #region Temel Bilgiler (Basic Information)

    /// <summary>
    /// Platform / Platform
    /// </summary>
    public SocialMediaPlatform Platform { get; private set; }

    /// <summary>
    /// Profil URL / Profile URL
    /// </summary>
    public string ProfileUrl { get; private set; } = string.Empty;

    /// <summary>
    /// Kullanıcı adı / Username
    /// </summary>
    public string? Username { get; private set; }

    /// <summary>
    /// Profil ID / Profile ID (platform-specific)
    /// </summary>
    public string? ProfileId { get; private set; }

    /// <summary>
    /// Aktif mi? / Is active?
    /// </summary>
    public bool IsActive { get; private set; }

    /// <summary>
    /// Doğrulanmış mı? / Is verified?
    /// </summary>
    public bool IsVerified { get; private set; }

    #endregion

    #region İlişkiler (Relationships)

    /// <summary>
    /// Müşteri ID / Customer ID
    /// </summary>
    public Guid? CustomerId { get; private set; }

    /// <summary>
    /// Kişi ID / Contact ID
    /// </summary>
    public Guid? ContactId { get; private set; }

    /// <summary>
    /// Lead ID
    /// </summary>
    public Guid? LeadId { get; private set; }

    #endregion

    #region Profil Bilgileri (Profile Information)

    /// <summary>
    /// Görünen ad / Display name
    /// </summary>
    public string? DisplayName { get; private set; }

    /// <summary>
    /// Bio / Bio
    /// </summary>
    public string? Bio { get; private set; }

    /// <summary>
    /// Profil resmi URL / Profile image URL
    /// </summary>
    public string? ProfileImageUrl { get; private set; }

    /// <summary>
    /// Kapak resmi URL / Cover image URL
    /// </summary>
    public string? CoverImageUrl { get; private set; }

    /// <summary>
    /// Web sitesi / Website
    /// </summary>
    public string? Website { get; private set; }

    /// <summary>
    /// Konum / Location
    /// </summary>
    public string? Location { get; private set; }

    #endregion

    #region İstatistikler (Statistics)

    /// <summary>
    /// Takipçi sayısı / Followers count
    /// </summary>
    public int? FollowersCount { get; private set; }

    /// <summary>
    /// Takip edilen sayısı / Following count
    /// </summary>
    public int? FollowingCount { get; private set; }

    /// <summary>
    /// Gönderi sayısı / Posts count
    /// </summary>
    public int? PostsCount { get; private set; }

    /// <summary>
    /// Beğeni sayısı / Likes count
    /// </summary>
    public int? LikesCount { get; private set; }

    /// <summary>
    /// Son güncelleme tarihi / Stats updated at
    /// </summary>
    public DateTime? StatsUpdatedAt { get; private set; }

    #endregion

    #region Engagement Bilgileri (Engagement Information)

    /// <summary>
    /// Engagement oranı (%) / Engagement rate
    /// </summary>
    public decimal? EngagementRate { get; private set; }

    /// <summary>
    /// Ortalama beğeni / Average likes per post
    /// </summary>
    public decimal? AverageLikesPerPost { get; private set; }

    /// <summary>
    /// Ortalama yorum / Average comments per post
    /// </summary>
    public decimal? AverageCommentsPerPost { get; private set; }

    /// <summary>
    /// Ortalama paylaşım / Average shares per post
    /// </summary>
    public decimal? AverageSharesPerPost { get; private set; }

    #endregion

    #region Influence Bilgileri (Influence Information)

    /// <summary>
    /// Influencer seviyesi / Influencer level
    /// </summary>
    public InfluencerLevel? InfluencerLevel { get; private set; }

    /// <summary>
    /// Etki puanı (0-100) / Influence score
    /// </summary>
    public int? InfluenceScore { get; private set; }

    /// <summary>
    /// Hedef kitle / Target audience
    /// </summary>
    public string? TargetAudience { get; private set; }

    /// <summary>
    /// İçerik kategorileri / Content categories
    /// </summary>
    public string? ContentCategories { get; private set; }

    #endregion

    #region Etkileşim Geçmişi (Interaction History)

    /// <summary>
    /// Son etkileşim tarihi / Last interaction date
    /// </summary>
    public DateTime? LastInteractionDate { get; private set; }

    /// <summary>
    /// Etkileşim türü / Last interaction type
    /// </summary>
    public string? LastInteractionType { get; private set; }

    /// <summary>
    /// Toplam etkileşim sayısı / Total interactions count
    /// </summary>
    public int TotalInteractionsCount { get; private set; }

    /// <summary>
    /// Markayı takip ediyor mu? / Follows our brand?
    /// </summary>
    public bool FollowsOurBrand { get; private set; }

    /// <summary>
    /// Marka hakkında paylaşım yaptı mı? / Mentioned our brand?
    /// </summary>
    public bool MentionedOurBrand { get; private set; }

    /// <summary>
    /// Son marka bahsetme tarihi / Last brand mention date
    /// </summary>
    public DateTime? LastBrandMentionDate { get; private set; }

    #endregion

    #region Kampanya Bilgileri (Campaign Information)

    /// <summary>
    /// Aktif kampanya var mı? / Has active campaign?
    /// </summary>
    public bool HasActiveCampaign { get; private set; }

    /// <summary>
    /// Kampanya ID / Campaign ID
    /// </summary>
    public Guid? CampaignId { get; private set; }

    /// <summary>
    /// İşbirliği durumu / Collaboration status
    /// </summary>
    public CollaborationStatus? CollaborationStatus { get; private set; }

    #endregion

    #region Notlar (Notes)

    /// <summary>
    /// Notlar / Notes
    /// </summary>
    public string? Notes { get; private set; }

    /// <summary>
    /// Etiketler / Tags
    /// </summary>
    public string? Tags { get; private set; }

    #endregion

    // Navigation
    public virtual Customer? Customer { get; private set; }
    public virtual Contact? Contact { get; private set; }
    public virtual Lead? Lead { get; private set; }
    public virtual Campaign? Campaign { get; private set; }

    protected SocialMediaProfile() : base() { }

    public SocialMediaProfile(
        Guid tenantId,
        SocialMediaPlatform platform,
        string profileUrl) : base(Guid.NewGuid(), tenantId)
    {
        Platform = platform;
        ProfileUrl = profileUrl;
        IsActive = true;
    }

    public static SocialMediaProfile CreateForCustomer(
        Guid tenantId,
        Guid customerId,
        SocialMediaPlatform platform,
        string profileUrl,
        string? username = null)
    {
        var profile = new SocialMediaProfile(tenantId, platform, profileUrl);
        profile.CustomerId = customerId;
        profile.Username = username;
        return profile;
    }

    public void UpdateProfileInfo(string? displayName, string? bio, string? profileImageUrl, string? website, string? location)
    {
        DisplayName = displayName;
        Bio = bio;
        ProfileImageUrl = profileImageUrl;
        Website = website;
        Location = location;
    }

    public void UpdateStatistics(int? followers, int? following, int? posts, int? likes)
    {
        FollowersCount = followers;
        FollowingCount = following;
        PostsCount = posts;
        LikesCount = likes;
        StatsUpdatedAt = DateTime.UtcNow;

        // Calculate influencer level based on followers
        InfluencerLevel = followers switch
        {
            >= 1000000 => Entities.InfluencerLevel.Mega,
            >= 100000 => Entities.InfluencerLevel.Macro,
            >= 10000 => Entities.InfluencerLevel.Mid,
            >= 1000 => Entities.InfluencerLevel.Micro,
            _ => Entities.InfluencerLevel.Nano
        };
    }

    public void UpdateEngagementMetrics(decimal? engagementRate, decimal? avgLikes, decimal? avgComments, decimal? avgShares)
    {
        EngagementRate = engagementRate;
        AverageLikesPerPost = avgLikes;
        AverageCommentsPerPost = avgComments;
        AverageSharesPerPost = avgShares;
    }

    public void RecordInteraction(string interactionType)
    {
        LastInteractionDate = DateTime.UtcNow;
        LastInteractionType = interactionType;
        TotalInteractionsCount++;
    }

    public void RecordBrandMention()
    {
        MentionedOurBrand = true;
        LastBrandMentionDate = DateTime.UtcNow;
        RecordInteraction("brand_mention");
    }

    public void SetFollowsOurBrand(bool follows)
    {
        FollowsOurBrand = follows;
        if (follows)
            RecordInteraction("followed");
    }

    public void StartCampaign(Guid campaignId)
    {
        HasActiveCampaign = true;
        CampaignId = campaignId;
        CollaborationStatus = Entities.CollaborationStatus.Active;
    }

    public void EndCampaign(CollaborationStatus status)
    {
        HasActiveCampaign = false;
        CollaborationStatus = status;
    }

    public void SetInfluenceInfo(InfluencerLevel level, int score, string? audience, string? categories)
    {
        InfluencerLevel = level;
        InfluenceScore = Math.Clamp(score, 0, 100);
        TargetAudience = audience;
        ContentCategories = categories;
    }

    public void RelateToCustomer(Guid customerId) => CustomerId = customerId;
    public void RelateToContact(Guid contactId) => ContactId = contactId;
    public void RelateToLead(Guid leadId) => LeadId = leadId;

    public void SetUsername(string? username) => Username = username;
    public void SetProfileId(string? profileId) => ProfileId = profileId;
    public void SetCoverImageUrl(string? url) => CoverImageUrl = url;
    public void SetNotes(string? notes) => Notes = notes;
    public void SetTags(string? tags) => Tags = tags;
    public void SetVerified(bool verified) => IsVerified = verified;

    public void Activate() => IsActive = true;
    public void Deactivate() => IsActive = false;
}

#region Enums

public enum SocialMediaPlatform
{
    /// <summary>Facebook</summary>
    Facebook = 1,

    /// <summary>Instagram</summary>
    Instagram = 2,

    /// <summary>Twitter/X</summary>
    Twitter = 3,

    /// <summary>LinkedIn</summary>
    LinkedIn = 4,

    /// <summary>YouTube</summary>
    YouTube = 5,

    /// <summary>TikTok</summary>
    TikTok = 6,

    /// <summary>Pinterest</summary>
    Pinterest = 7,

    /// <summary>Snapchat</summary>
    Snapchat = 8,

    /// <summary>WhatsApp Business</summary>
    WhatsAppBusiness = 9,

    /// <summary>Telegram</summary>
    Telegram = 10,

    /// <summary>Reddit</summary>
    Reddit = 11,

    /// <summary>Discord</summary>
    Discord = 12,

    /// <summary>Twitch</summary>
    Twitch = 13,

    /// <summary>Threads</summary>
    Threads = 14,

    /// <summary>Diğer / Other</summary>
    Other = 99
}

public enum InfluencerLevel
{
    /// <summary>Nano (1K-10K)</summary>
    Nano = 1,

    /// <summary>Micro (10K-100K)</summary>
    Micro = 2,

    /// <summary>Mid (100K-500K)</summary>
    Mid = 3,

    /// <summary>Macro (500K-1M)</summary>
    Macro = 4,

    /// <summary>Mega (1M+)</summary>
    Mega = 5
}

public enum CollaborationStatus
{
    /// <summary>Potansiyel / Potential</summary>
    Potential = 1,

    /// <summary>İletişimde / In contact</summary>
    InContact = 2,

    /// <summary>Müzakere / Negotiating</summary>
    Negotiating = 3,

    /// <summary>Aktif / Active</summary>
    Active = 4,

    /// <summary>Tamamlandı / Completed</summary>
    Completed = 5,

    /// <summary>Reddedildi / Rejected</summary>
    Rejected = 6,

    /// <summary>Askıya alındı / On hold</summary>
    OnHold = 7
}

#endregion
