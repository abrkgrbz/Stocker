using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using Stocker.Modules.CRM.Domain.Repositories;
using Stocker.Modules.CRM.Infrastructure.Persistence.Repositories;
using Stocker.SharedKernel.Interfaces;

namespace Stocker.Modules.CRM.Infrastructure.Persistence;

public class CRMUnitOfWork : IUnitOfWork
{
    private readonly CRMDbContext _context;
    private IDbContextTransaction? _currentTransaction;
    private ICustomerRepository? _customerRepository;
    private IContactRepository? _contactRepository;
    private ILeadRepository? _leadRepository;

    public CRMUnitOfWork(CRMDbContext context)
    {
        _context = context;
    }

    public ICustomerRepository CustomerRepository 
        => _customerRepository ??= new CustomerRepository(_context);

    public IContactRepository ContactRepository 
        => _contactRepository ??= new ContactRepository(_context);

    public ILeadRepository LeadRepository 
        => _leadRepository ??= new LeadRepository(_context);

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