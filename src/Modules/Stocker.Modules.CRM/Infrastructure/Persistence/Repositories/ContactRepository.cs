using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.Modules.CRM.Domain.Repositories;

namespace Stocker.Modules.CRM.Infrastructure.Persistence.Repositories;

/// <summary>
/// Repository implementation for Contact entity
/// </summary>
public class ContactRepository : BaseRepository<Contact>, IContactRepository
{
    public ContactRepository(CRMDbContext context) : base(context)
    {
    }

    public async Task<IReadOnlyList<Contact>> GetByCustomerIdAsync(Guid customerId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(c => c.CustomerId == customerId)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Contact>> GetPrimaryContactsAsync(CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(c => c.IsPrimary)
            .ToListAsync(cancellationToken);
    }

    public async Task<Contact?> FindByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .FirstOrDefaultAsync(c => c.Email.ToLower() == email.ToLower(), cancellationToken);
    }

    public async Task<IReadOnlyList<Contact>> GetActiveContactsAsync(CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(c => c.IsActive)
            .ToListAsync(cancellationToken);
    }

    public async Task<bool> ExistsWithEmailForCustomerAsync(string email, Guid customerId, Guid? excludeContactId = null, CancellationToken cancellationToken = default)
    {
        var query = _dbSet.Where(c => c.CustomerId == customerId && c.Email.ToLower() == email.ToLower());

        if (excludeContactId.HasValue)
        {
            query = query.Where(c => c.Id != excludeContactId.Value);
        }

        return await query.AnyAsync(cancellationToken);
    }
}