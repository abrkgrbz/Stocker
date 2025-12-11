using Stocker.SharedKernel.Common;
using Stocker.Domain.Common.ValueObjects;

namespace Stocker.Modules.Finance.Domain.Entities;

/// <summary>
/// Duran Varlık (Fixed Asset)
/// Maddi ve maddi olmayan duran varlık yönetimi
/// Türkiye muhasebe standartlarına uygun amortisman hesaplama
/// </summary>
public class FixedAsset : BaseEntity
{
    #region Temel Bilgiler (Basic Information)

    /// <summary>
    /// Demirbaş Kodu (Asset Code)
    /// </summary>
    public string Code { get; private set; } = string.Empty;

    /// <summary>
    /// Demirbaş Adı (Asset Name)
    /// </summary>
    public string Name { get; private set; } = string.Empty;

    /// <summary>
    /// Açıklama (Description)
    /// </summary>
    public string? Description { get; private set; }

    /// <summary>
    /// Barkod (Barcode)
    /// </summary>
    public string? Barcode { get; private set; }

    /// <summary>
    /// Seri Numarası (Serial Number)
    /// </summary>
    public string? SerialNumber { get; private set; }

    /// <summary>
    /// Model Numarası (Model Number)
    /// </summary>
    public string? ModelNumber { get; private set; }

    /// <summary>
    /// Marka (Brand)
    /// </summary>
    public string? Brand { get; private set; }

    #endregion

    #region Sınıflandırma Bilgileri (Classification Information)

    /// <summary>
    /// Varlık Türü (Asset Type)
    /// </summary>
    public FixedAssetType AssetType { get; private set; }

    /// <summary>
    /// Varlık Kategorisi (Asset Category)
    /// </summary>
    public FixedAssetCategory Category { get; private set; }

    /// <summary>
    /// Alt Kategori (Sub Category)
    /// </summary>
    public string? SubCategory { get; private set; }

    /// <summary>
    /// Tekdüzen Hesap Grubu (Chart of Accounts Group)
    /// 25- Ticari Mallar, 26- Hammaddeler, 253- Tesis Makine Cihazlar
    /// </summary>
    public string AccountGroup { get; private set; } = "253";

    #endregion

    #region Tarih Bilgileri (Date Information)

    /// <summary>
    /// Alım Tarihi (Acquisition Date)
    /// </summary>
    public DateTime AcquisitionDate { get; private set; }

    /// <summary>
    /// Kullanıma Alma Tarihi (In-Service Date)
    /// </summary>
    public DateTime? InServiceDate { get; private set; }

    /// <summary>
    /// Garanti Bitiş Tarihi (Warranty End Date)
    /// </summary>
    public DateTime? WarrantyEndDate { get; private set; }

    /// <summary>
    /// Satış/Hurda Tarihi (Disposal Date)
    /// </summary>
    public DateTime? DisposalDate { get; private set; }

    #endregion

    #region Değer Bilgileri (Value Information)

    /// <summary>
    /// Alış Değeri (Acquisition Cost)
    /// </summary>
    public Money AcquisitionCost { get; private set; } = null!;

    /// <summary>
    /// Maliyet Değeri (Cost Value - with additions)
    /// </summary>
    public Money CostValue { get; private set; } = null!;

    /// <summary>
    /// Hurda Değeri (Salvage Value)
    /// </summary>
    public Money SalvageValue { get; private set; } = null!;

    /// <summary>
    /// Amortismana Tabi Tutar (Depreciable Amount)
    /// </summary>
    public Money DepreciableAmount { get; private set; } = null!;

    /// <summary>
    /// Birikmiş Amortisman (Accumulated Depreciation)
    /// </summary>
    public Money AccumulatedDepreciation { get; private set; } = null!;

    /// <summary>
    /// Net Defter Değeri (Net Book Value)
    /// </summary>
    public Money NetBookValue { get; private set; } = null!;

    /// <summary>
    /// Para Birimi (Currency)
    /// </summary>
    public string Currency { get; private set; } = "TRY";

    /// <summary>
    /// Yeniden Değerleme Tutarı (Revaluation Amount)
    /// </summary>
    public Money? RevaluationAmount { get; private set; }

    /// <summary>
    /// Son Değerleme Tarihi (Last Revaluation Date)
    /// </summary>
    public DateTime? LastRevaluationDate { get; private set; }

    #endregion

    #region Amortisman Bilgileri (Depreciation Information)

    /// <summary>
    /// Amortisman Yöntemi (Depreciation Method)
    /// </summary>
    public DepreciationMethod DepreciationMethod { get; private set; }

    /// <summary>
    /// Faydalı Ömür (Yıl) (Useful Life Years)
    /// </summary>
    public int UsefulLifeYears { get; private set; }

    /// <summary>
    /// Faydalı Ömür (Ay) (Useful Life Months)
    /// </summary>
    public int UsefulLifeMonths { get; private set; }

    /// <summary>
    /// Amortisman Oranı % (Depreciation Rate)
    /// </summary>
    public decimal DepreciationRate { get; private set; }

    /// <summary>
    /// Kalan Faydalı Ömür (Ay) (Remaining Useful Life Months)
    /// </summary>
    public int RemainingUsefulLifeMonths { get; private set; }

    /// <summary>
    /// Amortisman Başlangıç Tarihi (Depreciation Start Date)
    /// </summary>
    public DateTime? DepreciationStartDate { get; private set; }

    /// <summary>
    /// Son Amortisman Tarihi (Last Depreciation Date)
    /// </summary>
    public DateTime? LastDepreciationDate { get; private set; }

    /// <summary>
    /// Kıst Amortisman mı? (Is Partial Year Depreciation)
    /// </summary>
    public bool IsPartialYearDepreciation { get; private set; }

    /// <summary>
    /// Amortisman Periyodu (Depreciation Period)
    /// </summary>
    public DepreciationPeriod DepreciationPeriod { get; private set; }

    #endregion

    #region Lokasyon Bilgileri (Location Information)

    /// <summary>
    /// Lokasyon ID (Location ID)
    /// </summary>
    public int? LocationId { get; private set; }

    /// <summary>
    /// Lokasyon Adı (Location Name)
    /// </summary>
    public string? LocationName { get; private set; }

    /// <summary>
    /// Departman ID (Department ID)
    /// </summary>
    public int? DepartmentId { get; private set; }

    /// <summary>
    /// Şube ID (Branch ID)
    /// </summary>
    public int? BranchId { get; private set; }

    /// <summary>
    /// Zimmetli Kişi ID (Custodian User ID)
    /// </summary>
    public int? CustodianUserId { get; private set; }

    /// <summary>
    /// Zimmetli Kişi Adı (Custodian Name)
    /// </summary>
    public string? CustodianName { get; private set; }

    #endregion

    #region Tedarikçi Bilgileri (Supplier Information)

    /// <summary>
    /// Tedarikçi ID (Supplier ID)
    /// </summary>
    public int? SupplierId { get; private set; }

    /// <summary>
    /// Tedarikçi Adı (Supplier Name)
    /// </summary>
    public string? SupplierName { get; private set; }

    /// <summary>
    /// Fatura ID (Invoice ID)
    /// </summary>
    public int? InvoiceId { get; private set; }

    /// <summary>
    /// Fatura Numarası (Invoice Number)
    /// </summary>
    public string? InvoiceNumber { get; private set; }

    #endregion

    #region Muhasebe Entegrasyonu (Accounting Integration)

    /// <summary>
    /// Varlık Hesabı ID (Asset Account ID)
    /// </summary>
    public int? AssetAccountId { get; private set; }

    /// <summary>
    /// Varlık Hesap Kodu (Asset Account Code)
    /// </summary>
    public string? AssetAccountCode { get; private set; }

    /// <summary>
    /// Birikmiş Amortisman Hesabı ID (Accumulated Depreciation Account ID)
    /// </summary>
    public int? AccumulatedDepreciationAccountId { get; private set; }

    /// <summary>
    /// Birikmiş Amortisman Hesap Kodu (Accumulated Depreciation Account Code)
    /// </summary>
    public string? AccumulatedDepreciationAccountCode { get; private set; }

    /// <summary>
    /// Amortisman Gideri Hesabı ID (Depreciation Expense Account ID)
    /// </summary>
    public int? DepreciationExpenseAccountId { get; private set; }

    /// <summary>
    /// Masraf Merkezi ID (Cost Center ID)
    /// </summary>
    public int? CostCenterId { get; private set; }

    #endregion

    #region Elden Çıkarma Bilgileri (Disposal Information)

    /// <summary>
    /// Elden Çıkarma Türü (Disposal Type)
    /// </summary>
    public DisposalType? DisposalType { get; private set; }

    /// <summary>
    /// Satış Tutarı (Sale Amount)
    /// </summary>
    public Money? SaleAmount { get; private set; }

    /// <summary>
    /// Satış Kâr/Zarar (Disposal Gain/Loss)
    /// </summary>
    public Money? DisposalGainLoss { get; private set; }

    /// <summary>
    /// Satış Faturası ID (Sale Invoice ID)
    /// </summary>
    public int? SaleInvoiceId { get; private set; }

    /// <summary>
    /// Alıcı ID (Buyer ID)
    /// </summary>
    public int? BuyerId { get; private set; }

    /// <summary>
    /// Elden Çıkarma Nedeni (Disposal Reason)
    /// </summary>
    public string? DisposalReason { get; private set; }

    #endregion

    #region Sigorta Bilgileri (Insurance Information)

    /// <summary>
    /// Sigortalı mı? (Is Insured)
    /// </summary>
    public bool IsInsured { get; private set; }

    /// <summary>
    /// Sigorta Poliçe No (Insurance Policy Number)
    /// </summary>
    public string? InsurancePolicyNumber { get; private set; }

    /// <summary>
    /// Sigorta Şirketi (Insurance Company)
    /// </summary>
    public string? InsuranceCompany { get; private set; }

    /// <summary>
    /// Sigorta Bitiş Tarihi (Insurance End Date)
    /// </summary>
    public DateTime? InsuranceEndDate { get; private set; }

    /// <summary>
    /// Sigorta Değeri (Insurance Value)
    /// </summary>
    public Money? InsuranceValue { get; private set; }

    #endregion

    #region Durum Bilgileri (Status Information)

    /// <summary>
    /// Durum (Status)
    /// </summary>
    public FixedAssetStatus Status { get; private set; }

    /// <summary>
    /// Aktif mi? (Is Active)
    /// </summary>
    public bool IsActive { get; private set; }

    /// <summary>
    /// Tamamen Amortize Edildi mi? (Is Fully Depreciated)
    /// </summary>
    public bool IsFullyDepreciated { get; private set; }

    /// <summary>
    /// Notlar (Notes)
    /// </summary>
    public string? Notes { get; private set; }

    /// <summary>
    /// Etiketler (Tags)
    /// </summary>
    public string? Tags { get; private set; }

    /// <summary>
    /// Resim Yolu (Image Path)
    /// </summary>
    public string? ImagePath { get; private set; }

    #endregion

    #region Navigation Properties

    public virtual Account? AssetAccount { get; private set; }
    public virtual Account? AccumulatedDepreciationAccount { get; private set; }
    public virtual Account? DepreciationExpenseAccount { get; private set; }
    public virtual CurrentAccount? Supplier { get; private set; }
    public virtual Invoice? Invoice { get; private set; }
    public virtual CostCenter? CostCenter { get; private set; }
    public virtual ICollection<FixedAssetDepreciation> Depreciations { get; private set; } = new List<FixedAssetDepreciation>();
    public virtual ICollection<FixedAssetMovement> Movements { get; private set; } = new List<FixedAssetMovement>();
    public virtual ICollection<FixedAssetMaintenance> Maintenances { get; private set; } = new List<FixedAssetMaintenance>();

    #endregion

    protected FixedAsset() { }

    public FixedAsset(
        string code,
        string name,
        FixedAssetType assetType,
        FixedAssetCategory category,
        DateTime acquisitionDate,
        Money acquisitionCost,
        int usefulLifeYears,
        DepreciationMethod depreciationMethod = DepreciationMethod.StraightLine)
    {
        Code = code;
        Name = name;
        AssetType = assetType;
        Category = category;
        AcquisitionDate = acquisitionDate;
        Currency = acquisitionCost.Currency;

        AcquisitionCost = acquisitionCost;
        CostValue = acquisitionCost;
        SalvageValue = Money.Zero(Currency);
        DepreciableAmount = acquisitionCost;
        AccumulatedDepreciation = Money.Zero(Currency);
        NetBookValue = acquisitionCost;

        DepreciationMethod = depreciationMethod;
        UsefulLifeYears = usefulLifeYears;
        UsefulLifeMonths = usefulLifeYears * 12;
        RemainingUsefulLifeMonths = UsefulLifeMonths;
        DepreciationRate = 100m / usefulLifeYears;
        IsPartialYearDepreciation = true;
        DepreciationPeriod = DepreciationPeriod.Monthly;

        // Set account group based on category
        AccountGroup = GetAccountGroupForCategory(category);

        Status = FixedAssetStatus.Acquired;
        IsActive = true;
        IsFullyDepreciated = false;
        IsInsured = false;
    }

    private static string GetAccountGroupForCategory(FixedAssetCategory category)
    {
        return category switch
        {
            FixedAssetCategory.Land => "250",
            FixedAssetCategory.LandImprovements => "251",
            FixedAssetCategory.Buildings => "252",
            FixedAssetCategory.MachineryEquipment => "253",
            FixedAssetCategory.Vehicles => "254",
            FixedAssetCategory.Fixtures => "255",
            FixedAssetCategory.OtherTangible => "256",
            FixedAssetCategory.Leasehold => "264",
            FixedAssetCategory.IntangibleRights => "260",
            FixedAssetCategory.Software => "267",
            FixedAssetCategory.Patents => "261",
            FixedAssetCategory.Goodwill => "262",
            _ => "256"
        };
    }

    public void SetDescription(string? description)
    {
        Description = description;
    }

    public void SetIdentifiers(string? barcode, string? serialNumber, string? modelNumber, string? brand)
    {
        Barcode = barcode;
        SerialNumber = serialNumber;
        ModelNumber = modelNumber;
        Brand = brand;
    }

    public void SetSubCategory(string? subCategory)
    {
        SubCategory = subCategory;
    }

    public void SetSalvageValue(Money salvageValue)
    {
        if (salvageValue.Currency != Currency)
            throw new InvalidOperationException("Currency mismatch");

        SalvageValue = salvageValue;
        RecalculateDepreciableAmount();
    }

    public void SetInServiceDate(DateTime inServiceDate)
    {
        InServiceDate = inServiceDate;
        DepreciationStartDate = inServiceDate;
        Status = FixedAssetStatus.InService;
    }

    public void SetWarrantyEndDate(DateTime? warrantyEndDate)
    {
        WarrantyEndDate = warrantyEndDate;
    }

    public void SetLocation(int? locationId, string? locationName, int? departmentId, int? branchId)
    {
        LocationId = locationId;
        LocationName = locationName;
        DepartmentId = departmentId;
        BranchId = branchId;
    }

    public void SetCustodian(int userId, string userName)
    {
        CustodianUserId = userId;
        CustodianName = userName;
    }

    public void SetSupplier(int? supplierId, string? supplierName, int? invoiceId, string? invoiceNumber)
    {
        SupplierId = supplierId;
        SupplierName = supplierName;
        InvoiceId = invoiceId;
        InvoiceNumber = invoiceNumber;
    }

    public void SetAccountingInfo(
        int assetAccountId,
        string assetAccountCode,
        int accumulatedDepreciationAccountId,
        string accumulatedDepreciationAccountCode,
        int depreciationExpenseAccountId)
    {
        AssetAccountId = assetAccountId;
        AssetAccountCode = assetAccountCode;
        AccumulatedDepreciationAccountId = accumulatedDepreciationAccountId;
        AccumulatedDepreciationAccountCode = accumulatedDepreciationAccountCode;
        DepreciationExpenseAccountId = depreciationExpenseAccountId;
    }

    public void SetCostCenter(int costCenterId)
    {
        CostCenterId = costCenterId;
    }

    public void SetInsurance(string policyNumber, string company, DateTime endDate, Money value)
    {
        IsInsured = true;
        InsurancePolicyNumber = policyNumber;
        InsuranceCompany = company;
        InsuranceEndDate = endDate;
        InsuranceValue = value;
    }

    public void SetDepreciationMethod(DepreciationMethod method, int usefulLifeYears, decimal? customRate = null)
    {
        DepreciationMethod = method;
        UsefulLifeYears = usefulLifeYears;
        UsefulLifeMonths = usefulLifeYears * 12;
        DepreciationRate = customRate ?? (100m / usefulLifeYears);
        RecalculateDepreciableAmount();
    }

    public void SetDepreciationPeriod(DepreciationPeriod period)
    {
        DepreciationPeriod = period;
    }

    public void SetPartialYearDepreciation(bool isPartialYear)
    {
        IsPartialYearDepreciation = isPartialYear;
    }

    public void SetNotes(string? notes)
    {
        Notes = notes;
    }

    public void SetTags(string? tags)
    {
        Tags = tags;
    }

    public void SetImagePath(string? imagePath)
    {
        ImagePath = imagePath;
    }

    private void RecalculateDepreciableAmount()
    {
        DepreciableAmount = Money.Create(CostValue.Amount - SalvageValue.Amount, Currency);
    }

    #region Cost Operations

    /// <summary>
    /// Maliyete ekleme (Add to cost - improvements, additions)
    /// </summary>
    public void AddToCost(Money amount, string description)
    {
        if (amount.Currency != Currency)
            throw new InvalidOperationException("Currency mismatch");

        CostValue = Money.Create(CostValue.Amount + amount.Amount, Currency);
        RecalculateDepreciableAmount();
        RecalculateNetBookValue();

        Notes = string.IsNullOrEmpty(Notes)
            ? $"Cost addition: {amount.Amount:N2} - {description}"
            : $"{Notes}\nCost addition: {amount.Amount:N2} - {description}";
    }

    /// <summary>
    /// Yeniden değerleme (Revaluation)
    /// </summary>
    public void Revalue(Money newValue, string? reason = null)
    {
        if (newValue.Currency != Currency)
            throw new InvalidOperationException("Currency mismatch");

        var difference = newValue.Amount - CostValue.Amount;
        RevaluationAmount = Money.Create(difference, Currency);
        CostValue = newValue;
        LastRevaluationDate = DateTime.UtcNow;

        RecalculateDepreciableAmount();
        RecalculateNetBookValue();

        if (!string.IsNullOrEmpty(reason))
        {
            Notes = string.IsNullOrEmpty(Notes)
                ? $"Revaluation: {reason}"
                : $"{Notes}\nRevaluation: {reason}";
        }
    }

    #endregion

    #region Depreciation Operations

    /// <summary>
    /// Amortisman hesapla (Calculate depreciation)
    /// </summary>
    public Money CalculateDepreciation(DateTime asOfDate)
    {
        if (IsFullyDepreciated || Status == FixedAssetStatus.Disposed)
            return Money.Zero(Currency);

        if (!InServiceDate.HasValue)
            return Money.Zero(Currency);

        return DepreciationMethod switch
        {
            DepreciationMethod.StraightLine => CalculateStraightLineDepreciation(asOfDate),
            DepreciationMethod.DecliningBalance => CalculateDecliningBalanceDepreciation(asOfDate),
            DepreciationMethod.DoubleDecliningBalance => CalculateDoubleDecliningBalanceDepreciation(asOfDate),
            DepreciationMethod.SumOfYearsDigits => CalculateSumOfYearsDigitsDepreciation(asOfDate),
            DepreciationMethod.UnitsOfProduction => Money.Zero(Currency), // Requires production units
            _ => CalculateStraightLineDepreciation(asOfDate)
        };
    }

    private Money CalculateStraightLineDepreciation(DateTime asOfDate)
    {
        var annualDepreciation = DepreciableAmount.Amount / UsefulLifeYears;

        if (DepreciationPeriod == DepreciationPeriod.Monthly)
        {
            return Money.Create(annualDepreciation / 12, Currency);
        }

        return Money.Create(annualDepreciation, Currency);
    }

    private Money CalculateDecliningBalanceDepreciation(DateTime asOfDate)
    {
        var rate = DepreciationRate / 100;
        var depreciation = NetBookValue.Amount * rate;

        if (DepreciationPeriod == DepreciationPeriod.Monthly)
        {
            depreciation /= 12;
        }

        // Ensure we don't go below salvage value
        if (NetBookValue.Amount - depreciation < SalvageValue.Amount)
        {
            depreciation = NetBookValue.Amount - SalvageValue.Amount;
        }

        return Money.Create(depreciation, Currency);
    }

    private Money CalculateDoubleDecliningBalanceDepreciation(DateTime asOfDate)
    {
        var rate = (DepreciationRate * 2) / 100;
        var depreciation = NetBookValue.Amount * rate;

        if (DepreciationPeriod == DepreciationPeriod.Monthly)
        {
            depreciation /= 12;
        }

        // Ensure we don't go below salvage value
        if (NetBookValue.Amount - depreciation < SalvageValue.Amount)
        {
            depreciation = NetBookValue.Amount - SalvageValue.Amount;
        }

        return Money.Create(depreciation, Currency);
    }

    private Money CalculateSumOfYearsDigitsDepreciation(DateTime asOfDate)
    {
        var sumOfYears = (UsefulLifeYears * (UsefulLifeYears + 1)) / 2;
        var yearsUsed = (DateTime.Today - InServiceDate!.Value).Days / 365;
        var remainingYears = UsefulLifeYears - yearsUsed;

        if (remainingYears <= 0)
            return Money.Zero(Currency);

        var depreciation = DepreciableAmount.Amount * (remainingYears / (decimal)sumOfYears);

        if (DepreciationPeriod == DepreciationPeriod.Monthly)
        {
            depreciation /= 12;
        }

        return Money.Create(depreciation, Currency);
    }

    /// <summary>
    /// Amortisman uygula (Apply depreciation)
    /// </summary>
    public void ApplyDepreciation(Money amount, DateTime depreciationDate)
    {
        if (IsFullyDepreciated)
            throw new InvalidOperationException("Asset is already fully depreciated");

        if (amount.Currency != Currency)
            throw new InvalidOperationException("Currency mismatch");

        AccumulatedDepreciation = Money.Create(AccumulatedDepreciation.Amount + amount.Amount, Currency);
        LastDepreciationDate = depreciationDate;

        if (RemainingUsefulLifeMonths > 0)
            RemainingUsefulLifeMonths--;

        RecalculateNetBookValue();

        if (NetBookValue.Amount <= SalvageValue.Amount)
        {
            IsFullyDepreciated = true;
        }
    }

    private void RecalculateNetBookValue()
    {
        NetBookValue = Money.Create(CostValue.Amount - AccumulatedDepreciation.Amount, Currency);

        if (NetBookValue.Amount < 0)
            NetBookValue = Money.Zero(Currency);
    }

    #endregion

    #region Disposal Operations

    /// <summary>
    /// Elden çıkar (Dispose asset)
    /// </summary>
    public void Dispose(DisposalType disposalType, DateTime disposalDate, Money? saleAmount = null, string? reason = null)
    {
        DisposalType = disposalType;
        DisposalDate = disposalDate;
        DisposalReason = reason;
        Status = FixedAssetStatus.Disposed;
        IsActive = false;

        if (saleAmount != null)
        {
            SaleAmount = saleAmount;
            DisposalGainLoss = Money.Create(saleAmount.Amount - NetBookValue.Amount, Currency);
        }
    }

    /// <summary>
    /// Satış yap (Sell asset)
    /// </summary>
    public void Sell(DateTime saleDate, Money saleAmount, int? buyerId, int? saleInvoiceId)
    {
        SaleAmount = saleAmount;
        BuyerId = buyerId;
        SaleInvoiceId = saleInvoiceId;

        Dispose(Domain.Entities.DisposalType.Sale, saleDate, saleAmount, "Sold");
    }

    /// <summary>
    /// Hurda yap (Scrap asset)
    /// </summary>
    public void Scrap(DateTime scrapDate, string reason)
    {
        Dispose(Domain.Entities.DisposalType.Scrap, scrapDate, Money.Zero(Currency), reason);
    }

    /// <summary>
    /// Transfer et (Transfer asset)
    /// </summary>
    public void Transfer(DateTime transferDate, int? newBuyerId, string reason)
    {
        Dispose(Domain.Entities.DisposalType.Transfer, transferDate, null, reason);
        BuyerId = newBuyerId;
    }

    #endregion

    #region Status Management

    public void Activate() => IsActive = true;
    public void Deactivate() => IsActive = false;

    public void SetStatus(FixedAssetStatus status)
    {
        Status = status;
    }

    public void MarkUnderMaintenance()
    {
        Status = FixedAssetStatus.UnderMaintenance;
    }

    public void ReturnFromMaintenance()
    {
        Status = FixedAssetStatus.InService;
    }

    #endregion

    #region Factory Methods

    /// <summary>
    /// Makine/Teçhizat oluştur (Create machinery/equipment)
    /// </summary>
    public static FixedAsset CreateMachineryEquipment(
        string code,
        string name,
        DateTime acquisitionDate,
        Money acquisitionCost,
        int usefulLifeYears = 10)
    {
        return new FixedAsset(
            code,
            name,
            FixedAssetType.Tangible,
            FixedAssetCategory.MachineryEquipment,
            acquisitionDate,
            acquisitionCost,
            usefulLifeYears);
    }

    /// <summary>
    /// Araç oluştur (Create vehicle)
    /// </summary>
    public static FixedAsset CreateVehicle(
        string code,
        string name,
        DateTime acquisitionDate,
        Money acquisitionCost,
        int usefulLifeYears = 5)
    {
        return new FixedAsset(
            code,
            name,
            FixedAssetType.Tangible,
            FixedAssetCategory.Vehicles,
            acquisitionDate,
            acquisitionCost,
            usefulLifeYears);
    }

    /// <summary>
    /// Demirbaş oluştur (Create fixture)
    /// </summary>
    public static FixedAsset CreateFixture(
        string code,
        string name,
        DateTime acquisitionDate,
        Money acquisitionCost,
        int usefulLifeYears = 5)
    {
        return new FixedAsset(
            code,
            name,
            FixedAssetType.Tangible,
            FixedAssetCategory.Fixtures,
            acquisitionDate,
            acquisitionCost,
            usefulLifeYears);
    }

    /// <summary>
    /// Bina oluştur (Create building)
    /// </summary>
    public static FixedAsset CreateBuilding(
        string code,
        string name,
        DateTime acquisitionDate,
        Money acquisitionCost,
        int usefulLifeYears = 50)
    {
        return new FixedAsset(
            code,
            name,
            FixedAssetType.Tangible,
            FixedAssetCategory.Buildings,
            acquisitionDate,
            acquisitionCost,
            usefulLifeYears);
    }

    /// <summary>
    /// Yazılım oluştur (Create software)
    /// </summary>
    public static FixedAsset CreateSoftware(
        string code,
        string name,
        DateTime acquisitionDate,
        Money acquisitionCost,
        int usefulLifeYears = 3)
    {
        return new FixedAsset(
            code,
            name,
            FixedAssetType.Intangible,
            FixedAssetCategory.Software,
            acquisitionDate,
            acquisitionCost,
            usefulLifeYears);
    }

    #endregion
}

/// <summary>
/// Duran Varlık Amortismanı (Fixed Asset Depreciation Record)
/// </summary>
public class FixedAssetDepreciation : BaseEntity
{
    /// <summary>
    /// Duran Varlık ID (Fixed Asset ID)
    /// </summary>
    public int FixedAssetId { get; private set; }

    /// <summary>
    /// Dönem (Period)
    /// </summary>
    public string Period { get; private set; } = string.Empty;

    /// <summary>
    /// Dönem Başlangıç (Period Start)
    /// </summary>
    public DateTime PeriodStart { get; private set; }

    /// <summary>
    /// Dönem Bitiş (Period End)
    /// </summary>
    public DateTime PeriodEnd { get; private set; }

    /// <summary>
    /// Amortisman Tutarı (Depreciation Amount)
    /// </summary>
    public Money DepreciationAmount { get; private set; } = null!;

    /// <summary>
    /// Dönem Sonu Birikmiş Amortisman (Accumulated Depreciation at Period End)
    /// </summary>
    public Money AccumulatedDepreciation { get; private set; } = null!;

    /// <summary>
    /// Dönem Sonu Net Değer (Net Book Value at Period End)
    /// </summary>
    public Money NetBookValue { get; private set; } = null!;

    /// <summary>
    /// Muhasebe Kaydı ID (Journal Entry ID)
    /// </summary>
    public int? JournalEntryId { get; private set; }

    /// <summary>
    /// Muhasebeye Aktarıldı mı? (Is Posted)
    /// </summary>
    public bool IsPosted { get; private set; }

    /// <summary>
    /// Hesaplama Tarihi (Calculation Date)
    /// </summary>
    public DateTime CalculationDate { get; private set; }

    public virtual FixedAsset FixedAsset { get; private set; } = null!;
    public virtual JournalEntry? JournalEntry { get; private set; }

    protected FixedAssetDepreciation() { }

    public FixedAssetDepreciation(
        int fixedAssetId,
        string period,
        DateTime periodStart,
        DateTime periodEnd,
        Money depreciationAmount,
        Money accumulatedDepreciation,
        Money netBookValue)
    {
        FixedAssetId = fixedAssetId;
        Period = period;
        PeriodStart = periodStart;
        PeriodEnd = periodEnd;
        DepreciationAmount = depreciationAmount;
        AccumulatedDepreciation = accumulatedDepreciation;
        NetBookValue = netBookValue;
        CalculationDate = DateTime.UtcNow;
        IsPosted = false;
    }

    public void Post(int journalEntryId)
    {
        JournalEntryId = journalEntryId;
        IsPosted = true;
    }
}

/// <summary>
/// Duran Varlık Hareketi (Fixed Asset Movement)
/// </summary>
public class FixedAssetMovement : BaseEntity
{
    public int FixedAssetId { get; private set; }
    public FixedAssetMovementType MovementType { get; private set; }
    public DateTime MovementDate { get; private set; }
    public string Description { get; private set; } = string.Empty;
    public int? FromLocationId { get; private set; }
    public int? ToLocationId { get; private set; }
    public int? FromDepartmentId { get; private set; }
    public int? ToDepartmentId { get; private set; }
    public int? FromCustodianId { get; private set; }
    public int? ToCustodianId { get; private set; }
    public Money? Amount { get; private set; }
    public int? JournalEntryId { get; private set; }
    public string? Notes { get; private set; }

    public virtual FixedAsset FixedAsset { get; private set; } = null!;

    protected FixedAssetMovement() { }

    public FixedAssetMovement(
        int fixedAssetId,
        FixedAssetMovementType movementType,
        DateTime movementDate,
        string description)
    {
        FixedAssetId = fixedAssetId;
        MovementType = movementType;
        MovementDate = movementDate;
        Description = description;
    }
}

/// <summary>
/// Duran Varlık Bakımı (Fixed Asset Maintenance)
/// </summary>
public class FixedAssetMaintenance : BaseEntity
{
    public int FixedAssetId { get; private set; }
    public MaintenanceType MaintenanceType { get; private set; }
    public DateTime MaintenanceDate { get; private set; }
    public string Description { get; private set; } = string.Empty;
    public int? SupplierId { get; private set; }
    public Money Cost { get; private set; } = null!;
    public DateTime? NextMaintenanceDate { get; private set; }
    public bool IsCompleted { get; private set; }
    public string? Notes { get; private set; }

    public virtual FixedAsset FixedAsset { get; private set; } = null!;

    protected FixedAssetMaintenance() { }

    public FixedAssetMaintenance(
        int fixedAssetId,
        MaintenanceType maintenanceType,
        DateTime maintenanceDate,
        string description,
        Money cost)
    {
        FixedAssetId = fixedAssetId;
        MaintenanceType = maintenanceType;
        MaintenanceDate = maintenanceDate;
        Description = description;
        Cost = cost;
        IsCompleted = false;
    }

    public void Complete()
    {
        IsCompleted = true;
    }
}

#region Enums

/// <summary>
/// Duran Varlık Türleri (Fixed Asset Types)
/// </summary>
public enum FixedAssetType
{
    /// <summary>
    /// Maddi (Tangible)
    /// </summary>
    Tangible = 1,

    /// <summary>
    /// Maddi Olmayan (Intangible)
    /// </summary>
    Intangible = 2
}

/// <summary>
/// Duran Varlık Kategorileri (Fixed Asset Categories)
/// </summary>
public enum FixedAssetCategory
{
    // Maddi Duran Varlıklar (Tangible Fixed Assets)

    /// <summary>
    /// Arazi ve Arsalar (250)
    /// </summary>
    Land = 1,

    /// <summary>
    /// Yeraltı ve Yerüstü Düzenleri (251)
    /// </summary>
    LandImprovements = 2,

    /// <summary>
    /// Binalar (252)
    /// </summary>
    Buildings = 3,

    /// <summary>
    /// Tesis, Makine ve Cihazlar (253)
    /// </summary>
    MachineryEquipment = 4,

    /// <summary>
    /// Taşıtlar (254)
    /// </summary>
    Vehicles = 5,

    /// <summary>
    /// Demirbaşlar (255)
    /// </summary>
    Fixtures = 6,

    /// <summary>
    /// Diğer Maddi Duran Varlıklar (256)
    /// </summary>
    OtherTangible = 7,

    /// <summary>
    /// Özel Maliyetler (264)
    /// </summary>
    Leasehold = 8,

    // Maddi Olmayan Duran Varlıklar (Intangible Fixed Assets)

    /// <summary>
    /// Haklar (260)
    /// </summary>
    IntangibleRights = 10,

    /// <summary>
    /// Patent (261)
    /// </summary>
    Patents = 11,

    /// <summary>
    /// Şerefiye (262)
    /// </summary>
    Goodwill = 12,

    /// <summary>
    /// Kuruluş ve Örgütlenme Giderleri (263)
    /// </summary>
    OrganizationCosts = 13,

    /// <summary>
    /// Araştırma ve Geliştirme Giderleri (263)
    /// </summary>
    RnD = 14,

    /// <summary>
    /// Yazılımlar (267)
    /// </summary>
    Software = 15,

    /// <summary>
    /// Diğer Maddi Olmayan Duran Varlıklar (268)
    /// </summary>
    OtherIntangible = 16
}

/// <summary>
/// Amortisman Yöntemleri (Depreciation Methods)
/// </summary>
public enum DepreciationMethod
{
    /// <summary>
    /// Normal Amortisman (Straight-Line)
    /// </summary>
    StraightLine = 1,

    /// <summary>
    /// Azalan Bakiyeler (Declining Balance)
    /// </summary>
    DecliningBalance = 2,

    /// <summary>
    /// Çift Azalan Bakiyeler (Double Declining Balance)
    /// </summary>
    DoubleDecliningBalance = 3,

    /// <summary>
    /// Yılların Toplamı (Sum of Years Digits)
    /// </summary>
    SumOfYearsDigits = 4,

    /// <summary>
    /// Üretim Birimi (Units of Production)
    /// </summary>
    UnitsOfProduction = 5,

    /// <summary>
    /// Amortisman Yok (No Depreciation)
    /// </summary>
    None = 99
}

/// <summary>
/// Amortisman Periyodu (Depreciation Period)
/// </summary>
public enum DepreciationPeriod
{
    /// <summary>
    /// Aylık (Monthly)
    /// </summary>
    Monthly = 1,

    /// <summary>
    /// Üç Aylık (Quarterly)
    /// </summary>
    Quarterly = 2,

    /// <summary>
    /// Yıllık (Annually)
    /// </summary>
    Annually = 3
}

/// <summary>
/// Duran Varlık Durumları (Fixed Asset Statuses)
/// </summary>
public enum FixedAssetStatus
{
    /// <summary>
    /// Alındı (Acquired)
    /// </summary>
    Acquired = 1,

    /// <summary>
    /// Kullanımda (In Service)
    /// </summary>
    InService = 2,

    /// <summary>
    /// Bakımda (Under Maintenance)
    /// </summary>
    UnderMaintenance = 3,

    /// <summary>
    /// Kullanım Dışı (Out of Service)
    /// </summary>
    OutOfService = 4,

    /// <summary>
    /// Elden Çıkarıldı (Disposed)
    /// </summary>
    Disposed = 5,

    /// <summary>
    /// Kayıp (Lost)
    /// </summary>
    Lost = 6
}

/// <summary>
/// Elden Çıkarma Türleri (Disposal Types)
/// </summary>
public enum DisposalType
{
    /// <summary>
    /// Satış (Sale)
    /// </summary>
    Sale = 1,

    /// <summary>
    /// Hurda (Scrap)
    /// </summary>
    Scrap = 2,

    /// <summary>
    /// Bağış (Donation)
    /// </summary>
    Donation = 3,

    /// <summary>
    /// Transfer (Transfer)
    /// </summary>
    Transfer = 4,

    /// <summary>
    /// Kayıp/Çalıntı (Lost/Stolen)
    /// </summary>
    LostStolen = 5,

    /// <summary>
    /// Sigorta Hasarı (Insurance Claim)
    /// </summary>
    InsuranceClaim = 6
}

/// <summary>
/// Duran Varlık Hareket Türleri (Fixed Asset Movement Types)
/// </summary>
public enum FixedAssetMovementType
{
    /// <summary>
    /// Alım (Acquisition)
    /// </summary>
    Acquisition = 1,

    /// <summary>
    /// Lokasyon Değişikliği (Location Change)
    /// </summary>
    LocationChange = 2,

    /// <summary>
    /// Departman Değişikliği (Department Change)
    /// </summary>
    DepartmentChange = 3,

    /// <summary>
    /// Zimmet Değişikliği (Custodian Change)
    /// </summary>
    CustodianChange = 4,

    /// <summary>
    /// Değer Artışı (Value Increase)
    /// </summary>
    ValueIncrease = 5,

    /// <summary>
    /// Değer Düşüşü (Value Decrease)
    /// </summary>
    ValueDecrease = 6,

    /// <summary>
    /// Yeniden Değerleme (Revaluation)
    /// </summary>
    Revaluation = 7,

    /// <summary>
    /// Amortisman (Depreciation)
    /// </summary>
    Depreciation = 8,

    /// <summary>
    /// Elden Çıkarma (Disposal)
    /// </summary>
    Disposal = 9
}

/// <summary>
/// Bakım Türleri (Maintenance Types)
/// </summary>
public enum MaintenanceType
{
    /// <summary>
    /// Koruyucu Bakım (Preventive)
    /// </summary>
    Preventive = 1,

    /// <summary>
    /// Düzeltici Bakım (Corrective)
    /// </summary>
    Corrective = 2,

    /// <summary>
    /// Arıza Bakımı (Breakdown)
    /// </summary>
    Breakdown = 3,

    /// <summary>
    /// Periyodik Bakım (Periodic)
    /// </summary>
    Periodic = 4,

    /// <summary>
    /// Kalibrasyon (Calibration)
    /// </summary>
    Calibration = 5,

    /// <summary>
    /// Genel Revizyon (Overhaul)
    /// </summary>
    Overhaul = 6
}

#endregion
