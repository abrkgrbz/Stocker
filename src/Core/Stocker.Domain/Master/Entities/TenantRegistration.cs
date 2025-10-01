using Stocker.Domain.Common.ValueObjects;
using Stocker.Domain.Master.Enums;
using Stocker.SharedKernel.Primitives;

namespace Stocker.Domain.Master.Entities;

public sealed class TenantRegistration : Entity
{
    public string RegistrationCode { get; private set; }
    public string CompanyName { get; private set; }
    public string CompanyCode { get; private set; }
    public string? TaxNumber { get; private set; }
    public string? TaxOffice { get; private set; }
    public string ContactPersonName { get; private set; }
    public string ContactPersonSurname { get; private set; }
    public Email ContactEmail { get; private set; }
    public PhoneNumber ContactPhone { get; private set; }
    public string? CompanyWebsite { get; private set; }
    public int EmployeeCount { get; private set; }
    public string? Industry { get; private set; }
    
    // Admin User Info
    public Email AdminEmail { get; private set; }
    public string AdminUsername { get; private set; }
    public string AdminFirstName { get; private set; }
    public string AdminLastName { get; private set; }
    public string? AdminPhone { get; private set; }
    public string? AdminTitle { get; private set; }
    
    // Package and Billing
    public string PackageName { get; private set; }
    public string BillingCycle { get; private set; }
    
    // Address
    public string AddressLine1 { get; private set; }
    public string? AddressLine2 { get; private set; }
    public string City { get; private set; }
    public string? State { get; private set; }
    public string PostalCode { get; private set; }
    public string Country { get; private set; }
    
    // Registration Status
    public RegistrationStatus Status { get; private set; }
    public DateTime RegistrationDate { get; private set; }
    public DateTime? ApprovalDate { get; private set; }
    public DateTime? RejectionDate { get; private set; }
    public string? RejectionReason { get; private set; }
    public string? ApprovedBy { get; private set; }
    public string? RejectedBy { get; private set; }
    
    // Package Selection
    public Guid? SelectedPackageId { get; private set; }
    public string? ReferralCode { get; private set; }
    public string? PromoCode { get; private set; }
    
    // Verification
    public bool EmailVerified { get; private set; }
    public DateTime? EmailVerifiedAt { get; private set; }
    public string? EmailVerificationToken { get; private set; } // For link-based verification
    public string? EmailVerificationCode { get; private set; }  // For code-based verification (6-digit)
    public bool PhoneVerified { get; private set; }
    public DateTime? PhoneVerifiedAt { get; private set; }
    public string? PhoneVerificationCode { get; private set; }
    
    // Terms & Conditions
    public bool TermsAccepted { get; private set; }
    public DateTime? TermsAcceptedAt { get; private set; }
    public string? TermsVersion { get; private set; }
    public bool PrivacyPolicyAccepted { get; private set; }
    public DateTime? PrivacyPolicyAcceptedAt { get; private set; }
    
    // Marketing
    public bool MarketingEmailsAllowed { get; private set; }
    public bool MarketingSmsAllowed { get; private set; }
    
    // Navigation
    public Guid? TenantId { get; private set; }
    public Tenant? Tenant { get; private set; }
    public Package? SelectedPackage { get; private set; }
    
    private TenantRegistration() { } // EF Constructor
    
    private TenantRegistration(
        string companyName,
        string companyCode,
        string contactPersonName,
        string contactPersonSurname,
        Email contactEmail,
        PhoneNumber contactPhone,
        string addressLine1,
        string city,
        string postalCode,
        string country,
        Email adminEmail,
        string adminUsername,
        string adminFirstName,
        string adminLastName)
    {
        Id = Guid.NewGuid();
        RegistrationCode = GenerateRegistrationCode();
        CompanyName = companyName;
        CompanyCode = companyCode;
        ContactPersonName = contactPersonName;
        ContactPersonSurname = contactPersonSurname;
        ContactEmail = contactEmail;
        ContactPhone = contactPhone;
        AddressLine1 = addressLine1;
        City = city;
        PostalCode = postalCode;
        Country = country;
        AdminEmail = adminEmail;
        AdminUsername = adminUsername;
        AdminFirstName = adminFirstName;
        AdminLastName = adminLastName;
        Status = RegistrationStatus.Pending;
        RegistrationDate = DateTime.UtcNow;
        EmailVerificationToken = GenerateVerificationToken(); // For link-based verification
        EmailVerificationCode = GenerateVerificationCode();  // For code-based verification
        PhoneVerificationCode = GenerateVerificationCode();
        BillingCycle = "Monthly"; // Default
        PackageName = "Trial"; // Default
    }
    
    public static TenantRegistration Create(
        string companyName,
        string companyCode,
        string contactPersonName,
        string contactPersonSurname,
        Email contactEmail,
        PhoneNumber contactPhone,
        string addressLine1,
        string city,
        string postalCode,
        string country,
        Email adminEmail,
        string adminUsername,
        string adminFirstName,
        string adminLastName)
    {
        if (string.IsNullOrWhiteSpace(companyName))
            throw new ArgumentException("Company name cannot be empty.", nameof(companyName));
            
        if (string.IsNullOrWhiteSpace(companyCode))
            throw new ArgumentException("Company code cannot be empty.", nameof(companyCode));
            
        if (string.IsNullOrWhiteSpace(contactPersonName))
            throw new ArgumentException("Contact person name cannot be empty.", nameof(contactPersonName));
            
        if (string.IsNullOrWhiteSpace(contactPersonSurname))
            throw new ArgumentException("Contact person surname cannot be empty.", nameof(contactPersonSurname));
            
        return new TenantRegistration(
            companyName,
            companyCode,
            contactPersonName,
            contactPersonSurname,
            contactEmail,
            contactPhone,
            addressLine1,
            city,
            postalCode,
            country,
            adminEmail,
            adminUsername,
            adminFirstName,
            adminLastName);
    }
    
    public void SetTaxInfo(string taxNumber, string taxOffice)
    {
        TaxNumber = taxNumber;
        TaxOffice = taxOffice;
    }
    
    public void SetCompanyDetails(string? website, int employeeCount, string? industry)
    {
        CompanyWebsite = website;
        EmployeeCount = employeeCount;
        Industry = industry;
    }
    
    public void SelectPackage(Guid packageId, string? referralCode = null, string? promoCode = null)
    {
        SelectedPackageId = packageId;
        ReferralCode = referralCode;
        PromoCode = promoCode;
    }
    
    public void SetAdminInfo(string? adminPhone, string? adminTitle)
    {
        AdminPhone = adminPhone;
        AdminTitle = adminTitle;
    }
    
    public void SetBillingInfo(string packageName, string billingCycle)
    {
        PackageName = packageName;
        BillingCycle = billingCycle;
    }
    
    public void VerifyEmail(string token)
    {
        if (EmailVerified)
            throw new InvalidOperationException("Email already verified.");

        // Accept both token (link-based) and code (6-digit)
        var isTokenValid = EmailVerificationToken != null && EmailVerificationToken == token;
        var isCodeValid = EmailVerificationCode != null && EmailVerificationCode == token;

        if (!isTokenValid && !isCodeValid)
            throw new InvalidOperationException("Invalid verification token or code.");

        EmailVerified = true;
        EmailVerifiedAt = DateTime.UtcNow;
        EmailVerificationToken = null;
        EmailVerificationCode = null;
    }
    
    public void VerifyPhone(string code)
    {
        if (PhoneVerified)
            throw new InvalidOperationException("Phone already verified.");
            
        if (PhoneVerificationCode != code)
            throw new InvalidOperationException("Invalid verification code.");
            
        PhoneVerified = true;
        PhoneVerifiedAt = DateTime.UtcNow;
        PhoneVerificationCode = null;
    }
    
    public void AcceptTerms(string termsVersion)
    {
        TermsAccepted = true;
        TermsAcceptedAt = DateTime.UtcNow;
        TermsVersion = termsVersion;
    }
    
    public void AcceptPrivacyPolicy()
    {
        PrivacyPolicyAccepted = true;
        PrivacyPolicyAcceptedAt = DateTime.UtcNow;
    }
    
    public void SetMarketingPreferences(bool emailAllowed, bool smsAllowed)
    {
        MarketingEmailsAllowed = emailAllowed;
        MarketingSmsAllowed = smsAllowed;
    }
    
    public void Approve(string approvedBy, Guid tenantId)
    {
        if (Status != RegistrationStatus.Pending)
            throw new InvalidOperationException("Only pending registrations can be approved.");
            
        Status = RegistrationStatus.Approved;
        ApprovalDate = DateTime.UtcNow;
        ApprovedBy = approvedBy;
        TenantId = tenantId;
    }
    
    public void Reject(string rejectedBy, string reason)
    {
        if (Status != RegistrationStatus.Pending)
            throw new InvalidOperationException("Only pending registrations can be rejected.");
            
        Status = RegistrationStatus.Rejected;
        RejectionDate = DateTime.UtcNow;
        RejectedBy = rejectedBy;
        RejectionReason = reason;
    }
    
    public void Cancel()
    {
        if (Status != RegistrationStatus.Pending)
            throw new InvalidOperationException("Only pending registrations can be cancelled.");
            
        Status = RegistrationStatus.Cancelled;
    }
    
    private static string GenerateRegistrationCode()
    {
        return $"REG-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString()[..8].ToUpper()}";
    }
    
    private static string GenerateVerificationToken()
    {
        return Guid.NewGuid().ToString("N");
    }
    
    private static string GenerateVerificationCode()
    {
        // Use cryptographically secure random number generator
        using var rng = System.Security.Cryptography.RandomNumberGenerator.Create();
        var bytes = new byte[4];
        rng.GetBytes(bytes);
        var number = BitConverter.ToUInt32(bytes, 0);
        // Generate 6-digit code between 100000-999999
        var code = (number % 900000) + 100000;
        return code.ToString();
    }
}

public enum RegistrationStatus
{
    Pending = 0,
    Approved = 1,
    Rejected = 2,
    Cancelled = 3,
    Expired = 4
}