using Stocker.SharedKernel.MultiTenancy;

namespace Stocker.Modules.CRM.Domain.Entities;

/// <summary>
/// Rakip entity'si - Rekabet analizi ve takibi
/// Competitor entity - Competition analysis and tracking
/// </summary>
public class Competitor : TenantEntity
{
    private readonly List<CompetitorProduct> _products = new();
    private readonly List<CompetitorStrength> _strengths = new();
    private readonly List<CompetitorWeakness> _weaknesses = new();

    #region Temel Bilgiler (Basic Information)

    /// <summary>
    /// Rakip adı / Competitor name
    /// </summary>
    public string Name { get; private set; } = string.Empty;

    /// <summary>
    /// Rakip kodu / Competitor code
    /// </summary>
    public string? Code { get; private set; }

    /// <summary>
    /// Açıklama / Description
    /// </summary>
    public string? Description { get; private set; }

    /// <summary>
    /// Aktif mi? / Is active?
    /// </summary>
    public bool IsActive { get; private set; }

    /// <summary>
    /// Tehdit seviyesi / Threat level
    /// </summary>
    public ThreatLevel ThreatLevel { get; private set; }

    #endregion

    #region Şirket Bilgileri (Company Information)

    /// <summary>
    /// Web sitesi / Website
    /// </summary>
    public string? Website { get; private set; }

    /// <summary>
    /// Genel merkez / Headquarters
    /// </summary>
    public string? Headquarters { get; private set; }

    /// <summary>
    /// Kuruluş yılı / Founded year
    /// </summary>
    public int? FoundedYear { get; private set; }

    /// <summary>
    /// Çalışan sayısı / Employee count
    /// </summary>
    public string? EmployeeCount { get; private set; }

    /// <summary>
    /// Yıllık gelir / Annual revenue
    /// </summary>
    public string? AnnualRevenue { get; private set; }

    /// <summary>
    /// Pazar payı (%) / Market share
    /// </summary>
    public decimal? MarketShare { get; private set; }

    #endregion

    #region Pazar Bilgileri (Market Information)

    /// <summary>
    /// Hedef pazarlar / Target markets
    /// </summary>
    public string? TargetMarkets { get; private set; }

    /// <summary>
    /// Sektörler / Industries
    /// </summary>
    public string? Industries { get; private set; }

    /// <summary>
    /// Coğrafi kapsam / Geographic coverage
    /// </summary>
    public string? GeographicCoverage { get; private set; }

    /// <summary>
    /// Müşteri segmentleri / Customer segments
    /// </summary>
    public string? CustomerSegments { get; private set; }

    #endregion

    #region Fiyatlandırma Bilgileri (Pricing Information)

    /// <summary>
    /// Fiyatlandırma stratejisi / Pricing strategy
    /// </summary>
    public string? PricingStrategy { get; private set; }

    /// <summary>
    /// Fiyat aralığı / Price range
    /// </summary>
    public string? PriceRange { get; private set; }

    /// <summary>
    /// Fiyat karşılaştırması / Price comparison
    /// </summary>
    public PriceComparison? PriceComparison { get; private set; }

    #endregion

    #region Satış & Pazarlama (Sales & Marketing)

    /// <summary>
    /// Satış kanalları / Sales channels
    /// </summary>
    public string? SalesChannels { get; private set; }

    /// <summary>
    /// Pazarlama stratejisi / Marketing strategy
    /// </summary>
    public string? MarketingStrategy { get; private set; }

    /// <summary>
    /// Ana mesaj / Key message
    /// </summary>
    public string? KeyMessage { get; private set; }

    /// <summary>
    /// Sosyal medya linkleri / Social media links
    /// </summary>
    public string? SocialMediaLinks { get; private set; }

    #endregion

    #region İletişim Bilgileri (Contact Information)

    /// <summary>
    /// İletişim kişisi / Contact person
    /// </summary>
    public string? ContactPerson { get; private set; }

    /// <summary>
    /// E-posta / Email
    /// </summary>
    public string? Email { get; private set; }

    /// <summary>
    /// Telefon / Phone
    /// </summary>
    public string? Phone { get; private set; }

    #endregion

    #region Analiz Bilgileri (Analysis Information)

    /// <summary>
    /// SWOT özeti / SWOT summary
    /// </summary>
    public string? SwotSummary { get; private set; }

    /// <summary>
    /// Rekabet stratejisi / Competitive strategy
    /// </summary>
    public string? CompetitiveStrategy { get; private set; }

    /// <summary>
    /// Kazanma stratejisi / Win strategy
    /// </summary>
    public string? WinStrategy { get; private set; }

    /// <summary>
    /// Kayıp nedenleri / Loss reasons
    /// </summary>
    public string? LossReasons { get; private set; }

    /// <summary>
    /// Son analiz tarihi / Last analysis date
    /// </summary>
    public DateTime? LastAnalysisDate { get; private set; }

    /// <summary>
    /// Analiz eden / Analyzed by
    /// </summary>
    public string? AnalyzedBy { get; private set; }

    #endregion

    #region İstatistikler (Statistics)

    /// <summary>
    /// Karşılaşma sayısı / Encounter count
    /// </summary>
    public int EncounterCount { get; private set; }

    /// <summary>
    /// Kazanma sayısı / Win count
    /// </summary>
    public int WinCount { get; private set; }

    /// <summary>
    /// Kaybetme sayısı / Loss count
    /// </summary>
    public int LossCount { get; private set; }

    /// <summary>
    /// Kazanma oranı (%) / Win rate
    /// </summary>
    public decimal WinRate => EncounterCount > 0 ? (decimal)WinCount / EncounterCount * 100 : 0;

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
    public IReadOnlyList<CompetitorProduct> Products => _products.AsReadOnly();
    public IReadOnlyList<CompetitorStrength> Strengths => _strengths.AsReadOnly();
    public IReadOnlyList<CompetitorWeakness> Weaknesses => _weaknesses.AsReadOnly();

    protected Competitor() : base() { }

    public Competitor(
        Guid tenantId,
        string name) : base(Guid.NewGuid(), tenantId)
    {
        Name = name;
        IsActive = true;
        ThreatLevel = ThreatLevel.Medium;
    }

    public CompetitorProduct AddProduct(string productName, string? description = null, string? priceRange = null)
    {
        var product = new CompetitorProduct(Id, productName, description, priceRange);
        _products.Add(product);
        return product;
    }

    public void RemoveProduct(Guid productId)
    {
        var product = _products.FirstOrDefault(p => p.Id == productId);
        if (product != null)
            _products.Remove(product);
    }

    public CompetitorStrength AddStrength(string description, StrengthCategory category)
    {
        var strength = new CompetitorStrength(Id, description, category);
        _strengths.Add(strength);
        return strength;
    }

    public void RemoveStrength(Guid strengthId)
    {
        var strength = _strengths.FirstOrDefault(s => s.Id == strengthId);
        if (strength != null)
            _strengths.Remove(strength);
    }

    public CompetitorWeakness AddWeakness(string description, WeaknessCategory category)
    {
        var weakness = new CompetitorWeakness(Id, description, category);
        _weaknesses.Add(weakness);
        return weakness;
    }

    public void RemoveWeakness(Guid weaknessId)
    {
        var weakness = _weaknesses.FirstOrDefault(w => w.Id == weaknessId);
        if (weakness != null)
            _weaknesses.Remove(weakness);
    }

    public void RecordEncounter(bool won)
    {
        EncounterCount++;
        if (won)
            WinCount++;
        else
            LossCount++;
    }

    public void UpdateAnalysis(string? swotSummary, string? competitiveStrategy, string? winStrategy, string analyzedBy)
    {
        SwotSummary = swotSummary;
        CompetitiveStrategy = competitiveStrategy;
        WinStrategy = winStrategy;
        AnalyzedBy = analyzedBy;
        LastAnalysisDate = DateTime.UtcNow;
    }

    public void SetCompanyInfo(string? website, string? headquarters, int? foundedYear, string? employeeCount)
    {
        Website = website;
        Headquarters = headquarters;
        FoundedYear = foundedYear;
        EmployeeCount = employeeCount;
    }

    public void SetMarketInfo(string? targetMarkets, string? industries, string? coverage, decimal? marketShare)
    {
        TargetMarkets = targetMarkets;
        Industries = industries;
        GeographicCoverage = coverage;
        MarketShare = marketShare;
    }

    public void SetPricingInfo(string? strategy, string? range, PriceComparison? comparison)
    {
        PricingStrategy = strategy;
        PriceRange = range;
        PriceComparison = comparison;
    }

    public void SetSalesMarketingInfo(string? channels, string? marketingStrategy, string? keyMessage)
    {
        SalesChannels = channels;
        MarketingStrategy = marketingStrategy;
        KeyMessage = keyMessage;
    }

    public void SetContactInfo(string? person, string? email, string? phone)
    {
        ContactPerson = person;
        Email = email;
        Phone = phone;
    }

    public void UpdateDetails(string name, string? code, string? description)
    {
        Name = name;
        Code = code;
        Description = description;
    }

    public void SetThreatLevel(ThreatLevel level) => ThreatLevel = level;
    public void SetAnnualRevenue(string? revenue) => AnnualRevenue = revenue;
    public void SetCustomerSegments(string? segments) => CustomerSegments = segments;
    public void SetSocialMediaLinks(string? links) => SocialMediaLinks = links;
    public void SetLossReasons(string? reasons) => LossReasons = reasons;
    public void SetNotes(string? notes) => Notes = notes;
    public void SetTags(string? tags) => Tags = tags;

    public void Activate() => IsActive = true;
    public void Deactivate() => IsActive = false;
}

/// <summary>
/// Rakip ürünü / Competitor product
/// </summary>
public class CompetitorProduct : TenantEntity
{
    public Guid CompetitorId { get; private set; }
    public string ProductName { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public string? PriceRange { get; private set; }
    public string? Features { get; private set; }
    public string? Differentiators { get; private set; }
    public string? OurAdvantage { get; private set; }
    public string? OurDisadvantage { get; private set; }
    public bool IsDirectCompetitor { get; private set; }

    public virtual Competitor Competitor { get; private set; } = null!;

    protected CompetitorProduct() : base() { }

    public CompetitorProduct(
        Guid competitorId,
        string productName,
        string? description = null,
        string? priceRange = null) : base(Guid.NewGuid(), Guid.Empty)
    {
        CompetitorId = competitorId;
        ProductName = productName;
        Description = description;
        PriceRange = priceRange;
        IsDirectCompetitor = true;
    }

    public void SetFeatures(string? features) => Features = features;
    public void SetDifferentiators(string? differentiators) => Differentiators = differentiators;
    public void SetOurAdvantage(string? advantage) => OurAdvantage = advantage;
    public void SetOurDisadvantage(string? disadvantage) => OurDisadvantage = disadvantage;
    public void SetIsDirectCompetitor(bool isDirect) => IsDirectCompetitor = isDirect;
}

/// <summary>
/// Rakip güçlü yönü / Competitor strength
/// </summary>
public class CompetitorStrength : TenantEntity
{
    public Guid CompetitorId { get; private set; }
    public string Description { get; private set; } = string.Empty;
    public StrengthCategory Category { get; private set; }
    public int ImpactLevel { get; private set; } = 3; // 1-5
    public string? CounterStrategy { get; private set; }

    public virtual Competitor Competitor { get; private set; } = null!;

    protected CompetitorStrength() : base() { }

    public CompetitorStrength(
        Guid competitorId,
        string description,
        StrengthCategory category) : base(Guid.NewGuid(), Guid.Empty)
    {
        CompetitorId = competitorId;
        Description = description;
        Category = category;
    }

    public void SetImpactLevel(int level) => ImpactLevel = Math.Clamp(level, 1, 5);
    public void SetCounterStrategy(string? strategy) => CounterStrategy = strategy;
}

/// <summary>
/// Rakip zayıf yönü / Competitor weakness
/// </summary>
public class CompetitorWeakness : TenantEntity
{
    public Guid CompetitorId { get; private set; }
    public string Description { get; private set; } = string.Empty;
    public WeaknessCategory Category { get; private set; }
    public int OpportunityLevel { get; private set; } = 3; // 1-5
    public string? ExploitStrategy { get; private set; }

    public virtual Competitor Competitor { get; private set; } = null!;

    protected CompetitorWeakness() : base() { }

    public CompetitorWeakness(
        Guid competitorId,
        string description,
        WeaknessCategory category) : base(Guid.NewGuid(), Guid.Empty)
    {
        CompetitorId = competitorId;
        Description = description;
        Category = category;
    }

    public void SetOpportunityLevel(int level) => OpportunityLevel = Math.Clamp(level, 1, 5);
    public void SetExploitStrategy(string? strategy) => ExploitStrategy = strategy;
}

#region Enums

public enum ThreatLevel
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

public enum PriceComparison
{
    /// <summary>Çok düşük / Much lower</summary>
    MuchLower = 1,

    /// <summary>Düşük / Lower</summary>
    Lower = 2,

    /// <summary>Benzer / Similar</summary>
    Similar = 3,

    /// <summary>Yüksek / Higher</summary>
    Higher = 4,

    /// <summary>Çok yüksek / Much higher</summary>
    MuchHigher = 5
}

public enum StrengthCategory
{
    /// <summary>Ürün / Product</summary>
    Product = 1,

    /// <summary>Fiyatlandırma / Pricing</summary>
    Pricing = 2,

    /// <summary>Marka / Brand</summary>
    Brand = 3,

    /// <summary>Dağıtım / Distribution</summary>
    Distribution = 4,

    /// <summary>Teknoloji / Technology</summary>
    Technology = 5,

    /// <summary>Müşteri hizmetleri / Customer service</summary>
    CustomerService = 6,

    /// <summary>İnsan kaynakları / Human resources</summary>
    HumanResources = 7,

    /// <summary>Finansal / Financial</summary>
    Financial = 8,

    /// <summary>Pazarlama / Marketing</summary>
    Marketing = 9,

    /// <summary>Diğer / Other</summary>
    Other = 99
}

public enum WeaknessCategory
{
    /// <summary>Ürün / Product</summary>
    Product = 1,

    /// <summary>Fiyatlandırma / Pricing</summary>
    Pricing = 2,

    /// <summary>Marka / Brand</summary>
    Brand = 3,

    /// <summary>Dağıtım / Distribution</summary>
    Distribution = 4,

    /// <summary>Teknoloji / Technology</summary>
    Technology = 5,

    /// <summary>Müşteri hizmetleri / Customer service</summary>
    CustomerService = 6,

    /// <summary>İnsan kaynakları / Human resources</summary>
    HumanResources = 7,

    /// <summary>Finansal / Financial</summary>
    Financial = 8,

    /// <summary>Pazarlama / Marketing</summary>
    Marketing = 9,

    /// <summary>Diğer / Other</summary>
    Other = 99
}

#endregion
