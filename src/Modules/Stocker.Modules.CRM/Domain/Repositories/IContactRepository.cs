using Stocker.Modules.CRM.Domain.Entities;
using Stocker.SharedKernel.Interfaces;

namespace Stocker.Modules.CRM.Domain.Repositories;

/// <summary>
/// Repository interface for Contact entity
/// </summary>
public interface IContactRepository : IRepository<Contact>
{
    /// <summary>
    /// Gets contacts for a specific customer
    /// </summary>
    Task<IReadOnlyList<Contact>> GetByCustomerIdAsync(Guid customerId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets primary contacts for all customers
    /// </summary>
    Task<IReadOnlyList<Contact>> GetPrimaryContactsAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Finds a contact by email
    /// </summary>
    Task<Contact?> FindByEmailAsync(string email, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets active contacts
    /// </summary>
    Task<IReadOnlyList<Contact>> GetActiveContactsAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Checks if a contact with the given email exists for a customer
    /// </summary>
    Task<bool> ExistsWithEmailForCustomerAsync(string email, Guid customerId, Guid? excludeContactId = null, CancellationToken cancellationToken = default);
}