using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Sales.Domain.Entities;
using Stocker.Modules.Sales.Domain.Repositories;

namespace Stocker.Modules.Sales.Infrastructure.Persistence.Repositories;

/// <summary>
/// Repository implementation for AdvancePayment entity
/// </summary>
public class AdvancePaymentRepository : BaseRepository<AdvancePayment>, IAdvancePaymentRepository
{
    public AdvancePaymentRepository(SalesDbContext context) : base(context)
    {
    }

    public async Task<AdvancePayment?> GetByPaymentNumberAsync(string paymentNumber, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .FirstOrDefaultAsync(ap => ap.PaymentNumber == paymentNumber, cancellationToken);
    }

    public async Task<IReadOnlyList<AdvancePayment>> GetByCustomerIdAsync(Guid customerId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(ap => ap.CustomerId == customerId)
            .OrderByDescending(ap => ap.PaymentDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<AdvancePayment>> GetBySalesOrderIdAsync(Guid salesOrderId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(ap => ap.SalesOrderId == salesOrderId)
            .OrderByDescending(ap => ap.PaymentDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<AdvancePayment>> GetByStatusAsync(AdvancePaymentStatus status, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(ap => ap.Status == status)
            .OrderByDescending(ap => ap.PaymentDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<string> GeneratePaymentNumberAsync(CancellationToken cancellationToken = default)
    {
        var today = DateTime.UtcNow;
        var prefix = $"ADV-{today:yyyyMMdd}-";

        var lastPayment = await _dbSet
            .Where(ap => ap.PaymentNumber.StartsWith(prefix))
            .OrderByDescending(ap => ap.PaymentNumber)
            .FirstOrDefaultAsync(cancellationToken);

        if (lastPayment == null)
        {
            return $"{prefix}0001";
        }

        var lastNumber = lastPayment.PaymentNumber.Replace(prefix, "");
        if (int.TryParse(lastNumber, out var number))
        {
            return $"{prefix}{(number + 1):D4}";
        }

        return $"{prefix}0001";
    }
}
