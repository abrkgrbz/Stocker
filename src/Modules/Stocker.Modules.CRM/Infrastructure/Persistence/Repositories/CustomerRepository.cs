using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.Modules.CRM.Domain.Enums;
using Stocker.Modules.CRM.Domain.Repositories;
using Stocker.Modules.CRM.Domain.Specifications;
using Stocker.Persistence.Repositories;

namespace Stocker.Modules.CRM.Infrastructure.Persistence.Repositories;

/// <summary>
/// Repository implementation for Customer aggregate
/// </summary>
public class CustomerRepository : GenericRepository<Customer, CRMDbContext>, ICustomerRepository
{
    public CustomerRepository(CRMDbContext context) : base(context)
    {
    }

    public async Task<Customer?> GetByCustomerCodeAsync(string customerCode, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(c => c.Contacts)
            .FirstOrDefaultAsync(c => c.CustomerCode == customerCode && !c.IsDeleted, cancellationToken);
    }

    public async Task<IReadOnlyList<Customer>> GetByTypeAsync(CustomerType type, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(c => c.Type == type && !c.IsDeleted)
            .OrderBy(c => c.CompanyName)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Customer>> GetBySegmentAsync(string segmentName, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(c => c.Segment != null && c.Segment.Name == segmentName && !c.IsDeleted)
            .OrderBy(c => c.CompanyName)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Customer>> GetByAccountManagerAsync(Guid accountManagerId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(c => c.AccountManagerId == accountManagerId && !c.IsDeleted)
            .OrderBy(c => c.CompanyName)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Customer>> GetActiveCustomersAsync(CancellationToken cancellationToken = default)
    {
        var specification = new ActiveCustomersSpecification();
        return await FindAsync(specification, cancellationToken);
    }

    public async Task<IReadOnlyList<Customer>> GetCustomersRequiringFollowUpAsync(DateTime asOfDate, CancellationToken cancellationToken = default)
    {
        var thirtyDaysAgo = asOfDate.AddDays(-30);
        
        return await DbSet
            .Where(c => c.Status == CustomerStatus.Active && !c.IsDeleted)
            .Where(c => !c.Activities.Any(a => a.CreatedAt >= thirtyDaysAgo && a.Status == ActivityStatus.Completed))
            .Include(c => c.Activities.Where(a => a.CreatedAt >= thirtyDaysAgo))
            .OrderBy(c => c.LastContactDate ?? c.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Customer>> GetHighValueCustomersAsync(decimal minLifetimeValue, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(c => c.LifetimeValue >= minLifetimeValue && !c.IsDeleted)
            .OrderByDescending(c => c.LifetimeValue)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Customer>> SearchAsync(string searchTerm, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(searchTerm))
            return new List<Customer>();

        var lowerSearchTerm = searchTerm.ToLower();

        return await DbSet
            .Where(c => !c.IsDeleted && (
                c.CustomerCode.ToLower().Contains(lowerSearchTerm) ||
                c.CompanyName.ToLower().Contains(lowerSearchTerm) ||
                (c.TradeName != null && c.TradeName.ToLower().Contains(lowerSearchTerm)) ||
                (c.TaxId != null && c.TaxId.Contains(searchTerm)) ||
                (c.Email != null && c.Email.Value.ToLower().Contains(lowerSearchTerm))
            ))
            .OrderBy(c => c.CompanyName)
            .Take(50)
            .ToListAsync(cancellationToken);
    }

    public async Task<Customer?> GetWithContactsAsync(Guid customerId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(c => c.Contacts.Where(ct => !ct.IsDeleted))
            .FirstOrDefaultAsync(c => c.Id == customerId && !c.IsDeleted, cancellationToken);
    }

    public async Task<Customer?> GetWithOpportunitiesAsync(Guid customerId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(c => c.Opportunities.Where(o => !o.IsDeleted))
                .ThenInclude(o => o.Products)
            .FirstOrDefaultAsync(c => c.Id == customerId && !c.IsDeleted, cancellationToken);
    }

    public async Task<Customer?> GetWithFullDetailsAsync(Guid customerId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(c => c.Contacts.Where(ct => !ct.IsDeleted))
            .Include(c => c.Opportunities.Where(o => !o.IsDeleted))
                .ThenInclude(o => o.Products)
            .Include(c => c.Activities.Where(a => !a.IsDeleted).OrderByDescending(a => a.CreatedAt).Take(20))
            .Include(c => c.Notes.Where(n => !n.IsDeleted).OrderByDescending(n => n.CreatedAt).Take(10))
            .FirstOrDefaultAsync(c => c.Id == customerId && !c.IsDeleted, cancellationToken);
    }

    public async Task<bool> CustomerCodeExistsAsync(string customerCode, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .AnyAsync(c => c.CustomerCode == customerCode && !c.IsDeleted, cancellationToken);
    }

    public async Task<CustomerStatistics> GetStatisticsAsync(Guid customerId, CancellationToken cancellationToken = default)
    {
        var customer = await DbSet
            .Include(c => c.Contacts)
            .Include(c => c.Opportunities)
            .Include(c => c.Activities)
            .FirstOrDefaultAsync(c => c.Id == customerId && !c.IsDeleted, cancellationToken);

        if (customer == null)
        {
            return new CustomerStatistics();
        }

        var totalOpportunities = customer.Opportunities.Count(o => !o.IsDeleted);
        var wonOpportunities = customer.Opportunities.Count(o => !o.IsDeleted && o.Stage == OpportunityStage.ClosedWon);

        return new CustomerStatistics
        {
            TotalContacts = customer.Contacts.Count(c => !c.IsDeleted),
            TotalOpportunities = totalOpportunities,
            WonOpportunities = wonOpportunities,
            TotalRevenue = customer.Opportunities
                .Where(o => !o.IsDeleted && o.Stage == OpportunityStage.ClosedWon && o.Amount != null)
                .Sum(o => o.Amount!.Value),
            TotalActivities = customer.Activities.Count(a => !a.IsDeleted),
            LastActivityDate = customer.Activities
                .Where(a => !a.IsDeleted && a.Status == ActivityStatus.Completed)
                .OrderByDescending(a => a.CompletedDate ?? a.CreatedAt)
                .Select(a => a.CompletedDate ?? a.CreatedAt)
                .FirstOrDefault(),
            WinRate = totalOpportunities > 0 ? (decimal)wonOpportunities / totalOpportunities * 100 : 0
        };
    }

    public async Task<IReadOnlyList<Customer>> GetTopCustomersByRevenueAsync(int count, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(c => !c.IsDeleted && c.IsActive)
            .OrderByDescending(c => c.LifetimeValue)
            .Take(count)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Customer>> GetInactiveCustomersAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(c => !c.IsDeleted && !c.IsActive)
            .OrderBy(c => c.CompanyName)
            .ToListAsync(cancellationToken);
    }

    public async Task<Customer?> GetWithRelatedDataAsync(Guid customerId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(c => c.Contacts.Where(ct => !ct.IsDeleted))
            .Include(c => c.Opportunities.Where(o => !o.IsDeleted))
                .ThenInclude(o => o.Products)
            .Include(c => c.Activities.Where(a => !a.IsDeleted).OrderByDescending(a => a.CreatedAt).Take(10))
            .Include(c => c.Notes.Where(n => !n.IsDeleted).OrderByDescending(n => n.CreatedAt).Take(10))
            .FirstOrDefaultAsync(c => c.Id == customerId && !c.IsDeleted, cancellationToken);
    }

    public async Task<IReadOnlyList<Customer>> GetCustomersBySegmentAsync(string segmentName, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(c => c.Segment != null && c.Segment.Name == segmentName && !c.IsDeleted)
            .OrderBy(c => c.CompanyName)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Customer>> GetBirthdaysAsync(DateTime fromDate, DateTime toDate, CancellationToken cancellationToken = default)
    {
        // Since customers don't have birthdays, return empty list
        // This method is typically for contacts, but included for interface compliance
        return new List<Customer>();
    }
}