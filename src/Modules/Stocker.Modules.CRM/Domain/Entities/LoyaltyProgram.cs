using Stocker.SharedKernel.MultiTenancy;

namespace Stocker.Modules.CRM.Domain.Entities;

/// <summary>
/// Sadakat programı entity'si - Müşteri sadakat yönetimi
/// Loyalty Program entity - Customer loyalty management
/// </summary>
public class LoyaltyProgram : TenantEntity
{
    private readonly List<LoyaltyTier> _tiers = new();
    private readonly List<LoyaltyReward> _rewards = new();

    #region Temel Bilgiler (Basic Information)

    /// <summary>
    /// Program adı / Program name
    /// </summary>
    public string Name { get; private set; } = string.Empty;

    /// <summary>
    /// Program kodu / Program code
    /// </summary>
    public string Code { get; private set; } = string.Empty;

    /// <summary>
    /// Açıklama / Description
    /// </summary>
    public string? Description { get; private set; }

    /// <summary>
    /// Aktif mi? / Is active?
    /// </summary>
    public bool IsActive { get; private set; }

    /// <summary>
    /// Program türü / Program type
    /// </summary>
    public LoyaltyProgramType ProgramType { get; private set; }

    #endregion

    #region Tarih Bilgileri (Date Information)

    /// <summary>
    /// Başlangıç tarihi / Start date
    /// </summary>
    public DateTime StartDate { get; private set; }

    /// <summary>
    /// Bitiş tarihi / End date
    /// </summary>
    public DateTime? EndDate { get; private set; }

    #endregion

    #region Puan Kuralları (Points Rules)

    /// <summary>
    /// Harcama başına puan oranı / Points per spend
    /// </summary>
    public decimal PointsPerSpend { get; private set; }

    /// <summary>
    /// Harcama birimi / Spend unit (e.g., 1 TRY)
    /// </summary>
    public decimal SpendUnit { get; private set; }

    /// <summary>
    /// Para birimi / Currency
    /// </summary>
    public string Currency { get; private set; } = "TRY";

    /// <summary>
    /// Minimum harcama / Minimum spend for points
    /// </summary>
    public decimal? MinimumSpendForPoints { get; private set; }

    /// <summary>
    /// Maksimum puan/işlem / Max points per transaction
    /// </summary>
    public int? MaxPointsPerTransaction { get; private set; }

    #endregion

    #region Puan Kullanım Kuralları (Redemption Rules)

    /// <summary>
    /// Puan değeri (TRY) / Point value
    /// </summary>
    public decimal PointValue { get; private set; }

    /// <summary>
    /// Minimum kullanım puanı / Minimum points for redemption
    /// </summary>
    public int MinimumRedemptionPoints { get; private set; }

    /// <summary>
    /// Maksimum kullanım oranı (%) / Max redemption percentage
    /// </summary>
    public decimal? MaxRedemptionPercentage { get; private set; }

    #endregion

    #region Süre Kuralları (Expiry Rules)

    /// <summary>
    /// Puan geçerlilik süresi (ay) / Points validity (months)
    /// </summary>
    public int? PointsValidityMonths { get; private set; }

    /// <summary>
    /// Puanlar yıl sonunda sıfırlanır mı? / Reset points yearly?
    /// </summary>
    public bool ResetPointsYearly { get; private set; }

    #endregion

    #region Özel Kurallar (Special Rules)

    /// <summary>
    /// Doğum günü bonusu / Birthday bonus points
    /// </summary>
    public int? BirthdayBonusPoints { get; private set; }

    /// <summary>
    /// Kayıt bonusu / Sign-up bonus points
    /// </summary>
    public int? SignUpBonusPoints { get; private set; }

    /// <summary>
    /// Referans bonusu / Referral bonus points
    /// </summary>
    public int? ReferralBonusPoints { get; private set; }

    /// <summary>
    /// İnceleme bonusu / Review bonus points
    /// </summary>
    public int? ReviewBonusPoints { get; private set; }

    #endregion

    #region Şartlar (Terms)

    /// <summary>
    /// Kullanım şartları / Terms and conditions
    /// </summary>
    public string? TermsAndConditions { get; private set; }

    /// <summary>
    /// Gizlilik politikası / Privacy policy
    /// </summary>
    public string? PrivacyPolicy { get; private set; }

    #endregion

    // Navigation
    public IReadOnlyList<LoyaltyTier> Tiers => _tiers.AsReadOnly();
    public IReadOnlyList<LoyaltyReward> Rewards => _rewards.AsReadOnly();

    protected LoyaltyProgram() : base() { }

    public LoyaltyProgram(
        Guid tenantId,
        string name,
        string code,
        LoyaltyProgramType programType = LoyaltyProgramType.PointsBased) : base(Guid.NewGuid(), tenantId)
    {
        Name = name;
        Code = code;
        ProgramType = programType;
        IsActive = true;
        StartDate = DateTime.UtcNow;
        Currency = "TRY";
        PointsPerSpend = 1;
        SpendUnit = 1;
        PointValue = 0.01m; // 1 puan = 0.01 TRY
        MinimumRedemptionPoints = 100;
    }

    public LoyaltyTier AddTier(string name, int minPoints, decimal discountPercentage)
    {
        var order = _tiers.Count + 1;
        var tier = new LoyaltyTier(Id, name, order, minPoints, discountPercentage);
        _tiers.Add(tier);
        return tier;
    }

    public void RemoveTier(Guid tierId)
    {
        var tier = _tiers.FirstOrDefault(t => t.Id == tierId);
        if (tier != null)
            _tiers.Remove(tier);
    }

    public LoyaltyReward AddReward(string name, string description, int pointsCost, RewardType rewardType)
    {
        var reward = new LoyaltyReward(Id, name, description, pointsCost, rewardType);
        _rewards.Add(reward);
        return reward;
    }

    public void RemoveReward(Guid rewardId)
    {
        var reward = _rewards.FirstOrDefault(r => r.Id == rewardId);
        if (reward != null)
            _rewards.Remove(reward);
    }

    public void SetPointsRules(decimal pointsPerSpend, decimal spendUnit, decimal? minSpend = null, int? maxPoints = null)
    {
        PointsPerSpend = pointsPerSpend;
        SpendUnit = spendUnit;
        MinimumSpendForPoints = minSpend;
        MaxPointsPerTransaction = maxPoints;
    }

    public void SetRedemptionRules(decimal pointValue, int minPoints, decimal? maxPercentage = null)
    {
        PointValue = pointValue;
        MinimumRedemptionPoints = minPoints;
        MaxRedemptionPercentage = maxPercentage;
    }

    public void SetExpiryRules(int? validityMonths, bool resetYearly)
    {
        PointsValidityMonths = validityMonths;
        ResetPointsYearly = resetYearly;
    }

    public void SetBonusRules(int? birthday, int? signUp, int? referral, int? review)
    {
        BirthdayBonusPoints = birthday;
        SignUpBonusPoints = signUp;
        ReferralBonusPoints = referral;
        ReviewBonusPoints = review;
    }

    public int CalculatePoints(decimal spendAmount)
    {
        if (MinimumSpendForPoints.HasValue && spendAmount < MinimumSpendForPoints.Value)
            return 0;

        var points = (int)(spendAmount / SpendUnit * PointsPerSpend);

        if (MaxPointsPerTransaction.HasValue)
            points = Math.Min(points, MaxPointsPerTransaction.Value);

        return points;
    }

    public decimal CalculateRedemptionValue(int points)
    {
        return points * PointValue;
    }

    public LoyaltyTier? GetTierForPoints(int totalPoints)
    {
        return _tiers
            .Where(t => t.MinimumPoints <= totalPoints && t.IsActive)
            .OrderByDescending(t => t.MinimumPoints)
            .FirstOrDefault();
    }

    public void UpdateDetails(string name, string code, string? description)
    {
        Name = name;
        Code = code;
        Description = description;
    }

    public void SetDateRange(DateTime startDate, DateTime? endDate)
    {
        StartDate = startDate;
        EndDate = endDate;
    }

    public void SetTerms(string? terms, string? privacy)
    {
        TermsAndConditions = terms;
        PrivacyPolicy = privacy;
    }

    public void SetCurrency(string currency) => Currency = currency;
    public void SetProgramType(LoyaltyProgramType type) => ProgramType = type;

    public void Activate() => IsActive = true;
    public void Deactivate() => IsActive = false;
}

/// <summary>
/// Sadakat seviyesi / Loyalty tier
/// </summary>
public class LoyaltyTier : TenantEntity
{
    public Guid LoyaltyProgramId { get; private set; }
    public string Name { get; private set; } = string.Empty;
    public int Order { get; private set; }
    public int MinimumPoints { get; private set; }
    public decimal DiscountPercentage { get; private set; }
    public decimal? BonusPointsMultiplier { get; private set; }
    public string? Benefits { get; private set; }
    public string? IconUrl { get; private set; }
    public string? Color { get; private set; }
    public bool IsActive { get; private set; }

    public virtual LoyaltyProgram LoyaltyProgram { get; private set; } = null!;

    protected LoyaltyTier() : base() { }

    public LoyaltyTier(
        Guid loyaltyProgramId,
        string name,
        int order,
        int minimumPoints,
        decimal discountPercentage) : base(Guid.NewGuid(), Guid.Empty)
    {
        LoyaltyProgramId = loyaltyProgramId;
        Name = name;
        Order = order;
        MinimumPoints = minimumPoints;
        DiscountPercentage = discountPercentage;
        IsActive = true;
    }

    public void SetBonusMultiplier(decimal? multiplier) => BonusPointsMultiplier = multiplier;
    public void SetBenefits(string? benefits) => Benefits = benefits;
    public void SetIconUrl(string? url) => IconUrl = url;
    public void SetColor(string? color) => Color = color;
    public void Activate() => IsActive = true;
    public void Deactivate() => IsActive = false;
}

/// <summary>
/// Sadakat ödülü / Loyalty reward
/// </summary>
public class LoyaltyReward : TenantEntity
{
    public Guid LoyaltyProgramId { get; private set; }
    public string Name { get; private set; } = string.Empty;
    public string Description { get; private set; } = string.Empty;
    public int PointsCost { get; private set; }
    public RewardType RewardType { get; private set; }
    public decimal? DiscountValue { get; private set; }
    public decimal? DiscountPercentage { get; private set; }
    public int? ProductId { get; private set; }
    public string? ProductName { get; private set; }
    public int? StockQuantity { get; private set; }
    public DateTime? ValidFrom { get; private set; }
    public DateTime? ValidUntil { get; private set; }
    public string? ImageUrl { get; private set; }
    public string? Terms { get; private set; }
    public bool IsActive { get; private set; }
    public int RedemptionCount { get; private set; }

    public virtual LoyaltyProgram LoyaltyProgram { get; private set; } = null!;

    protected LoyaltyReward() : base() { }

    public LoyaltyReward(
        Guid loyaltyProgramId,
        string name,
        string description,
        int pointsCost,
        RewardType rewardType) : base(Guid.NewGuid(), Guid.Empty)
    {
        LoyaltyProgramId = loyaltyProgramId;
        Name = name;
        Description = description;
        PointsCost = pointsCost;
        RewardType = rewardType;
        IsActive = true;
    }

    public void SetDiscountValue(decimal? value) => DiscountValue = value;
    public void SetDiscountPercentage(decimal? percentage) => DiscountPercentage = percentage;
    public void SetProduct(int? productId, string? productName)
    {
        ProductId = productId;
        ProductName = productName;
    }
    public void SetStock(int? quantity) => StockQuantity = quantity;
    public void SetValidityPeriod(DateTime? from, DateTime? until)
    {
        ValidFrom = from;
        ValidUntil = until;
    }
    public void SetImageUrl(string? url) => ImageUrl = url;
    public void SetTerms(string? terms) => Terms = terms;
    public void IncrementRedemption() => RedemptionCount++;
    public void Activate() => IsActive = true;
    public void Deactivate() => IsActive = false;

    public bool IsAvailable()
    {
        if (!IsActive) return false;
        if (StockQuantity.HasValue && StockQuantity.Value <= 0) return false;
        if (ValidFrom.HasValue && DateTime.UtcNow < ValidFrom.Value) return false;
        if (ValidUntil.HasValue && DateTime.UtcNow > ValidUntil.Value) return false;
        return true;
    }
}

/// <summary>
/// Müşteri sadakat üyeliği / Customer loyalty membership
/// </summary>
public class LoyaltyMembership : TenantEntity
{
    private readonly List<LoyaltyTransaction> _transactions = new();

    public Guid LoyaltyProgramId { get; private set; }
    public Guid CustomerId { get; private set; }
    public string MembershipNumber { get; private set; } = string.Empty;
    public Guid? CurrentTierId { get; private set; }
    public int TotalPointsEarned { get; private set; }
    public int TotalPointsRedeemed { get; private set; }
    public int CurrentPoints { get; private set; }
    public int LifetimePoints { get; private set; }
    public DateTime EnrollmentDate { get; private set; }
    public DateTime? LastActivityDate { get; private set; }
    public DateTime? PointsExpiryDate { get; private set; }
    public bool IsActive { get; private set; }

    public virtual LoyaltyProgram LoyaltyProgram { get; private set; } = null!;
    public virtual Customer Customer { get; private set; } = null!;
    public virtual LoyaltyTier? CurrentTier { get; private set; }
    public IReadOnlyList<LoyaltyTransaction> Transactions => _transactions.AsReadOnly();

    protected LoyaltyMembership() : base() { }

    public LoyaltyMembership(
        Guid tenantId,
        Guid loyaltyProgramId,
        Guid customerId,
        string membershipNumber) : base(Guid.NewGuid(), tenantId)
    {
        LoyaltyProgramId = loyaltyProgramId;
        CustomerId = customerId;
        MembershipNumber = membershipNumber;
        EnrollmentDate = DateTime.UtcNow;
        IsActive = true;
    }

    public void EarnPoints(int points, string description, string? referenceNumber = null)
    {
        CurrentPoints += points;
        TotalPointsEarned += points;
        LifetimePoints += points;
        LastActivityDate = DateTime.UtcNow;

        var transaction = new LoyaltyTransaction(Id, LoyaltyTransactionType.Earn, points, description, referenceNumber);
        _transactions.Add(transaction);
    }

    public void RedeemPoints(int points, string description, string? referenceNumber = null)
    {
        if (points > CurrentPoints)
            throw new InvalidOperationException("Yetersiz puan.");

        CurrentPoints -= points;
        TotalPointsRedeemed += points;
        LastActivityDate = DateTime.UtcNow;

        var transaction = new LoyaltyTransaction(Id, LoyaltyTransactionType.Redeem, -points, description, referenceNumber);
        _transactions.Add(transaction);
    }

    public void AdjustPoints(int points, string reason)
    {
        CurrentPoints += points;
        if (points > 0)
            TotalPointsEarned += points;

        LastActivityDate = DateTime.UtcNow;

        var transaction = new LoyaltyTransaction(Id, LoyaltyTransactionType.Adjustment, points, reason, null);
        _transactions.Add(transaction);
    }

    public void ExpirePoints(int points, string reason)
    {
        if (points > CurrentPoints)
            points = CurrentPoints;

        CurrentPoints -= points;
        LastActivityDate = DateTime.UtcNow;

        var transaction = new LoyaltyTransaction(Id, LoyaltyTransactionType.Expire, -points, reason, null);
        _transactions.Add(transaction);
    }

    public void SetTier(Guid tierId) => CurrentTierId = tierId;
    public void SetPointsExpiryDate(DateTime? date) => PointsExpiryDate = date;
    public void Activate() => IsActive = true;
    public void Deactivate() => IsActive = false;
}

/// <summary>
/// Sadakat işlemi / Loyalty transaction
/// </summary>
public class LoyaltyTransaction : TenantEntity
{
    public Guid LoyaltyMembershipId { get; private set; }
    public LoyaltyTransactionType TransactionType { get; private set; }
    public int Points { get; private set; }
    public int BalanceAfter { get; private set; }
    public string Description { get; private set; } = string.Empty;
    public string? ReferenceNumber { get; private set; }
    public DateTime TransactionDate { get; private set; }
    public Guid? OrderId { get; private set; }
    public Guid? RewardId { get; private set; }

    public virtual LoyaltyMembership LoyaltyMembership { get; private set; } = null!;

    protected LoyaltyTransaction() : base() { }

    public LoyaltyTransaction(
        Guid loyaltyMembershipId,
        LoyaltyTransactionType transactionType,
        int points,
        string description,
        string? referenceNumber = null) : base(Guid.NewGuid(), Guid.Empty)
    {
        LoyaltyMembershipId = loyaltyMembershipId;
        TransactionType = transactionType;
        Points = points;
        Description = description;
        ReferenceNumber = referenceNumber;
        TransactionDate = DateTime.UtcNow;
    }

    public void SetBalanceAfter(int balance) => BalanceAfter = balance;
    public void SetOrderId(Guid orderId) => OrderId = orderId;
    public void SetRewardId(Guid rewardId) => RewardId = rewardId;
}

#region Enums

public enum LoyaltyProgramType
{
    /// <summary>Puan bazlı / Points based</summary>
    PointsBased = 1,

    /// <summary>Seviye bazlı / Tier based</summary>
    TierBased = 2,

    /// <summary>Harcama bazlı / Spend based</summary>
    SpendBased = 3,

    /// <summary>Abonelik / Subscription</summary>
    Subscription = 4,

    /// <summary>Hibrit / Hybrid</summary>
    Hybrid = 5
}

public enum LoyaltyTransactionType
{
    /// <summary>Kazanım / Earn</summary>
    Earn = 1,

    /// <summary>Kullanım / Redeem</summary>
    Redeem = 2,

    /// <summary>Düzeltme / Adjustment</summary>
    Adjustment = 3,

    /// <summary>Süre dolumu / Expire</summary>
    Expire = 4,

    /// <summary>Transfer / Transfer</summary>
    Transfer = 5,

    /// <summary>Bonus / Bonus</summary>
    Bonus = 6
}

#endregion
