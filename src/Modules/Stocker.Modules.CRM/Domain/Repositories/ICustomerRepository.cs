using Stocker.Modules.CRM.Domain.Entities;
using Stocker.SharedKernel.Interfaces;

namespace Stocker.Modules.CRM.Domain.Repositories;

/// <summary>
/// Repository interface for Customer entity
/// </summary>
public interface ICustomerRepository : IRepository<Customer>
{
    /// <summary>
    /// Gets a customer with their contacts
    /// </summary>
    Task<Customer?> GetWithContactsAsync(Guid customerId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Finds customers by industry
    /// </summary>
    Task<IReadOnlyList<Customer>> FindByIndustryAsync(string industry, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets active customers
    /// </summary>
    Task<IReadOnlyList<Customer>> GetActiveCustomersAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Searches customers by name or email
    /// </summary>
    Task<IReadOnlyList<Customer>> SearchAsync(string searchTerm, CancellationToken cancellationToken = default);

    /// <summary>
    /// Checks if a customer with the given email exists
    /// </summary>
    Task<bool> ExistsWithEmailAsync(string email, Guid? excludeCustomerId = null, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a CRM customer by its linked TenantCustomerId
    /// </summary>
    Task<Customer?> GetByTenantCustomerIdAsync(Guid tenantCustomerId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets all CRM customers that are linked to Tenant customers
    /// </summary>
    Task<IReadOnlyList<Customer>> GetLinkedCustomersAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets all CRM customers that are NOT linked to any Tenant customer
    /// </summary>
    Task<IReadOnlyList<Customer>> GetUnlinkedCustomersAsync(CancellationToken cancellationToken = default);
}