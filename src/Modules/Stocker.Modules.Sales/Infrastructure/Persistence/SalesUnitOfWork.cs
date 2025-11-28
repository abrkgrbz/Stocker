using Microsoft.EntityFrameworkCore.Storage;
using Stocker.Modules.Sales.Domain.Repositories;
using Stocker.Modules.Sales.Infrastructure.Persistence.Repositories;
using Stocker.SharedKernel.Interfaces;

namespace Stocker.Modules.Sales.Infrastructure.Persistence;

/// <summary>
/// Unit of Work implementation for Sales module
/// </summary>
public class SalesUnitOfWork : IUnitOfWork
{
    private readonly SalesDbContext _context;
    private IDbContextTransaction? _currentTransaction;
    private ISalesOrderRepository? _salesOrderRepository;
    private IInvoiceRepository? _invoiceRepository;
    private IPaymentRepository? _paymentRepository;

    public SalesUnitOfWork(SalesDbContext context)
    {
        _context = context;
    }

    public ISalesOrderRepository SalesOrderRepository
        => _salesOrderRepository ??= new SalesOrderRepository(_context);

    public IInvoiceRepository InvoiceRepository
        => _invoiceRepository ??= new InvoiceRepository(_context);

    public IPaymentRepository PaymentRepository
        => _paymentRepository ??= new PaymentRepository(_context);

    public bool HasActiveTransaction => _currentTransaction != null;

    public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return await _context.SaveChangesAsync(cancellationToken);
    }

    public int SaveChanges()
    {
        return _context.SaveChanges();
    }

    public async Task<bool> SaveEntitiesAsync(CancellationToken cancellationToken = default)
    {
        var result = await _context.SaveChangesAsync(cancellationToken);
        return result > 0;
    }

    public async Task BeginTransactionAsync(CancellationToken cancellationToken = default)
    {
        if (_currentTransaction != null)
            return;

        _currentTransaction = await _context.Database.BeginTransactionAsync(cancellationToken);
    }

    public async Task CommitTransactionAsync(CancellationToken cancellationToken = default)
    {
        if (_currentTransaction == null)
            throw new InvalidOperationException("No active transaction to commit");

        try
        {
            await SaveChangesAsync(cancellationToken);
            await _currentTransaction.CommitAsync(cancellationToken);
        }
        catch
        {
            await RollbackTransactionAsync(cancellationToken);
            throw;
        }
        finally
        {
            if (_currentTransaction != null)
            {
                _currentTransaction.Dispose();
                _currentTransaction = null;
            }
        }
    }

    public async Task RollbackTransactionAsync(CancellationToken cancellationToken = default)
    {
        if (_currentTransaction == null)
            return;

        try
        {
            await _currentTransaction.RollbackAsync(cancellationToken);
        }
        finally
        {
            if (_currentTransaction != null)
            {
                _currentTransaction.Dispose();
                _currentTransaction = null;
            }
        }
    }

    public void Dispose()
    {
        _currentTransaction?.Dispose();
        _context.Dispose();
    }
}
