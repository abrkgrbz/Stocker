using Stocker.SharedKernel.Common;
using Stocker.Domain.Common.ValueObjects;
using Stocker.Modules.Finance.Domain.Enums;

namespace Stocker.Modules.Finance.Domain.Entities;

/// <summary>
/// Fatura Satırı (Invoice Line)
/// UBL-TR 1.2 standartlarına uygun
/// </summary>
public class InvoiceLine : BaseEntity
{
    #region Temel Bilgiler (Basic Information)

    /// <summary>
    /// Fatura ID (Invoice ID)
    /// </summary>
    public int InvoiceId { get; private set; }

    /// <summary>
    /// Satır Numarası (Line Number)
    /// </summary>
    public int LineNumber { get; private set; }

    /// <summary>
    /// Ürün/Hizmet ID (Product/Service ID)
    /// </summary>
    public int? ProductId { get; private set; }

    /// <summary>
    /// Ürün/Hizmet Kodu (Product/Service Code)
    /// </summary>
    public string? ProductCode { get; private set; }

    /// <summary>
    /// Ürün/Hizmet Adı (Product/Service Name)
    /// </summary>
    public string Description { get; private set; } = string.Empty;

    /// <summary>
    /// Açıklama (Additional Description)
    /// </summary>
    public string? AdditionalDescription { get; private set; }

    /// <summary>
    /// Marka (Brand)
    /// </summary>
    public string? Brand { get; private set; }

    /// <summary>
    /// Model (Model)
    /// </summary>
    public string? Model { get; private set; }

    /// <summary>
    /// GTİP Kodu (HS Code - for customs)
    /// </summary>
    public string? HsCode { get; private set; }

    #endregion

    #region Miktar Bilgileri (Quantity Information)

    /// <summary>
    /// Miktar (Quantity)
    /// </summary>
    public decimal Quantity { get; private set; }

    /// <summary>
    /// Birim (Unit)
    /// </summary>
    public string Unit { get; private set; } = "ADET";

    /// <summary>
    /// Birim Kodu (Unit Code - UBL)
    /// </summary>
    public string UnitCode { get; private set; } = "C62";

    /// <summary>
    /// Birim Fiyatı (Unit Price)
    /// </summary>
    public Money UnitPrice { get; private set; } = null!;

    #endregion

    #region Tutar Bilgileri (Amount Information)

    /// <summary>
    /// Satır Tutarı (Line Total = Quantity * Unit Price)
    /// </summary>
    public Money LineTotal { get; private set; } = null!;

    /// <summary>
    /// Brüt Tutar (Gross Amount)
    /// </summary>
    public Money GrossAmount { get; private set; } = null!;

    /// <summary>
    /// İskonto Oranı % (Discount Rate)
    /// </summary>
    public decimal DiscountRate { get; private set; }

    /// <summary>
    /// İskonto Tutarı (Discount Amount)
    /// </summary>
    public Money DiscountAmount { get; private set; } = null!;

    /// <summary>
    /// İskonto Nedeni (Discount Reason)
    /// </summary>
    public string? DiscountReason { get; private set; }

    /// <summary>
    /// Net Tutar (Net Amount = Gross - Discount)
    /// </summary>
    public Money NetAmount { get; private set; } = null!;

    #endregion

    #region KDV Bilgileri (VAT Information)

    /// <summary>
    /// KDV Oranı (VAT Rate)
    /// </summary>
    public VatRate VatRate { get; private set; }

    /// <summary>
    /// KDV Tutarı (VAT Amount)
    /// </summary>
    public Money VatAmount { get; private set; } = null!;

    /// <summary>
    /// KDV Dahil Tutar (Amount Including VAT)
    /// </summary>
    public Money AmountIncludingVat { get; private set; } = null!;

    /// <summary>
    /// KDV İstisnası Var mı? (Has VAT Exemption)
    /// </summary>
    public bool HasVatExemption { get; private set; }

    /// <summary>
    /// İstisna Nedeni (Exemption Reason)
    /// </summary>
    public VatExemptionReason? VatExemptionReason { get; private set; }

    /// <summary>
    /// İstisna Açıklaması (Exemption Description)
    /// </summary>
    public string? VatExemptionDescription { get; private set; }

    #endregion

    #region Tevkifat Bilgileri (Withholding Information)

    /// <summary>
    /// Tevkifat Uygulansın mı? (Apply Withholding)
    /// </summary>
    public bool ApplyWithholding { get; private set; }

    /// <summary>
    /// Tevkifat Oranı (Withholding Rate)
    /// </summary>
    public VatWithholdingRate WithholdingRate { get; private set; }

    /// <summary>
    /// Tevkifat Kodu (Withholding Code)
    /// </summary>
    public WithholdingCode? WithholdingCode { get; private set; }

    /// <summary>
    /// Tevkifat Tutarı (Withholding Amount)
    /// </summary>
    public Money WithholdingAmount { get; private set; } = null!;

    #endregion

    #region ÖTV Bilgileri (Special Consumption Tax)

    /// <summary>
    /// ÖTV Oranı % (SCT Rate)
    /// </summary>
    public decimal SctRate { get; private set; }

    /// <summary>
    /// ÖTV Tutarı (SCT Amount)
    /// </summary>
    public Money SctAmount { get; private set; } = null!;

    #endregion

    #region Stok/Depo Bilgileri (Stock/Warehouse Information)

    /// <summary>
    /// Depo ID (Warehouse ID)
    /// </summary>
    public int? WarehouseId { get; private set; }

    /// <summary>
    /// Lot/Seri No (Lot/Serial Number)
    /// </summary>
    public string? LotSerialNumber { get; private set; }

    /// <summary>
    /// Son Kullanma Tarihi (Expiry Date)
    /// </summary>
    public DateTime? ExpiryDate { get; private set; }

    #endregion

    #region Referans Bilgileri (Reference Information)

    /// <summary>
    /// Sipariş Satır ID (Order Line ID)
    /// </summary>
    public int? OrderLineId { get; private set; }

    /// <summary>
    /// İrsaliye Satır ID (Waybill Line ID)
    /// </summary>
    public int? WaybillLineId { get; private set; }

    /// <summary>
    /// Masraf Merkezi ID (Cost Center ID)
    /// </summary>
    public int? CostCenterId { get; private set; }

    /// <summary>
    /// Proje ID (Project ID)
    /// </summary>
    public int? ProjectId { get; private set; }

    #endregion

    #region Para Birimi (Currency)

    /// <summary>
    /// Para Birimi (Currency)
    /// </summary>
    public string Currency { get; private set; } = "TRY";

    #endregion

    #region Navigation Properties

    public virtual Invoice Invoice { get; private set; } = null!;
    public virtual CostCenter? CostCenter { get; private set; }

    #endregion

    protected InvoiceLine() { }

    public InvoiceLine(
        int invoiceId,
        int lineNumber,
        string description,
        decimal quantity,
        string unit,
        Money unitPrice,
        VatRate vatRate,
        string currency = "TRY")
    {
        InvoiceId = invoiceId;
        LineNumber = lineNumber;
        Description = description;
        Quantity = quantity;
        Unit = unit;
        UnitCode = GetUnitCode(unit);
        UnitPrice = unitPrice;
        VatRate = vatRate;
        Currency = currency;

        // Initialize money fields
        InitializeMoneyFields(currency);

        // Calculate amounts
        Calculate();
    }

    private void InitializeMoneyFields(string currency)
    {
        LineTotal = Money.Zero(currency);
        GrossAmount = Money.Zero(currency);
        DiscountAmount = Money.Zero(currency);
        NetAmount = Money.Zero(currency);
        VatAmount = Money.Zero(currency);
        AmountIncludingVat = Money.Zero(currency);
        WithholdingAmount = Money.Zero(currency);
        SctAmount = Money.Zero(currency);
    }

    public void Calculate()
    {
        // Line Total = Quantity * Unit Price
        var lineTotal = Quantity * UnitPrice.Amount;
        LineTotal = Money.Create(lineTotal, Currency);
        GrossAmount = LineTotal;

        // Discount
        var discountAmount = lineTotal * (DiscountRate / 100);
        DiscountAmount = Money.Create(discountAmount, Currency);

        // Net Amount = Gross - Discount
        var netAmount = lineTotal - discountAmount;
        NetAmount = Money.Create(netAmount, Currency);

        // VAT Calculation
        decimal vatAmount = 0;
        if (!HasVatExemption)
        {
            var vatRateValue = (int)VatRate / 100m;
            vatAmount = netAmount * vatRateValue;
        }
        VatAmount = Money.Create(vatAmount, Currency);

        // Withholding Calculation
        if (ApplyWithholding && WithholdingRate != VatWithholdingRate.None)
        {
            var withholdingRateValue = (int)WithholdingRate / 100m;
            var withholdingAmount = vatAmount * withholdingRateValue;
            WithholdingAmount = Money.Create(withholdingAmount, Currency);
        }
        else
        {
            WithholdingAmount = Money.Zero(Currency);
        }

        // SCT Calculation
        if (SctRate > 0)
        {
            var sctAmount = netAmount * (SctRate / 100);
            SctAmount = Money.Create(sctAmount, Currency);
        }
        else
        {
            SctAmount = Money.Zero(Currency);
        }

        // Amount Including VAT
        AmountIncludingVat = Money.Create(netAmount + vatAmount + SctAmount.Amount, Currency);
    }

    public void SetProductInfo(int? productId, string? productCode, string? brand, string? model, string? hsCode)
    {
        ProductId = productId;
        ProductCode = productCode;
        Brand = brand;
        Model = model;
        HsCode = hsCode;
    }

    public void SetDescription(string description, string? additionalDescription)
    {
        Description = description;
        AdditionalDescription = additionalDescription;
    }

    public void SetQuantity(decimal quantity, string unit)
    {
        Quantity = quantity;
        Unit = unit;
        UnitCode = GetUnitCode(unit);
        Calculate();
    }

    public void SetUnitPrice(Money unitPrice)
    {
        UnitPrice = unitPrice;
        Calculate();
    }

    public void SetDiscount(decimal discountRate, string? discountReason = null)
    {
        DiscountRate = discountRate;
        DiscountReason = discountReason;
        Calculate();
    }

    public void SetVatRate(VatRate vatRate)
    {
        VatRate = vatRate;
        Calculate();
    }

    public void SetVatExemption(bool hasExemption, VatExemptionReason? reason = null, string? description = null)
    {
        HasVatExemption = hasExemption;
        VatExemptionReason = reason;
        VatExemptionDescription = description;
        Calculate();
    }

    public void SetWithholding(bool apply, VatWithholdingRate rate, WithholdingCode? code = null)
    {
        ApplyWithholding = apply;
        WithholdingRate = rate;
        WithholdingCode = code;
        Calculate();
    }

    public void SetSct(decimal sctRate)
    {
        SctRate = sctRate;
        Calculate();
    }

    public void SetStockInfo(int? warehouseId, string? lotSerialNumber, DateTime? expiryDate)
    {
        WarehouseId = warehouseId;
        LotSerialNumber = lotSerialNumber;
        ExpiryDate = expiryDate;
    }

    public void SetReferences(int? orderLineId, int? waybillLineId, int? costCenterId, int? projectId)
    {
        OrderLineId = orderLineId;
        WaybillLineId = waybillLineId;
        CostCenterId = costCenterId;
        ProjectId = projectId;
    }

    private static string GetUnitCode(string unit)
    {
        // UBL Unit Codes mapping
        return unit.ToUpperInvariant() switch
        {
            "ADET" or "AD" => "C62",
            "KG" or "KİLOGRAM" => "KGM",
            "GR" or "GRAM" => "GRM",
            "LT" or "LİTRE" => "LTR",
            "M" or "METRE" => "MTR",
            "M2" or "METREKARE" => "MTK",
            "M3" or "METREKÜP" => "MTQ",
            "KM" or "KİLOMETRE" => "KMT",
            "TON" => "TNE",
            "PAKET" or "PKT" => "PA",
            "KUTU" or "KT" => "BX",
            "DÜZINE" => "DZN",
            "SET" => "SET",
            "ÇIFT" => "PR",
            "SAAT" => "HUR",
            "GÜN" => "DAY",
            "AY" => "MON",
            "YIL" => "ANN",
            _ => "C62" // Default to pieces
        };
    }
}
