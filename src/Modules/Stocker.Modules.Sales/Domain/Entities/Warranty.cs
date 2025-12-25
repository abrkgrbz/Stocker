using Stocker.Modules.Sales.Domain.ValueObjects;
using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Sales.Domain.Entities;

/// <summary>
/// Represents a product warranty registration.
/// Tracks warranty coverage, claims, and service history.
/// Supports standard and extended warranty types.
/// </summary>
public class Warranty : TenantAggregateRoot
{
    private readonly List<WarrantyClaim> _claims = new();

    #region Properties

    public string WarrantyNumber { get; private set; } = string.Empty;

    // Product Information
    public Guid? ProductId { get; private set; }
    public string ProductCode { get; private set; } = string.Empty;
    public string ProductName { get; private set; } = string.Empty;
    public string? SerialNumber { get; private set; }
    public string? LotNumber { get; private set; }

    // Sale Information
    public Guid? SalesOrderId { get; private set; }
    public string? SalesOrderNumber { get; private set; }
    public Guid? SalesOrderItemId { get; private set; }
    public Guid? InvoiceId { get; private set; }
    public string? InvoiceNumber { get; private set; }
    public DateTime? PurchaseDate { get; private set; }

    // Customer Information
    public Guid? CustomerId { get; private set; }
    public string CustomerName { get; private set; } = string.Empty;
    public string? CustomerEmail { get; private set; }
    public string? CustomerPhone { get; private set; }
    public string? CustomerAddress { get; private set; }

    // Warranty Period
    public DateTime StartDate { get; private set; }
    public DateTime EndDate { get; private set; }
    public int DurationMonths => (int)((EndDate - StartDate).TotalDays / 30);
    public int RemainingDays => IsExpired ? 0 : (int)(EndDate - DateTime.UtcNow).TotalDays;

    // Warranty Type & Coverage
    public WarrantyType Type { get; private set; }
    public WarrantyCoverageType CoverageType { get; private set; }
    public string? CoverageDescription { get; private set; }
    public decimal? MaxClaimAmount { get; private set; }
    public int? MaxClaimCount { get; private set; }

    // Status
    public WarrantyStatus Status { get; private set; }
    public bool IsActive => Status == WarrantyStatus.Active && !IsExpired;
    public bool IsExpired => DateTime.UtcNow > EndDate;
    public bool IsVoid { get; private set; }
    public string? VoidReason { get; private set; }
    public DateTime? VoidedDate { get; private set; }

    // Extended Warranty
    public bool IsExtended { get; private set; }
    public Guid? OriginalWarrantyId { get; private set; }
    public decimal? ExtensionPrice { get; private set; }
    public DateTime? ExtendedDate { get; private set; }

    // Claims Summary
    public int ClaimCount => _claims.Count;
    public int ApprovedClaimCount => _claims.Count(c => c.Status == WarrantyClaimStatus.Approved);
    public decimal TotalClaimedAmount => _claims.Where(c => c.Status == WarrantyClaimStatus.Approved).Sum(c => c.ClaimAmount);

    // Registration
    public bool IsRegistered { get; private set; }
    public DateTime? RegisteredDate { get; private set; }
    public string? RegisteredBy { get; private set; }

    // Audit
    public string? Notes { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }

    public IReadOnlyCollection<WarrantyClaim> Claims => _claims.AsReadOnly();

    #endregion

    #region Constructors

    private Warranty() { }

    private Warranty(
        Guid tenantId,
        string warrantyNumber,
        string productCode,
        string productName,
        DateTime startDate,
        DateTime endDate,
        WarrantyType type) : base(Guid.NewGuid(), tenantId)
    {
        WarrantyNumber = warrantyNumber;
        ProductCode = productCode;
        ProductName = productName;
        StartDate = startDate;
        EndDate = endDate;
        Type = type;
        CoverageType = WarrantyCoverageType.Full;
        Status = WarrantyStatus.Pending;
        CreatedAt = DateTime.UtcNow;
    }

    #endregion

    #region Factory Methods

    public static Result<Warranty> Create(
        Guid tenantId,
        string warrantyNumber,
        string productCode,
        string productName,
        DateTime startDate,
        DateTime endDate,
        WarrantyType type = WarrantyType.Standard)
    {
        if (string.IsNullOrWhiteSpace(warrantyNumber))
            return Result<Warranty>.Failure(Error.Validation("Warranty.NumberRequired", "Warranty number is required"));

        if (string.IsNullOrWhiteSpace(productCode))
            return Result<Warranty>.Failure(Error.Validation("Warranty.ProductRequired", "Product code is required"));

        if (endDate <= startDate)
            return Result<Warranty>.Failure(Error.Validation("Warranty.InvalidPeriod", "End date must be after start date"));

        return Result<Warranty>.Success(new Warranty(tenantId, warrantyNumber, productCode, productName, startDate, endDate, type));
    }

    public static Result<Warranty> CreateStandard(
        Guid tenantId,
        string warrantyNumber,
        string productCode,
        string productName,
        DateTime startDate,
        int durationMonths)
    {
        return Create(tenantId, warrantyNumber, productCode, productName, startDate, startDate.AddMonths(durationMonths), WarrantyType.Standard);
    }

    public static Result<Warranty> CreateExtended(
        Guid tenantId,
        string warrantyNumber,
        string productCode,
        string productName,
        DateTime startDate,
        int durationMonths,
        Guid originalWarrantyId,
        decimal extensionPrice)
    {
        var result = Create(tenantId, warrantyNumber, productCode, productName, startDate, startDate.AddMonths(durationMonths), WarrantyType.Extended);
        if (!result.IsSuccess) return result;

        var warranty = result.Value;
        warranty.IsExtended = true;
        warranty.OriginalWarrantyId = originalWarrantyId;
        warranty.ExtensionPrice = extensionPrice;
        warranty.ExtendedDate = DateTime.UtcNow;

        return Result<Warranty>.Success(warranty);
    }

    #endregion

    #region Product & Sale

    public Result SetProduct(Guid? productId, string? serialNumber, string? lotNumber)
    {
        ProductId = productId;
        SerialNumber = serialNumber;
        LotNumber = lotNumber;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    public Result SetSaleInfo(Guid salesOrderId, string salesOrderNumber, Guid salesOrderItemId, DateTime purchaseDate)
    {
        SalesOrderId = salesOrderId;
        SalesOrderNumber = salesOrderNumber;
        SalesOrderItemId = salesOrderItemId;
        PurchaseDate = purchaseDate;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    public Result SetInvoice(Guid invoiceId, string invoiceNumber)
    {
        InvoiceId = invoiceId;
        InvoiceNumber = invoiceNumber;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    #endregion

    #region Customer

    public Result SetCustomer(Guid? customerId, string customerName, string? email, string? phone, string? address)
    {
        if (string.IsNullOrWhiteSpace(customerName))
            return Result.Failure(Error.Validation("Warranty.CustomerRequired", "Customer name is required"));

        CustomerId = customerId;
        CustomerName = customerName;
        CustomerEmail = email;
        CustomerPhone = phone;
        CustomerAddress = address;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    #endregion

    #region Coverage

    public Result SetCoverage(WarrantyCoverageType coverageType, string? description, decimal? maxClaimAmount, int? maxClaimCount)
    {
        CoverageType = coverageType;
        CoverageDescription = description;
        MaxClaimAmount = maxClaimAmount;
        MaxClaimCount = maxClaimCount;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    #endregion

    #region Status & Validity

    public bool IsValidOn(DateTime date)
    {
        return date >= StartDate && date <= EndDate && Status == WarrantyStatus.Active && !IsVoid;
    }

    public bool IsValidNow => IsValidOn(DateTime.UtcNow);

    public Result Register(string? registeredBy = null)
    {
        if (IsRegistered)
            return Result.Failure(Error.Validation("Warranty.AlreadyRegistered", "Warranty is already registered"));

        IsRegistered = true;
        RegisteredDate = DateTime.UtcNow;
        RegisteredBy = registeredBy;
        Status = WarrantyStatus.Active;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    public Result Activate()
    {
        if (Status == WarrantyStatus.Active)
            return Result.Failure(Error.Validation("Warranty.AlreadyActive", "Warranty is already active"));

        if (IsVoid)
            return Result.Failure(Error.Validation("Warranty.IsVoid", "Cannot activate a void warranty"));

        Status = WarrantyStatus.Active;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    public Result Suspend(string reason)
    {
        if (Status != WarrantyStatus.Active)
            return Result.Failure(Error.Validation("Warranty.NotActive", "Can only suspend active warranties"));

        Status = WarrantyStatus.Suspended;
        Notes = $"{Notes}\nSuspended: {reason}".Trim();
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    public Result VoidWarranty(string reason)
    {
        if (IsVoid)
            return Result.Failure(Error.Validation("Warranty.AlreadyVoid", "Warranty is already void"));

        IsVoid = true;
        VoidReason = reason;
        VoidedDate = DateTime.UtcNow;
        Status = WarrantyStatus.Void;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    public Result Expire()
    {
        if (Status == WarrantyStatus.Expired)
            return Result.Failure(Error.Validation("Warranty.AlreadyExpired", "Warranty is already expired"));

        Status = WarrantyStatus.Expired;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    #endregion

    #region Extension

    public Result Extend(int additionalMonths, decimal? price = null)
    {
        if (IsVoid)
            return Result.Failure(Error.Validation("Warranty.IsVoid", "Cannot extend a void warranty"));

        if (additionalMonths <= 0)
            return Result.Failure(Error.Validation("Warranty.InvalidExtension", "Extension must be at least 1 month"));

        EndDate = EndDate.AddMonths(additionalMonths);
        IsExtended = true;
        ExtendedDate = DateTime.UtcNow;
        if (price.HasValue)
            ExtensionPrice = (ExtensionPrice ?? 0) + price.Value;

        // Reactivate if expired
        if (Status == WarrantyStatus.Expired && DateTime.UtcNow <= EndDate)
            Status = WarrantyStatus.Active;

        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    #endregion

    #region Claims

    public Result AddClaim(WarrantyClaim claim)
    {
        if (!IsActive)
            return Result.Failure(Error.Validation("Warranty.NotActive", "Cannot add claims to inactive warranty"));

        if (MaxClaimCount.HasValue && ClaimCount >= MaxClaimCount.Value)
            return Result.Failure(Error.Validation("Warranty.MaxClaimsReached", $"Maximum claim count ({MaxClaimCount}) reached"));

        if (MaxClaimAmount.HasValue && TotalClaimedAmount + claim.ClaimAmount > MaxClaimAmount.Value)
            return Result.Failure(Error.Validation("Warranty.MaxAmountExceeded", $"Claim would exceed maximum claim amount ({MaxClaimAmount})"));

        _claims.Add(claim);
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    public Result<WarrantyClaim> CreateClaim(
        Guid tenantId,
        string claimNumber,
        string issueDescription,
        WarrantyClaimType claimType,
        decimal estimatedAmount)
    {
        var claimResult = WarrantyClaim.Create(tenantId, Id, claimNumber, issueDescription, claimType, estimatedAmount);
        if (!claimResult.IsSuccess)
            return claimResult;

        var addResult = AddClaim(claimResult.Value);
        if (!addResult.IsSuccess)
            return Result<WarrantyClaim>.Failure(addResult.Error);

        return claimResult;
    }

    #endregion

    #region Metadata

    public Result SetNotes(string? notes)
    {
        Notes = notes;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    #endregion
}

/// <summary>
/// Represents a warranty claim submitted by a customer
/// </summary>
public class WarrantyClaim : TenantEntity
{
    public Guid WarrantyId { get; private set; }
    public string ClaimNumber { get; private set; } = string.Empty;
    public DateTime ClaimDate { get; private set; }

    // Issue Details
    public string IssueDescription { get; private set; } = string.Empty;
    public WarrantyClaimType ClaimType { get; private set; }
    public string? FailureCode { get; private set; }
    public string? DiagnosticNotes { get; private set; }

    // Resolution
    public WarrantyClaimStatus Status { get; private set; }
    public string? Resolution { get; private set; }
    public WarrantyResolutionType? ResolutionType { get; private set; }
    public DateTime? ResolvedDate { get; private set; }
    public Guid? ResolvedBy { get; private set; }

    // Amounts
    public decimal ClaimAmount { get; private set; }
    public decimal ApprovedAmount { get; private set; }
    public decimal PaidAmount { get; private set; }

    // Replacement (if applicable)
    public Guid? ReplacementProductId { get; private set; }
    public string? ReplacementSerialNumber { get; private set; }

    // Service (if applicable)
    public Guid? ServiceOrderId { get; private set; }
    public string? ServiceOrderNumber { get; private set; }

    // Audit
    public string? Notes { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }

    private WarrantyClaim() { }

    private WarrantyClaim(
        Guid tenantId,
        Guid warrantyId,
        string claimNumber,
        string issueDescription,
        WarrantyClaimType claimType,
        decimal claimAmount) : base(Guid.NewGuid(), tenantId)
    {
        WarrantyId = warrantyId;
        ClaimNumber = claimNumber;
        ClaimDate = DateTime.UtcNow;
        IssueDescription = issueDescription;
        ClaimType = claimType;
        ClaimAmount = claimAmount;
        Status = WarrantyClaimStatus.Submitted;
        CreatedAt = DateTime.UtcNow;
    }

    public static Result<WarrantyClaim> Create(
        Guid tenantId,
        Guid warrantyId,
        string claimNumber,
        string issueDescription,
        WarrantyClaimType claimType,
        decimal claimAmount)
    {
        if (string.IsNullOrWhiteSpace(claimNumber))
            return Result<WarrantyClaim>.Failure(Error.Validation("Claim.NumberRequired", "Claim number is required"));

        if (string.IsNullOrWhiteSpace(issueDescription))
            return Result<WarrantyClaim>.Failure(Error.Validation("Claim.DescriptionRequired", "Issue description is required"));

        if (claimAmount < 0)
            return Result<WarrantyClaim>.Failure(Error.Validation("Claim.InvalidAmount", "Claim amount cannot be negative"));

        return Result<WarrantyClaim>.Success(
            new WarrantyClaim(tenantId, warrantyId, claimNumber, issueDescription, claimType, claimAmount));
    }

    public Result StartReview()
    {
        if (Status != WarrantyClaimStatus.Submitted)
            return Result.Failure(Error.Validation("Claim.NotSubmitted", "Can only review submitted claims"));

        Status = WarrantyClaimStatus.UnderReview;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    public Result Approve(decimal approvedAmount, WarrantyResolutionType resolutionType, string resolution, Guid resolvedBy)
    {
        if (Status != WarrantyClaimStatus.UnderReview)
            return Result.Failure(Error.Validation("Claim.NotUnderReview", "Can only approve claims under review"));

        if (approvedAmount < 0 || approvedAmount > ClaimAmount)
            return Result.Failure(Error.Validation("Claim.InvalidApproval", "Invalid approved amount"));

        Status = WarrantyClaimStatus.Approved;
        ApprovedAmount = approvedAmount;
        ResolutionType = resolutionType;
        Resolution = resolution;
        ResolvedDate = DateTime.UtcNow;
        ResolvedBy = resolvedBy;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    public Result Reject(string reason, Guid resolvedBy)
    {
        if (Status != WarrantyClaimStatus.UnderReview)
            return Result.Failure(Error.Validation("Claim.NotUnderReview", "Can only reject claims under review"));

        Status = WarrantyClaimStatus.Rejected;
        Resolution = reason;
        ResolvedDate = DateTime.UtcNow;
        ResolvedBy = resolvedBy;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    public Result Complete(decimal paidAmount)
    {
        if (Status != WarrantyClaimStatus.Approved)
            return Result.Failure(Error.Validation("Claim.NotApproved", "Can only complete approved claims"));

        PaidAmount = paidAmount;
        Status = WarrantyClaimStatus.Completed;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    public Result SetReplacement(Guid productId, string serialNumber)
    {
        ReplacementProductId = productId;
        ReplacementSerialNumber = serialNumber;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    public Result SetServiceOrder(Guid serviceOrderId, string serviceOrderNumber)
    {
        ServiceOrderId = serviceOrderId;
        ServiceOrderNumber = serviceOrderNumber;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    public Result SetDiagnostics(string? failureCode, string? diagnosticNotes)
    {
        FailureCode = failureCode;
        DiagnosticNotes = diagnosticNotes;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    public Result SetNotes(string? notes)
    {
        Notes = notes;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }
}

#region Enums

public enum WarrantyType
{
    Standard = 0,
    Extended = 1,
    Limited = 2,
    Lifetime = 3,
    Manufacturer = 4,
    ThirdParty = 5
}

public enum WarrantyCoverageType
{
    Full = 0,               // Parts and labor
    PartsOnly = 1,          // Parts only
    LaborOnly = 2,          // Labor only
    Limited = 3,            // Limited coverage
    Accidental = 4,         // Accidental damage
    ComprehensivePlus = 5   // Full + accidental
}

public enum WarrantyStatus
{
    Pending = 0,
    Active = 1,
    Suspended = 2,
    Expired = 3,
    Void = 4
}

public enum WarrantyClaimType
{
    Defect = 0,
    Malfunction = 1,
    DOA = 2,                // Dead on Arrival
    AccidentalDamage = 3,
    Wear = 4,
    Missing = 5,
    Other = 99
}

public enum WarrantyClaimStatus
{
    Submitted = 0,
    UnderReview = 1,
    Approved = 2,
    Rejected = 3,
    Completed = 4,
    Cancelled = 5
}

public enum WarrantyResolutionType
{
    Repair = 0,
    Replace = 1,
    Refund = 2,
    Credit = 3,
    NoAction = 4
}

#endregion
