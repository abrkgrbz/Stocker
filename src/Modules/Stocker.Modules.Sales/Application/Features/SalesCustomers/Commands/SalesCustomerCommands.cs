using MediatR;
using Stocker.Modules.Sales.Application.DTOs;
using Stocker.Modules.Sales.Domain.Enums;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Sales.Application.Features.SalesCustomers.Commands;

/// <summary>
/// Command to create a new sales customer
/// </summary>
public record CreateSalesCustomerCommand : IRequest<Result<SalesCustomerDto>>
{
    public SalesCustomerType CustomerType { get; init; }

    // Customer Code (optional - auto-generated if not provided)
    public string? CustomerCode { get; init; }

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
/// Command to update an existing sales customer
/// </summary>
public record UpdateSalesCustomerCommand : IRequest<Result<SalesCustomerDto>>
{
    public Guid Id { get; init; }

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

/// <summary>
/// Command to delete a sales customer (soft delete)
/// </summary>
public record DeleteSalesCustomerCommand : IRequest<Result>
{
    public Guid Id { get; init; }
}

/// <summary>
/// Command to activate a sales customer
/// </summary>
public record ActivateSalesCustomerCommand : IRequest<Result<SalesCustomerDto>>
{
    public Guid Id { get; init; }
}

/// <summary>
/// Command to deactivate a sales customer
/// </summary>
public record DeactivateSalesCustomerCommand : IRequest<Result<SalesCustomerDto>>
{
    public Guid Id { get; init; }
}

/// <summary>
/// Command to update customer balance (add debit or credit)
/// </summary>
public record UpdateCustomerBalanceCommand : IRequest<Result<SalesCustomerDto>>
{
    public Guid Id { get; init; }
    public decimal Amount { get; init; }
    public bool IsCredit { get; init; }
}

/// <summary>
/// Command to set customer balance directly
/// </summary>
public record SetCustomerBalanceCommand : IRequest<Result<SalesCustomerDto>>
{
    public Guid Id { get; init; }
    public decimal Balance { get; init; }
}

/// <summary>
/// Command to update customer e-invoice info
/// </summary>
public record UpdateEInvoiceInfoCommand : IRequest<Result<SalesCustomerDto>>
{
    public Guid Id { get; init; }
    public bool IsRegistered { get; init; }
    public string? EInvoiceAlias { get; init; }
}

/// <summary>
/// Command to link customer to CRM
/// </summary>
public record LinkToCrmCustomerCommand : IRequest<Result<SalesCustomerDto>>
{
    public Guid Id { get; init; }
    public Guid CrmCustomerId { get; init; }
}

/// <summary>
/// Command to unlink customer from CRM
/// </summary>
public record UnlinkFromCrmCommand : IRequest<Result<SalesCustomerDto>>
{
    public Guid Id { get; init; }
}
