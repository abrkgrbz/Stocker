using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Results;
using Stocker.Modules.CRM.Domain.Enums;

namespace Stocker.Modules.CRM.Domain.Entities;

/// <summary>
/// Represents a contract in the CRM system
/// </summary>
public class Contract : TenantAggregateRoot
{
    private readonly List<Note> _notes = new();
    private readonly List<ContractLineItem> _lineItems = new();

    /// <summary>
    /// Gets the contract number
    /// </summary>
    public string ContractNumber { get; private set; } = string.Empty;

    /// <summary>
    /// Gets the contract title
    /// </summary>
    public string Title { get; private set; } = string.Empty;

    /// <summary>
    /// Gets the contract type
    /// </summary>
    public string? Type { get; private set; }

    /// <summary>
    /// Gets the contract status
    /// </summary>
    public ContractStatus Status { get; private set; }

    /// <summary>
    /// Gets the account ID
    /// </summary>
    public Guid AccountId { get; private set; }

    /// <summary>
    /// Gets the account
    /// </summary>
    public Account? Account { get; private set; }

    /// <summary>
    /// Gets the contact ID
    /// </summary>
    public Guid? ContactId { get; private set; }

    /// <summary>
    /// Gets the contact
    /// </summary>
    public Contact? Contact { get; private set; }

    /// <summary>
    /// Gets the opportunity ID
    /// </summary>
    public Guid? OpportunityId { get; private set; }

    /// <summary>
    /// Gets the opportunity
    /// </summary>
    public Opportunity? Opportunity { get; private set; }

    /// <summary>
    /// Gets the owner user ID
    /// </summary>
    public Guid OwnerId { get; private set; }

    /// <summary>
    /// Gets the start date
    /// </summary>
    public DateTime StartDate { get; private set; }

    /// <summary>
    /// Gets the end date
    /// </summary>
    public DateTime EndDate { get; private set; }

    /// <summary>
    /// Gets the contract value
    /// </summary>
    public decimal ContractValue { get; private set; }

    /// <summary>
    /// Gets the payment terms
    /// </summary>
    public string? PaymentTerms { get; private set; }

    /// <summary>
    /// Gets the payment frequency
    /// </summary>
    public string? PaymentFrequency { get; private set; }

    /// <summary>
    /// Gets the billing frequency
    /// </summary>
    public string? BillingFrequency { get; private set; }

    /// <summary>
    /// Gets the renewal date
    /// </summary>
    public DateTime? RenewalDate { get; private set; }

    /// <summary>
    /// Gets whether auto-renewal is enabled
    /// </summary>
    public bool IsAutoRenewal { get; private set; }

    /// <summary>
    /// Gets the renewal term in months
    /// </summary>
    public int? RenewalTermMonths { get; private set; }

    /// <summary>
    /// Gets the notice period in days
    /// </summary>
    public int NoticePeriodDays { get; private set; }

    /// <summary>
    /// Gets the signed date
    /// </summary>
    public DateTime? SignedDate { get; private set; }

    /// <summary>
    /// Gets the signed by name
    /// </summary>
    public string? SignedByName { get; private set; }

    /// <summary>
    /// Gets the signed by title
    /// </summary>
    public string? SignedByTitle { get; private set; }

    /// <summary>
    /// Gets the company signed date
    /// </summary>
    public DateTime? CompanySignedDate { get; private set; }

    /// <summary>
    /// Gets the company signed by ID
    /// </summary>
    public Guid? CompanySignedById { get; private set; }

    /// <summary>
    /// Gets the description
    /// </summary>
    public string? Description { get; private set; }

    /// <summary>
    /// Gets the special terms
    /// </summary>
    public string? SpecialTerms { get; private set; }

    /// <summary>
    /// Gets the cancellation terms
    /// </summary>
    public string? CancellationTerms { get; private set; }

    /// <summary>
    /// Gets the currency code
    /// </summary>
    public string CurrencyCode { get; private set; } = "TRY";

    /// <summary>
    /// Gets the billing address
    /// </summary>
    public Address? BillingAddress { get; private set; }

    /// <summary>
    /// Gets the line items
    /// </summary>
    public IReadOnlyList<ContractLineItem> LineItems => _lineItems.AsReadOnly();

    /// <summary>
    /// Gets the notes
    /// </summary>
    public IReadOnlyList<Note> Notes => _notes.AsReadOnly();

    /// <summary>
    /// Gets the created date
    /// </summary>
    public DateTime CreatedAt { get; private set; }

    /// <summary>
    /// Gets the last modified date
    /// </summary>
    public DateTime? UpdatedAt { get; private set; }

    /// <summary>
    /// Private constructor for EF Core
    /// </summary>
    private Contract() : base()
    {
    }

    /// <summary>
    /// Creates a new contract
    /// </summary>
    public static Result<Contract> Create(
        Guid tenantId,
        string title,
        Guid accountId,
        Guid ownerId,
        DateTime startDate,
        DateTime endDate,
        decimal contractValue,
        string? type = null)
    {
        if (string.IsNullOrWhiteSpace(title))
            return Result<Contract>.Failure(Error.Validation("Contract.Title", "Title is required"));

        if (accountId == Guid.Empty)
            return Result<Contract>.Failure(Error.Validation("Contract.AccountId", "Account is required"));

        if (ownerId == Guid.Empty)
            return Result<Contract>.Failure(Error.Validation("Contract.OwnerId", "Owner is required"));

        if (endDate <= startDate)
            return Result<Contract>.Failure(Error.Validation("Contract.Dates", "End date must be after start date"));

        if (contractValue < 0)
            return Result<Contract>.Failure(Error.Validation("Contract.Value", "Contract value cannot be negative"));

        var contract = new Contract
        {
            Id = Guid.NewGuid(),
            ContractNumber = GenerateContractNumber(),
            Title = title,
            Type = type,
            Status = ContractStatus.Draft,
            AccountId = accountId,
            OwnerId = ownerId,
            StartDate = startDate,
            EndDate = endDate,
            ContractValue = contractValue,
            NoticePeriodDays = 30, // Default 30 days
            IsAutoRenewal = false,
            CurrencyCode = "TRY",
            CreatedAt = DateTime.UtcNow
        };

        contract.SetTenantId(tenantId);

        return Result<Contract>.Success(contract);
    }

    /// <summary>
    /// Updates contract details
    /// </summary>
    public Result UpdateDetails(
        string title,
        string? type,
        decimal contractValue,
        string? description)
    {
        if (Status != ContractStatus.Draft)
            return Result.Failure(Error.Conflict("Contract.Status", "Can only update draft contracts"));

        if (string.IsNullOrWhiteSpace(title))
            return Result.Failure(Error.Validation("Contract.Title", "Title is required"));

        if (contractValue < 0)
            return Result.Failure(Error.Validation("Contract.Value", "Contract value cannot be negative"));

        Title = title;
        Type = type;
        ContractValue = contractValue;
        Description = description;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    /// <summary>
    /// Updates contract dates
    /// </summary>
    public Result UpdateDates(DateTime startDate, DateTime endDate)
    {
        if (Status == ContractStatus.Active && startDate != StartDate)
            return Result.Failure(Error.Conflict("Contract.Status", "Cannot change start date of active contract"));

        if (endDate <= startDate)
            return Result.Failure(Error.Validation("Contract.Dates", "End date must be after start date"));

        StartDate = startDate;
        EndDate = endDate;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    /// <summary>
    /// Sets renewal terms
    /// </summary>
    public Result SetRenewalTerms(
        bool isAutoRenewal,
        int? renewalTermMonths,
        int noticePeriodDays)
    {
        if (isAutoRenewal && (!renewalTermMonths.HasValue || renewalTermMonths.Value <= 0))
            return Result.Failure(Error.Validation("Contract.RenewalTerm", "Renewal term is required for auto-renewal"));

        if (noticePeriodDays < 0)
            return Result.Failure(Error.Validation("Contract.NoticePeriod", "Notice period cannot be negative"));

        IsAutoRenewal = isAutoRenewal;
        RenewalTermMonths = renewalTermMonths;
        NoticePeriodDays = noticePeriodDays;
        
        if (isAutoRenewal)
        {
            RenewalDate = EndDate.AddDays(-noticePeriodDays);
        }

        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    /// <summary>
    /// Signs the contract
    /// </summary>
    public Result Sign(string signedByName, string signedByTitle)
    {
        if (Status != ContractStatus.InApproval)
            return Result.Failure(Error.Conflict("Contract.Status", "Contract must be in approval status to sign"));

        if (string.IsNullOrWhiteSpace(signedByName))
            return Result.Failure(Error.Validation("Contract.SignedBy", "Signer name is required"));

        SignedDate = DateTime.UtcNow;
        SignedByName = signedByName;
        SignedByTitle = signedByTitle;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    /// <summary>
    /// Company signs the contract
    /// </summary>
    public Result CompanySign(Guid signedById)
    {
        if (SignedDate == null)
            return Result.Failure(Error.Conflict("Contract.Signature", "Customer must sign first"));

        CompanySignedDate = DateTime.UtcNow;
        CompanySignedById = signedById;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    /// <summary>
    /// Activates the contract
    /// </summary>
    public Result Activate()
    {
        if (Status != ContractStatus.InApproval && Status != ContractStatus.Draft)
            return Result.Failure(Error.Conflict("Contract.Status", "Contract must be approved to activate"));

        if (CompanySignedDate == null || SignedDate == null)
            return Result.Failure(Error.Conflict("Contract.Signature", "Contract must be signed by both parties"));

        Status = ContractStatus.Active;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    /// <summary>
    /// Renews the contract
    /// </summary>
    public Result Renew(DateTime newEndDate)
    {
        if (Status != ContractStatus.Active && Status != ContractStatus.Expired)
            return Result.Failure(Error.Conflict("Contract.Status", "Can only renew active or expired contracts"));

        if (newEndDate <= EndDate)
            return Result.Failure(Error.Validation("Contract.RenewalDate", "New end date must be after current end date"));

        StartDate = EndDate;
        EndDate = newEndDate;
        Status = ContractStatus.Renewed;
        
        if (IsAutoRenewal)
        {
            RenewalDate = newEndDate.AddDays(-NoticePeriodDays);
        }

        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    /// <summary>
    /// Terminates the contract
    /// </summary>
    public Result Terminate(string reason)
    {
        if (Status != ContractStatus.Active)
            return Result.Failure(Error.Conflict("Contract.Status", "Can only terminate active contracts"));

        if (string.IsNullOrWhiteSpace(reason))
            return Result.Failure(Error.Validation("Contract.Termination", "Termination reason is required"));

        Status = ContractStatus.Terminated;
        CancellationTerms = reason;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    /// <summary>
    /// Expires the contract
    /// </summary>
    public Result Expire()
    {
        if (Status != ContractStatus.Active)
            return Result.Failure(Error.Conflict("Contract.Status", "Can only expire active contracts"));

        if (DateTime.UtcNow.Date < EndDate.Date)
            return Result.Failure(Error.Conflict("Contract.EndDate", "Contract has not reached end date"));

        Status = ContractStatus.Expired;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    /// <summary>
    /// Adds a line item
    /// </summary>
    public Result AddLineItem(string name, string description, decimal quantity, decimal unitPrice)
    {
        if (Status != ContractStatus.Draft)
            return Result.Failure(Error.Conflict("Contract.Status", "Can only add items to draft contracts"));

        var lineItem = ContractLineItem.Create(name, description, quantity, unitPrice);
        _lineItems.Add(lineItem);
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    /// <summary>
    /// Generates contract number
    /// </summary>
    private static string GenerateContractNumber()
    {
        return $"CNT-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString("N")[..6].ToUpper()}";
    }
}

/// <summary>
/// Represents a line item in a contract
/// </summary>
public class ContractLineItem
{
    public Guid Id { get; private set; }
    public string Name { get; private set; } = string.Empty;
    public string Description { get; private set; } = string.Empty;
    public decimal Quantity { get; private set; }
    public decimal UnitPrice { get; private set; }
    public decimal TotalPrice { get; private set; }

    private ContractLineItem() { }

    public static ContractLineItem Create(string name, string description, decimal quantity, decimal unitPrice)
    {
        return new ContractLineItem
        {
            Id = Guid.NewGuid(),
            Name = name,
            Description = description,
            Quantity = quantity,
            UnitPrice = unitPrice,
            TotalPrice = quantity * unitPrice
        };
    }
}