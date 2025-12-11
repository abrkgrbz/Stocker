using Stocker.SharedKernel.MultiTenancy;

namespace Stocker.Modules.CRM.Domain.Entities;

/// <summary>
/// Referans entity'si - Müşteri yönlendirme takibi
/// Referral entity - Customer referral tracking
/// </summary>
public class Referral : TenantEntity
{
    #region Temel Bilgiler (Basic Information)

    /// <summary>
    /// Referans kodu / Referral code
    /// </summary>
    public string ReferralCode { get; private set; } = string.Empty;

    /// <summary>
    /// Durum / Status
    /// </summary>
    public ReferralStatus Status { get; private set; }

    /// <summary>
    /// Referans türü / Referral type
    /// </summary>
    public ReferralType ReferralType { get; private set; }

    #endregion

    #region Referans Veren (Referrer)

    /// <summary>
    /// Referans veren müşteri ID / Referrer customer ID
    /// </summary>
    public Guid? ReferrerCustomerId { get; private set; }

    /// <summary>
    /// Referans veren kişi ID / Referrer contact ID
    /// </summary>
    public Guid? ReferrerContactId { get; private set; }

    /// <summary>
    /// Referans veren adı / Referrer name
    /// </summary>
    public string ReferrerName { get; private set; } = string.Empty;

    /// <summary>
    /// Referans veren e-posta / Referrer email
    /// </summary>
    public string? ReferrerEmail { get; private set; }

    /// <summary>
    /// Referans veren telefon / Referrer phone
    /// </summary>
    public string? ReferrerPhone { get; private set; }

    #endregion

    #region Referans Edilen (Referred)

    /// <summary>
    /// Referans edilen müşteri ID / Referred customer ID
    /// </summary>
    public Guid? ReferredCustomerId { get; private set; }

    /// <summary>
    /// Referans edilen lead ID / Referred lead ID
    /// </summary>
    public Guid? ReferredLeadId { get; private set; }

    /// <summary>
    /// Referans edilen adı / Referred name
    /// </summary>
    public string ReferredName { get; private set; } = string.Empty;

    /// <summary>
    /// Referans edilen e-posta / Referred email
    /// </summary>
    public string? ReferredEmail { get; private set; }

    /// <summary>
    /// Referans edilen telefon / Referred phone
    /// </summary>
    public string? ReferredPhone { get; private set; }

    /// <summary>
    /// Referans edilen şirket / Referred company
    /// </summary>
    public string? ReferredCompany { get; private set; }

    #endregion

    #region Tarih Bilgileri (Date Information)

    /// <summary>
    /// Referans tarihi / Referral date
    /// </summary>
    public DateTime ReferralDate { get; private set; }

    /// <summary>
    /// İletişim tarihi / Contact date
    /// </summary>
    public DateTime? ContactedDate { get; private set; }

    /// <summary>
    /// Dönüşüm tarihi / Conversion date
    /// </summary>
    public DateTime? ConversionDate { get; private set; }

    /// <summary>
    /// Son kullanma tarihi / Expiry date
    /// </summary>
    public DateTime? ExpiryDate { get; private set; }

    #endregion

    #region Ödül Bilgileri (Reward Information)

    /// <summary>
    /// Referans veren ödülü / Referrer reward
    /// </summary>
    public decimal? ReferrerReward { get; private set; }

    /// <summary>
    /// Referans edilen ödülü/indirimi / Referred reward/discount
    /// </summary>
    public decimal? ReferredReward { get; private set; }

    /// <summary>
    /// Ödül türü / Reward type
    /// </summary>
    public RewardType? RewardType { get; private set; }

    /// <summary>
    /// Para birimi / Currency
    /// </summary>
    public string Currency { get; private set; } = "TRY";

    /// <summary>
    /// Ödül ödendi mi? / Reward paid?
    /// </summary>
    public bool RewardPaid { get; private set; }

    /// <summary>
    /// Ödeme tarihi / Payment date
    /// </summary>
    public DateTime? RewardPaidDate { get; private set; }

    #endregion

    #region Program Bilgileri (Program Information)

    /// <summary>
    /// Kampanya ID / Campaign ID
    /// </summary>
    public Guid? CampaignId { get; private set; }

    /// <summary>
    /// Referans programı adı / Referral program name
    /// </summary>
    public string? ProgramName { get; private set; }

    #endregion

    #region Sonuç Bilgileri (Result Information)

    /// <summary>
    /// İlişkili fırsat ID / Related opportunity ID
    /// </summary>
    public Guid? OpportunityId { get; private set; }

    /// <summary>
    /// İlişkili anlaşma ID / Related deal ID
    /// </summary>
    public Guid? DealId { get; private set; }

    /// <summary>
    /// Toplam satış tutarı / Total sales amount
    /// </summary>
    public decimal? TotalSalesAmount { get; private set; }

    /// <summary>
    /// Dönüşüm değeri / Conversion value
    /// </summary>
    public decimal? ConversionValue { get; private set; }

    #endregion

    #region Notlar (Notes)

    /// <summary>
    /// Referans mesajı / Referral message
    /// </summary>
    public string? ReferralMessage { get; private set; }

    /// <summary>
    /// İç notlar / Internal notes
    /// </summary>
    public string? InternalNotes { get; private set; }

    /// <summary>
    /// Red nedeni / Rejection reason
    /// </summary>
    public string? RejectionReason { get; private set; }

    #endregion

    #region Takip Bilgileri (Tracking)

    /// <summary>
    /// Atanan kullanıcı ID / Assigned user ID
    /// </summary>
    public int? AssignedToUserId { get; private set; }

    /// <summary>
    /// Takip sayısı / Follow-up count
    /// </summary>
    public int FollowUpCount { get; private set; }

    /// <summary>
    /// Son takip tarihi / Last follow-up date
    /// </summary>
    public DateTime? LastFollowUpDate { get; private set; }

    #endregion

    // Navigation
    public virtual Customer? ReferrerCustomer { get; private set; }
    public virtual Contact? ReferrerContact { get; private set; }
    public virtual Customer? ReferredCustomer { get; private set; }
    public virtual Lead? ReferredLead { get; private set; }
    public virtual Campaign? Campaign { get; private set; }
    public virtual Opportunity? Opportunity { get; private set; }
    public virtual Deal? Deal { get; private set; }

    protected Referral() : base() { }

    public Referral(
        Guid tenantId,
        string referralCode,
        string referrerName,
        string referredName) : base(Guid.NewGuid(), tenantId)
    {
        ReferralCode = referralCode;
        ReferrerName = referrerName;
        ReferredName = referredName;
        Status = ReferralStatus.New;
        ReferralType = ReferralType.Customer;
        ReferralDate = DateTime.UtcNow;
        Currency = "TRY";
    }

    public static Referral CreateFromCustomer(
        Guid tenantId,
        string referralCode,
        Guid referrerCustomerId,
        string referrerName,
        string referredName,
        string referredEmail)
    {
        var referral = new Referral(tenantId, referralCode, referrerName, referredName);
        referral.ReferrerCustomerId = referrerCustomerId;
        referral.ReferredEmail = referredEmail;
        referral.ReferralType = ReferralType.Customer;
        return referral;
    }

    public void MarkAsContacted()
    {
        if (Status != ReferralStatus.New)
            throw new InvalidOperationException("Sadece yeni referanslar iletişime geçildi olarak işaretlenebilir.");

        Status = ReferralStatus.Contacted;
        ContactedDate = DateTime.UtcNow;
    }

    public void MarkAsQualified()
    {
        Status = ReferralStatus.Qualified;
    }

    public void MarkAsConverted(decimal? conversionValue = null)
    {
        Status = ReferralStatus.Converted;
        ConversionDate = DateTime.UtcNow;
        ConversionValue = conversionValue;
    }

    public void Reject(string reason)
    {
        Status = ReferralStatus.Rejected;
        RejectionReason = reason;
    }

    public void Expire()
    {
        Status = ReferralStatus.Expired;
    }

    public void PayReward()
    {
        if (Status != ReferralStatus.Converted)
            throw new InvalidOperationException("Sadece dönüştürülmüş referanslar için ödül ödenebilir.");

        RewardPaid = true;
        RewardPaidDate = DateTime.UtcNow;
    }

    public void SetRewards(decimal? referrerReward, decimal? referredReward, RewardType rewardType)
    {
        ReferrerReward = referrerReward;
        ReferredReward = referredReward;
        RewardType = rewardType;
    }

    public void RecordFollowUp()
    {
        FollowUpCount++;
        LastFollowUpDate = DateTime.UtcNow;
    }

    public void CreateLeadForReferred(Guid leadId)
    {
        ReferredLeadId = leadId;
        Status = ReferralStatus.Qualified;
    }

    public void ConvertToCustomer(Guid customerId)
    {
        ReferredCustomerId = customerId;
        MarkAsConverted();
    }

    public void SetReferrerCustomer(Guid customerId) => ReferrerCustomerId = customerId;
    public void SetReferrerContact(Guid contactId) => ReferrerContactId = contactId;
    public void SetReferrerEmail(string? email) => ReferrerEmail = email;
    public void SetReferrerPhone(string? phone) => ReferrerPhone = phone;

    public void SetReferredDetails(string name, string? email, string? phone, string? company)
    {
        ReferredName = name;
        ReferredEmail = email;
        ReferredPhone = phone;
        ReferredCompany = company;
    }

    public void SetOpportunity(Guid opportunityId) => OpportunityId = opportunityId;
    public void SetDeal(Guid dealId) => DealId = dealId;
    public void SetTotalSalesAmount(decimal amount) => TotalSalesAmount = amount;

    public void SetCampaign(Guid campaignId, string? programName = null)
    {
        CampaignId = campaignId;
        ProgramName = programName;
    }

    public void SetExpiryDate(DateTime? date) => ExpiryDate = date;
    public void SetAssignedTo(int userId) => AssignedToUserId = userId;
    public void SetReferralMessage(string? message) => ReferralMessage = message;
    public void SetInternalNotes(string? notes) => InternalNotes = notes;
    public void SetReferralType(ReferralType type) => ReferralType = type;
    public void SetCurrency(string currency) => Currency = currency;

    public bool IsExpired() => ExpiryDate.HasValue && ExpiryDate.Value < DateTime.UtcNow;
}

#region Enums

public enum ReferralStatus
{
    /// <summary>Yeni / New</summary>
    New = 1,

    /// <summary>İletişime geçildi / Contacted</summary>
    Contacted = 2,

    /// <summary>Nitelikli / Qualified</summary>
    Qualified = 3,

    /// <summary>Dönüştürüldü / Converted</summary>
    Converted = 4,

    /// <summary>Reddedildi / Rejected</summary>
    Rejected = 5,

    /// <summary>Süresi doldu / Expired</summary>
    Expired = 6
}

public enum ReferralType
{
    /// <summary>Müşteri / Customer</summary>
    Customer = 1,

    /// <summary>Partner / Partner</summary>
    Partner = 2,

    /// <summary>Çalışan / Employee</summary>
    Employee = 3,

    /// <summary>Influencer</summary>
    Influencer = 4,

    /// <summary>Affiliate</summary>
    Affiliate = 5,

    /// <summary>Diğer / Other</summary>
    Other = 99
}

public enum RewardType
{
    /// <summary>Nakit / Cash</summary>
    Cash = 1,

    /// <summary>İndirim / Discount</summary>
    Discount = 2,

    /// <summary>Puan / Points</summary>
    Points = 3,

    /// <summary>Kredi / Credit</summary>
    Credit = 4,

    /// <summary>Hediye / Gift</summary>
    Gift = 5,

    /// <summary>Ücretsiz ürün / Free product</summary>
    FreeProduct = 6,

    /// <summary>Ücretsiz hizmet / Free service</summary>
    FreeService = 7
}

#endregion
