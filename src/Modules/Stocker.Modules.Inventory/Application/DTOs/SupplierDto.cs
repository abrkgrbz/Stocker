namespace Stocker.Modules.Inventory.Application.DTOs;

/// <summary>
/// Data transfer object for Supplier entity
/// </summary>
public class SupplierDto
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? TaxNumber { get; set; }
    public string? TaxOffice { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? Fax { get; set; }
    public string? Street { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? Country { get; set; }
    public string? PostalCode { get; set; }
    public string? Website { get; set; }
    public string? ContactPerson { get; set; }
    public string? ContactPhone { get; set; }
    public string? ContactEmail { get; set; }
    public int? PaymentTermDays { get; set; }
    public decimal CreditLimit { get; set; }
    public bool IsPreferred { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public int ProductCount { get; set; }
    public List<SupplierProductDto> Products { get; set; } = new();
}

/// <summary>
/// DTO for creating a supplier
/// </summary>
public class CreateSupplierDto
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? TaxNumber { get; set; }
    public string? TaxOffice { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? Fax { get; set; }
    public string? Street { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? Country { get; set; }
    public string? PostalCode { get; set; }
    public string? Website { get; set; }
    public string? ContactPerson { get; set; }
    public string? ContactPhone { get; set; }
    public string? ContactEmail { get; set; }
    public int? PaymentTermDays { get; set; }
    public decimal CreditLimit { get; set; }
    public bool IsPreferred { get; set; }
}

/// <summary>
/// DTO for updating a supplier
/// </summary>
public class UpdateSupplierDto
{
    public string Name { get; set; } = string.Empty;
    public string? TaxNumber { get; set; }
    public string? TaxOffice { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? Fax { get; set; }
    public string? Street { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? Country { get; set; }
    public string? PostalCode { get; set; }
    public string? Website { get; set; }
    public string? ContactPerson { get; set; }
    public string? ContactPhone { get; set; }
    public string? ContactEmail { get; set; }
    public int? PaymentTermDays { get; set; }
    public decimal CreditLimit { get; set; }
    public bool IsPreferred { get; set; }
}

/// <summary>
/// DTO for supplier listing (lightweight)
/// </summary>
public class SupplierListDto
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? City { get; set; }
    public bool IsPreferred { get; set; }
    public bool IsActive { get; set; }
    public int ProductCount { get; set; }
}

/// <summary>
/// DTO for supplier product relationship
/// </summary>
public class SupplierProductDto
{
    public int Id { get; set; }
    public int SupplierId { get; set; }
    public int ProductId { get; set; }
    public string ProductCode { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public string? SupplierProductCode { get; set; }
    public decimal UnitCost { get; set; }
    public string Currency { get; set; } = string.Empty;
    public decimal MinimumOrderQuantity { get; set; }
    public int LeadTimeDays { get; set; }
    public bool IsPreferred { get; set; }
    public bool IsActive { get; set; }
}

/// <summary>
/// DTO for adding/updating supplier product
/// </summary>
public class CreateSupplierProductDto
{
    public int SupplierId { get; set; }
    public int ProductId { get; set; }
    public string? SupplierProductCode { get; set; }
    public decimal UnitCost { get; set; }
    public string Currency { get; set; } = "TRY";
    public decimal MinimumOrderQuantity { get; set; } = 1;
    public int LeadTimeDays { get; set; }
    public bool IsPreferred { get; set; }
}
