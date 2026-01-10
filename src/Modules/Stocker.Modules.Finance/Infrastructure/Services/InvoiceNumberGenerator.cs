using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Finance.Domain.Services;
using Stocker.Modules.Finance.Domain.ValueObjects;
using Stocker.Modules.Finance.Infrastructure.Persistence;

namespace Stocker.Modules.Finance.Infrastructure.Services;

/// <summary>
/// Fatura numarası üretici implementasyonu.
/// GİB standartlarına uygun benzersiz fatura numaraları üretir.
/// </summary>
public class InvoiceNumberGenerator : IInvoiceNumberGenerator
{
    private readonly FinanceDbContext _dbContext;
    private static readonly SemaphoreSlim _lock = new(1, 1);

    public InvoiceNumberGenerator(FinanceDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<InvoiceNumber> GenerateAsync(
        Guid tenantId,
        string series,
        CancellationToken cancellationToken = default)
    {
        await _lock.WaitAsync(cancellationToken);
        try
        {
            var currentYear = DateTime.UtcNow.Year;
            var lastNumber = await GetLastNumberAsync(tenantId, series, currentYear, cancellationToken);

            int nextSequence;
            if (lastNumber == null)
            {
                nextSequence = 1;
            }
            else
            {
                nextSequence = lastNumber.SequenceNumber + 1;
            }

            var invoiceNumber = InvoiceNumber.Create(series, currentYear, nextSequence);

            // Verify uniqueness
            var isUnique = await IsUniqueAsync(tenantId, invoiceNumber, cancellationToken);
            if (!isUnique)
            {
                throw new InvalidOperationException(
                    $"Generated invoice number {invoiceNumber.Value} is not unique. This should not happen.");
            }

            return invoiceNumber;
        }
        finally
        {
            _lock.Release();
        }
    }

    public async Task<InvoiceNumber?> GetLastNumberAsync(
        Guid tenantId,
        string series,
        int year,
        CancellationToken cancellationToken = default)
    {
        var prefix = $"{series.ToUpperInvariant()}{year}";

        var lastInvoice = await _dbContext.Invoices
            .AsNoTracking()
            .Where(i => i.TenantId == tenantId && i.Series == series.ToUpperInvariant())
            .Where(i => i.InvoiceNumber.StartsWith(prefix))
            .OrderByDescending(i => i.SequenceNumber)
            .Select(i => new { i.InvoiceNumber, i.SequenceNumber })
            .FirstOrDefaultAsync(cancellationToken);

        if (lastInvoice == null)
        {
            return null;
        }

        return InvoiceNumber.Create(series, year, lastInvoice.SequenceNumber);
    }

    public async Task<bool> IsUniqueAsync(
        Guid tenantId,
        InvoiceNumber invoiceNumber,
        CancellationToken cancellationToken = default)
    {
        var exists = await _dbContext.Invoices
            .AsNoTracking()
            .AnyAsync(i => i.TenantId == tenantId && i.InvoiceNumber == invoiceNumber.Value, cancellationToken);

        return !exists;
    }
}
