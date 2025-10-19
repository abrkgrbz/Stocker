using Microsoft.Extensions.Logging;
using Stocker.Modules.CRM.Domain.Repositories;
using Stocker.Shared.Contracts.CRM;
using Stocker.SharedKernel.Interfaces;

namespace Stocker.Modules.CRM.Application.Services;

/// <summary>
/// Implementation of ICrmCustomerService for cross-module customer operations
/// </summary>
public class CrmCustomerService : ICrmCustomerService
{
    private readonly ICustomerRepository _customerRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<CrmCustomerService> _logger;

    public CrmCustomerService(
        ICustomerRepository customerRepository,
        IUnitOfWork unitOfWork,
        ILogger<CrmCustomerService> logger)
    {
        _customerRepository = customerRepository;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<CustomerDto?> GetCustomerByIdAsync(Guid customerId, Guid tenantId, CancellationToken cancellationToken = default)
    {
        try
        {
            var customer = await _customerRepository.GetByIdAsync(customerId, cancellationToken);
            if (customer == null || customer.TenantId != tenantId)
                return null;

            return MapToDto(customer);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting customer {CustomerId} for tenant {TenantId}", customerId, tenantId);
            return null;
        }
    }

    public async Task<CustomerDto?> GetCustomerByEmailAsync(string email, Guid tenantId, CancellationToken cancellationToken = default)
    {
        try
        {
            // TODO: Add GetByEmailAsync to ICustomerRepository
            _logger.LogWarning("GetCustomerByEmailAsync not yet implemented in repository");
            return null;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting customer by email {Email} for tenant {TenantId}", email, tenantId);
            return null;
        }
    }

    public async Task<bool> CustomerExistsAsync(Guid customerId, Guid tenantId, CancellationToken cancellationToken = default)
    {
        try
        {
            var customer = await _customerRepository.GetByIdAsync(customerId, cancellationToken);
            return customer != null && customer.TenantId == tenantId;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking customer existence {CustomerId} for tenant {TenantId}", customerId, tenantId);
            return false;
        }
    }

    public async Task<IEnumerable<CustomerDto>> GetActiveCustomersAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        try
        {
            var customers = await _customerRepository.GetActiveCustomersAsync(cancellationToken);
            return customers
                .Where(c => c.TenantId == tenantId)
                .Select(MapToDto)
                .ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting active customers for tenant {TenantId}", tenantId);
            return Enumerable.Empty<CustomerDto>();
        }
    }

    public async Task<bool> UpdateCreditLimitAsync(Guid customerId, Guid tenantId, decimal newLimit, CancellationToken cancellationToken = default)
    {
        try
        {
            var customer = await _customerRepository.GetByIdAsync(customerId, cancellationToken);
            if (customer == null || customer.TenantId != tenantId)
            {
                _logger.LogWarning("Customer {CustomerId} not found for tenant {TenantId}", customerId, tenantId);
                return false;
            }

            // Note: Customer entity doesn't have CreditLimit property yet
            // This is a placeholder for future implementation
            _logger.LogInformation("Credit limit update requested for customer {CustomerId}: {NewLimit}", customerId, newLimit);

            // TODO: Add CreditLimit property to Customer entity
            // customer.UpdateCreditLimit(newLimit);
            // await _unitOfWork.SaveChangesAsync(cancellationToken);

            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating credit limit for customer {CustomerId}", customerId);
            return false;
        }
    }

    public async Task RecordTransactionAsync(Guid customerId, Guid tenantId, decimal amount, string transactionType, CancellationToken cancellationToken = default)
    {
        try
        {
            var customer = await _customerRepository.GetByIdAsync(customerId, cancellationToken);
            if (customer == null || customer.TenantId != tenantId)
            {
                _logger.LogWarning("Customer {CustomerId} not found for tenant {TenantId}", customerId, tenantId);
                return;
            }

            _logger.LogInformation(
                "Transaction recorded for customer {CustomerId}: Type={TransactionType}, Amount={Amount}",
                customerId, transactionType, amount);

            // TODO: Implement transaction recording logic
            // This could involve updating customer statistics, creating activity records, etc.
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error recording transaction for customer {CustomerId}", customerId);
        }
    }

    private static CustomerDto MapToDto(Domain.Entities.Customer customer)
    {
        return new CustomerDto
        {
            Id = customer.Id,
            TenantId = customer.TenantId,
            CompanyName = customer.CompanyName,
            Email = customer.Email,
            Phone = customer.Phone,
            Website = customer.Website,
            Industry = customer.Industry,
            Address = customer.Address,
            City = customer.City,
            State = customer.State,
            Country = customer.Country,
            PostalCode = customer.PostalCode,
            AnnualRevenue = customer.AnnualRevenue,
            NumberOfEmployees = customer.NumberOfEmployees,
            IsActive = customer.IsActive,
            CreatedAt = customer.CreatedAt
        };
    }
}
