using Stocker.SharedKernel.MultiTenancy;

namespace Stocker.Modules.CRM.Domain.Entities;

/// <summary>
/// Ürün ilgisi entity'si - Müşteri ürün ilgi takibi
/// Product Interest entity - Customer product interest tracking
/// </summary>
public class ProductInterest : TenantEntity
{
    #region Temel Bilgiler (Basic Information)

    /// <summary>
    /// İlgi seviyesi / Interest level
    /// </summary>
    public InterestLevel InterestLevel { get; private set; }

    /// <summary>
    /// İlgi durumu / Interest status
    /// </summary>
    public InterestStatus Status { get; private set; }

    /// <summary>
    /// Kaynak / Source
    /// </summary>
    public InterestSource Source { get; private set; }

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

    /// <summary>
    /// Fırsat ID / Opportunity ID
    /// </summary>
    public Guid? OpportunityId { get; private set; }

    /// <summary>
    /// Ürün ID / Product ID (from Inventory module)
    /// </summary>
    public int ProductId { get; private set; }

    /// <summary>
    /// Ürün adı / Product name (denormalized)
    /// </summary>
    public string ProductName { get; private set; } = string.Empty;

    /// <summary>
    /// Ürün kategorisi / Product category
    /// </summary>
    public string? ProductCategory { get; private set; }

    #endregion

    #region Miktar ve Fiyat (Quantity & Price)

    /// <summary>
    /// İlgilenilen miktar / Interested quantity
    /// </summary>
    public decimal? InterestedQuantity { get; private set; }

    /// <summary>
    /// Birim / Unit
    /// </summary>
    public string? Unit { get; private set; }

    /// <summary>
    /// Tahmini bütçe / Estimated budget
    /// </summary>
    public decimal? EstimatedBudget { get; private set; }

    /// <summary>
    /// Para birimi / Currency
    /// </summary>
    public string Currency { get; private set; } = "TRY";

    /// <summary>
    /// Teklif edilen fiyat / Quoted price
    /// </summary>
    public decimal? QuotedPrice { get; private set; }

    #endregion

    #region Zaman Bilgileri (Time Information)

    /// <summary>
    /// İlgi tarihi / Interest date
    /// </summary>
    public DateTime InterestDate { get; private set; }

    /// <summary>
    /// Tahmini satın alma tarihi / Expected purchase date
    /// </summary>
    public DateTime? ExpectedPurchaseDate { get; private set; }

    /// <summary>
    /// Son etkileşim tarihi / Last interaction date
    /// </summary>
    public DateTime? LastInteractionDate { get; private set; }

    /// <summary>
    /// Takip tarihi / Follow-up date
    /// </summary>
    public DateTime? FollowUpDate { get; private set; }

    #endregion

    #region Detay Bilgileri (Detail Information)

    /// <summary>
    /// İlgi nedeni / Interest reason
    /// </summary>
    public string? InterestReason { get; private set; }

    /// <summary>
    /// Gereksinimler / Requirements
    /// </summary>
    public string? Requirements { get; private set; }

    /// <summary>
    /// Notlar / Notes
    /// </summary>
    public string? Notes { get; private set; }

    /// <summary>
    /// Rakip ürünler / Competitor products
    /// </summary>
    public string? CompetitorProducts { get; private set; }

    /// <summary>
    /// Satın almama nedeni / Reason for not purchasing
    /// </summary>
    public string? NotPurchasedReason { get; private set; }

    #endregion

    #region Puanlama (Scoring)

    /// <summary>
    /// İlgi puanı (0-100) / Interest score
    /// </summary>
    public int InterestScore { get; private set; }

    /// <summary>
    /// Satın alma olasılığı (%) / Purchase probability
    /// </summary>
    public decimal? PurchaseProbability { get; private set; }

    #endregion

    #region Kampanya Bilgileri (Campaign Information)

    /// <summary>
    /// Kampanya ID / Campaign ID
    /// </summary>
    public Guid? CampaignId { get; private set; }

    /// <summary>
    /// Promosyon kodu / Promo code
    /// </summary>
    public string? PromoCode { get; private set; }

    #endregion

    // Navigation
    public virtual Customer? Customer { get; private set; }
    public virtual Contact? Contact { get; private set; }
    public virtual Lead? Lead { get; private set; }
    public virtual Opportunity? Opportunity { get; private set; }
    public virtual Campaign? Campaign { get; private set; }

    protected ProductInterest() : base() { }

    public ProductInterest(
        Guid tenantId,
        int productId,
        string productName,
        InterestLevel interestLevel = InterestLevel.Medium) : base(Guid.NewGuid(), tenantId)
    {
        ProductId = productId;
        ProductName = productName;
        InterestLevel = interestLevel;
        Status = InterestStatus.New;
        Source = InterestSource.Direct;
        InterestDate = DateTime.UtcNow;
        InterestScore = 50;
        Currency = "TRY";
    }

    public static ProductInterest CreateForCustomer(
        Guid tenantId,
        Guid customerId,
        int productId,
        string productName)
    {
        var interest = new ProductInterest(tenantId, productId, productName);
        interest.CustomerId = customerId;
        return interest;
    }

    public static ProductInterest CreateForLead(
        Guid tenantId,
        Guid leadId,
        int productId,
        string productName)
    {
        var interest = new ProductInterest(tenantId, productId, productName);
        interest.LeadId = leadId;
        return interest;
    }

    public void UpdateInterestLevel(InterestLevel level)
    {
        InterestLevel = level;
        LastInteractionDate = DateTime.UtcNow;

        // Update score based on level
        InterestScore = level switch
        {
            InterestLevel.VeryLow => 10,
            InterestLevel.Low => 30,
            InterestLevel.Medium => 50,
            InterestLevel.High => 75,
            InterestLevel.VeryHigh => 95,
            _ => InterestScore
        };
    }

    public void SetQuantityAndBudget(decimal? quantity, string? unit, decimal? budget)
    {
        InterestedQuantity = quantity;
        Unit = unit;
        EstimatedBudget = budget;
    }

    public void SetQuotedPrice(decimal price)
    {
        QuotedPrice = price;
        Status = InterestStatus.Quoted;
    }

    public void SetExpectedPurchaseDate(DateTime? date) => ExpectedPurchaseDate = date;

    public void SetFollowUp(DateTime followUpDate)
    {
        FollowUpDate = followUpDate;
        Status = InterestStatus.FollowUp;
    }

    public void MarkAsQualified()
    {
        Status = InterestStatus.Qualified;
        InterestScore = Math.Max(InterestScore, 70);
    }

    public void MarkAsNegotiating()
    {
        Status = InterestStatus.Negotiating;
        InterestScore = Math.Max(InterestScore, 80);
    }

    public void MarkAsPurchased()
    {
        Status = InterestStatus.Purchased;
        InterestScore = 100;
    }

    public void MarkAsLost(string? reason = null)
    {
        Status = InterestStatus.Lost;
        NotPurchasedReason = reason;
    }

    public void MarkAsNotInterested(string? reason = null)
    {
        Status = InterestStatus.NotInterested;
        NotPurchasedReason = reason;
        InterestScore = 0;
    }

    public void SetPurchaseProbability(decimal probability)
    {
        PurchaseProbability = Math.Clamp(probability, 0, 100);
    }

    public void RecordInteraction()
    {
        LastInteractionDate = DateTime.UtcNow;
    }

    public void RelateToCustomer(Guid customerId) => CustomerId = customerId;
    public void RelateToContact(Guid contactId) => ContactId = contactId;
    public void RelateToLead(Guid leadId) => LeadId = leadId;
    public void RelateToOpportunity(Guid opportunityId) => OpportunityId = opportunityId;
    public void RelateToCampaign(Guid campaignId) => CampaignId = campaignId;

    public void SetSource(InterestSource source) => Source = source;
    public void SetProductCategory(string? category) => ProductCategory = category;
    public void SetInterestReason(string? reason) => InterestReason = reason;
    public void SetRequirements(string? requirements) => Requirements = requirements;
    public void SetNotes(string? notes) => Notes = notes;
    public void SetCompetitorProducts(string? products) => CompetitorProducts = products;
    public void SetPromoCode(string? code) => PromoCode = code;
    public void SetCurrency(string currency) => Currency = currency;
}

#region Enums

public enum InterestLevel
{
    /// <summary>Çok düşük / Very low</summary>
    VeryLow = 1,

    /// <summary>Düşük / Low</summary>
    Low = 2,

    /// <summary>Orta / Medium</summary>
    Medium = 3,

    /// <summary>Yüksek / High</summary>
    High = 4,

    /// <summary>Çok yüksek / Very high</summary>
    VeryHigh = 5
}

public enum InterestStatus
{
    /// <summary>Yeni / New</summary>
    New = 1,

    /// <summary>Takipte / Follow-up</summary>
    FollowUp = 2,

    /// <summary>Nitelikli / Qualified</summary>
    Qualified = 3,

    /// <summary>Teklif verildi / Quoted</summary>
    Quoted = 4,

    /// <summary>Müzakere / Negotiating</summary>
    Negotiating = 5,

    /// <summary>Satın alındı / Purchased</summary>
    Purchased = 6,

    /// <summary>Kaybedildi / Lost</summary>
    Lost = 7,

    /// <summary>İlgilenmiyor / Not interested</summary>
    NotInterested = 8,

    /// <summary>Ertelendi / Postponed</summary>
    Postponed = 9
}

public enum InterestSource
{
    /// <summary>Direkt / Direct</summary>
    Direct = 1,

    /// <summary>Web sitesi / Website</summary>
    Website = 2,

    /// <summary>Kampanya / Campaign</summary>
    Campaign = 3,

    /// <summary>Referans / Referral</summary>
    Referral = 4,

    /// <summary>Fuar/Etkinlik / Event</summary>
    Event = 5,

    /// <summary>Sosyal medya / Social media</summary>
    SocialMedia = 6,

    /// <summary>E-posta / Email</summary>
    Email = 7,

    /// <summary>Telefon / Phone</summary>
    Phone = 8,

    /// <summary>Reklam / Advertisement</summary>
    Advertisement = 9,

    /// <summary>Partner / Partner</summary>
    Partner = 10,

    /// <summary>Diğer / Other</summary>
    Other = 99
}

#endregion
