using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Domain.Entities;

/// <summary>
/// Represents a customer in the CRM system
/// </summary>
public class Customer : TenantAggregateRoot
{
    private readonly List<Contact> _contacts = new();
    private readonly List<CustomerSegmentMember> _segmentMemberships = new();
    private readonly List<CustomerTag> _tags = new();

    /// <summary>
    /// Gets the customer's company name
    /// </summary>
    public string CompanyName { get; private set; } = string.Empty;

    /// <summary>
    /// Gets the customer's email address
    /// </summary>
    public string Email { get; private set; } = string.Empty;

    /// <summary>
    /// Gets the customer's phone number
    /// </summary>
    public string? Phone { get; private set; }

    /// <summary>
    /// Gets the customer's website
    /// </summary>
    public string? Website { get; private set; }

    /// <summary>
    /// Gets the customer's industry
    /// </summary>
    public string? Industry { get; private set; }

    /// <summary>
    /// Gets the customer's address
    /// </summary>
    public string? Address { get; private set; }

    /// <summary>
    /// Gets the customer's city
    /// </summary>
    public string? City { get; private set; }

    /// <summary>
    /// Gets the customer's state/province
    /// </summary>
    public string? State { get; private set; }

    /// <summary>
    /// Gets the customer's country
    /// </summary>
    public string? Country { get; private set; }

    /// <summary>
    /// Gets the customer's postal code
    /// </summary>
    public string? PostalCode { get; private set; }

    /// <summary>
    /// Gets the customer's annual revenue
    /// </summary>
    public decimal? AnnualRevenue { get; private set; }

    /// <summary>
    /// Gets the number of employees
    /// </summary>
    public int? NumberOfEmployees { get; private set; }

    /// <summary>
    /// Gets the customer's description or notes
    /// </summary>
    public string? Description { get; private set; }

    /// <summary>
    /// Gets whether the customer is active
    /// </summary>
    public bool IsActive { get; private set; }

    /// <summary>
    /// Gets the date when the customer was created
    /// </summary>
    public DateTime CreatedAt { get; private set; }

    /// <summary>
    /// Gets the date when the customer was last updated
    /// </summary>
    public DateTime? UpdatedAt { get; private set; }

    /// <summary>
    /// Gets the customer's contacts
    /// </summary>
    public IReadOnlyList<Contact> Contacts => _contacts.AsReadOnly();

    /// <summary>
    /// Gets the customer's segment memberships
    /// </summary>
    public IReadOnlyList<CustomerSegmentMember> SegmentMemberships => _segmentMemberships.AsReadOnly();

    /// <summary>
    /// Gets the customer's tags
    /// </summary>
    public IReadOnlyList<CustomerTag> Tags => _tags.AsReadOnly();

    /// <summary>
    /// Private constructor for EF Core
    /// </summary>
    private Customer() : base()
    {
    }

    /// <summary>
    /// Creates a new customer
    /// </summary>
    public static Result<Customer> Create(
        Guid tenantId,
        string companyName,
        string email,
        string? phone = null,
        string? website = null,
        string? industry = null)
    {
        if (string.IsNullOrWhiteSpace(companyName))
            return Result<Customer>.Failure(Error.Validation("Customer.CompanyName", "Company name is required"));

        if (string.IsNullOrWhiteSpace(email))
            return Result<Customer>.Failure(Error.Validation("Customer.Email", "Email is required"));

        if (!IsValidEmail(email))
            return Result<Customer>.Failure(Error.Validation("Customer.Email", "Invalid email format"));

        var customer = new Customer();
        customer.Id = Guid.NewGuid();
        customer.SetTenantId(tenantId);
        customer.CompanyName = companyName;
        customer.Email = email.ToLowerInvariant();
        customer.Phone = phone;
        customer.Website = website;
        customer.Industry = industry;
        customer.IsActive = true;
        customer.CreatedAt = DateTime.UtcNow;

        return Result<Customer>.Success(customer);
    }

    /// <summary>
    /// Updates the customer's basic information
    /// </summary>
    public Result UpdateBasicInfo(
        string companyName,
        string email,
        string? phone = null,
        string? website = null,
        string? industry = null)
    {
        if (string.IsNullOrWhiteSpace(companyName))
            return Result.Failure(Error.Validation("Customer.CompanyName", "Company name is required"));

        if (string.IsNullOrWhiteSpace(email))
            return Result.Failure(Error.Validation("Customer.Email", "Email is required"));

        if (!IsValidEmail(email))
            return Result.Failure(Error.Validation("Customer.Email", "Invalid email format"));

        CompanyName = companyName;
        Email = email.ToLowerInvariant();
        Phone = phone;
        Website = website;
        Industry = industry;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    /// <summary>
    /// Updates the customer's address
    /// </summary>
    public Result UpdateAddress(
        string? address,
        string? city,
        string? state,
        string? country,
        string? postalCode)
    {
        Address = address;
        City = city;
        State = state;
        Country = country;
        PostalCode = postalCode;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    /// <summary>
    /// Updates the customer's business information
    /// </summary>
    public Result UpdateBusinessInfo(
        decimal? annualRevenue,
        int? numberOfEmployees,
        string? description)
    {
        if (annualRevenue.HasValue && annualRevenue.Value < 0)
            return Result.Failure(Error.Validation("Customer.AnnualRevenue", "Annual revenue cannot be negative"));

        if (numberOfEmployees.HasValue && numberOfEmployees.Value < 0)
            return Result.Failure(Error.Validation("Customer.NumberOfEmployees", "Number of employees cannot be negative"));

        AnnualRevenue = annualRevenue;
        NumberOfEmployees = numberOfEmployees;
        Description = description;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    /// <summary>
    /// Adds a contact to the customer
    /// </summary>
    public Result AddContact(Contact contact)
    {
        if (contact == null)
            return Result.Failure(Error.Validation("Customer.Contact", "Contact cannot be null"));

        if (_contacts.Any(c => c.Email.Equals(contact.Email, StringComparison.OrdinalIgnoreCase)))
            return Result.Failure(Error.Conflict("Customer.Contact", "A contact with this email already exists"));

        _contacts.Add(contact);
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    /// <summary>
    /// Removes a contact from the customer
    /// </summary>
    public Result RemoveContact(Guid contactId)
    {
        var contact = _contacts.FirstOrDefault(c => c.Id == contactId);
        if (contact == null)
            return Result.Failure(Error.NotFound("Customer.Contact", "Contact not found"));

        _contacts.Remove(contact);
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    /// <summary>
    /// Activates the customer
    /// </summary>
    public Result Activate()
    {
        if (IsActive)
            return Result.Failure(Error.Conflict("Customer.Status", "Customer is already active"));

        IsActive = true;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    /// <summary>
    /// Deactivates the customer
    /// </summary>
    public Result Deactivate()
    {
        if (!IsActive)
            return Result.Failure(Error.Conflict("Customer.Status", "Customer is already inactive"));

        IsActive = false;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
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