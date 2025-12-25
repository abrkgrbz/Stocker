using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Sales.Domain.Entities;
using Stocker.Modules.Sales.Domain.Repositories;

namespace Stocker.Modules.Sales.Infrastructure.Persistence.Repositories;

/// <summary>
/// Repository implementation for CustomerContract entity.
/// Provides credit limit validation, SLA management, and contract lifecycle operations.
/// </summary>
public class CustomerContractRepository : BaseRepository<CustomerContract>, ICustomerContractRepository
{
    public CustomerContractRepository(SalesDbContext context) : base(context)
    {
    }

    /// <inheritdoc />
    public async Task<CustomerContract?> GetActiveContractByCustomerIdAsync(
        Guid customerId,
        CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(c => c.PriceAgreements)
            .Include(c => c.PaymentTerms)
            .Where(c => c.CustomerId == customerId)
            .Where(c => c.Status == ContractStatus.Active)
            .Where(c => c.StartDate <= DateTime.UtcNow)
            .Where(c => c.EndDate > DateTime.UtcNow)
            .OrderByDescending(c => c.StartDate)
            .FirstOrDefaultAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task<CustomerContract?> GetByContractNumberAsync(
        string contractNumber,
        CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(c => c.PriceAgreements)
            .Include(c => c.PaymentTerms)
            .FirstOrDefaultAsync(c => c.ContractNumber == contractNumber, cancellationToken);
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<CustomerContract>> GetByCustomerIdAsync(
        Guid customerId,
        CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(c => c.PriceAgreements)
            .Include(c => c.PaymentTerms)
            .Where(c => c.CustomerId == customerId)
            .OrderByDescending(c => c.StartDate)
            .ToListAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<CustomerContract>> GetByStatusAsync(
        ContractStatus status,
        CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(c => c.PriceAgreements)
            .Include(c => c.PaymentTerms)
            .Where(c => c.Status == status)
            .OrderByDescending(c => c.StartDate)
            .ToListAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<CustomerContract>> GetExpiringContractsAsync(
        int daysUntilExpiration,
        CancellationToken cancellationToken = default)
    {
        var expirationThreshold = DateTime.UtcNow.AddDays(daysUntilExpiration);

        return await _dbSet
            .Include(c => c.PriceAgreements)
            .Include(c => c.PaymentTerms)
            .Where(c => c.Status == ContractStatus.Active)
            .Where(c => c.EndDate <= expirationThreshold)
            .Where(c => c.EndDate > DateTime.UtcNow)
            .OrderBy(c => c.EndDate)
            .ToListAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<CustomerContract>> GetContractsRequiringRenewalNotificationAsync(
        CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(c => c.PriceAgreements)
            .Include(c => c.PaymentTerms)
            .Where(c => c.Status == ContractStatus.Active)
            .Where(c => c.AutoRenewal == true)
            .Where(c => c.RenewalNoticeBeforeDays.HasValue)
            .Where(c => c.EndDate <= DateTime.UtcNow.AddDays(30)) // Default: 30 days before expiration
            .Where(c => c.EndDate > DateTime.UtcNow)
            .OrderBy(c => c.EndDate)
            .ToListAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task<string> GenerateContractNumberAsync(CancellationToken cancellationToken = default)
    {
        var today = DateTime.UtcNow;
        var prefix = $"CTR-{today:yyyyMMdd}-";

        var lastContract = await _dbSet
            .Where(c => c.ContractNumber.StartsWith(prefix))
            .OrderByDescending(c => c.ContractNumber)
            .FirstOrDefaultAsync(cancellationToken);

        if (lastContract == null)
        {
            return $"{prefix}0001";
        }

        var lastNumber = lastContract.ContractNumber.Replace(prefix, "");
        if (int.TryParse(lastNumber, out var number))
        {
            return $"{prefix}{(number + 1):D4}";
        }

        return $"{prefix}0001";
    }
}
