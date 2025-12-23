using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.Modules.CRM.Domain.Repositories;
using Stocker.SharedKernel.Authorization;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.API.Controllers;

[ApiController]
[Authorize]
[Route("api/crm/contacts")]
[RequireModule("CRM")]
[ApiExplorerSettings(GroupName = "crm")]
public class ContactsController : ControllerBase
{
    private readonly IContactRepository _contactRepository;
    private readonly ICustomerRepository _customerRepository;
    private readonly ITenantService _tenantService;

    public ContactsController(
        IContactRepository contactRepository,
        ICustomerRepository customerRepository,
        ITenantService tenantService)
    {
        _contactRepository = contactRepository;
        _customerRepository = customerRepository;
        _tenantService = tenantService;
    }

    /// <summary>
    /// Get all contacts for a customer
    /// </summary>
    [HttpGet("customer/{customerId}")]
    [ProducesResponseType(typeof(List<ContactDto>), 200)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<List<ContactDto>>> GetContactsByCustomer(Guid customerId)
    {
        var customer = await _customerRepository.GetByIdAsync(customerId);
        if (customer == null)
            return NotFound(new Error("Customer.NotFound", "Customer not found", ErrorType.NotFound));

        var contacts = await _contactRepository.GetByCustomerIdAsync(customerId);

        var dtos = contacts.Select(c => new ContactDto
        {
            Id = c.Id,
            CustomerId = c.CustomerId,
            FirstName = c.FirstName,
            LastName = c.LastName,
            FullName = c.FullName,
            Email = c.Email,
            Phone = c.Phone,
            MobilePhone = c.MobilePhone,
            JobTitle = c.JobTitle,
            Department = c.Department,
            IsPrimary = c.IsPrimary,
            IsActive = c.IsActive,
            Notes = c.Notes,
            CreatedAt = c.CreatedAt,
            UpdatedAt = c.UpdatedAt
        }).ToList();

        return Ok(dtos);
    }

    /// <summary>
    /// Get contact by ID
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ContactDto), 200)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<ContactDto>> GetContact(Guid id)
    {
        var contact = await _contactRepository.GetByIdAsync(id);
        if (contact == null)
            return NotFound(new Error("Contact.NotFound", "Contact not found", ErrorType.NotFound));

        var dto = new ContactDto
        {
            Id = contact.Id,
            CustomerId = contact.CustomerId,
            FirstName = contact.FirstName,
            LastName = contact.LastName,
            FullName = contact.FullName,
            Email = contact.Email,
            Phone = contact.Phone,
            MobilePhone = contact.MobilePhone,
            JobTitle = contact.JobTitle,
            Department = contact.Department,
            IsPrimary = contact.IsPrimary,
            IsActive = contact.IsActive,
            Notes = contact.Notes,
            CreatedAt = contact.CreatedAt,
            UpdatedAt = contact.UpdatedAt
        };

        return Ok(dto);
    }

    /// <summary>
    /// Create a new contact
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(ContactDto), 201)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<ContactDto>> CreateContact([FromBody] CreateContactDto dto)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue)
            return BadRequest(new Error("Tenant.Required", "Tenant ID is required", ErrorType.Validation));

        // Verify customer exists
        var customer = await _customerRepository.GetByIdAsync(dto.CustomerId);
        if (customer == null)
            return NotFound(new Error("Customer.NotFound", "Customer not found", ErrorType.NotFound));

        // Check for duplicate email within customer
        var emailExists = await _contactRepository.ExistsWithEmailForCustomerAsync(dto.Email, dto.CustomerId);
        if (emailExists)
            return BadRequest(new Error("Contact.DuplicateEmail", "A contact with this email already exists for this customer", ErrorType.Conflict));

        // If this contact is primary, remove primary from others
        if (dto.IsPrimary)
        {
            var existingContacts = await _contactRepository.GetByCustomerIdAsync(dto.CustomerId);
            foreach (var existingContact in existingContacts.Where(c => c.IsPrimary))
            {
                existingContact.RemovePrimaryStatus();
                await _contactRepository.UpdateAsync(existingContact);
            }
        }

        var contactResult = Contact.Create(
            tenantId.Value,
            dto.CustomerId,
            dto.FirstName,
            dto.LastName,
            dto.Email,
            dto.Phone,
            dto.MobilePhone,
            dto.JobTitle,
            dto.Department,
            dto.IsPrimary
        );

        if (contactResult.IsFailure)
            return BadRequest(contactResult.Error);

        var contact = contactResult.Value;

        if (!string.IsNullOrEmpty(dto.Notes))
            contact.UpdateNotes(dto.Notes);

        await _contactRepository.AddAsync(contact);

        var resultDto = new ContactDto
        {
            Id = contact.Id,
            CustomerId = contact.CustomerId,
            FirstName = contact.FirstName,
            LastName = contact.LastName,
            FullName = contact.FullName,
            Email = contact.Email,
            Phone = contact.Phone,
            MobilePhone = contact.MobilePhone,
            JobTitle = contact.JobTitle,
            Department = contact.Department,
            IsPrimary = contact.IsPrimary,
            IsActive = contact.IsActive,
            Notes = contact.Notes,
            CreatedAt = contact.CreatedAt,
            UpdatedAt = contact.UpdatedAt
        };

        return CreatedAtAction(nameof(GetContact), new { id = contact.Id }, resultDto);
    }

    /// <summary>
    /// Update a contact
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(ContactDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<ContactDto>> UpdateContact(Guid id, [FromBody] UpdateContactDto dto)
    {
        var contact = await _contactRepository.GetByIdAsync(id);
        if (contact == null)
            return NotFound(new Error("Contact.NotFound", "Contact not found", ErrorType.NotFound));

        // Check for duplicate email within customer (excluding current contact)
        var emailExists = await _contactRepository.ExistsWithEmailForCustomerAsync(dto.Email, contact.CustomerId, id);
        if (emailExists)
            return BadRequest(new Error("Contact.DuplicateEmail", "A contact with this email already exists for this customer", ErrorType.Conflict));

        // Update personal info
        var updateResult = contact.UpdatePersonalInfo(dto.FirstName, dto.LastName, dto.Email);
        if (updateResult.IsFailure)
            return BadRequest(updateResult.Error);

        // Update phone numbers
        contact.UpdatePhoneNumbers(dto.Phone, dto.MobilePhone);

        // Update job info
        contact.UpdateJobInfo(dto.JobTitle, dto.Department);

        // Update notes
        contact.UpdateNotes(dto.Notes);

        // Handle primary status change
        if (dto.IsPrimary && !contact.IsPrimary)
        {
            // Remove primary from other contacts
            var existingContacts = await _contactRepository.GetByCustomerIdAsync(contact.CustomerId);
            foreach (var existingContact in existingContacts.Where(c => c.IsPrimary && c.Id != id))
            {
                existingContact.RemovePrimaryStatus();
                await _contactRepository.UpdateAsync(existingContact);
            }
            contact.SetAsPrimary();
        }
        else if (!dto.IsPrimary && contact.IsPrimary)
        {
            contact.RemovePrimaryStatus();
        }

        await _contactRepository.UpdateAsync(contact);

        var resultDto = new ContactDto
        {
            Id = contact.Id,
            CustomerId = contact.CustomerId,
            FirstName = contact.FirstName,
            LastName = contact.LastName,
            FullName = contact.FullName,
            Email = contact.Email,
            Phone = contact.Phone,
            MobilePhone = contact.MobilePhone,
            JobTitle = contact.JobTitle,
            Department = contact.Department,
            IsPrimary = contact.IsPrimary,
            IsActive = contact.IsActive,
            Notes = contact.Notes,
            CreatedAt = contact.CreatedAt,
            UpdatedAt = contact.UpdatedAt
        };

        return Ok(resultDto);
    }

    /// <summary>
    /// Delete a contact
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(204)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> DeleteContact(Guid id)
    {
        var contact = await _contactRepository.GetByIdAsync(id);
        if (contact == null)
            return NotFound(new Error("Contact.NotFound", "Contact not found", ErrorType.NotFound));

        await _contactRepository.DeleteAsync(contact);

        return NoContent();
    }

    /// <summary>
    /// Set a contact as primary
    /// </summary>
    [HttpPost("{id}/set-primary")]
    [ProducesResponseType(typeof(ContactDto), 200)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<ContactDto>> SetAsPrimary(Guid id)
    {
        var contact = await _contactRepository.GetByIdAsync(id);
        if (contact == null)
            return NotFound(new Error("Contact.NotFound", "Contact not found", ErrorType.NotFound));

        // Remove primary from other contacts
        var existingContacts = await _contactRepository.GetByCustomerIdAsync(contact.CustomerId);
        foreach (var existingContact in existingContacts.Where(c => c.IsPrimary && c.Id != id))
        {
            existingContact.RemovePrimaryStatus();
            await _contactRepository.UpdateAsync(existingContact);
        }

        contact.SetAsPrimary();
        await _contactRepository.UpdateAsync(contact);

        var resultDto = new ContactDto
        {
            Id = contact.Id,
            CustomerId = contact.CustomerId,
            FirstName = contact.FirstName,
            LastName = contact.LastName,
            FullName = contact.FullName,
            Email = contact.Email,
            Phone = contact.Phone,
            MobilePhone = contact.MobilePhone,
            JobTitle = contact.JobTitle,
            Department = contact.Department,
            IsPrimary = contact.IsPrimary,
            IsActive = contact.IsActive,
            Notes = contact.Notes,
            CreatedAt = contact.CreatedAt,
            UpdatedAt = contact.UpdatedAt
        };

        return Ok(resultDto);
    }

    /// <summary>
    /// Activate a contact
    /// </summary>
    [HttpPost("{id}/activate")]
    [ProducesResponseType(typeof(ContactDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<ContactDto>> ActivateContact(Guid id)
    {
        var contact = await _contactRepository.GetByIdAsync(id);
        if (contact == null)
            return NotFound(new Error("Contact.NotFound", "Contact not found", ErrorType.NotFound));

        var result = contact.Activate();
        if (result.IsFailure)
            return BadRequest(result.Error);

        await _contactRepository.UpdateAsync(contact);

        var resultDto = new ContactDto
        {
            Id = contact.Id,
            CustomerId = contact.CustomerId,
            FirstName = contact.FirstName,
            LastName = contact.LastName,
            FullName = contact.FullName,
            Email = contact.Email,
            Phone = contact.Phone,
            MobilePhone = contact.MobilePhone,
            JobTitle = contact.JobTitle,
            Department = contact.Department,
            IsPrimary = contact.IsPrimary,
            IsActive = contact.IsActive,
            Notes = contact.Notes,
            CreatedAt = contact.CreatedAt,
            UpdatedAt = contact.UpdatedAt
        };

        return Ok(resultDto);
    }

    /// <summary>
    /// Deactivate a contact
    /// </summary>
    [HttpPost("{id}/deactivate")]
    [ProducesResponseType(typeof(ContactDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<ContactDto>> DeactivateContact(Guid id)
    {
        var contact = await _contactRepository.GetByIdAsync(id);
        if (contact == null)
            return NotFound(new Error("Contact.NotFound", "Contact not found", ErrorType.NotFound));

        var result = contact.Deactivate();
        if (result.IsFailure)
            return BadRequest(result.Error);

        await _contactRepository.UpdateAsync(contact);

        var resultDto = new ContactDto
        {
            Id = contact.Id,
            CustomerId = contact.CustomerId,
            FirstName = contact.FirstName,
            LastName = contact.LastName,
            FullName = contact.FullName,
            Email = contact.Email,
            Phone = contact.Phone,
            MobilePhone = contact.MobilePhone,
            JobTitle = contact.JobTitle,
            Department = contact.Department,
            IsPrimary = contact.IsPrimary,
            IsActive = contact.IsActive,
            Notes = contact.Notes,
            CreatedAt = contact.CreatedAt,
            UpdatedAt = contact.UpdatedAt
        };

        return Ok(resultDto);
    }
}
