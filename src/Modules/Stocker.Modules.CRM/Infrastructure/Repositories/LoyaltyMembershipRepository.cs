using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.Modules.CRM.Infrastructure.Persistence;

namespace Stocker.Modules.CRM.Infrastructure.Repositories;

public class LoyaltyMembershipRepository : ILoyaltyMembershipRepository
{
    private readonly CRMDbContext _context;

    public LoyaltyMembershipRepository(CRMDbContext context)
    {
        _context = context;
    }

    public async System.Threading.Tasks.Task<List<LoyaltyMembership>> GetAllAsync(
        Guid? loyaltyProgramId = null,
        Guid? customerId = null,
        bool? isActive = null,
        int skip = 0,
        int take = 100,
        CancellationToken cancellationToken = default)
    {
        var query = _context.LoyaltyMemberships
            .Include(m => m.LoyaltyProgram)
            .Include(m => m.Customer)
            .Include(m => m.CurrentTier)
            .AsQueryable();

        if (loyaltyProgramId.HasValue)
            query = query.Where(m => m.LoyaltyProgramId == loyaltyProgramId.Value);
        if (customerId.HasValue)
            query = query.Where(m => m.CustomerId == customerId.Value);
        if (isActive.HasValue)
            query = query.Where(m => m.IsActive == isActive.Value);

        return await query
            .OrderByDescending(m => m.CurrentPoints)
            .Skip(skip)
            .Take(take)
            .ToListAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<LoyaltyMembership?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.LoyaltyMemberships
            .Include(m => m.LoyaltyProgram)
            .Include(m => m.Customer)
            .Include(m => m.CurrentTier)
            .Include(m => m.Transactions)
            .FirstOrDefaultAsync(m => m.Id == id, cancellationToken);
    }

    public async System.Threading.Tasks.Task<LoyaltyMembership?> GetByMembershipNumberAsync(string membershipNumber, CancellationToken cancellationToken = default)
    {
        return await _context.LoyaltyMemberships
            .Include(m => m.LoyaltyProgram)
            .Include(m => m.Customer)
            .Include(m => m.CurrentTier)
            .FirstOrDefaultAsync(m => m.MembershipNumber == membershipNumber, cancellationToken);
    }

    public async System.Threading.Tasks.Task<LoyaltyMembership?> GetByCustomerAndProgramAsync(Guid customerId, Guid programId, CancellationToken cancellationToken = default)
    {
        return await _context.LoyaltyMemberships
            .Include(m => m.LoyaltyProgram)
            .Include(m => m.CurrentTier)
            .FirstOrDefaultAsync(m => m.CustomerId == customerId && m.LoyaltyProgramId == programId, cancellationToken);
    }

    public async System.Threading.Tasks.Task<List<LoyaltyMembership>> GetByCustomerIdAsync(Guid customerId, CancellationToken cancellationToken = default)
    {
        return await _context.LoyaltyMemberships
            .Include(m => m.LoyaltyProgram)
            .Include(m => m.CurrentTier)
            .Where(m => m.CustomerId == customerId)
            .OrderBy(m => m.EnrollmentDate)
            .ToListAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<List<LoyaltyMembership>> GetByProgramIdAsync(Guid programId, CancellationToken cancellationToken = default)
    {
        return await _context.LoyaltyMemberships
            .Include(m => m.Customer)
            .Include(m => m.CurrentTier)
            .Where(m => m.LoyaltyProgramId == programId)
            .OrderByDescending(m => m.CurrentPoints)
            .ToListAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<List<LoyaltyMembership>> GetExpiringPointsAsync(int daysUntilExpiry, CancellationToken cancellationToken = default)
    {
        var expiryDate = DateTime.UtcNow.AddDays(daysUntilExpiry);
        return await _context.LoyaltyMemberships
            .Include(m => m.Customer)
            .Include(m => m.LoyaltyProgram)
            .Where(m => m.IsActive && m.CurrentPoints > 0 && m.PointsExpiryDate.HasValue && m.PointsExpiryDate.Value <= expiryDate)
            .OrderBy(m => m.PointsExpiryDate)
            .ToListAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<int> GetTotalCountAsync(
        Guid? loyaltyProgramId = null,
        Guid? customerId = null,
        bool? isActive = null,
        CancellationToken cancellationToken = default)
    {
        var query = _context.LoyaltyMemberships.AsQueryable();

        if (loyaltyProgramId.HasValue)
            query = query.Where(m => m.LoyaltyProgramId == loyaltyProgramId.Value);
        if (customerId.HasValue)
            query = query.Where(m => m.CustomerId == customerId.Value);
        if (isActive.HasValue)
            query = query.Where(m => m.IsActive == isActive.Value);

        return await query.CountAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<bool> IsMembershipNumberUniqueAsync(string membershipNumber, Guid? excludeId = null, CancellationToken cancellationToken = default)
    {
        var query = _context.LoyaltyMemberships.Where(m => m.MembershipNumber == membershipNumber);
        if (excludeId.HasValue)
            query = query.Where(m => m.Id != excludeId.Value);
        return !await query.AnyAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<LoyaltyMembership> CreateAsync(LoyaltyMembership membership, CancellationToken cancellationToken = default)
    {
        _context.LoyaltyMemberships.Add(membership);
        await _context.SaveChangesAsync(cancellationToken);
        return membership;
    }

    public async System.Threading.Tasks.Task UpdateAsync(LoyaltyMembership membership, CancellationToken cancellationToken = default)
    {
        _context.LoyaltyMemberships.Update(membership);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var membership = await GetByIdAsync(id, cancellationToken);
        if (membership != null)
        {
            _context.LoyaltyMemberships.Remove(membership);
            await _context.SaveChangesAsync(cancellationToken);
        }
    }
}
