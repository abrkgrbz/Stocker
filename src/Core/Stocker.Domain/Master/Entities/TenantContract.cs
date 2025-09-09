using Stocker.SharedKernel.Primitives;

namespace Stocker.Domain.Master.Entities;

public sealed class TenantContract : Entity
{
    public Guid TenantId { get; private set; }
    public string ContractNumber { get; private set; }
    public ContractType ContractType { get; private set; }
    public DateTime StartDate { get; private set; }
    public DateTime EndDate { get; private set; }
    public decimal ContractValue { get; private set; }
    public string Currency { get; private set; }
    public PaymentTerms PaymentTerms { get; private set; }
    
    // Contract Details
    public string? Terms { get; private set; }
    public string? SpecialConditions { get; private set; }
    public int NoticePeriodDays { get; private set; }
    public bool AutoRenewal { get; private set; }
    public int? RenewalPeriodMonths { get; private set; }
    public decimal? RenewalPriceIncrease { get; private set; }
    
    // Signing Information
    public ContractStatus Status { get; private set; }
    public DateTime? SignedDate { get; private set; }
    public string? SignedBy { get; private set; }
    public string? SignerTitle { get; private set; }
    public string? SignerEmail { get; private set; }
    public string? DocumentUrl { get; private set; }
    public string? DocumentHash { get; private set; }
    
    // Approval Process
    public bool RequiresApproval { get; private set; }
    public DateTime? ApprovedDate { get; private set; }
    public string? ApprovedBy { get; private set; }
    public string? ApprovalNotes { get; private set; }
    
    // Termination
    public DateTime? TerminationDate { get; private set; }
    public string? TerminationReason { get; private set; }
    public string? TerminatedBy { get; private set; }
    public decimal? EarlyTerminationFee { get; private set; }
    
    // SLA (Service Level Agreement)
    public decimal? UptimeGuarantee { get; private set; }
    public int? ResponseTimeHours { get; private set; }
    public int? ResolutionTimeHours { get; private set; }
    public string? SupportLevel { get; private set; }
    
    // Audit
    public DateTime CreatedAt { get; private set; }
    public string CreatedBy { get; private set; }
    public DateTime? UpdatedAt { get; private set; }
    public string? UpdatedBy { get; private set; }
    
    // Navigation
    public Tenant Tenant { get; private set; }
    
    private TenantContract() { } // EF Constructor
    
    private TenantContract(
        Guid tenantId,
        ContractType contractType,
        DateTime startDate,
        DateTime endDate,
        decimal contractValue,
        string currency,
        PaymentTerms paymentTerms,
        string createdBy)
    {
        Id = Guid.NewGuid();
        TenantId = tenantId;
        ContractNumber = GenerateContractNumber();
        ContractType = contractType;
        StartDate = startDate;
        EndDate = endDate;
        ContractValue = contractValue;
        Currency = currency;
        PaymentTerms = paymentTerms;
        Status = ContractStatus.Draft;
        NoticePeriodDays = 30;
        AutoRenewal = false;
        RequiresApproval = contractValue > 10000;
        CreatedAt = DateTime.UtcNow;
        CreatedBy = createdBy;
    }
    
    public static TenantContract Create(
        Guid tenantId,
        ContractType contractType,
        DateTime startDate,
        DateTime endDate,
        decimal contractValue,
        string currency,
        PaymentTerms paymentTerms,
        string createdBy)
    {
        if (tenantId == Guid.Empty)
            throw new ArgumentException("Tenant ID cannot be empty.", nameof(tenantId));
            
        if (endDate <= startDate)
            throw new ArgumentException("End date must be after start date.", nameof(endDate));
            
        if (contractValue < 0)
            throw new ArgumentException("Contract value cannot be negative.", nameof(contractValue));
            
        if (string.IsNullOrWhiteSpace(currency))
            throw new ArgumentException("Currency cannot be empty.", nameof(currency));
            
        return new TenantContract(
            tenantId,
            contractType,
            startDate,
            endDate,
            contractValue,
            currency,
            paymentTerms,
            createdBy);
    }
    
    public void SetTerms(string terms, string? specialConditions = null)
    {
        Terms = terms;
        SpecialConditions = specialConditions;
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void SetRenewalTerms(bool autoRenewal, int? renewalPeriodMonths = null, decimal? priceIncrease = null)
    {
        AutoRenewal = autoRenewal;
        RenewalPeriodMonths = renewalPeriodMonths;
        RenewalPriceIncrease = priceIncrease;
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void SetSLA(decimal uptimeGuarantee, int responseTimeHours, int resolutionTimeHours, string supportLevel)
    {
        UptimeGuarantee = uptimeGuarantee;
        ResponseTimeHours = responseTimeHours;
        ResolutionTimeHours = resolutionTimeHours;
        SupportLevel = supportLevel;
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void Sign(string signedBy, string signerTitle, string signerEmail, string documentUrl, string? documentHash = null)
    {
        if (Status != ContractStatus.Draft && Status != ContractStatus.Approved)
            throw new InvalidOperationException("Contract must be in draft or approved status to sign.");
            
        SignedDate = DateTime.UtcNow;
        SignedBy = signedBy;
        SignerTitle = signerTitle;
        SignerEmail = signerEmail;
        DocumentUrl = documentUrl;
        DocumentHash = documentHash;
        Status = ContractStatus.Active;
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void Approve(string approvedBy, string? notes = null)
    {
        if (!RequiresApproval)
            throw new InvalidOperationException("Contract does not require approval.");
            
        if (Status != ContractStatus.Draft)
            throw new InvalidOperationException("Only draft contracts can be approved.");
            
        ApprovedDate = DateTime.UtcNow;
        ApprovedBy = approvedBy;
        ApprovalNotes = notes;
        Status = ContractStatus.Approved;
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void Terminate(string terminatedBy, string reason, decimal? earlyTerminationFee = null)
    {
        if (Status != ContractStatus.Active)
            throw new InvalidOperationException("Only active contracts can be terminated.");
            
        TerminationDate = DateTime.UtcNow;
        TerminatedBy = terminatedBy;
        TerminationReason = reason;
        EarlyTerminationFee = earlyTerminationFee;
        Status = ContractStatus.Terminated;
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void Expire()
    {
        if (Status != ContractStatus.Active)
            throw new InvalidOperationException("Only active contracts can expire.");
            
        Status = ContractStatus.Expired;
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void Renew(DateTime newEndDate, decimal? newContractValue = null)
    {
        if (!AutoRenewal)
            throw new InvalidOperationException("Contract does not have auto-renewal enabled.");
            
        if (Status != ContractStatus.Active && Status != ContractStatus.Expired)
            throw new InvalidOperationException("Only active or expired contracts can be renewed.");
            
        EndDate = newEndDate;
        
        if (newContractValue.HasValue)
            ContractValue = newContractValue.Value;
        else if (RenewalPriceIncrease.HasValue)
            ContractValue = ContractValue * (1 + RenewalPriceIncrease.Value / 100);
            
        Status = ContractStatus.Active;
        UpdatedAt = DateTime.UtcNow;
    }
    
    private static string GenerateContractNumber()
    {
        return $"CNT-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString()[..8].ToUpper()}";
    }
}

public enum ContractType
{
    Standard = 0,
    Enterprise = 1,
    Custom = 2,
    Trial = 3,
    Partnership = 4
}

public enum ContractStatus
{
    Draft = 0,
    Approved = 1,
    Active = 2,
    Expired = 3,
    Terminated = 4,
    Suspended = 5
}

public enum PaymentTerms
{
    Monthly = 0,
    Quarterly = 1,
    SemiAnnual = 2,
    Annual = 3,
    OneTime = 4,
    Custom = 5
}