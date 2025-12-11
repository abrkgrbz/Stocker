using Stocker.SharedKernel.Common;
using Stocker.Domain.Common.ValueObjects;
using Stocker.Modules.Finance.Domain.Enums;

namespace Stocker.Modules.Finance.Domain.Entities;

/// <summary>
/// Fatura Vergi Detayı (Invoice Tax Detail)
/// Faturadaki tüm vergi kırılımlarını tutar
/// </summary>
public class InvoiceTax : BaseEntity
{
    /// <summary>
    /// Fatura ID (Invoice ID)
    /// </summary>
    public int InvoiceId { get; private set; }

    /// <summary>
    /// Vergi Türü (Tax Type)
    /// </summary>
    public TaxType TaxType { get; private set; }

    /// <summary>
    /// Vergi Kodu (Tax Code - GİB)
    /// </summary>
    public string TaxCode { get; private set; } = string.Empty;

    /// <summary>
    /// Vergi Adı (Tax Name)
    /// </summary>
    public string TaxName { get; private set; } = string.Empty;

    /// <summary>
    /// Vergi Matrahı (Tax Base)
    /// </summary>
    public Money TaxBase { get; private set; } = null!;

    /// <summary>
    /// Vergi Oranı % (Tax Rate)
    /// </summary>
    public decimal TaxRate { get; private set; }

    /// <summary>
    /// Vergi Tutarı (Tax Amount)
    /// </summary>
    public Money TaxAmount { get; private set; } = null!;

    /// <summary>
    /// İstisna Kodu (Exemption Code)
    /// </summary>
    public string? ExemptionCode { get; private set; }

    /// <summary>
    /// İstisna Nedeni (Exemption Reason)
    /// </summary>
    public string? ExemptionReason { get; private set; }

    /// <summary>
    /// Para Birimi (Currency)
    /// </summary>
    public string Currency { get; private set; } = "TRY";

    // Navigation Properties
    public virtual Invoice Invoice { get; private set; } = null!;

    protected InvoiceTax() { }

    public InvoiceTax(
        int invoiceId,
        TaxType taxType,
        string taxCode,
        string taxName,
        Money taxBase,
        decimal taxRate,
        string currency = "TRY")
    {
        InvoiceId = invoiceId;
        TaxType = taxType;
        TaxCode = taxCode;
        TaxName = taxName;
        TaxBase = taxBase;
        TaxRate = taxRate;
        Currency = currency;

        // Calculate tax amount
        var taxAmount = taxBase.Amount * (taxRate / 100);
        TaxAmount = Money.Create(taxAmount, currency);
    }

    public void SetExemption(string? exemptionCode, string? exemptionReason)
    {
        ExemptionCode = exemptionCode;
        ExemptionReason = exemptionReason;
        TaxAmount = Money.Zero(Currency);
    }

    public void Recalculate()
    {
        if (string.IsNullOrEmpty(ExemptionCode))
        {
            var taxAmount = TaxBase.Amount * (TaxRate / 100);
            TaxAmount = Money.Create(taxAmount, Currency);
        }
    }

    /// <summary>
    /// KDV vergi kaydı oluştur (Create VAT tax record)
    /// </summary>
    public static InvoiceTax CreateVat(int invoiceId, Money taxBase, VatRate vatRate, string currency = "TRY")
    {
        var rate = (int)vatRate;
        return new InvoiceTax(
            invoiceId,
            TaxType.VAT,
            "0015",
            "KATMA DEĞER VERGİSİ",
            taxBase,
            rate,
            currency);
    }

    /// <summary>
    /// ÖTV vergi kaydı oluştur (Create SCT tax record)
    /// </summary>
    public static InvoiceTax CreateSct(int invoiceId, Money taxBase, decimal sctRate, string currency = "TRY")
    {
        return new InvoiceTax(
            invoiceId,
            TaxType.SCT,
            "0071",
            "ÖZEL TÜKETİM VERGİSİ",
            taxBase,
            sctRate,
            currency);
    }

    /// <summary>
    /// Stopaj vergi kaydı oluştur (Create withholding tax record)
    /// </summary>
    public static InvoiceTax CreateWithholding(int invoiceId, Money taxBase, decimal withholdingRate, WithholdingTaxType type, string currency = "TRY")
    {
        var (code, name) = type switch
        {
            WithholdingTaxType.Rent => ("0011", "KİRA STOPAJI"),
            WithholdingTaxType.Freelance => ("0094", "SERBEST MESLEK STOPAJI"),
            WithholdingTaxType.Dividend => ("0012", "TEMETTÜ STOPAJI"),
            WithholdingTaxType.Interest => ("0013", "FAİZ STOPAJI"),
            WithholdingTaxType.Royalty => ("0014", "TELİF HAKKI STOPAJI"),
            _ => ("0099", "DİĞER STOPAJ")
        };

        return new InvoiceTax(
            invoiceId,
            TaxType.Withholding,
            code,
            name,
            taxBase,
            withholdingRate,
            currency);
    }

    /// <summary>
    /// Damga vergisi kaydı oluştur (Create stamp tax record)
    /// </summary>
    public static InvoiceTax CreateStampTax(int invoiceId, Money taxBase, decimal stampTaxRate, string currency = "TRY")
    {
        return new InvoiceTax(
            invoiceId,
            TaxType.Stamp,
            "0488",
            "DAMGA VERGİSİ",
            taxBase,
            stampTaxRate,
            currency);
    }
}
