using Stocker.SharedKernel.MultiTenancy;

namespace Stocker.Modules.Purchase.Domain.Entities;

/// <summary>
/// İthalat beyannamesi entity'si - Gümrük işlemleri ve ithalat takibi
/// Import Declaration entity - Customs procedures and import tracking
/// </summary>
public class ImportDeclaration : TenantAggregateRoot
{
    private readonly List<ImportDeclarationItem> _items = new();
    private readonly List<ImportDeclarationCost> _costs = new();

    #region Temel Bilgiler (Basic Information)

    /// <summary>
    /// Beyanname numarası / Declaration number
    /// </summary>
    public string DeclarationNumber { get; private set; } = string.Empty;

    /// <summary>
    /// Gümrük beyanname numarası / Customs declaration number
    /// </summary>
    public string? CustomsDeclarationNumber { get; private set; }

    /// <summary>
    /// Tedarikçi ID / Supplier ID
    /// </summary>
    public Guid SupplierId { get; private set; }

    /// <summary>
    /// Durum / Status
    /// </summary>
    public ImportDeclarationStatus Status { get; private set; }

    /// <summary>
    /// İthalat tipi / Import type
    /// </summary>
    public ImportType ImportType { get; private set; }

    #endregion

    #region Tarih Bilgileri (Date Information)

    /// <summary>
    /// Beyanname tarihi / Declaration date
    /// </summary>
    public DateTime DeclarationDate { get; private set; }

    /// <summary>
    /// Yükleme tarihi / Loading date
    /// </summary>
    public DateTime? LoadingDate { get; private set; }

    /// <summary>
    /// Tahmini varış tarihi / Estimated arrival date
    /// </summary>
    public DateTime? EstimatedArrivalDate { get; private set; }

    /// <summary>
    /// Gerçek varış tarihi / Actual arrival date
    /// </summary>
    public DateTime? ActualArrivalDate { get; private set; }

    /// <summary>
    /// Gümrük giriş tarihi / Customs entry date
    /// </summary>
    public DateTime? CustomsEntryDate { get; private set; }

    /// <summary>
    /// Gümrük çıkış tarihi / Customs clearance date
    /// </summary>
    public DateTime? CustomsClearanceDate { get; private set; }

    #endregion

    #region Nakliye Bilgileri (Shipping Information)

    /// <summary>
    /// Nakliye şekli / Shipping method
    /// </summary>
    public ShippingMethod ShippingMethod { get; private set; }

    /// <summary>
    /// Teslim şekli (Incoterm) / Incoterm
    /// </summary>
    public string? Incoterm { get; private set; }

    /// <summary>
    /// Nakliye firması / Shipping company
    /// </summary>
    public string? ShippingCompany { get; private set; }

    /// <summary>
    /// Konşimento numarası / Bill of lading number
    /// </summary>
    public string? BillOfLadingNumber { get; private set; }

    /// <summary>
    /// Konteyner numaraları / Container numbers
    /// </summary>
    public string? ContainerNumbers { get; private set; }

    /// <summary>
    /// Gemi/Uçuş adı / Vessel/Flight name
    /// </summary>
    public string? VesselName { get; private set; }

    /// <summary>
    /// Sefer numarası / Voyage number
    /// </summary>
    public string? VoyageNumber { get; private set; }

    #endregion

    #region Çıkış/Varış Bilgileri (Origin/Destination)

    /// <summary>
    /// Menşe ülke / Country of origin
    /// </summary>
    public string CountryOfOrigin { get; private set; } = string.Empty;

    /// <summary>
    /// Yükleme limanı / Loading port
    /// </summary>
    public string? LoadingPort { get; private set; }

    /// <summary>
    /// Varış limanı / Destination port
    /// </summary>
    public string? DestinationPort { get; private set; }

    /// <summary>
    /// Gümrük noktası / Customs point
    /// </summary>
    public string? CustomsPoint { get; private set; }

    /// <summary>
    /// Varış deposu ID / Destination warehouse ID
    /// </summary>
    public Guid? DestinationWarehouseId { get; private set; }

    #endregion

    #region Mal Bilgileri (Cargo Information)

    /// <summary>
    /// Toplam brüt ağırlık (kg) / Total gross weight (kg)
    /// </summary>
    public decimal TotalGrossWeight { get; private set; }

    /// <summary>
    /// Toplam net ağırlık (kg) / Total net weight (kg)
    /// </summary>
    public decimal TotalNetWeight { get; private set; }

    /// <summary>
    /// Toplam hacim (m³) / Total volume (m³)
    /// </summary>
    public decimal? TotalVolume { get; private set; }

    /// <summary>
    /// Toplam kap sayısı / Total package count
    /// </summary>
    public int TotalPackageCount { get; private set; }

    /// <summary>
    /// Ambalaj türü / Package type
    /// </summary>
    public string? PackageType { get; private set; }

    #endregion

    #region Değer Bilgileri (Value Information)

    /// <summary>
    /// FOB değeri / FOB value
    /// </summary>
    public decimal FobValue { get; private set; }

    /// <summary>
    /// CIF değeri / CIF value
    /// </summary>
    public decimal CifValue { get; private set; }

    /// <summary>
    /// Navlun tutarı / Freight amount
    /// </summary>
    public decimal FreightAmount { get; private set; }

    /// <summary>
    /// Sigorta tutarı / Insurance amount
    /// </summary>
    public decimal InsuranceAmount { get; private set; }

    /// <summary>
    /// Para birimi / Currency
    /// </summary>
    public string Currency { get; private set; } = "USD";

    /// <summary>
    /// Döviz kuru / Exchange rate
    /// </summary>
    public decimal ExchangeRate { get; private set; } = 1;

    /// <summary>
    /// TL karşılığı / Value in TRY
    /// </summary>
    public decimal ValueInTRY { get; private set; }

    #endregion

    #region Vergi ve Gümrük (Tax and Customs)

    /// <summary>
    /// Gümrük vergisi / Customs duty
    /// </summary>
    public decimal CustomsDuty { get; private set; }

    /// <summary>
    /// KDV tutarı / VAT amount
    /// </summary>
    public decimal VatAmount { get; private set; }

    /// <summary>
    /// ÖTV tutarı / Special consumption tax
    /// </summary>
    public decimal? SpecialConsumptionTax { get; private set; }

    /// <summary>
    /// Damga vergisi / Stamp duty
    /// </summary>
    public decimal? StampDuty { get; private set; }

    /// <summary>
    /// Diğer vergiler / Other taxes
    /// </summary>
    public decimal OtherTaxes { get; private set; }

    /// <summary>
    /// Toplam vergi / Total taxes
    /// </summary>
    public decimal TotalTaxes => CustomsDuty + VatAmount + (SpecialConsumptionTax ?? 0) + (StampDuty ?? 0) + OtherTaxes;

    /// <summary>
    /// Toplam maliyet / Total cost
    /// </summary>
    public decimal TotalCost { get; private set; }

    #endregion

    #region Gümrük Müşaviri (Customs Broker)

    /// <summary>
    /// Gümrük müşaviri / Customs broker
    /// </summary>
    public string? CustomsBroker { get; private set; }

    /// <summary>
    /// Müşavir telefon / Broker phone
    /// </summary>
    public string? BrokerPhone { get; private set; }

    /// <summary>
    /// Müşavir e-posta / Broker email
    /// </summary>
    public string? BrokerEmail { get; private set; }

    /// <summary>
    /// Müşavirlik ücreti / Brokerage fee
    /// </summary>
    public decimal? BrokerageFee { get; private set; }

    #endregion

    #region Sigorta Bilgileri (Insurance Information)

    /// <summary>
    /// Sigorta şirketi / Insurance company
    /// </summary>
    public string? InsuranceCompany { get; private set; }

    /// <summary>
    /// Poliçe numarası / Policy number
    /// </summary>
    public string? PolicyNumber { get; private set; }

    /// <summary>
    /// Sigorta bedeli / Insured value
    /// </summary>
    public decimal? InsuredValue { get; private set; }

    #endregion

    #region İlişkili Belgeler (Related Documents)

    /// <summary>
    /// İlişkili sipariş ID / Related purchase order ID
    /// </summary>
    public Guid? RelatedPurchaseOrderId { get; private set; }

    /// <summary>
    /// İlişkili fatura ID / Related invoice ID
    /// </summary>
    public Guid? RelatedInvoiceId { get; private set; }

    /// <summary>
    /// İlişkili mal kabul ID / Related goods receipt ID
    /// </summary>
    public Guid? RelatedGoodsReceiptId { get; private set; }

    #endregion

    #region Belgeler (Documents)

    /// <summary>
    /// Proforma fatura URL / Proforma invoice URL
    /// </summary>
    public string? ProformaInvoiceUrl { get; private set; }

    /// <summary>
    /// Ticari fatura URL / Commercial invoice URL
    /// </summary>
    public string? CommercialInvoiceUrl { get; private set; }

    /// <summary>
    /// Paketleme listesi URL / Packing list URL
    /// </summary>
    public string? PackingListUrl { get; private set; }

    /// <summary>
    /// Menşe şahadetnamesi URL / Certificate of origin URL
    /// </summary>
    public string? CertificateOfOriginUrl { get; private set; }

    /// <summary>
    /// Diğer belgeler / Other documents
    /// </summary>
    public string? OtherDocumentsJson { get; private set; }

    #endregion

    #region Ek Bilgiler (Additional Information)

    /// <summary>
    /// Notlar / Notes
    /// </summary>
    public string? Notes { get; private set; }

    /// <summary>
    /// Etiketler / Tags
    /// </summary>
    public string? Tags { get; private set; }

    /// <summary>
    /// Oluşturma tarihi / Creation date
    /// </summary>
    public DateTime CreatedAt { get; private set; }

    /// <summary>
    /// Güncelleme tarihi / Update date
    /// </summary>
    public DateTime? UpdatedAt { get; private set; }

    #endregion

    // Navigation Properties
    public virtual Supplier Supplier { get; private set; } = null!;
    public virtual PurchaseOrder? RelatedPurchaseOrder { get; private set; }
    public virtual IReadOnlyCollection<ImportDeclarationItem> Items => _items.AsReadOnly();
    public virtual IReadOnlyCollection<ImportDeclarationCost> Costs => _costs.AsReadOnly();

    protected ImportDeclaration() : base() { }

    public static ImportDeclaration Create(
        string declarationNumber,
        Guid supplierId,
        ImportType importType,
        string countryOfOrigin,
        Guid tenantId,
        DateTime? declarationDate = null)
    {
        var declaration = new ImportDeclaration();
        declaration.Id = Guid.NewGuid();
        declaration.SetTenantId(tenantId);
        declaration.DeclarationNumber = declarationNumber;
        declaration.SupplierId = supplierId;
        declaration.ImportType = importType;
        declaration.CountryOfOrigin = countryOfOrigin;
        declaration.DeclarationDate = declarationDate ?? DateTime.UtcNow;
        declaration.Status = ImportDeclarationStatus.Draft;
        declaration.ShippingMethod = ShippingMethod.Sea;
        declaration.Currency = "USD";
        declaration.ExchangeRate = 1;
        declaration.CreatedAt = DateTime.UtcNow;
        return declaration;
    }

    public ImportDeclarationItem AddItem(
        Guid productId,
        string productName,
        string hsCode,
        decimal quantity,
        string unit,
        decimal unitPrice,
        decimal customsDutyRate)
    {
        var item = new ImportDeclarationItem(Id, productId, productName, hsCode, quantity, unit, unitPrice, customsDutyRate);
        _items.Add(item);
        RecalculateTotals();
        return item;
    }

    public void RemoveItem(Guid itemId)
    {
        var item = _items.FirstOrDefault(i => i.Id == itemId);
        if (item != null)
        {
            _items.Remove(item);
            RecalculateTotals();
        }
    }

    public ImportDeclarationCost AddCost(
        ImportCostType costType,
        string description,
        decimal amount,
        string? currency = null)
    {
        var cost = new ImportDeclarationCost(Id, costType, description, amount, currency ?? Currency);
        _costs.Add(cost);
        RecalculateTotals();
        return cost;
    }

    public void RemoveCost(Guid costId)
    {
        var cost = _costs.FirstOrDefault(c => c.Id == costId);
        if (cost != null)
        {
            _costs.Remove(cost);
            RecalculateTotals();
        }
    }

    private void RecalculateTotals()
    {
        FobValue = _items.Sum(i => i.FobValue);
        TotalGrossWeight = _items.Sum(i => i.GrossWeight);
        TotalNetWeight = _items.Sum(i => i.NetWeight);
        TotalPackageCount = _items.Sum(i => i.PackageCount);
        CustomsDuty = _items.Sum(i => i.CustomsDutyAmount);
        VatAmount = _items.Sum(i => i.VatAmount);

        CifValue = FobValue + FreightAmount + InsuranceAmount;
        ValueInTRY = CifValue * ExchangeRate;

        var additionalCosts = _costs.Sum(c => c.AmountInTRY);
        TotalCost = ValueInTRY + TotalTaxes + additionalCosts;

        UpdatedAt = DateTime.UtcNow;
    }

    public void SetShippingInfo(
        ShippingMethod method,
        string? incoterm,
        string? company,
        string? billOfLading,
        string? containers,
        string? vessel,
        string? voyage)
    {
        ShippingMethod = method;
        Incoterm = incoterm;
        ShippingCompany = company;
        BillOfLadingNumber = billOfLading;
        ContainerNumbers = containers;
        VesselName = vessel;
        VoyageNumber = voyage;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetPorts(string? loadingPort, string? destinationPort, string? customsPoint)
    {
        LoadingPort = loadingPort;
        DestinationPort = destinationPort;
        CustomsPoint = customsPoint;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetFreightAndInsurance(decimal freight, decimal insurance)
    {
        FreightAmount = freight;
        InsuranceAmount = insurance;
        RecalculateTotals();
    }

    public void SetExchangeRate(decimal rate)
    {
        ExchangeRate = rate;
        RecalculateTotals();
    }

    public void SetCustomsBroker(string? broker, string? phone, string? email, decimal? fee)
    {
        CustomsBroker = broker;
        BrokerPhone = phone;
        BrokerEmail = email;
        BrokerageFee = fee;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetInsuranceInfo(string? company, string? policy, decimal? insuredValue)
    {
        InsuranceCompany = company;
        PolicyNumber = policy;
        InsuredValue = insuredValue;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetDates(DateTime? loading, DateTime? estimatedArrival, DateTime? actualArrival)
    {
        LoadingDate = loading;
        EstimatedArrivalDate = estimatedArrival;
        ActualArrivalDate = actualArrival;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Submit()
    {
        if (Status != ImportDeclarationStatus.Draft)
            throw new InvalidOperationException("Only draft declarations can be submitted");

        Status = ImportDeclarationStatus.Submitted;
        UpdatedAt = DateTime.UtcNow;
    }

    public void StartCustomsClearance(string customsNumber, DateTime entryDate)
    {
        CustomsDeclarationNumber = customsNumber;
        CustomsEntryDate = entryDate;
        Status = ImportDeclarationStatus.InCustoms;
        UpdatedAt = DateTime.UtcNow;
    }

    public void ClearCustoms(DateTime clearanceDate)
    {
        CustomsClearanceDate = clearanceDate;
        Status = ImportDeclarationStatus.Cleared;
        UpdatedAt = DateTime.UtcNow;
    }

    public void ReceiveGoods(Guid goodsReceiptId)
    {
        RelatedGoodsReceiptId = goodsReceiptId;
        Status = ImportDeclarationStatus.Received;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Complete()
    {
        Status = ImportDeclarationStatus.Completed;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Cancel(string reason)
    {
        Status = ImportDeclarationStatus.Cancelled;
        Notes = $"İptal nedeni: {reason}. {Notes}";
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetRelatedPurchaseOrder(Guid? orderId) => RelatedPurchaseOrderId = orderId;
    public void SetRelatedInvoice(Guid? invoiceId) => RelatedInvoiceId = invoiceId;
    public void SetDestinationWarehouse(Guid? warehouseId) => DestinationWarehouseId = warehouseId;
    public void SetOtherTaxes(decimal amount) => OtherTaxes = amount;
    public void SetSpecialTaxes(decimal? sct, decimal? stamp)
    {
        SpecialConsumptionTax = sct;
        StampDuty = stamp;
    }
    public void SetCargoInfo(decimal? volume, string? packageType)
    {
        TotalVolume = volume;
        PackageType = packageType;
    }
    public void SetNotes(string? notes) => Notes = notes;
    public void SetTags(string? tags) => Tags = tags;
}

/// <summary>
/// İthalat beyanname kalemi / Import declaration item
/// </summary>
public class ImportDeclarationItem : TenantAggregateRoot
{
    public Guid ImportDeclarationId { get; private set; }
    public Guid ProductId { get; private set; }
    public string ProductName { get; private set; } = string.Empty;
    public string? ProductCode { get; private set; }

    public string HsCode { get; private set; } = string.Empty;
    public string? GtipCode { get; private set; }

    public decimal Quantity { get; private set; }
    public string Unit { get; private set; } = string.Empty;
    public decimal UnitPrice { get; private set; }
    public decimal FobValue => Quantity * UnitPrice;

    public decimal GrossWeight { get; private set; }
    public decimal NetWeight { get; private set; }
    public int PackageCount { get; private set; }

    public decimal CustomsDutyRate { get; private set; }
    public decimal CustomsDutyAmount => FobValue * CustomsDutyRate / 100;

    public decimal VatRate { get; private set; } = 20;
    public decimal VatAmount => (FobValue + CustomsDutyAmount) * VatRate / 100;

    public string? CountryOfOrigin { get; private set; }
    public string? BatchNumber { get; private set; }
    public DateTime? ExpiryDate { get; private set; }

    public string? Notes { get; private set; }

    public virtual ImportDeclaration ImportDeclaration { get; private set; } = null!;

    protected ImportDeclarationItem() : base() { }

    public ImportDeclarationItem(
        Guid importDeclarationId,
        Guid productId,
        string productName,
        string hsCode,
        decimal quantity,
        string unit,
        decimal unitPrice,
        decimal customsDutyRate) : base()
    {
        Id = Guid.NewGuid();
        ImportDeclarationId = importDeclarationId;
        ProductId = productId;
        ProductName = productName;
        HsCode = hsCode;
        Quantity = quantity;
        Unit = unit;
        UnitPrice = unitPrice;
        CustomsDutyRate = customsDutyRate;
        PackageCount = 1;
    }

    public void SetWeights(decimal gross, decimal net)
    {
        GrossWeight = gross;
        NetWeight = net;
    }

    public void SetPackageCount(int count) => PackageCount = count;
    public void SetGtipCode(string? gtip) => GtipCode = gtip;
    public void SetVatRate(decimal rate) => VatRate = rate;
    public void SetCountryOfOrigin(string? country) => CountryOfOrigin = country;
    public void SetBatchInfo(string? batch, DateTime? expiry)
    {
        BatchNumber = batch;
        ExpiryDate = expiry;
    }
    public void SetProductCode(string? code) => ProductCode = code;
    public void SetNotes(string? notes) => Notes = notes;
}

/// <summary>
/// İthalat maliyet kalemi / Import cost item
/// </summary>
public class ImportDeclarationCost : TenantAggregateRoot
{
    public Guid ImportDeclarationId { get; private set; }

    public ImportCostType CostType { get; private set; }
    public string Description { get; private set; } = string.Empty;

    public decimal Amount { get; private set; }
    public string Currency { get; private set; } = "TRY";
    public decimal ExchangeRate { get; private set; } = 1;
    public decimal AmountInTRY => Amount * ExchangeRate;

    public string? VendorName { get; private set; }
    public string? InvoiceNumber { get; private set; }
    public DateTime? InvoiceDate { get; private set; }

    public bool IsPaid { get; private set; }
    public DateTime? PaymentDate { get; private set; }

    public string? Notes { get; private set; }

    public virtual ImportDeclaration ImportDeclaration { get; private set; } = null!;

    protected ImportDeclarationCost() : base() { }

    public ImportDeclarationCost(
        Guid importDeclarationId,
        ImportCostType costType,
        string description,
        decimal amount,
        string currency) : base()
    {
        Id = Guid.NewGuid();
        ImportDeclarationId = importDeclarationId;
        CostType = costType;
        Description = description;
        Amount = amount;
        Currency = currency;
        ExchangeRate = 1;
    }

    public void SetExchangeRate(decimal rate) => ExchangeRate = rate;
    public void SetVendorInfo(string? name, string? invoice, DateTime? date)
    {
        VendorName = name;
        InvoiceNumber = invoice;
        InvoiceDate = date;
    }
    public void MarkAsPaid(DateTime? paymentDate = null)
    {
        IsPaid = true;
        PaymentDate = paymentDate ?? DateTime.UtcNow;
    }
    public void SetNotes(string? notes) => Notes = notes;
}

#region Enums

public enum ImportDeclarationStatus
{
    /// <summary>Taslak / Draft</summary>
    Draft = 1,

    /// <summary>Gönderildi / Submitted</summary>
    Submitted = 2,

    /// <summary>Yolda / In transit</summary>
    InTransit = 3,

    /// <summary>Gümrükte / In customs</summary>
    InCustoms = 4,

    /// <summary>Gümrükten çıktı / Cleared</summary>
    Cleared = 5,

    /// <summary>Teslim alındı / Received</summary>
    Received = 6,

    /// <summary>Tamamlandı / Completed</summary>
    Completed = 7,

    /// <summary>İptal edildi / Cancelled</summary>
    Cancelled = 8
}

public enum ImportType
{
    /// <summary>Standart ithalat / Standard import</summary>
    Standard = 1,

    /// <summary>Dahilde işleme / Inward processing</summary>
    InwardProcessing = 2,

    /// <summary>Geçici ithalat / Temporary import</summary>
    Temporary = 3,

    /// <summary>Antrepo / Warehouse</summary>
    Warehouse = 4,

    /// <summary>Serbest bölge / Free zone</summary>
    FreeZone = 5,

    /// <summary>Transit / Transit</summary>
    Transit = 6
}

public enum ShippingMethod
{
    /// <summary>Deniz yolu / Sea</summary>
    Sea = 1,

    /// <summary>Hava yolu / Air</summary>
    Air = 2,

    /// <summary>Kara yolu / Road</summary>
    Road = 3,

    /// <summary>Demir yolu / Rail</summary>
    Rail = 4,

    /// <summary>Multimodal / Multimodal</summary>
    Multimodal = 5,

    /// <summary>Kurye / Courier</summary>
    Courier = 6
}

public enum ImportCostType
{
    /// <summary>Navlun / Freight</summary>
    Freight = 1,

    /// <summary>Sigorta / Insurance</summary>
    Insurance = 2,

    /// <summary>Gümrük müşavirliği / Customs brokerage</summary>
    CustomsBrokerage = 3,

    /// <summary>Liman hizmetleri / Port services</summary>
    PortServices = 4,

    /// <summary>Depolama / Storage</summary>
    Storage = 5,

    /// <summary>İç nakliye / Inland transport</summary>
    InlandTransport = 6,

    /// <summary>Ardiye / Demurrage</summary>
    Demurrage = 7,

    /// <summary>Muayene / Inspection</summary>
    Inspection = 8,

    /// <summary>Sertifikasyon / Certification</summary>
    Certification = 9,

    /// <summary>Banka masrafları / Bank charges</summary>
    BankCharges = 10,

    /// <summary>Diğer / Other</summary>
    Other = 99
}

#endregion
