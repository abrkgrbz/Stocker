using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Stocker.Application.Common.Interfaces;
using Stocker.Application.Common.Exceptions;
using Stocker.Domain.Common.ValueObjects;
using Stocker.Domain.Tenant.Entities;
using Stocker.SharedKernel.Pagination;

namespace Stocker.API.Controllers;

[ApiController]
[Authorize]
[Route("api/tenants/{tenantId}/customers")]
public class CustomersController : ControllerBase
{
    private readonly ITenantDbContextFactory _contextFactory;
    private readonly ILogger<CustomersController> _logger;
    private readonly ICacheService _cacheService;

    public CustomersController(
        ITenantDbContextFactory contextFactory,
        ILogger<CustomersController> logger,
        ICacheService cacheService)
    {
        _contextFactory = contextFactory;
        _logger = logger;
        _cacheService = cacheService;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<CustomerDto>>> GetAll(
        Guid tenantId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? search = null)
    {
        if (page < 1) page = 1;
        if (pageSize < 1) pageSize = 20;
        if (pageSize > 100) pageSize = 100; // Maximum page size limit

        using var context = await _contextFactory.CreateDbContextAsync(tenantId);
        
        var query = context.Customers
            .Where(c => c.TenantId == tenantId);

        // Apply search filter if provided
        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(c => 
                c.Name.Contains(search) ||
                c.Email.Value.Contains(search) ||
                c.Phone.Value.Contains(search) ||
                c.TaxNumber.Contains(search));
        }

        // Get total count for pagination
        var totalCount = await query.CountAsync();

        // Get paginated data
        var customers = await query
            .OrderBy(c => c.Name)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(c => new CustomerDto
            {
                Id = c.Id,
                Name = c.Name,
                Email = c.Email.Value,
                Phone = c.Phone.Value,
                Street = c.Address.Street,
                City = c.Address.City,
                State = c.Address.State,
                PostalCode = c.Address.PostalCode,
                Country = c.Address.Country,
                TaxNumber = c.TaxNumber,
                TaxOffice = c.TaxOffice,
                CreditLimit = c.CreditLimit,
                CurrentBalance = c.CurrentBalance,
                IsActive = c.IsActive
            })
            .ToListAsync();

        var result = PagedResult<CustomerDto>.Create(customers, totalCount, page, pageSize);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<CustomerDto>> GetById(Guid tenantId, Guid id)
    {
        // Try to get from cache first
        var cacheKey = $"customer:{tenantId}:{id}";
        var cachedCustomer = await _cacheService.GetAsync<CustomerDto>(cacheKey);
        
        if (cachedCustomer != null)
        {
            _logger.LogDebug("Customer {CustomerId} retrieved from cache", id);
            return Ok(cachedCustomer);
        }

        // If not in cache, get from database
        using var context = await _contextFactory.CreateDbContextAsync(tenantId);
        var customer = await context.Customers
            .Where(c => c.TenantId == tenantId && c.Id == id)
            .Select(c => new CustomerDto
            {
                Id = c.Id,
                Name = c.Name,
                Email = c.Email.Value,
                Phone = c.Phone.Value,
                Street = c.Address.Street,
                City = c.Address.City,
                State = c.Address.State,
                PostalCode = c.Address.PostalCode,
                Country = c.Address.Country,
                TaxNumber = c.TaxNumber,
                TaxOffice = c.TaxOffice,
                CreditLimit = c.CreditLimit,
                CurrentBalance = c.CurrentBalance,
                IsActive = c.IsActive
            })
            .FirstOrDefaultAsync();

        if (customer == null)
            throw new NotFoundException("Customer", id);

        // Cache the result for future requests
        await _cacheService.SetAsync(cacheKey, customer, TimeSpan.FromMinutes(10));
        _logger.LogDebug("Customer {CustomerId} cached", id);

        return Ok(customer);
    }

    [HttpPost]
    public async Task<ActionResult<CustomerDto>> Create(Guid tenantId, CreateCustomerDto dto)
    {
        var emailResult = Email.Create(dto.Email);
        if (emailResult.IsFailure)
            throw new ValidationException("Email", emailResult.Error.Description);

        var phoneResult = PhoneNumber.Create(dto.Phone);
        if (phoneResult.IsFailure)
            throw new ValidationException("Phone", phoneResult.Error.Description);

        Address address;
        try
        {
            address = Address.Create(dto.Street, dto.City, dto.Country, dto.PostalCode, state: dto.State);
        }
        catch (ArgumentException ex)
        {
            throw new ValidationException("Address", ex.Message);
        }

        var customer = Customer.Create(
            tenantId,
            dto.Name,
            emailResult.Value,
            phoneResult.Value,
            address
        );

        if (!string.IsNullOrWhiteSpace(dto.TaxNumber))
            customer.SetTaxInfo(dto.TaxNumber, dto.TaxOffice);

        using var context = await _contextFactory.CreateDbContextAsync(tenantId);
        
        // Check for duplicate email
        var existingCustomer = await context.Customers
            .FirstOrDefaultAsync(c => c.TenantId == tenantId && c.Email == emailResult.Value);
        if (existingCustomer != null)
            throw new ConflictException("Customer", "email", dto.Email);

        context.Customers.Add(customer);
        await context.SaveChangesAsync();

        var result = new CustomerDto
        {
            Id = customer.Id,
            Name = customer.Name,
            Email = customer.Email.Value,
            Phone = customer.Phone.Value,
            Street = customer.Address.Street,
            City = customer.Address.City,
            State = customer.Address.State,
            PostalCode = customer.Address.PostalCode,
            Country = customer.Address.Country,
            TaxNumber = customer.TaxNumber,
            TaxOffice = customer.TaxOffice,
            CreditLimit = customer.CreditLimit,
            CurrentBalance = customer.CurrentBalance,
            IsActive = customer.IsActive
        };

        return CreatedAtAction(nameof(GetById), new { tenantId, id = customer.Id }, result);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<CustomerDto>> Update(Guid tenantId, Guid id, UpdateCustomerDto dto)
    {
        using var context = await _contextFactory.CreateDbContextAsync(tenantId);
        var customer = await context.Customers
            .FirstOrDefaultAsync(c => c.TenantId == tenantId && c.Id == id);

        if (customer == null)
            throw new NotFoundException("Customer", id);

        if (!string.IsNullOrWhiteSpace(dto.Name))
            customer.UpdateName(dto.Name);

        if (!string.IsNullOrWhiteSpace(dto.Email))
        {
            var emailResult = Email.Create(dto.Email);
            if (emailResult.IsFailure)
                throw new ValidationException("Email", emailResult.Error.Description);
                
            // Check for duplicate email (excluding current customer)
            var existingCustomer = await context.Customers
                .FirstOrDefaultAsync(c => c.TenantId == tenantId && c.Email == emailResult.Value && c.Id != id);
            if (existingCustomer != null)
                throw new ConflictException("Customer", "email", dto.Email);
                
            customer.UpdateEmail(emailResult.Value);
        }

        if (!string.IsNullOrWhiteSpace(dto.Phone))
        {
            var phoneResult = PhoneNumber.Create(dto.Phone);
            if (phoneResult.IsFailure)
                throw new ValidationException("Phone", phoneResult.Error.Description);
            customer.UpdatePhone(phoneResult.Value);
        }

        await context.SaveChangesAsync();

        // Invalidate cache for this customer after update
        var cacheKey = $"customer:{tenantId}:{id}";
        await _cacheService.RemoveAsync(cacheKey);
        _logger.LogDebug("Cache invalidated for updated customer {CustomerId}", id);

        var result = new CustomerDto
        {
            Id = customer.Id,
            Name = customer.Name,
            Email = customer.Email.Value,
            Phone = customer.Phone.Value,
            Street = customer.Address.Street,
            City = customer.Address.City,
            State = customer.Address.State,
            PostalCode = customer.Address.PostalCode,
            Country = customer.Address.Country,
            TaxNumber = customer.TaxNumber,
            TaxOffice = customer.TaxOffice,
            CreditLimit = customer.CreditLimit,
            CurrentBalance = customer.CurrentBalance,
            IsActive = customer.IsActive
        };

        return Ok(result);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid tenantId, Guid id)
    {
        using var context = await _contextFactory.CreateDbContextAsync(tenantId);
        var customer = await context.Customers
            .FirstOrDefaultAsync(c => c.TenantId == tenantId && c.Id == id);

        if (customer == null)
            throw new NotFoundException("Customer", id);

        // Check if customer has any related data that would prevent deletion
        // For now, we'll allow deletion, but in production you'd check for invoices, orders, etc.
        
        context.Customers.Remove(customer);
        await context.SaveChangesAsync();

        return NoContent();
    }
}

public class CustomerDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Street { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string State { get; set; } = string.Empty;
    public string PostalCode { get; set; } = string.Empty;
    public string Country { get; set; } = string.Empty;
    public string? TaxNumber { get; set; }
    public string? TaxOffice { get; set; }
    public decimal CreditLimit { get; set; }
    public decimal CurrentBalance { get; set; }
    public bool IsActive { get; set; }
}

public class CreateCustomerDto
{
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Street { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string State { get; set; } = string.Empty;
    public string PostalCode { get; set; } = string.Empty;
    public string Country { get; set; } = string.Empty;
    public string? TaxNumber { get; set; }
    public string? TaxOffice { get; set; }
}

public class UpdateCustomerDto
{
    public string? Name { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
}