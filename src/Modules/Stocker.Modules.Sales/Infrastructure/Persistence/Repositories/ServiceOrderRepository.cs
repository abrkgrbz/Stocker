using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Sales.Domain.Entities;
using Stocker.Modules.Sales.Domain.Repositories;

namespace Stocker.Modules.Sales.Infrastructure.Persistence.Repositories;

/// <summary>
/// Repository implementation for ServiceOrder entity
/// </summary>
public class ServiceOrderRepository : BaseRepository<ServiceOrder>, IServiceOrderRepository
{
    public ServiceOrderRepository(SalesDbContext context) : base(context)
    {
    }

    public async Task<ServiceOrder?> GetByServiceOrderNumberAsync(string serviceOrderNumber, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(so => so.Items)
            .FirstOrDefaultAsync(so => so.ServiceOrderNumber == serviceOrderNumber, cancellationToken);
    }

    public async Task<ServiceOrder?> GetWithItemsAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(so => so.Items)
            .FirstOrDefaultAsync(so => so.Id == id, cancellationToken);
    }

    public async Task<IReadOnlyList<ServiceOrder>> GetByCustomerIdAsync(Guid customerId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(so => so.Items)
            .Where(so => so.CustomerId == customerId)
            .OrderByDescending(so => so.OrderDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<ServiceOrder>> GetByStatusAsync(ServiceOrderStatus status, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(so => so.Items)
            .Where(so => so.Status == status)
            .OrderByDescending(so => so.OrderDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<ServiceOrder>> GetByTypeAsync(ServiceOrderType type, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(so => so.Items)
            .Where(so => so.Type == type)
            .OrderByDescending(so => so.OrderDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<string> GenerateServiceOrderNumberAsync(CancellationToken cancellationToken = default)
    {
        var today = DateTime.UtcNow;
        var prefix = $"SVC-{today:yyyyMMdd}-";

        var lastOrder = await _dbSet
            .Where(so => so.ServiceOrderNumber.StartsWith(prefix))
            .OrderByDescending(so => so.ServiceOrderNumber)
            .FirstOrDefaultAsync(cancellationToken);

        if (lastOrder == null)
        {
            return $"{prefix}0001";
        }

        var lastNumber = lastOrder.ServiceOrderNumber.Replace(prefix, "");
        if (int.TryParse(lastNumber, out var number))
        {
            return $"{prefix}{(number + 1):D4}";
        }

        return $"{prefix}0001";
    }
}
