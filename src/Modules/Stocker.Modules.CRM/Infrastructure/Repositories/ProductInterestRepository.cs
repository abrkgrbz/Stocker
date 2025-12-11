using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.Modules.CRM.Infrastructure.Persistence;

namespace Stocker.Modules.CRM.Infrastructure.Repositories;

public class ProductInterestRepository : IProductInterestRepository
{
    private readonly CRMDbContext _context;

    public ProductInterestRepository(CRMDbContext context)
    {
        _context = context;
    }

    public async System.Threading.Tasks.Task<List<ProductInterest>> GetAllAsync(
        Guid? customerId = null,
        Guid? contactId = null,
        Guid? leadId = null,
        int? productId = null,
        InterestStatus? status = null,
        InterestLevel? interestLevel = null,
        int skip = 0,
        int take = 100,
        CancellationToken cancellationToken = default)
    {
        var query = _context.ProductInterests.AsQueryable();

        if (customerId.HasValue)
            query = query.Where(p => p.CustomerId == customerId.Value);

        if (contactId.HasValue)
            query = query.Where(p => p.ContactId == contactId.Value);

        if (leadId.HasValue)
            query = query.Where(p => p.LeadId == leadId.Value);

        if (productId.HasValue)
            query = query.Where(p => p.ProductId == productId.Value);

        if (status.HasValue)
            query = query.Where(p => p.Status == status.Value);

        if (interestLevel.HasValue)
            query = query.Where(p => p.InterestLevel == interestLevel.Value);

        return await query
            .OrderByDescending(p => p.InterestScore)
            .ThenByDescending(p => p.InterestDate)
            .Skip(skip)
            .Take(take)
            .ToListAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<ProductInterest?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.ProductInterests
            .Include(p => p.Customer)
            .Include(p => p.Contact)
            .Include(p => p.Lead)
            .Include(p => p.Opportunity)
            .Include(p => p.Campaign)
            .FirstOrDefaultAsync(p => p.Id == id, cancellationToken);
    }

    public async System.Threading.Tasks.Task<List<ProductInterest>> GetByCustomerIdAsync(Guid customerId, CancellationToken cancellationToken = default)
    {
        return await _context.ProductInterests
            .Where(p => p.CustomerId == customerId)
            .OrderByDescending(p => p.InterestDate)
            .ToListAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<List<ProductInterest>> GetByLeadIdAsync(Guid leadId, CancellationToken cancellationToken = default)
    {
        return await _context.ProductInterests
            .Where(p => p.LeadId == leadId)
            .OrderByDescending(p => p.InterestDate)
            .ToListAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<List<ProductInterest>> GetByProductIdAsync(int productId, CancellationToken cancellationToken = default)
    {
        return await _context.ProductInterests
            .Where(p => p.ProductId == productId)
            .OrderByDescending(p => p.InterestScore)
            .ToListAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<List<ProductInterest>> GetHighInterestAsync(CancellationToken cancellationToken = default)
    {
        return await _context.ProductInterests
            .Where(p => p.InterestLevel >= InterestLevel.High &&
                       (p.Status == InterestStatus.New || p.Status == InterestStatus.FollowUp || p.Status == InterestStatus.Qualified))
            .OrderByDescending(p => p.InterestScore)
            .ToListAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<List<ProductInterest>> GetFollowUpDueAsync(CancellationToken cancellationToken = default)
    {
        return await _context.ProductInterests
            .Where(p => p.FollowUpDate.HasValue &&
                       p.FollowUpDate.Value <= DateTime.UtcNow &&
                       p.Status == InterestStatus.FollowUp)
            .OrderBy(p => p.FollowUpDate)
            .ToListAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<int> GetTotalCountAsync(
        Guid? customerId = null,
        int? productId = null,
        InterestStatus? status = null,
        CancellationToken cancellationToken = default)
    {
        var query = _context.ProductInterests.AsQueryable();

        if (customerId.HasValue)
            query = query.Where(p => p.CustomerId == customerId.Value);

        if (productId.HasValue)
            query = query.Where(p => p.ProductId == productId.Value);

        if (status.HasValue)
            query = query.Where(p => p.Status == status.Value);

        return await query.CountAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<ProductInterest> CreateAsync(ProductInterest productInterest, CancellationToken cancellationToken = default)
    {
        _context.ProductInterests.Add(productInterest);
        await _context.SaveChangesAsync(cancellationToken);
        return productInterest;
    }

    public async System.Threading.Tasks.Task UpdateAsync(ProductInterest productInterest, CancellationToken cancellationToken = default)
    {
        _context.ProductInterests.Update(productInterest);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var productInterest = await GetByIdAsync(id, cancellationToken);
        if (productInterest != null)
        {
            _context.ProductInterests.Remove(productInterest);
            await _context.SaveChangesAsync(cancellationToken);
        }
    }
}
