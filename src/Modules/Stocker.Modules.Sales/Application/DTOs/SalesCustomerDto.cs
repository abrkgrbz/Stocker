using Stocker.Modules.Sales.Domain.Entities;
using Stocker.Modules.Sales.Domain.Enums;

namespace Stocker.Modules.Sales.Application.DTOs;

/// <summary>
/// Full details DTO for SalesCustomer entity
/// Used for single customer retrieval and detailed views
/// </summary>
public record SalesCustomerDto
{
    public Guid Id { get; init; }
    public string CustomerCode { get; init; } = string.Empty;
    public string CustomerType { get; init; } = string.Empty;
    public string DataSource { get; init; } = string.Empty;
    public Guid? CrmCustomerId { get; init; }

    // Identity
    public string? TaxNumber { get; init; }
    public string? TaxOffice { get; init; }
    public string? IdentityNumber { get; init; }

    // Name
    public string? CompanyName { get; init; }
    public string? FirstName { get; init; }
    public string? LastName { get; init; }
    public string DisplayName { get; init; } = string.Empty;

    // Contact
    public string? Email { get; init; }
    public string? Phone { get; init; }
    public string? MobilePhone { get; init; }

    // Address
    public string? AddressLine { get; init; }
    public string? District { get; init; }
    public string? City { get; init; }
    public string? PostalCode { get; init; }
    public string Country { get; init; } = "Türkiye";
    public string CountryCode { get; init; } = "TR";
    public string FullAddress { get; init; } = string.Empty;

    // Shipping Address
    public string? ShippingAddressLine { get; init; }
    public string? ShippingDistrict { get; init; }
    public string? ShippingCity { get; init; }
    public string? ShippingPostalCode { get; init; }
    public string? ShippingCountry { get; init; }
    public bool ShippingSameAsBilling { get; init; }

    // E-Invoice
    public bool IsEInvoiceRegistered { get; init; }
    public string? EInvoiceAlias { get; init; }
    public DateTime? EInvoiceLastCheckedAt { get; init; }

    // Financial
    public decimal CreditLimit { get; init; }
    public decimal CurrentBalance { get; init; }
    public string Currency { get; init; } = "TRY";
    public int DefaultPaymentTermDays { get; init; }
    public decimal DefaultVatRate { get; init; }
    public string? VatExemptionCode { get; init; }
    public string? VatExemptionReason { get; init; }

    // Status
    public bool IsActive { get; init; }
    public string? Notes { get; init; }

    // Audit
    public DateTime CreatedAt { get; init; }
    public string? CreatedBy { get; init; }
    public DateTime? UpdatedAt { get; init; }
    public string? UpdatedBy { get; init; }

    public static SalesCustomerDto FromEntity(SalesCustomer entity)
    {
        return new SalesCustomerDto
        {
            Id = entity.Id,
            CustomerCode = entity.CustomerCode,
            CustomerType = entity.CustomerType.ToString(),
            DataSource = entity.DataSource.ToString(),
            CrmCustomerId = entity.CrmCustomerId,
            TaxNumber = entity.TaxNumber,
            TaxOffice = entity.TaxOffice,
            IdentityNumber = entity.IdentityNumber,
            CompanyName = entity.CompanyName,
            FirstName = entity.FirstName,
            LastName = entity.LastName,
            DisplayName = entity.DisplayName,
            Email = entity.Email,
            Phone = entity.Phone,
            MobilePhone = entity.MobilePhone,
            AddressLine = entity.AddressLine,
            District = entity.District,
            City = entity.City,
            PostalCode = entity.PostalCode,
            Country = entity.Country,
            CountryCode = entity.CountryCode,
            FullAddress = entity.FullAddress,
            ShippingAddressLine = entity.ShippingAddressLine,
            ShippingDistrict = entity.ShippingDistrict,
            ShippingCity = entity.ShippingCity,
            ShippingPostalCode = entity.ShippingPostalCode,
            ShippingCountry = entity.ShippingCountry,
            ShippingSameAsBilling = entity.ShippingSameAsBilling,
            IsEInvoiceRegistered = entity.IsEInvoiceRegistered,
            EInvoiceAlias = entity.EInvoiceAlias,
            EInvoiceLastCheckedAt = entity.EInvoiceLastCheckedAt,
            CreditLimit = entity.CreditLimit,
            CurrentBalance = entity.CurrentBalance,
            Currency = entity.Currency,
            DefaultPaymentTermDays = entity.DefaultPaymentTermDays,
            DefaultVatRate = entity.DefaultVatRate,
            VatExemptionCode = entity.VatExemptionCode,
            VatExemptionReason = entity.VatExemptionReason,
            IsActive = entity.IsActive,
            Notes = entity.Notes,
            CreatedAt = entity.CreatedAt,
            CreatedBy = entity.CreatedBy,
            UpdatedAt = entity.UpdatedAt,
            UpdatedBy = entity.UpdatedBy
        };
    }
}

/// <summary>
/// List DTO for SalesCustomer entity
/// Used for paginated lists and search results
/// </summary>
public record SalesCustomerListDto
{
    public Guid Id { get; init; }
    public string CustomerCode { get; init; } = string.Empty;
    public string CustomerType { get; init; } = string.Empty;
    public string DataSource { get; init; } = string.Empty;
    public string DisplayName { get; init; } = string.Empty;
    public string? TaxNumber { get; init; }
    public string? IdentityNumber { get; init; }
    public string? Email { get; init; }
    public string? Phone { get; init; }
    public string? City { get; init; }
    public bool IsEInvoiceRegistered { get; init; }
    public bool IsActive { get; init; }
    public decimal CurrentBalance { get; init; }
    public DateTime CreatedAt { get; init; }

    public static SalesCustomerListDto FromEntity(SalesCustomer entity)
    {
        return new SalesCustomerListDto
        {
            Id = entity.Id,
            CustomerCode = entity.CustomerCode,
            CustomerType = entity.CustomerType.ToString(),
            DataSource = entity.DataSource.ToString(),
            DisplayName = entity.DisplayName,
            TaxNumber = entity.TaxNumber,
            IdentityNumber = entity.IdentityNumber,
            Email = entity.Email,
            Phone = entity.Phone,
            City = entity.City,
            IsEInvoiceRegistered = entity.IsEInvoiceRegistered,
            IsActive = entity.IsActive,
            CurrentBalance = entity.CurrentBalance,
            CreatedAt = entity.CreatedAt
        };
    }
}

/// <summary>
/// Create DTO for SalesCustomer
/// </summary>
public record CreateSalesCustomerDto
{
    public SalesCustomerType CustomerType { get; init; }

    // Customer Code (optional - auto-generated if not provided)
    public string? CustomerCode { get; init; }

    // Identity - required based on customer type
    public string? TaxNumber { get; init; }
    public string? TaxOffice { get; init; }
    public string? IdentityNumber { get; init; }

    // Name
    public string? CompanyName { get; init; }
    public string? FirstName { get; init; }
    public string? LastName { get; init; }

    // Contact
    public string? Email { get; init; }
    public string? Phone { get; init; }
    public string? MobilePhone { get; init; }

    // Address
    public string? AddressLine { get; init; }
    public string? District { get; init; }
    public string? City { get; init; }
    public string? PostalCode { get; init; }
    public string Country { get; init; } = "Türkiye";
    public string CountryCode { get; init; } = "TR";

    // Shipping Address
    public string? ShippingAddressLine { get; init; }
    public string? ShippingDistrict { get; init; }
    public string? ShippingCity { get; init; }
    public string? ShippingPostalCode { get; init; }
    public string? ShippingCountry { get; init; }
    public bool ShippingSameAsBilling { get; init; } = true;

    // E-Invoice
    public bool IsEInvoiceRegistered { get; init; }
    public string? EInvoiceAlias { get; init; }

    // Financial
    public decimal CreditLimit { get; init; }
    public string Currency { get; init; } = "TRY";
    public int DefaultPaymentTermDays { get; init; } = 30;
    public decimal DefaultVatRate { get; init; } = 20;
    public string? VatExemptionCode { get; init; }
    public string? VatExemptionReason { get; init; }

    // Other
    public string? Notes { get; init; }
}

/// <summary>
/// Update DTO for SalesCustomer
/// </summary>
public record UpdateSalesCustomerDto
{
    // Identity
    public string? TaxNumber { get; init; }
    public string? TaxOffice { get; init; }
    public string? IdentityNumber { get; init; }

    // Name
    public string? CompanyName { get; init; }
    public string? FirstName { get; init; }
    public string? LastName { get; init; }

    // Contact
    public string? Email { get; init; }
    public string? Phone { get; init; }
    public string? MobilePhone { get; init; }

    // Address
    public string? AddressLine { get; init; }
    public string? District { get; init; }
    public string? City { get; init; }
    public string? PostalCode { get; init; }
    public string? Country { get; init; }
    public string? CountryCode { get; init; }

    // Shipping Address
    public string? ShippingAddressLine { get; init; }
    public string? ShippingDistrict { get; init; }
    public string? ShippingCity { get; init; }
    public string? ShippingPostalCode { get; init; }
    public string? ShippingCountry { get; init; }
    public bool? ShippingSameAsBilling { get; init; }

    // E-Invoice
    public bool? IsEInvoiceRegistered { get; init; }
    public string? EInvoiceAlias { get; init; }

    // Financial
    public decimal? CreditLimit { get; init; }
    public string? Currency { get; init; }
    public int? DefaultPaymentTermDays { get; init; }
    public decimal? DefaultVatRate { get; init; }
    public string? VatExemptionCode { get; init; }
    public string? VatExemptionReason { get; init; }

    // Status
    public bool? IsActive { get; init; }
    public string? Notes { get; init; }
}
