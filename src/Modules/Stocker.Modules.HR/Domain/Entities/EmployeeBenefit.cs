using Stocker.SharedKernel.Common;

namespace Stocker.Modules.HR.Domain.Entities;

/// <summary>
/// Çalışan yan hakları entity'si - Yan hak ve prim takibi
/// Employee Benefit entity - Benefits and bonus tracking
/// </summary>
public class EmployeeBenefit : BaseEntity
{
    #region Temel Bilgiler (Basic Information)

    /// <summary>
    /// Çalışan ID / Employee ID
    /// </summary>
    public int EmployeeId { get; private set; }

    /// <summary>
    /// Yan hak türü / Benefit type
    /// </summary>
    public BenefitType BenefitType { get; private set; }

    /// <summary>
    /// Yan hak adı / Benefit name
    /// </summary>
    public string BenefitName { get; private set; } = string.Empty;

    /// <summary>
    /// Durum / Status
    /// </summary>
    public BenefitStatus Status { get; private set; }

    #endregion

    #region Değer Bilgileri (Value Information)

    /// <summary>
    /// Tutar / Amount
    /// </summary>
    public decimal Amount { get; private set; }

    /// <summary>
    /// Para birimi / Currency
    /// </summary>
    public string Currency { get; private set; } = "TRY";

    /// <summary>
    /// Ödeme periyodu / Payment frequency
    /// </summary>
    public PaymentFrequency PaymentFrequency { get; private set; }

    /// <summary>
    /// Yıllık değer / Annual value
    /// </summary>
    public decimal? AnnualValue { get; private set; }

    /// <summary>
    /// Vergi dahil mi? / Tax included?
    /// </summary>
    public bool TaxIncluded { get; private set; }

    /// <summary>
    /// Vergiye tabi mi? / Is taxable?
    /// </summary>
    public bool IsTaxable { get; private set; }

    #endregion

    #region Dönem Bilgileri (Period Information)

    /// <summary>
    /// Başlangıç tarihi / Start date
    /// </summary>
    public DateTime StartDate { get; private set; }

    /// <summary>
    /// Bitiş tarihi / End date
    /// </summary>
    public DateTime? EndDate { get; private set; }

    /// <summary>
    /// Yenileme tarihi / Renewal date
    /// </summary>
    public DateTime? RenewalDate { get; private set; }

    /// <summary>
    /// Hak ediş tarihi / Vesting date
    /// </summary>
    public DateTime? VestingDate { get; private set; }

    /// <summary>
    /// Bekleme süresi (ay) / Waiting period (months)
    /// </summary>
    public int? WaitingPeriodMonths { get; private set; }

    #endregion

    #region Sağlık Sigortası (Health Insurance)

    /// <summary>
    /// Sigorta şirketi / Insurance provider
    /// </summary>
    public string? InsuranceProvider { get; private set; }

    /// <summary>
    /// Poliçe numarası / Policy number
    /// </summary>
    public string? PolicyNumber { get; private set; }

    /// <summary>
    /// Kapsam seviyesi / Coverage level
    /// </summary>
    public string? CoverageLevel { get; private set; }

    /// <summary>
    /// Aile kapsamı / Family coverage
    /// </summary>
    public bool IncludesFamily { get; private set; }

    /// <summary>
    /// Eş dahil mi? / Spouse covered?
    /// </summary>
    public bool SpouseCovered { get; private set; }

    /// <summary>
    /// Çocuklar dahil mi? / Children covered?
    /// </summary>
    public bool ChildrenCovered { get; private set; }

    /// <summary>
    /// Bağımlı sayısı / Number of dependents
    /// </summary>
    public int? NumberOfDependents { get; private set; }

    #endregion

    #region Araç (Vehicle)

    /// <summary>
    /// Araç plakası / Vehicle plate
    /// </summary>
    public string? VehiclePlate { get; private set; }

    /// <summary>
    /// Araç modeli / Vehicle model
    /// </summary>
    public string? VehicleModel { get; private set; }

    /// <summary>
    /// Yakıt limiti / Fuel allowance
    /// </summary>
    public decimal? FuelAllowance { get; private set; }

    /// <summary>
    /// Kilometre limiti / Mileage limit
    /// </summary>
    public int? MileageLimit { get; private set; }

    #endregion

    #region Telefon/İnternet (Phone/Internet)

    /// <summary>
    /// Telefon numarası / Phone number
    /// </summary>
    public string? PhoneNumber { get; private set; }

    /// <summary>
    /// Aylık limit / Monthly limit
    /// </summary>
    public decimal? MonthlyLimit { get; private set; }

    /// <summary>
    /// Operatör / Operator
    /// </summary>
    public string? Operator { get; private set; }

    #endregion

    #region Yemek Kartı (Meal Card)

    /// <summary>
    /// Kart numarası / Card number
    /// </summary>
    public string? CardNumber { get; private set; }

    /// <summary>
    /// Günlük tutar / Daily amount
    /// </summary>
    public decimal? DailyAmount { get; private set; }

    /// <summary>
    /// Kart sağlayıcı / Card provider
    /// </summary>
    public string? CardProvider { get; private set; }

    #endregion

    #region Kullanım Bilgileri (Usage Information)

    /// <summary>
    /// Kullanılan tutar / Used amount
    /// </summary>
    public decimal? UsedAmount { get; private set; }

    /// <summary>
    /// Kalan tutar / Remaining amount
    /// </summary>
    public decimal? RemainingAmount { get; private set; }

    /// <summary>
    /// Son kullanım tarihi / Last usage date
    /// </summary>
    public DateTime? LastUsageDate { get; private set; }

    #endregion

    #region Ek Bilgiler (Additional Information)

    /// <summary>
    /// Açıklama / Description
    /// </summary>
    public string? Description { get; private set; }

    /// <summary>
    /// Notlar / Notes
    /// </summary>
    public string? Notes { get; private set; }

    /// <summary>
    /// Belge URL / Document URL
    /// </summary>
    public string? DocumentUrl { get; private set; }

    /// <summary>
    /// Onaylayan ID / Approved by ID
    /// </summary>
    public int? ApprovedById { get; private set; }

    /// <summary>
    /// Onay tarihi / Approval date
    /// </summary>
    public DateTime? ApprovalDate { get; private set; }

    #endregion

    // Navigation Properties
    public virtual Employee Employee { get; private set; } = null!;
    public virtual Employee? ApprovedBy { get; private set; }

    protected EmployeeBenefit() { }

    public EmployeeBenefit(
        int employeeId,
        BenefitType benefitType,
        string benefitName,
        decimal amount,
        DateTime startDate,
        PaymentFrequency paymentFrequency = PaymentFrequency.Monthly)
    {
        EmployeeId = employeeId;
        BenefitType = benefitType;
        BenefitName = benefitName;
        Amount = amount;
        StartDate = startDate;
        PaymentFrequency = paymentFrequency;
        Status = BenefitStatus.Active;
        Currency = "TRY";
        IsTaxable = true;

        CalculateAnnualValue();
    }

    private void CalculateAnnualValue()
    {
        AnnualValue = PaymentFrequency switch
        {
            PaymentFrequency.OneTime => Amount,
            PaymentFrequency.Daily => Amount * 365,
            PaymentFrequency.Weekly => Amount * 52,
            PaymentFrequency.BiWeekly => Amount * 26,
            PaymentFrequency.Monthly => Amount * 12,
            PaymentFrequency.Quarterly => Amount * 4,
            PaymentFrequency.SemiAnnually => Amount * 2,
            PaymentFrequency.Annually => Amount,
            _ => Amount * 12
        };
    }

    public void UpdateAmount(decimal amount)
    {
        Amount = amount;
        CalculateAnnualValue();
    }

    public void Activate()
    {
        Status = BenefitStatus.Active;
    }

    public void Suspend()
    {
        Status = BenefitStatus.Suspended;
    }

    public void Terminate(DateTime endDate)
    {
        Status = BenefitStatus.Terminated;
        EndDate = endDate;
    }

    public void Renew(DateTime renewalDate, DateTime? newEndDate = null)
    {
        RenewalDate = renewalDate;
        if (newEndDate.HasValue)
            EndDate = newEndDate;
        Status = BenefitStatus.Active;
    }

    public void Approve(int approvedById)
    {
        ApprovedById = approvedById;
        ApprovalDate = DateTime.UtcNow;
        Status = BenefitStatus.Active;
    }

    public void RecordUsage(decimal amount)
    {
        UsedAmount = (UsedAmount ?? 0) + amount;
        LastUsageDate = DateTime.UtcNow;

        if (AnnualValue.HasValue)
            RemainingAmount = AnnualValue.Value - (UsedAmount ?? 0);
    }

    public void ResetUsage()
    {
        UsedAmount = 0;
        RemainingAmount = AnnualValue;
    }

    // Health Insurance specific
    public void SetInsuranceDetails(string provider, string policyNumber, string coverageLevel)
    {
        InsuranceProvider = provider;
        PolicyNumber = policyNumber;
        CoverageLevel = coverageLevel;
    }

    public void SetFamilyCoverage(bool includesFamily, bool spouse, bool children, int? dependents)
    {
        IncludesFamily = includesFamily;
        SpouseCovered = spouse;
        ChildrenCovered = children;
        NumberOfDependents = dependents;
    }

    // Vehicle specific
    public void SetVehicleDetails(string plate, string model, decimal? fuelAllowance, int? mileageLimit)
    {
        VehiclePlate = plate;
        VehicleModel = model;
        FuelAllowance = fuelAllowance;
        MileageLimit = mileageLimit;
    }

    // Phone specific
    public void SetPhoneDetails(string phoneNumber, decimal? monthlyLimit, string? operatorName)
    {
        PhoneNumber = phoneNumber;
        MonthlyLimit = monthlyLimit;
        Operator = operatorName;
    }

    // Meal card specific
    public void SetMealCardDetails(string cardNumber, decimal dailyAmount, string provider)
    {
        CardNumber = cardNumber;
        DailyAmount = dailyAmount;
        CardProvider = provider;
    }

    public void SetEndDate(DateTime? date) => EndDate = date;
    public void SetVestingDate(DateTime? date) => VestingDate = date;
    public void SetWaitingPeriod(int? months) => WaitingPeriodMonths = months;
    public void SetTaxable(bool isTaxable) => IsTaxable = isTaxable;
    public void SetTaxIncluded(bool taxIncluded) => TaxIncluded = taxIncluded;
    public void SetDescription(string? description) => Description = description;
    public void SetNotes(string? notes) => Notes = notes;
    public void SetDocumentUrl(string? url) => DocumentUrl = url;

    public bool IsExpired() => EndDate.HasValue && EndDate.Value < DateTime.UtcNow;
    public bool IsVested() => !VestingDate.HasValue || VestingDate.Value <= DateTime.UtcNow;
}

#region Enums

public enum BenefitType
{
    /// <summary>Sağlık sigortası / Health insurance</summary>
    HealthInsurance = 1,

    /// <summary>Hayat sigortası / Life insurance</summary>
    LifeInsurance = 2,

    /// <summary>Bireysel emeklilik / Private pension</summary>
    PrivatePension = 3,

    /// <summary>Şirket aracı / Company car</summary>
    CompanyCar = 4,

    /// <summary>Yakıt desteği / Fuel allowance</summary>
    FuelAllowance = 5,

    /// <summary>Yemek kartı / Meal card</summary>
    MealCard = 6,

    /// <summary>Ulaşım desteği / Transportation allowance</summary>
    TransportationAllowance = 7,

    /// <summary>Telefon / Phone</summary>
    Phone = 8,

    /// <summary>İnternet / Internet</summary>
    Internet = 9,

    /// <summary>Konut desteği / Housing allowance</summary>
    HousingAllowance = 10,

    /// <summary>Eğitim desteği / Education allowance</summary>
    EducationAllowance = 11,

    /// <summary>Spor salonu / Gym membership</summary>
    GymMembership = 12,

    /// <summary>Çocuk bakımı / Childcare</summary>
    Childcare = 13,

    /// <summary>Hisse senedi / Stock options</summary>
    StockOptions = 14,

    /// <summary>Prim / Bonus</summary>
    Bonus = 15,

    /// <summary>İkramiye / Gratuity</summary>
    Gratuity = 16,

    /// <summary>Kıdem tazminatı / Severance</summary>
    Severance = 17,

    /// <summary>Doğum yardımı / Birth allowance</summary>
    BirthAllowance = 18,

    /// <summary>Evlilik yardımı / Marriage allowance</summary>
    MarriageAllowance = 19,

    /// <summary>Vefat yardımı / Death benefit</summary>
    DeathBenefit = 20,

    /// <summary>Diğer / Other</summary>
    Other = 99
}

public enum BenefitStatus
{
    /// <summary>Beklemede / Pending</summary>
    Pending = 1,

    /// <summary>Aktif / Active</summary>
    Active = 2,

    /// <summary>Askıda / Suspended</summary>
    Suspended = 3,

    /// <summary>Sonlandırıldı / Terminated</summary>
    Terminated = 4,

    /// <summary>Süresi doldu / Expired</summary>
    Expired = 5
}

public enum PaymentFrequency
{
    /// <summary>Tek seferlik / One-time</summary>
    OneTime = 1,

    /// <summary>Günlük / Daily</summary>
    Daily = 2,

    /// <summary>Haftalık / Weekly</summary>
    Weekly = 3,

    /// <summary>İki haftalık / Bi-weekly</summary>
    BiWeekly = 4,

    /// <summary>Aylık / Monthly</summary>
    Monthly = 5,

    /// <summary>Üç aylık / Quarterly</summary>
    Quarterly = 6,

    /// <summary>Altı aylık / Semi-annually</summary>
    SemiAnnually = 7,

    /// <summary>Yıllık / Annually</summary>
    Annually = 8
}

#endregion
