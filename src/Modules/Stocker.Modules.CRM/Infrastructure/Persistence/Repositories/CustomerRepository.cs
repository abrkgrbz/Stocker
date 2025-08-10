using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.Modules.CRM.Domain.Repositories;

namespace Stocker.Modules.CRM.Infrastructure.Persistence.Repositories;

/// <summary>
/// Repository implementation for Customer entity
/// </summary>
public class CustomerRepository : BaseRepository<Customer>, ICustomerRepository
{
    public CustomerRepository(CRMDbContext context) : base(context)
    {
    }

    public async Task<Customer?> GetWithContactsAsync(Guid customerId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(c => c.Contacts)
            .FirstOrDefaultAsync(c => c.Id == customerId, cancellationToken);
    }

    public async Task<IReadOnlyList<Customer>> FindByIndustryAsync(string industry, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(c => c.Industry == industry)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Customer>> GetActiveCustomersAsync(CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(c => c.IsActive)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Customer>> SearchAsync(string searchTerm, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(searchTerm))
        {
            return new List<Customer>();
        }

        var searchLower = searchTerm.ToLower();

        return await _dbSet
            .Where(c => c.CompanyName.ToLower().Contains(searchLower) ||
                       c.Email.ToLower().Contains(searchLower))
            .ToListAsync(cancellationToken);
    }

    public async Task<bool> ExistsWithEmailAsync(string email, Guid? excludeCustomerId = null, CancellationToken cancellationToken = default)
    {
        var query = _dbSet.Where(c => c.Email.ToLower() == email.ToLower());

        if (excludeCustomerId.HasValue)
        {
            query = query.Where(c => c.Id != excludeCustomerId.Value);
        }

        return await query.AnyAsync(cancellationToken);
    }
}