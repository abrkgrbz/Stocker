using Stocker.Modules.Purchase.Domain.Entities;

namespace Stocker.Modules.Purchase.Application.DTOs;

public record SupplierDto
{
    public Guid Id { get; init; }
    public string Code { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string? TaxNumber { get; init; }
    public string? TaxOffice { get; init; }
    public string Type { get; init; } = string.Empty;
    public string Status { get; init; } = string.Empty;
    public string? Address { get; init; }
    public string? City { get; init; }
    public string? District { get; init; }
    public string? PostalCode { get; init; }
    public string? Country { get; init; }
    public string? Phone { get; init; }
    public string? Fax { get; init; }
    public string? Email { get; init; }
    public string? Website { get; init; }
    public string Currency { get; init; } = "TRY";
    public string PaymentTerms { get; init; } = string.Empty;
    public int PaymentDueDays { get; init; }
    public decimal CreditLimit { get; init; }
    public decimal CurrentBalance { get; init; }
    public string? BankName { get; init; }
    public string? BankAccountNumber { get; init; }
    public string? IBAN { get; init; }
    public string? SwiftCode { get; init; }
    public decimal DiscountRate { get; init; }
    public int Rating { get; init; }
    public string? Notes { get; init; }
    public bool IsActive { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; init; }
    public List<SupplierContactDto> Contacts { get; init; } = new();
    public List<SupplierProductDto> Products { get; init; } = new();
}

public record SupplierContactDto
{
    public Guid Id { get; init; }
    public Guid SupplierId { get; init; }
    public string Name { get; init; } = string.Empty;
    public string? Title { get; init; }
    public string? Department { get; init; }
    public string? Phone { get; init; }
    public string? Mobile { get; init; }
    public string? Email { get; init; }
    public bool IsPrimary { get; init; }
    public string? Notes { get; init; }
}

public record SupplierProductDto
{
    public Guid Id { get; init; }
    public Guid SupplierId { get; init; }
    public Guid ProductId { get; init; }
    public string? ProductCode { get; init; }
    public string? ProductName { get; init; }
    public string? SupplierProductCode { get; init; }
    public string? SupplierProductName { get; init; }
    public decimal UnitPrice { get; init; }
    public string Currency { get; init; } = "TRY";
    public decimal MinOrderQuantity { get; init; }
    public int LeadTimeDays { get; init; }
    public bool IsPreferred { get; init; }
    public DateTime? LastPurchaseDate { get; init; }
    public decimal LastPurchasePrice { get; init; }
}

public record SupplierListDto
{
    public Guid Id { get; init; }
    public string Code { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string? TaxNumber { get; init; }
    public string Type { get; init; } = string.Empty;
    public string Status { get; init; } = string.Empty;
    public string? City { get; init; }
    public string? Phone { get; init; }
    public string? Email { get; init; }
    public decimal CurrentBalance { get; init; }
    public string Currency { get; init; } = "TRY";
    public int Rating { get; init; }
    public bool IsActive { get; init; }
    public DateTime CreatedAt { get; init; }
}

public record CreateSupplierDto
{
    public string Code { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string? TaxNumber { get; init; }
    public string? TaxOffice { get; init; }
    public SupplierType Type { get; init; } = SupplierType.Manufacturer;
    public string? Address { get; init; }
    public string? City { get; init; }
    public string? District { get; init; }
    public string? PostalCode { get; init; }
    public string? Country { get; init; }
    public string? Phone { get; init; }
    public string? Fax { get; init; }
    public string? Email { get; init; }
    public string? Website { get; init; }
    public string Currency { get; init; } = "TRY";
    public string PaymentTerms { get; init; } = "Net30";
    public int PaymentDueDays { get; init; } = 30;
    public int PaymentTermDays { get; init; } = 30;
    public decimal CreditLimit { get; init; }
    public string? BankName { get; init; }
    public string? BankAccountNumber { get; init; }
    public string? IBAN { get; init; }
    public string? SwiftCode { get; init; }
    public decimal DiscountRate { get; init; }
    public string? Notes { get; init; }
}

public record UpdateSupplierDto
{
    public string? Name { get; init; }
    public string? TaxNumber { get; init; }
    public string? TaxOffice { get; init; }
    public SupplierType? Type { get; init; }
    public string? Address { get; init; }
    public string? City { get; init; }
    public string? District { get; init; }
    public string? PostalCode { get; init; }
    public string? Country { get; init; }
    public string? Phone { get; init; }
    public string? Fax { get; init; }
    public string? Email { get; init; }
    public string? Website { get; init; }
    public string? Currency { get; init; }
    public string? PaymentTerms { get; init; }
    public int? PaymentDueDays { get; init; }
    public int? PaymentTermDays { get; init; }
    public decimal? CreditLimit { get; init; }
    public string? BankName { get; init; }
    public string? BankAccountNumber { get; init; }
    public string? IBAN { get; init; }
    public string? SwiftCode { get; init; }
    public decimal? DiscountRate { get; init; }
    public string? Notes { get; init; }
}

public record CreateSupplierContactDto
{
    public string Name { get; init; } = string.Empty;
    public string? Title { get; init; }
    public string? Department { get; init; }
    public string? Phone { get; init; }
    public string? Mobile { get; init; }
    public string? Email { get; init; }
    public bool IsPrimary { get; init; }
    public string? Notes { get; init; }
}

public record CreateSupplierProductDto
{
    public Guid ProductId { get; init; }
    public string? SupplierProductCode { get; init; }
    public string? SupplierProductName { get; init; }
    public decimal UnitPrice { get; init; }
    public string Currency { get; init; } = "TRY";
    public decimal MinOrderQuantity { get; init; } = 1;
    public int LeadTimeDays { get; init; }
    public bool IsPreferred { get; init; }
}

public record SupplierSummaryDto
{
    public int TotalSuppliers { get; init; }
    public int ActiveSuppliers { get; init; }
    public int InactiveSuppliers { get; init; }
    public decimal TotalBalance { get; init; }
    public Dictionary<string, int> SuppliersByType { get; init; } = new();
    public Dictionary<string, int> SuppliersByCity { get; init; } = new();
}
