using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Results;
using Stocker.Modules.CRM.Domain.Enums;

namespace Stocker.Modules.CRM.Domain.Entities;

/// <summary>
/// Represents an account (company/organization) in the CRM system
/// </summary>
public class Account : TenantAggregateRoot
{
    private readonly List<Contact> _contacts = new();
    private readonly List<Opportunity> _opportunities = new();
    private readonly List<Deal> _deals = new();
    private readonly List<Activity> _activities = new();
    private readonly List<Note> _notes = new();
    private readonly List<Contract> _contracts = new();

    /// <summary>
    /// Gets the account name
    /// </summary>
    public string Name { get; private set; } = string.Empty;

    /// <summary>
    /// Gets the account number (unique identifier)
    /// </summary>
    public string AccountNumber { get; private set; } = string.Empty;

    /// <summary>
    /// Gets the account type
    /// </summary>
    public AccountType Type { get; private set; }

    /// <summary>
    /// Gets the account status
    /// </summary>
    public AccountStatus Status { get; private set; }

    /// <summary>
    /// Gets the industry
    /// </summary>
    public string? Industry { get; private set; }

    /// <summary>
    /// Gets the annual revenue
    /// </summary>
    public decimal? AnnualRevenue { get; private set; }

    /// <summary>
    /// Gets the number of employees
    /// </summary>
    public int? NumberOfEmployees { get; private set; }

    /// <summary>
    /// Gets the website
    /// </summary>
    public string? Website { get; private set; }

    /// <summary>
    /// Gets the phone number
    /// </summary>
    public string? Phone { get; private set; }

    /// <summary>
    /// Gets the fax number
    /// </summary>
    public string? Fax { get; private set; }

    /// <summary>
    /// Gets the email address
    /// </summary>
    public string? Email { get; private set; }

    /// <summary>
    /// Gets the billing address
    /// </summary>
    public Address? BillingAddress { get; private set; }

    /// <summary>
    /// Gets the shipping address
    /// </summary>
    public Address? ShippingAddress { get; private set; }

    /// <summary>
    /// Gets the parent account ID
    /// </summary>
    public Guid? ParentAccountId { get; private set; }

    /// <summary>
    /// Gets the parent account
    /// </summary>
    public Account? ParentAccount { get; private set; }

    /// <summary>
    /// Gets the owner user ID
    /// </summary>
    public Guid OwnerId { get; private set; }

    /// <summary>
    /// Gets the rating
    /// </summary>
    public AccountRating Rating { get; private set; }

    /// <summary>
    /// Gets the SIC code
    /// </summary>
    public string? SicCode { get; private set; }

    /// <summary>
    /// Gets the ticker symbol
    /// </summary>
    public string? TickerSymbol { get; private set; }

    /// <summary>
    /// Gets the ownership type
    /// </summary>
    public string? Ownership { get; private set; }

    /// <summary>
    /// Gets the description
    /// </summary>
    public string? Description { get; private set; }

    /// <summary>
    /// Gets the created date
    /// </summary>
    public DateTime CreatedAt { get; private set; }

    /// <summary>
    /// Gets the last modified date
    /// </summary>
    public DateTime? UpdatedAt { get; private set; }

    /// <summary>
    /// Gets the last activity date
    /// </summary>
    public DateTime? LastActivityDate { get; private set; }

    /// <summary>
    /// Gets the contacts
    /// </summary>
    public IReadOnlyList<Contact> Contacts => _contacts.AsReadOnly();

    /// <summary>
    /// Gets the opportunities
    /// </summary>
    public IReadOnlyList<Opportunity> Opportunities => _opportunities.AsReadOnly();

    /// <summary>
    /// Gets the deals
    /// </summary>
    public IReadOnlyList<Deal> Deals => _deals.AsReadOnly();

    /// <summary>
    /// Gets the activities
    /// </summary>
    public IReadOnlyList<Activity> Activities => _activities.AsReadOnly();

    /// <summary>
    /// Gets the notes
    /// </summary>
    public IReadOnlyList<Note> Notes => _notes.AsReadOnly();

    /// <summary>
    /// Gets the contracts
    /// </summary>
    public IReadOnlyList<Contract> Contracts => _contracts.AsReadOnly();

    /// <summary>
    /// Private constructor for EF Core
    /// </summary>
    private Account() : base()
    {
    }

    /// <summary>
    /// Creates a new account
    /// </summary>
    public static Result<Account> Create(
        Guid tenantId,
        string name,
        AccountType type,
        Guid ownerId,
        string? industry = null,
        string? website = null,
        string? phone = null,
        string? email = null)
    {
        if (string.IsNullOrWhiteSpace(name))
            return Result<Account>.Failure(Error.Validation("Account.Name", "Account name is required"));

        if (ownerId == Guid.Empty)
            return Result<Account>.Failure(Error.Validation("Account.OwnerId", "Owner is required"));

        if (!string.IsNullOrWhiteSpace(email) && !IsValidEmail(email))
            return Result<Account>.Failure(Error.Validation("Account.Email", "Invalid email format"));

        var account = new Account
        {
            Id = Guid.NewGuid(),
            Name = name,
            AccountNumber = GenerateAccountNumber(),
            Type = type,
            Status = AccountStatus.Active,
            OwnerId = ownerId,
            Industry = industry,
            Website = website,
            Phone = phone,
            Email = email?.ToLowerInvariant(),
            Rating = AccountRating.Warm,
            CreatedAt = DateTime.UtcNow
        };

        account.SetTenantId(tenantId);

        return Result<Account>.Success(account);
    }

    /// <summary>
    /// Updates basic information
    /// </summary>
    public Result UpdateBasicInfo(
        string name,
        AccountType type,
        string? industry,
        string? website,
        string? phone,
        string? email)
    {
        if (string.IsNullOrWhiteSpace(name))
            return Result.Failure(Error.Validation("Account.Name", "Account name is required"));

        if (!string.IsNullOrWhiteSpace(email) && !IsValidEmail(email))
            return Result.Failure(Error.Validation("Account.Email", "Invalid email format"));

        Name = name;
        Type = type;
        Industry = industry;
        Website = website;
        Phone = phone;
        Email = email?.ToLowerInvariant();
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    /// <summary>
    /// Updates business information
    /// </summary>
    public Result UpdateBusinessInfo(
        decimal? annualRevenue,
        int? numberOfEmployees,
        string? sicCode,
        string? tickerSymbol,
        string? ownership)
    {
        if (annualRevenue.HasValue && annualRevenue.Value < 0)
            return Result.Failure(Error.Validation("Account.AnnualRevenue", "Annual revenue cannot be negative"));

        if (numberOfEmployees.HasValue && numberOfEmployees.Value < 0)
            return Result.Failure(Error.Validation("Account.NumberOfEmployees", "Number of employees cannot be negative"));

        AnnualRevenue = annualRevenue;
        NumberOfEmployees = numberOfEmployees;
        SicCode = sicCode;
        TickerSymbol = tickerSymbol;
        Ownership = ownership;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    /// <summary>
    /// Updates billing address
    /// </summary>
    public Result UpdateBillingAddress(Address address)
    {
        BillingAddress = address;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    /// <summary>
    /// Updates shipping address
    /// </summary>
    public Result UpdateShippingAddress(Address address)
    {
        ShippingAddress = address;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    /// <summary>
    /// Sets parent account
    /// </summary>
    public Result SetParentAccount(Guid? parentAccountId)
    {
        if (parentAccountId == Id)
            return Result.Failure(Error.Validation("Account.ParentAccount", "Account cannot be its own parent"));

        ParentAccountId = parentAccountId;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    /// <summary>
    /// Updates rating
    /// </summary>
    public Result UpdateRating(AccountRating rating)
    {
        Rating = rating;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    /// <summary>
    /// Updates status
    /// </summary>
    public Result UpdateStatus(AccountStatus status)
    {
        Status = status;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    /// <summary>
    /// Changes owner
    /// </summary>
    public Result ChangeOwner(Guid newOwnerId)
    {
        if (newOwnerId == Guid.Empty)
            return Result.Failure(Error.Validation("Account.OwnerId", "Owner is required"));

        OwnerId = newOwnerId;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    /// <summary>
    /// Adds a contact
    /// </summary>
    public Result AddContact(Contact contact)
    {
        if (contact == null)
            return Result.Failure(Error.Validation("Account.Contact", "Contact cannot be null"));

        if (_contacts.Any(c => c.Id == contact.Id))
            return Result.Failure(Error.Conflict("Account.Contact", "Contact already exists"));

        _contacts.Add(contact);
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    /// <summary>
    /// Removes a contact
    /// </summary>
    public Result RemoveContact(Guid contactId)
    {
        var contact = _contacts.FirstOrDefault(c => c.Id == contactId);
        if (contact == null)
            return Result.Failure(Error.NotFound("Account.Contact", "Contact not found"));

        _contacts.Remove(contact);
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    /// <summary>
    /// Updates last activity date
    /// </summary>
    public void UpdateLastActivityDate()
    {
        LastActivityDate = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }

    /// <summary>
    /// Generates account number
    /// </summary>
    private static string GenerateAccountNumber()
    {
        return $"ACC-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString("N")[..8].ToUpper()}";
    }

    /// <summary>
    /// Validates email format
    /// </summary>
    private static bool IsValidEmail(string email)
    {
        try
        {
            var addr = new System.Net.Mail.MailAddress(email);
            return addr.Address == email;
        }
        catch
        {
            return false;
        }
    }
}

/// <summary>
/// Value object for address
/// </summary>
public class Address
{
    public string? Street { get; private set; }
    public string? City { get; private set; }
    public string? State { get; private set; }
    public string? PostalCode { get; private set; }
    public string? Country { get; private set; }

    private Address() { }

    public static Address Create(
        string? street,
        string? city,
        string? state,
        string? postalCode,
        string? country)
    {
        return new Address
        {
            Street = street,
            City = city,
            State = state,
            PostalCode = postalCode,
            Country = country
        };
    }

    public override string ToString()
    {
        var parts = new List<string>();
        if (!string.IsNullOrWhiteSpace(Street)) parts.Add(Street);
        if (!string.IsNullOrWhiteSpace(City)) parts.Add(City);
        if (!string.IsNullOrWhiteSpace(State)) parts.Add(State);
        if (!string.IsNullOrWhiteSpace(PostalCode)) parts.Add(PostalCode);
        if (!string.IsNullOrWhiteSpace(Country)) parts.Add(Country);
        return string.Join(", ", parts);
    }
}