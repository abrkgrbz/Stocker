using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Finance.Domain.Entities;
using Stocker.Modules.Finance.Domain.Enums;
using Stocker.Modules.Finance.Domain.Repositories;

namespace Stocker.Modules.Finance.Infrastructure.Persistence.Repositories;

/// <summary>
/// Repository implementation for Payment entity
/// </summary>
public class PaymentRepository : FinanceGenericRepository<Payment>, IPaymentRepository
{
    public PaymentRepository(FinanceDbContext context) : base(context)
    {
    }

    public async Task<Payment?> GetWithAllocationsAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(p => p.Allocations)
            .Include(p => p.CurrentAccount)
            .FirstOrDefaultAsync(p => p.Id == id, cancellationToken);
    }

    public async Task<Payment?> GetByPaymentNumberAsync(string paymentNumber, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(p => p.Allocations)
            .FirstOrDefaultAsync(p => p.PaymentNumber == paymentNumber, cancellationToken);
    }

    public async Task<string> GetNextPaymentNumberAsync(MovementDirection direction, int year, CancellationToken cancellationToken = default)
    {
        var prefix = direction == MovementDirection.Inbound ? "TAH" : "ODE"; // Tahsilat / Ödeme

        var maxNumber = await _dbSet
            .Where(p => p.Direction == direction && p.PaymentDate.Year == year)
            .Select(p => p.PaymentNumber)
            .OrderByDescending(n => n)
            .FirstOrDefaultAsync(cancellationToken);

        if (string.IsNullOrEmpty(maxNumber))
        {
            return $"{prefix}-{year}-000001";
        }

        // Parse existing number and increment
        var parts = maxNumber.Split('-');
        if (parts.Length >= 3 && int.TryParse(parts[2], out var sequence))
        {
            return $"{prefix}-{year}-{(sequence + 1):D6}";
        }

        return $"{prefix}-{year}-000001";
    }

    public async Task<IReadOnlyList<Payment>> GetByCurrentAccountAsync(int currentAccountId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(p => p.CurrentAccountId == currentAccountId)
            .OrderByDescending(p => p.PaymentDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Payment>> GetByDirectionAsync(MovementDirection direction, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(p => p.Direction == direction)
            .OrderByDescending(p => p.PaymentDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Payment>> GetByTypeAsync(PaymentType paymentType, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(p => p.PaymentType == paymentType)
            .OrderByDescending(p => p.PaymentDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Payment>> GetByStatusAsync(PaymentStatus status, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(p => p.Status == status)
            .OrderByDescending(p => p.PaymentDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Payment>> GetByBankAccountAsync(int bankAccountId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(p => p.BankAccountId == bankAccountId)
            .OrderByDescending(p => p.PaymentDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Payment>> GetByCashAccountAsync(int cashAccountId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(p => p.CashAccountId == cashAccountId)
            .OrderByDescending(p => p.PaymentDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Payment>> GetByDateRangeAsync(
        DateTime startDate,
        DateTime endDate,
        MovementDirection? direction = null,
        CancellationToken cancellationToken = default)
    {
        var query = _dbSet.Where(p => p.PaymentDate >= startDate && p.PaymentDate <= endDate);

        if (direction.HasValue)
        {
            query = query.Where(p => p.Direction == direction.Value);
        }

        return await query
            .OrderByDescending(p => p.PaymentDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Payment>> GetUnallocatedPaymentsAsync(CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(p => p.UnallocatedAmount.Amount > 0 && p.Status == PaymentStatus.Completed)
            .OrderByDescending(p => p.PaymentDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Payment>> GetChecksByDueDateRangeAsync(
        DateTime startDate,
        DateTime endDate,
        CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(p => (p.PaymentType == PaymentType.Check || p.PaymentType == PaymentType.PromissoryNote) &&
                       p.ValueDate >= startDate &&
                       p.ValueDate <= endDate)
            .OrderBy(p => p.ValueDate)
            .ToListAsync(cancellationToken);
    }
}
