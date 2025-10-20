using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Domain.Entities;

/// <summary>
/// Represents a contact person associated with a customer
/// </summary>
public class Contact : TenantEntity
{
    /// <summary>
    /// Gets the customer ID this contact belongs to
    /// </summary>
    public Guid CustomerId { get; private set; }

    /// <summary>
    /// Gets the contact's first name
    /// </summary>
    public string FirstName { get; private set; } = string.Empty;

    /// <summary>
    /// Gets the contact's last name
    /// </summary>
    public string LastName { get; private set; } = string.Empty;

    /// <summary>
    /// Gets the contact's full name
    /// </summary>
    public string FullName => $"{FirstName} {LastName}".Trim();

    /// <summary>
    /// Gets the contact's email address
    /// </summary>
    public string Email { get; private set; } = string.Empty;

    /// <summary>
    /// Gets the contact's phone number
    /// </summary>
    public string? Phone { get; private set; }

    /// <summary>
    /// Gets the contact's mobile phone number
    /// </summary>
    public string? MobilePhone { get; private set; }

    /// <summary>
    /// Gets the contact's job title
    /// </summary>
    public string? JobTitle { get; private set; }

    /// <summary>
    /// Gets the contact's department
    /// </summary>
    public string? Department { get; private set; }

    /// <summary>
    /// Gets whether this is the primary contact
    /// </summary>
    public bool IsPrimary { get; private set; }

    /// <summary>
    /// Gets whether the contact is active
    /// </summary>
    public bool IsActive { get; private set; }

    /// <summary>
    /// Gets any notes about the contact
    /// </summary>
    public string? Notes { get; private set; }

    /// <summary>
    /// Gets the date when the contact was created
    /// </summary>
    public DateTime CreatedAt { get; private set; }

    /// <summary>
    /// Gets the date when the contact was last updated
    /// </summary>
    public DateTime? UpdatedAt { get; private set; }

    /// <summary>
    /// Navigation property for the customer
    /// </summary>
    public Customer? Customer { get; private set; }

    /// <summary>
    /// Private constructor for EF Core
    /// </summary>
    private Contact() : base()
    {
    }

    /// <summary>
    /// Creates a new contact
    /// </summary>
    public static Result<Contact> Create(
        Guid tenantId,
        Guid customerId,
        string firstName,
        string lastName,
        string email,
        string? phone = null,
        string? mobilePhone = null,
        string? jobTitle = null,
        string? department = null,
        bool isPrimary = false)
    {
        if (string.IsNullOrWhiteSpace(firstName))
            return Result<Contact>.Failure(Error.Validation("Contact.FirstName", "First name is required"));

        if (string.IsNullOrWhiteSpace(lastName))
            return Result<Contact>.Failure(Error.Validation("Contact.LastName", "Last name is required"));

        if (string.IsNullOrWhiteSpace(email))
            return Result<Contact>.Failure(Error.Validation("Contact.Email", "Email is required"));

        if (!IsValidEmail(email))
            return Result<Contact>.Failure(Error.Validation("Contact.Email", "Invalid email format"));

        if (customerId == Guid.Empty)
            return Result<Contact>.Failure(Error.Validation("Contact.CustomerId", "Customer ID is required"));

        var contact = new Contact();
        contact.Id = Guid.NewGuid();
        contact.SetTenantId(tenantId);
        contact.CustomerId = customerId;
        contact.FirstName = firstName;
        contact.LastName = lastName;
        contact.Email = email.ToLowerInvariant();
        contact.Phone = phone;
        contact.MobilePhone = mobilePhone;
        contact.JobTitle = jobTitle;
        contact.Department = department;
        contact.IsPrimary = isPrimary;
        contact.IsActive = true;
        contact.CreatedAt = DateTime.UtcNow;

        return Result<Contact>.Success(contact);
    }

    /// <summary>
    /// Updates the contact's personal information
    /// </summary>
    public Result UpdatePersonalInfo(
        string firstName,
        string lastName,
        string email)
    {
        if (string.IsNullOrWhiteSpace(firstName))
            return Result.Failure(Error.Validation("Contact.FirstName", "First name is required"));

        if (string.IsNullOrWhiteSpace(lastName))
            return Result.Failure(Error.Validation("Contact.LastName", "Last name is required"));

        if (string.IsNullOrWhiteSpace(email))
            return Result.Failure(Error.Validation("Contact.Email", "Email is required"));

        if (!IsValidEmail(email))
            return Result.Failure(Error.Validation("Contact.Email", "Invalid email format"));

        FirstName = firstName;
        LastName = lastName;
        Email = email.ToLowerInvariant();
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    /// <summary>
    /// Updates the contact's phone numbers
    /// </summary>
    public Result UpdatePhoneNumbers(string? phone, string? mobilePhone)
    {
        Phone = phone;
        MobilePhone = mobilePhone;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    /// <summary>
    /// Updates the contact's job information
    /// </summary>
    public Result UpdateJobInfo(string? jobTitle, string? department)
    {
        JobTitle = jobTitle;
        Department = department;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    /// <summary>
    /// Sets the contact as primary
    /// </summary>
    public Result SetAsPrimary()
    {
        if (IsPrimary)
            return Result.Failure(Error.Conflict("Contact.Primary", "Contact is already primary"));

        IsPrimary = true;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    /// <summary>
    /// Removes the primary status from the contact
    /// </summary>
    public Result RemovePrimaryStatus()
    {
        if (!IsPrimary)
            return Result.Failure(Error.Conflict("Contact.Primary", "Contact is not primary"));

        IsPrimary = false;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    /// <summary>
    /// Updates the notes for the contact
    /// </summary>
    public Result UpdateNotes(string? notes)
    {
        Notes = notes;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    /// <summary>
    /// Activates the contact
    /// </summary>
    public Result Activate()
    {
        if (IsActive)
            return Result.Failure(Error.Conflict("Contact.Status", "Contact is already active"));

        IsActive = true;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    /// <summary>
    /// Deactivates the contact
    /// </summary>
    public Result Deactivate()
    {
        if (!IsActive)
            return Result.Failure(Error.Conflict("Contact.Status", "Contact is already inactive"));

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