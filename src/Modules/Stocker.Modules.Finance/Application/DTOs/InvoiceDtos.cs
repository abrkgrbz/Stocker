using Stocker.Modules.Finance.Domain.Enums;

namespace Stocker.Modules.Finance.Application.DTOs;

/// <summary>
/// Fatura DTO (Invoice DTO)
/// </summary>
public class InvoiceDto
{
    public int Id { get; set; }
    public string InvoiceNumber { get; set; } = string.Empty;
    public string Series { get; set; } = string.Empty;
    public int SequenceNumber { get; set; }
    public DateTime InvoiceDate { get; set; }
    public TimeSpan IssueTime { get; set; }
    public InvoiceType InvoiceType { get; set; }
    public EInvoiceType EInvoiceType { get; set; }
    public InvoiceScenario Scenario { get; set; }
    public InvoiceStatus Status { get; set; }
    public string Currency { get; set; } = "TRY";
    public decimal ExchangeRate { get; set; }

    // Current Account Information
    public int CurrentAccountId { get; set; }
    public string CurrentAccountName { get; set; } = string.Empty;
    public string? TaxNumber { get; set; }
    public string? IdentityNumber { get; set; }
    public string? TaxOffice { get; set; }

    // Address Information
    public string? BillingAddress { get; set; }
    public string? BillingDistrict { get; set; }
    public string? BillingCity { get; set; }
    public string? BillingCountry { get; set; }
    public string? BillingPostalCode { get; set; }

    // Amount Information
    public decimal LineExtensionAmount { get; set; }
    public decimal GrossAmount { get; set; }
    public decimal TotalDiscount { get; set; }
    public decimal NetAmountBeforeTax { get; set; }
    public decimal TotalVat { get; set; }
    public decimal VatWithholdingAmount { get; set; }
    public decimal TotalOtherTaxes { get; set; }
    public decimal WithholdingTaxAmount { get; set; }
    public decimal GrandTotal { get; set; }
    public decimal GrandTotalTRY { get; set; }
    public decimal PaidAmount { get; set; }
    public decimal RemainingAmount { get; set; }

    // Due Date and Payment Information
    public DateTime? DueDate { get; set; }
    public PaymentType? PaymentMethod { get; set; }
    public string? PaymentTerms { get; set; }
    public string? PaymentNote { get; set; }

    // E-Invoice Information
    public Guid? GibUuid { get; set; }
    public string? GibEnvelopeId { get; set; }
    public string? GibStatusCode { get; set; }
    public string? GibStatusDescription { get; set; }
    public DateTime? GibSendDate { get; set; }
    public DateTime? GibResponseDate { get; set; }
    public string? ReceiverAlias { get; set; }

    // Withholding Information
    public bool ApplyVatWithholding { get; set; }
    public VatWithholdingRate VatWithholdingRate { get; set; }
    public WithholdingCode? WithholdingCode { get; set; }
    public string? WithholdingReason { get; set; }

    // Exemption Information
    public bool HasVatExemption { get; set; }
    public VatExemptionReason? VatExemptionReason { get; set; }
    public string? VatExemptionDescription { get; set; }

    // Reference Information
    public string? WaybillNumber { get; set; }
    public DateTime? WaybillDate { get; set; }
    public string? OrderNumber { get; set; }
    public DateTime? OrderDate { get; set; }
    public int? RelatedInvoiceId { get; set; }
    public string? RelatedInvoiceNumber { get; set; }
    public int? SalesOrderId { get; set; }
    public int? PurchaseOrderId { get; set; }
    public int? ProjectId { get; set; }

    // Other Information
    public string? Notes { get; set; }
    public string? InternalNotes { get; set; }
    public string? PdfFilePath { get; set; }
    public string? XmlFilePath { get; set; }
    public bool IsPrinted { get; set; }
    public int PrintCount { get; set; }
    public bool IsEmailSent { get; set; }
    public DateTime? EmailSendDate { get; set; }
    public int? CreatedByUserId { get; set; }
    public int? ApprovedByUserId { get; set; }
    public DateTime? ApprovalDate { get; set; }
    public int? JournalEntryId { get; set; }

    // Audit
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    // Navigation
    public List<InvoiceLineDto> Lines { get; set; } = new();
    public List<InvoiceTaxDto> Taxes { get; set; } = new();
}

/// <summary>
/// Fatura Kalemi DTO (Invoice Line DTO)
/// </summary>
public class InvoiceLineDto
{
    public int Id { get; set; }
    public int InvoiceId { get; set; }
    public int LineNumber { get; set; }

    // Product Information
    public int? ProductId { get; set; }
    public string? ProductCode { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Unit { get; set; }

    // Quantity and Price
    public decimal Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal LineTotal { get; set; }

    // Discount
    public decimal DiscountRate { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal GrossAmount { get; set; }
    public decimal NetAmount { get; set; }

    // VAT
    public VatRate VatRate { get; set; }
    public decimal VatAmount { get; set; }

    // Withholding
    public bool ApplyWithholding { get; set; }
    public VatWithholdingRate WithholdingRate { get; set; }
    public decimal WithholdingAmount { get; set; }

    // Other Taxes
    public decimal OtherTaxAmount { get; set; }

    // Final Amount
    public decimal FinalAmount { get; set; }

    // Currency
    public string Currency { get; set; } = "TRY";
}

/// <summary>
/// Fatura Vergi DTO (Invoice Tax DTO)
/// </summary>
public class InvoiceTaxDto
{
    public int Id { get; set; }
    public int InvoiceId { get; set; }
    public TaxType TaxType { get; set; }
    public string TaxTypeName { get; set; } = string.Empty;
    public string? TaxCode { get; set; }
    public decimal TaxableAmount { get; set; }
    public decimal TaxRate { get; set; }
    public decimal TaxAmount { get; set; }
    public string Currency { get; set; } = "TRY";
}

/// <summary>
/// Fatura Oluşturma DTO (Create Invoice DTO)
/// </summary>
public class CreateInvoiceDto
{
    public string Series { get; set; } = string.Empty;
    public DateTime InvoiceDate { get; set; }
    public InvoiceType InvoiceType { get; set; }
    public EInvoiceType EInvoiceType { get; set; }
    public InvoiceScenario Scenario { get; set; } = InvoiceScenario.Basic;
    public string Currency { get; set; } = "TRY";
    public decimal? ExchangeRate { get; set; }

    // Current Account
    public int CurrentAccountId { get; set; }

    // Due Date and Payment
    public DateTime? DueDate { get; set; }
    public PaymentType? PaymentMethod { get; set; }
    public string? PaymentTerms { get; set; }
    public string? PaymentNote { get; set; }

    // Address Override (if different from current account)
    public string? BillingAddress { get; set; }
    public string? BillingDistrict { get; set; }
    public string? BillingCity { get; set; }
    public string? BillingCountry { get; set; }
    public string? BillingPostalCode { get; set; }

    // Delivery Address
    public string? DeliveryAddress { get; set; }
    public string? DeliveryDistrict { get; set; }
    public string? DeliveryCity { get; set; }
    public string? DeliveryCountry { get; set; }

    // Withholding
    public bool ApplyVatWithholding { get; set; }
    public VatWithholdingRate VatWithholdingRate { get; set; }
    public WithholdingCode? WithholdingCode { get; set; }
    public string? WithholdingReason { get; set; }

    // Exemption
    public bool HasVatExemption { get; set; }
    public VatExemptionReason? VatExemptionReason { get; set; }
    public string? VatExemptionDescription { get; set; }

    // Reference
    public string? WaybillNumber { get; set; }
    public DateTime? WaybillDate { get; set; }
    public string? OrderNumber { get; set; }
    public DateTime? OrderDate { get; set; }
    public int? RelatedInvoiceId { get; set; }
    public int? SalesOrderId { get; set; }
    public int? PurchaseOrderId { get; set; }
    public int? ProjectId { get; set; }

    // Notes
    public string? Notes { get; set; }
    public string? InternalNotes { get; set; }

    // Lines
    public List<CreateInvoiceLineDto> Lines { get; set; } = new();
}

/// <summary>
/// Fatura Kalemi Oluşturma DTO (Create Invoice Line DTO)
/// </summary>
public class CreateInvoiceLineDto
{
    public int? ProductId { get; set; }
    public string? ProductCode { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Unit { get; set; }
    public decimal Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal DiscountRate { get; set; }
    public VatRate VatRate { get; set; } = VatRate.Twenty;
    public bool ApplyWithholding { get; set; }
    public VatWithholdingRate WithholdingRate { get; set; }
}

/// <summary>
/// Fatura Güncelleme DTO (Update Invoice DTO)
/// </summary>
public class UpdateInvoiceDto
{
    // Only draft invoices can be updated
    public DateTime? InvoiceDate { get; set; }
    public DateTime? DueDate { get; set; }
    public PaymentType? PaymentMethod { get; set; }
    public string? PaymentTerms { get; set; }
    public string? PaymentNote { get; set; }

    // Address
    public string? BillingAddress { get; set; }
    public string? BillingDistrict { get; set; }
    public string? BillingCity { get; set; }
    public string? BillingCountry { get; set; }
    public string? BillingPostalCode { get; set; }

    // Delivery Address
    public string? DeliveryAddress { get; set; }
    public string? DeliveryDistrict { get; set; }
    public string? DeliveryCity { get; set; }
    public string? DeliveryCountry { get; set; }

    // Withholding
    public bool? ApplyVatWithholding { get; set; }
    public VatWithholdingRate? VatWithholdingRate { get; set; }
    public WithholdingCode? WithholdingCode { get; set; }
    public string? WithholdingReason { get; set; }

    // Exemption
    public bool? HasVatExemption { get; set; }
    public VatExemptionReason? VatExemptionReason { get; set; }
    public string? VatExemptionDescription { get; set; }

    // Reference
    public string? WaybillNumber { get; set; }
    public DateTime? WaybillDate { get; set; }
    public string? OrderNumber { get; set; }
    public DateTime? OrderDate { get; set; }

    // Notes
    public string? Notes { get; set; }
    public string? InternalNotes { get; set; }

    // Lines (if provided, replaces all existing lines)
    public List<CreateInvoiceLineDto>? Lines { get; set; }
}

/// <summary>
/// Fatura Özet DTO (Invoice Summary DTO)
/// </summary>
public class InvoiceSummaryDto
{
    public int Id { get; set; }
    public string InvoiceNumber { get; set; } = string.Empty;
    public DateTime InvoiceDate { get; set; }
    public InvoiceType InvoiceType { get; set; }
    public EInvoiceType EInvoiceType { get; set; }
    public InvoiceStatus Status { get; set; }
    public string CurrentAccountName { get; set; } = string.Empty;
    public decimal GrandTotal { get; set; }
    public decimal RemainingAmount { get; set; }
    public string Currency { get; set; } = "TRY";
    public DateTime? DueDate { get; set; }
    public bool IsOverdue => DueDate.HasValue && DueDate.Value < DateTime.Today && RemainingAmount > 0;
}

/// <summary>
/// Fatura Filtre DTO (Invoice Filter DTO)
/// </summary>
public class InvoiceFilterDto
{
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 20;
    public string? SearchTerm { get; set; }
    public InvoiceType? InvoiceType { get; set; }
    public EInvoiceType? EInvoiceType { get; set; }
    public InvoiceStatus? Status { get; set; }
    public int? CurrentAccountId { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public DateTime? DueDateStart { get; set; }
    public DateTime? DueDateEnd { get; set; }
    public bool? IsOverdue { get; set; }
    public string? SortBy { get; set; }
    public bool SortDescending { get; set; } = true;
}

/// <summary>
/// Fatura İptal DTO (Cancel Invoice DTO)
/// </summary>
public class CancelInvoiceDto
{
    public string? Reason { get; set; }
}
