using Stocker.Domain.Common.ValueObjects;
using Stocker.Domain.Master.Enums;
using Stocker.SharedKernel.Primitives;

namespace Stocker.Domain.Master.Entities;

public sealed class TenantBilling : Entity
{
    public Guid TenantId { get; private set; }
    
    // Billing Address
    public string CompanyName { get; private set; }
    public string? TaxNumber { get; private set; }
    public string? TaxOffice { get; private set; }
    public string AddressLine1 { get; private set; }
    public string? AddressLine2 { get; private set; }
    public string City { get; private set; }
    public string? State { get; private set; }
    public string PostalCode { get; private set; }
    public string Country { get; private set; }
    
    // Contact Information
    public Email InvoiceEmail { get; private set; }
    public Email? CCEmail { get; private set; }
    public PhoneNumber? ContactPhone { get; private set; }
    
    // Payment Settings
    public PaymentMethod PreferredPaymentMethod { get; private set; }
    public BillingCycle BillingCycle { get; private set; }
    public int BillingDay { get; private set; } // Day of month/week for billing
    public bool AutoPaymentEnabled { get; private set; }
    public decimal? PaymentLimit { get; private set; } // Max auto-payment amount
    public string Currency { get; private set; }
    
    // Bank Account (for wire transfer)
    public string? BankName { get; private set; }
    public string? BankBranch { get; private set; }
    public string? AccountHolder { get; private set; }
    public string? IBAN { get; private set; }
    public string? SwiftCode { get; private set; }
    public string? AccountNumber { get; private set; }
    public string? RoutingNumber { get; private set; }
    
    // Credit Card (masked)
    public string? CardHolderName { get; private set; }
    public string? CardNumberMasked { get; private set; }
    public string? CardType { get; private set; } // Visa, MasterCard, etc.
    public int? CardExpiryMonth { get; private set; }
    public int? CardExpiryYear { get; private set; }
    public string? CardToken { get; private set; } // Payment gateway token
    public DateTime? CardAddedDate { get; private set; }
    
    // PayPal
    public string? PayPalEmail { get; private set; }
    public string? PayPalAccountId { get; private set; }
    
    // Billing Preferences
    public bool SendInvoiceByEmail { get; private set; }
    public bool SendInvoiceByPost { get; private set; }
    public bool ConsolidatedBilling { get; private set; } // Single invoice for multiple services
    public string? PurchaseOrderNumber { get; private set; }
    public string? CostCenter { get; private set; }
    
    // Late Payment Settings
    public decimal? LatePaymentInterestRate { get; private set; }
    public int? PaymentTermsDays { get; private set; }
    public int? GracePeriodDays { get; private set; }
    
    // Status
    public bool IsActive { get; private set; }
    public bool IsVerified { get; private set; }
    public DateTime? VerifiedAt { get; private set; }
    public string? VerifiedBy { get; private set; }
    public DateTime? LastPaymentDate { get; private set; }
    public decimal? LastPaymentAmount { get; private set; }
    public DateTime? NextBillingDate { get; private set; }
    
    // Audit
    public DateTime CreatedAt { get; private set; }
    public string CreatedBy { get; private set; }
    public DateTime? UpdatedAt { get; private set; }
    public string? UpdatedBy { get; private set; }
    
    // Navigation
    public Tenant Tenant { get; private set; }
    
    private TenantBilling() { } // EF Constructor
    
    private TenantBilling(
        Guid tenantId,
        string companyName,
        string addressLine1,
        string city,
        string postalCode,
        string country,
        Email invoiceEmail,
        PaymentMethod preferredPaymentMethod,
        BillingCycle billingCycle,
        string currency,
        string createdBy)
    {
        Id = Guid.NewGuid();
        TenantId = tenantId;
        CompanyName = companyName;
        AddressLine1 = addressLine1;
        City = city;
        PostalCode = postalCode;
        Country = country;
        InvoiceEmail = invoiceEmail;
        PreferredPaymentMethod = preferredPaymentMethod;
        BillingCycle = billingCycle;
        BillingDay = 1;
        Currency = currency;
        AutoPaymentEnabled = false;
        SendInvoiceByEmail = true;
        SendInvoiceByPost = false;
        ConsolidatedBilling = false;
        PaymentTermsDays = 30;
        GracePeriodDays = 7;
        IsActive = true;
        IsVerified = false;
        CreatedAt = DateTime.UtcNow;
        CreatedBy = createdBy;
    }
    
    public static TenantBilling Create(
        Guid tenantId,
        string companyName,
        string addressLine1,
        string city,
        string postalCode,
        string country,
        Email invoiceEmail,
        PaymentMethod preferredPaymentMethod,
        BillingCycle billingCycle,
        string currency,
        string createdBy)
    {
        if (tenantId == Guid.Empty)
            throw new ArgumentException("Tenant ID cannot be empty.", nameof(tenantId));
            
        if (string.IsNullOrWhiteSpace(companyName))
            throw new ArgumentException("Company name cannot be empty.", nameof(companyName));
            
        if (string.IsNullOrWhiteSpace(currency))
            throw new ArgumentException("Currency cannot be empty.", nameof(currency));
            
        return new TenantBilling(
            tenantId,
            companyName,
            addressLine1,
            city,
            postalCode,
            country,
            invoiceEmail,
            preferredPaymentMethod,
            billingCycle,
            currency,
            createdBy);
    }
    
    public void UpdateTaxInfo(string? taxNumber, string? taxOffice)
    {
        TaxNumber = taxNumber;
        TaxOffice = taxOffice;
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void UpdateAddress(
        string addressLine1,
        string? addressLine2,
        string city,
        string? state,
        string postalCode,
        string country)
    {
        AddressLine1 = addressLine1;
        AddressLine2 = addressLine2;
        City = city;
        State = state;
        PostalCode = postalCode;
        Country = country;
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void SetBankAccount(
        string bankName,
        string? bankBranch,
        string accountHolder,
        string? iban,
        string? swiftCode,
        string? accountNumber,
        string? routingNumber)
    {
        BankName = bankName;
        BankBranch = bankBranch;
        AccountHolder = accountHolder;
        IBAN = iban;
        SwiftCode = swiftCode;
        AccountNumber = accountNumber;
        RoutingNumber = routingNumber;
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void SetCreditCard(
        string cardHolderName,
        string cardNumberMasked,
        string cardType,
        int expiryMonth,
        int expiryYear,
        string cardToken)
    {
        CardHolderName = cardHolderName;
        CardNumberMasked = cardNumberMasked;
        CardType = cardType;
        CardExpiryMonth = expiryMonth;
        CardExpiryYear = expiryYear;
        CardToken = cardToken;
        CardAddedDate = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void SetPayPal(string payPalEmail, string? payPalAccountId = null)
    {
        PayPalEmail = payPalEmail;
        PayPalAccountId = payPalAccountId;
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void UpdatePaymentMethod(PaymentMethod paymentMethod)
    {
        PreferredPaymentMethod = paymentMethod;
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void UpdateBillingCycle(BillingCycle billingCycle, int billingDay)
    {
        BillingCycle = billingCycle;
        BillingDay = billingDay;
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void EnableAutoPayment(decimal? paymentLimit = null)
    {
        AutoPaymentEnabled = true;
        PaymentLimit = paymentLimit;
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void DisableAutoPayment()
    {
        AutoPaymentEnabled = false;
        PaymentLimit = null;
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void UpdateBillingPreferences(
        bool sendByEmail,
        bool sendByPost,
        bool consolidatedBilling,
        string? purchaseOrderNumber = null,
        string? costCenter = null)
    {
        SendInvoiceByEmail = sendByEmail;
        SendInvoiceByPost = sendByPost;
        ConsolidatedBilling = consolidatedBilling;
        PurchaseOrderNumber = purchaseOrderNumber;
        CostCenter = costCenter;
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void SetPaymentTerms(
        int paymentTermsDays,
        int gracePeriodDays,
        decimal? latePaymentInterestRate = null)
    {
        PaymentTermsDays = paymentTermsDays;
        GracePeriodDays = gracePeriodDays;
        LatePaymentInterestRate = latePaymentInterestRate;
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void Verify(string verifiedBy)
    {
        IsVerified = true;
        VerifiedAt = DateTime.UtcNow;
        VerifiedBy = verifiedBy;
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void RecordPayment(decimal amount, DateTime? nextBillingDate = null)
    {
        LastPaymentDate = DateTime.UtcNow;
        LastPaymentAmount = amount;
        NextBillingDate = nextBillingDate;
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void Activate()
    {
        IsActive = true;
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void Deactivate()
    {
        IsActive = false;
        UpdatedAt = DateTime.UtcNow;
    }
}

public enum PaymentMethod
{
    CreditCard = 0,
    BankTransfer = 1,
    PayPal = 2,
    Check = 3,
    Cash = 4,
    DirectDebit = 5,
    Cryptocurrency = 6,
    Diger = 7
}