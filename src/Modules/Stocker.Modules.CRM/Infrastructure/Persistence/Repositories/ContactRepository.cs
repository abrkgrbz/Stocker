using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.Modules.CRM.Domain.Enums;
using Stocker.Modules.CRM.Domain.Repositories;
using Stocker.Persistence.Repositories;

namespace Stocker.Modules.CRM.Infrastructure.Persistence.Repositories;

/// <summary>
/// Repository implementation for Contact aggregate
/// </summary>
public class ContactRepository : GenericRepository<Contact, CRMDbContext>, IContactRepository
{
    public ContactRepository(CRMDbContext context) : base(context)
    {
    }

    public async Task<IReadOnlyList<Contact>> GetByCustomerAsync(Guid customerId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(c => c.CustomerId == customerId && !c.IsDeleted)
            .OrderBy(c => c.FirstName)
            .ThenBy(c => c.LastName)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Contact>> GetByRoleAsync(ContactRole role, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(c => c.Role == role && !c.IsDeleted)
            .Include(c => c.Customer)
            .OrderBy(c => c.FirstName)
            .ThenBy(c => c.LastName)
            .ToListAsync(cancellationToken);
    }

    public async Task<Contact?> GetByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(c => c.Customer)
            .FirstOrDefaultAsync(c => c.EmailAddress != null && c.EmailAddress.Value == email && !c.IsDeleted, cancellationToken);
    }

    public async Task<IReadOnlyList<Contact>> GetActiveContactsAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(c => c.IsActive && !c.IsDeleted)
            .Include(c => c.Customer)
            .OrderBy(c => c.FirstName)
            .ThenBy(c => c.LastName)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Contact>> GetPrimaryContactsAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(c => c.IsPrimary && !c.IsDeleted)
            .Include(c => c.Customer)
            .OrderBy(c => c.Customer!.CompanyName)
            .ThenBy(c => c.FirstName)
            .ThenBy(c => c.LastName)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Contact>> GetBirthdaysInMonthAsync(int month, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(c => c.DateOfBirth.HasValue && c.DateOfBirth.Value.Month == month && !c.IsDeleted)
            .Include(c => c.Customer)
            .OrderBy(c => c.DateOfBirth!.Value.Day)
            .ToListAsync(cancellationToken);
    }

    public async Task<Contact?> GetWithActivitiesAsync(Guid contactId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(c => c.Customer)
            .Include(c => c.Activities.Where(a => !a.IsDeleted).OrderByDescending(a => a.CreatedAt))
            .FirstOrDefaultAsync(c => c.Id == contactId && !c.IsDeleted, cancellationToken);
    }

    public async Task<IReadOnlyList<Contact>> SearchAsync(string searchTerm, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(searchTerm))
            return new List<Contact>();

        var lowerSearchTerm = searchTerm.ToLower();

        return await DbSet
            .Include(c => c.Customer)
            .Where(c => !c.IsDeleted && (
                c.FirstName.ToLower().Contains(lowerSearchTerm) ||
                c.LastName.ToLower().Contains(lowerSearchTerm) ||
                (c.EmailAddress != null && c.EmailAddress.Value.ToLower().Contains(lowerSearchTerm)) ||
                (c.DirectPhone != null && c.DirectPhone.Number.Contains(searchTerm)) ||
                (c.MobilePhone != null && c.MobilePhone.Number.Contains(searchTerm)) ||
                (c.Customer != null && c.Customer.CompanyName.ToLower().Contains(lowerSearchTerm))
            ))
            .OrderBy(c => c.FirstName)
            .ThenBy(c => c.LastName)
            .Take(50)
            .ToListAsync(cancellationToken);
    }

    public async Task<bool> EmailExistsAsync(string email, Guid? excludeContactId = null, CancellationToken cancellationToken = default)
    {
        var query = DbSet.Where(c => c.EmailAddress != null && c.EmailAddress.Value == email && !c.IsDeleted);
        
        if (excludeContactId.HasValue)
        {
            query = query.Where(c => c.Id != excludeContactId.Value);
        }

        return await query.AnyAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Contact>> GetDuplicatesAsync(string firstName, string lastName, string? email = null, CancellationToken cancellationToken = default)
    {
        var query = DbSet.Where(c => !c.IsDeleted);

        // Check by name
        query = query.Where(c => 
            c.FirstName.ToLower() == firstName.ToLower() && 
            c.LastName.ToLower() == lastName.ToLower());

        // Or by email if provided
        if (!string.IsNullOrWhiteSpace(email))
        {
            query = DbSet.Where(c => !c.IsDeleted && 
                (c.EmailAddress != null && c.EmailAddress.Value == email) ||
                (c.FirstName.ToLower() == firstName.ToLower() && c.LastName.ToLower() == lastName.ToLower()));
        }

        return await query
            .Include(c => c.Customer)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Contact>> GetByCustomerIdAsync(Guid customerId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(c => c.CustomerId == customerId && !c.IsDeleted)
            .OrderBy(c => c.FirstName)
            .ThenBy(c => c.LastName)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Contact>> GetDecisionMakersAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(c => !c.IsDeleted && (c.Role == ContactRole.DecisionMaker || c.Role == ContactRole.ExecutiveSponsor))
            .Include(c => c.Customer)
            .OrderBy(c => c.Customer!.CompanyName)
            .ThenBy(c => c.FirstName)
            .ThenBy(c => c.LastName)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Contact>> GetByDepartmentAsync(string department, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(c => c.Department == department && !c.IsDeleted)
            .Include(c => c.Customer)
            .OrderBy(c => c.FirstName)
            .ThenBy(c => c.LastName)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Contact>> GetBirthdaysAsync(DateTime fromDate, DateTime toDate, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(c => c.DateOfBirth.HasValue && !c.IsDeleted &&
                       c.DateOfBirth.Value.DayOfYear >= fromDate.DayOfYear &&
                       c.DateOfBirth.Value.DayOfYear <= toDate.DayOfYear)
            .Include(c => c.Customer)
            .OrderBy(c => c.DateOfBirth!.Value.DayOfYear)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Contact>> GetMarketingContactsAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(c => c.OptInMarketing && c.IsActive && !c.IsDeleted)
            .Include(c => c.Customer)
            .OrderBy(c => c.FirstName)
            .ThenBy(c => c.LastName)
            .ToListAsync(cancellationToken);
    }
}