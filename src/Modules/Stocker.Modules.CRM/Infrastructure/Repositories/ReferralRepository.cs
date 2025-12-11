using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.Modules.CRM.Infrastructure.Persistence;

namespace Stocker.Modules.CRM.Infrastructure.Repositories;

public class ReferralRepository : IReferralRepository
{
    private readonly CRMDbContext _context;

    public ReferralRepository(CRMDbContext context)
    {
        _context = context;
    }

    public async System.Threading.Tasks.Task<List<Referral>> GetAllAsync(
        Guid? referrerCustomerId = null,
        Guid? referredCustomerId = null,
        ReferralStatus? status = null,
        ReferralType? referralType = null,
        bool? rewardPaid = null,
        int skip = 0,
        int take = 100,
        CancellationToken cancellationToken = default)
    {
        var query = _context.Referrals.AsQueryable();

        if (referrerCustomerId.HasValue)
            query = query.Where(r => r.ReferrerCustomerId == referrerCustomerId.Value);

        if (referredCustomerId.HasValue)
            query = query.Where(r => r.ReferredCustomerId == referredCustomerId.Value);

        if (status.HasValue)
            query = query.Where(r => r.Status == status.Value);

        if (referralType.HasValue)
            query = query.Where(r => r.ReferralType == referralType.Value);

        if (rewardPaid.HasValue)
            query = query.Where(r => r.RewardPaid == rewardPaid.Value);

        return await query
            .OrderByDescending(r => r.ReferralDate)
            .Skip(skip)
            .Take(take)
            .ToListAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<Referral?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Referrals
            .Include(r => r.ReferrerCustomer)
            .Include(r => r.ReferrerContact)
            .Include(r => r.ReferredCustomer)
            .Include(r => r.ReferredLead)
            .Include(r => r.Campaign)
            .Include(r => r.Opportunity)
            .Include(r => r.Deal)
            .FirstOrDefaultAsync(r => r.Id == id, cancellationToken);
    }

    public async System.Threading.Tasks.Task<Referral?> GetByCodeAsync(string referralCode, CancellationToken cancellationToken = default)
    {
        return await _context.Referrals
            .FirstOrDefaultAsync(r => r.ReferralCode == referralCode, cancellationToken);
    }

    public async System.Threading.Tasks.Task<List<Referral>> GetByReferrerCustomerIdAsync(Guid customerId, CancellationToken cancellationToken = default)
    {
        return await _context.Referrals
            .Where(r => r.ReferrerCustomerId == customerId)
            .OrderByDescending(r => r.ReferralDate)
            .ToListAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<List<Referral>> GetPendingRewardsAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Referrals
            .Where(r => r.Status == ReferralStatus.Converted && !r.RewardPaid)
            .OrderBy(r => r.ConversionDate)
            .ToListAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<List<Referral>> GetExpiredReferralsAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Referrals
            .Where(r => r.ExpiryDate.HasValue &&
                       r.ExpiryDate.Value < DateTime.UtcNow &&
                       r.Status != ReferralStatus.Converted &&
                       r.Status != ReferralStatus.Expired)
            .ToListAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<int> GetTotalCountAsync(
        ReferralStatus? status = null,
        bool? rewardPaid = null,
        CancellationToken cancellationToken = default)
    {
        var query = _context.Referrals.AsQueryable();

        if (status.HasValue)
            query = query.Where(r => r.Status == status.Value);

        if (rewardPaid.HasValue)
            query = query.Where(r => r.RewardPaid == rewardPaid.Value);

        return await query.CountAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task<Referral> CreateAsync(Referral referral, CancellationToken cancellationToken = default)
    {
        _context.Referrals.Add(referral);
        await _context.SaveChangesAsync(cancellationToken);
        return referral;
    }

    public async System.Threading.Tasks.Task UpdateAsync(Referral referral, CancellationToken cancellationToken = default)
    {
        _context.Referrals.Update(referral);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var referral = await GetByIdAsync(id, cancellationToken);
        if (referral != null)
        {
            _context.Referrals.Remove(referral);
            await _context.SaveChangesAsync(cancellationToken);
        }
    }

    public async System.Threading.Tasks.Task<bool> CodeExistsAsync(string code, CancellationToken cancellationToken = default)
    {
        return await _context.Referrals.AnyAsync(r => r.ReferralCode == code, cancellationToken);
    }
}
