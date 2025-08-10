using Stocker.Modules.CRM.Domain.Enums;
using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Domain.Entities;

/// <summary>
/// Represents a sales lead in the CRM system
/// </summary>
public class Lead : TenantAggregateRoot
{
    /// <summary>
    /// Gets the lead's company name
    /// </summary>
    public string? CompanyName { get; private set; }

    /// <summary>
    /// Gets the lead's first name
    /// </summary>
    public string FirstName { get; private set; } = string.Empty;

    /// <summary>
    /// Gets the lead's last name
    /// </summary>
    public string LastName { get; private set; } = string.Empty;

    /// <summary>
    /// Gets the lead's full name
    /// </summary>
    public string FullName => $"{FirstName} {LastName}".Trim();

    /// <summary>
    /// Gets the lead's email address
    /// </summary>
    public string Email { get; private set; } = string.Empty;

    /// <summary>
    /// Gets the lead's phone number
    /// </summary>
    public string? Phone { get; private set; }

    /// <summary>
    /// Gets the lead's mobile phone number
    /// </summary>
    public string? MobilePhone { get; private set; }

    /// <summary>
    /// Gets the lead's job title
    /// </summary>
    public string? JobTitle { get; private set; }

    /// <summary>
    /// Gets the lead's industry
    /// </summary>
    public string? Industry { get; private set; }

    /// <summary>
    /// Gets the lead source
    /// </summary>
    public string? Source { get; private set; }

    /// <summary>
    /// Gets the lead status
    /// </summary>
    public LeadStatus Status { get; private set; }

    /// <summary>
    /// Gets the lead rating
    /// </summary>
    public LeadRating Rating { get; private set; }

    /// <summary>
    /// Gets the lead's address
    /// </summary>
    public string? Address { get; private set; }

    /// <summary>
    /// Gets the lead's city
    /// </summary>
    public string? City { get; private set; }

    /// <summary>
    /// Gets the lead's state/province
    /// </summary>
    public string? State { get; private set; }

    /// <summary>
    /// Gets the lead's country
    /// </summary>
    public string? Country { get; private set; }

    /// <summary>
    /// Gets the lead's postal code
    /// </summary>
    public string? PostalCode { get; private set; }

    /// <summary>
    /// Gets the lead's website
    /// </summary>
    public string? Website { get; private set; }

    /// <summary>
    /// Gets the lead's annual revenue
    /// </summary>
    public decimal? AnnualRevenue { get; private set; }

    /// <summary>
    /// Gets the number of employees
    /// </summary>
    public int? NumberOfEmployees { get; private set; }

    /// <summary>
    /// Gets the lead's description or notes
    /// </summary>
    public string? Description { get; private set; }

    /// <summary>
    /// Gets the ID of the user assigned to this lead
    /// </summary>
    public Guid? AssignedToUserId { get; private set; }

    /// <summary>
    /// Gets the date when the lead was converted
    /// </summary>
    public DateTime? ConvertedDate { get; private set; }

    /// <summary>
    /// Gets the customer ID if the lead was converted
    /// </summary>
    public Guid? ConvertedToCustomerId { get; private set; }

    /// <summary>
    /// Gets whether the lead has been converted
    /// </summary>
    public bool IsConverted => ConvertedToCustomerId.HasValue;

    /// <summary>
    /// Gets the lead score
    /// </summary>
    public int Score { get; private set; }

    /// <summary>
    /// Gets the date when the lead was created
    /// </summary>
    public DateTime CreatedAt { get; private set; }

    /// <summary>
    /// Gets the date when the lead was last updated
    /// </summary>
    public DateTime? UpdatedAt { get; private set; }

    /// <summary>
    /// Private constructor for EF Core
    /// </summary>
    private Lead() : base()
    {
    }

    /// <summary>
    /// Creates a new lead
    /// </summary>
    public static Result<Lead> Create(
        Guid tenantId,
        string firstName,
        string lastName,
        string email,
        string? companyName = null,
        string? phone = null,
        string? source = null,
        LeadStatus status = LeadStatus.New,
        LeadRating rating = LeadRating.Unrated)
    {
        if (string.IsNullOrWhiteSpace(firstName))
            return Result<Lead>.Failure(Error.Validation("Lead.FirstName", "First name is required"));

        if (string.IsNullOrWhiteSpace(lastName))
            return Result<Lead>.Failure(Error.Validation("Lead.LastName", "Last name is required"));

        if (string.IsNullOrWhiteSpace(email))
            return Result<Lead>.Failure(Error.Validation("Lead.Email", "Email is required"));

        if (!IsValidEmail(email))
            return Result<Lead>.Failure(Error.Validation("Lead.Email", "Invalid email format"));

        var lead = new Lead();
        lead.Id = Guid.NewGuid();
        lead.SetTenantId(tenantId);
        lead.FirstName = firstName;
        lead.LastName = lastName;
        lead.Email = email.ToLowerInvariant();
        lead.CompanyName = companyName;
        lead.Phone = phone;
        lead.Source = source;
        lead.Status = status;
        lead.Rating = rating;
        lead.Score = 0;
        lead.CreatedAt = DateTime.UtcNow;

        return Result<Lead>.Success(lead);
    }

    /// <summary>
    /// Updates the lead's basic information
    /// </summary>
    public Result UpdateBasicInfo(
        string firstName,
        string lastName,
        string email,
        string? companyName = null,
        string? phone = null,
        string? mobilePhone = null)
    {
        if (IsConverted)
            return Result.Failure(Error.Conflict("Lead.Converted", "Cannot update a converted lead"));

        if (string.IsNullOrWhiteSpace(firstName))
            return Result.Failure(Error.Validation("Lead.FirstName", "First name is required"));

        if (string.IsNullOrWhiteSpace(lastName))
            return Result.Failure(Error.Validation("Lead.LastName", "Last name is required"));

        if (string.IsNullOrWhiteSpace(email))
            return Result.Failure(Error.Validation("Lead.Email", "Email is required"));

        if (!IsValidEmail(email))
            return Result.Failure(Error.Validation("Lead.Email", "Invalid email format"));

        FirstName = firstName;
        LastName = lastName;
        Email = email.ToLowerInvariant();
        CompanyName = companyName;
        Phone = phone;
        MobilePhone = mobilePhone;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    /// <summary>
    /// Updates the lead's business information
    /// </summary>
    public Result UpdateBusinessInfo(
        string? jobTitle,
        string? industry,
        string? website,
        decimal? annualRevenue,
        int? numberOfEmployees)
    {
        if (IsConverted)
            return Result.Failure(Error.Conflict("Lead.Converted", "Cannot update a converted lead"));

        if (annualRevenue.HasValue && annualRevenue.Value < 0)
            return Result.Failure(Error.Validation("Lead.AnnualRevenue", "Annual revenue cannot be negative"));

        if (numberOfEmployees.HasValue && numberOfEmployees.Value < 0)
            return Result.Failure(Error.Validation("Lead.NumberOfEmployees", "Number of employees cannot be negative"));

        JobTitle = jobTitle;
        Industry = industry;
        Website = website;
        AnnualRevenue = annualRevenue;
        NumberOfEmployees = numberOfEmployees;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    /// <summary>
    /// Updates the lead's address
    /// </summary>
    public Result UpdateAddress(
        string? address,
        string? city,
        string? state,
        string? country,
        string? postalCode)
    {
        if (IsConverted)
            return Result.Failure(Error.Conflict("Lead.Converted", "Cannot update a converted lead"));

        Address = address;
        City = city;
        State = state;
        Country = country;
        PostalCode = postalCode;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    /// <summary>
    /// Updates the lead's status
    /// </summary>
    public Result UpdateStatus(LeadStatus status)
    {
        if (IsConverted)
            return Result.Failure(Error.Conflict("Lead.Converted", "Cannot update status of a converted lead"));

        Status = status;
        UpdatedAt = DateTime.UtcNow;

        // Update score based on status progression
        if (status == LeadStatus.Contacted)
            UpdateScore(10);
        else if (status == LeadStatus.Qualified)
            UpdateScore(20);

        return Result.Success();
    }

    /// <summary>
    /// Updates the lead's rating
    /// </summary>
    public Result UpdateRating(LeadRating rating)
    {
        if (IsConverted)
            return Result.Failure(Error.Conflict("Lead.Converted", "Cannot update rating of a converted lead"));

        Rating = rating;
        UpdatedAt = DateTime.UtcNow;

        // Update score based on rating
        var ratingScore = rating switch
        {
            LeadRating.Hot => 30,
            LeadRating.Warm => 20,
            LeadRating.Cold => 10,
            _ => 0
        };
        UpdateScore(ratingScore);

        return Result.Success();
    }

    /// <summary>
    /// Assigns the lead to a user
    /// </summary>
    public Result AssignTo(Guid userId)
    {
        if (IsConverted)
            return Result.Failure(Error.Conflict("Lead.Converted", "Cannot assign a converted lead"));

        if (userId == Guid.Empty)
            return Result.Failure(Error.Validation("Lead.AssignedTo", "Invalid user ID"));

        AssignedToUserId = userId;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    /// <summary>
    /// Converts the lead to a customer
    /// </summary>
    public Result<Customer> ConvertToCustomer()
    {
        if (IsConverted)
            return Result<Customer>.Failure(Error.Conflict("Lead.Converted", "Lead has already been converted"));

        if (Status != LeadStatus.Qualified)
            return Result<Customer>.Failure(Error.Conflict("Lead.Status", "Only qualified leads can be converted"));

        var customerResult = Customer.Create(
            TenantId,
            CompanyName ?? $"{FirstName} {LastName}",
            Email,
            Phone,
            Website,
            Industry);

        if (customerResult.IsFailure)
            return customerResult;

        var customer = customerResult.Value;

        // Update customer with additional information
        customer.UpdateAddress(Address, City, State, Country, PostalCode);
        customer.UpdateBusinessInfo(AnnualRevenue, NumberOfEmployees, Description);

        // Create primary contact from lead
        var contactResult = Contact.Create(
            TenantId,
            customer.Id,
            FirstName,
            LastName,
            Email,
            Phone,
            MobilePhone,
            JobTitle,
            null,
            true);

        if (contactResult.IsSuccess)
        {
            customer.AddContact(contactResult.Value);
        }

        // Mark lead as converted
        ConvertedDate = DateTime.UtcNow;
        ConvertedToCustomerId = customer.Id;
        Status = LeadStatus.Converted;
        UpdatedAt = DateTime.UtcNow;

        return Result<Customer>.Success(customer);
    }

    /// <summary>
    /// Updates the lead score
    /// </summary>
    public Result UpdateScore(int points)
    {
        if (IsConverted)
            return Result.Failure(Error.Conflict("Lead.Converted", "Cannot update score of a converted lead"));

        Score = Math.Max(0, Math.Min(100, Score + points));
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    /// <summary>
    /// Updates the description/notes
    /// </summary>
    public Result UpdateDescription(string? description)
    {
        if (IsConverted)
            return Result.Failure(Error.Conflict("Lead.Converted", "Cannot update a converted lead"));

        Description = description;
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