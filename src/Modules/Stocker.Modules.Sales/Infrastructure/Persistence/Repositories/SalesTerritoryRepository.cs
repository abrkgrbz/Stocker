using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Sales.Domain.Entities;
using Stocker.Modules.Sales.Domain.Repositories;

namespace Stocker.Modules.Sales.Infrastructure.Persistence.Repositories;

/// <summary>
/// Repository implementation for SalesTerritory entity.
/// Provides geographic lookup, hierarchy navigation, and sales representative assignment operations.
/// </summary>
public class SalesTerritoryRepository : BaseRepository<SalesTerritory>, ISalesTerritoryRepository
{
    public SalesTerritoryRepository(SalesDbContext context) : base(context)
    {
    }

    /// <inheritdoc />
    public async Task<SalesTerritory?> GetByCodeAsync(
        string territoryCode,
        CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(t => t.Assignments)
            .Include(t => t.Customers)
            .FirstOrDefaultAsync(t => t.TerritoryCode == territoryCode, cancellationToken);
    }

    /// <inheritdoc />
    public async Task<SalesTerritory?> GetWithDetailsAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(t => t.Assignments)
            .Include(t => t.Customers)
            .Include(t => t.PostalCodes)
            .Include(t => t.ChildTerritories)
            .FirstOrDefaultAsync(t => t.Id == id, cancellationToken);
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<SalesTerritory>> GetActiveTerritoriesAsync(
        CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(t => t.Assignments)
            .Where(t => t.Status == TerritoryStatus.Active)
            .OrderBy(t => t.Name)
            .ToListAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<SalesTerritory>> GetByTypeAsync(
        TerritoryType type,
        CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(t => t.Assignments)
            .Where(t => t.TerritoryType == type)
            .Where(t => t.Status == TerritoryStatus.Active)
            .OrderBy(t => t.Name)
            .ToListAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<SalesTerritory>> GetChildTerritoriesAsync(
        Guid parentTerritoryId,
        CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(t => t.Assignments)
            .Where(t => t.ParentTerritoryId == parentTerritoryId)
            .Where(t => t.Status == TerritoryStatus.Active)
            .OrderBy(t => t.Name)
            .ToListAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task<SalesTerritory?> GetTerritoryForCustomerAsync(
        Guid customerId,
        string? postalCode,
        string? city,
        string? region,
        CancellationToken cancellationToken = default)
    {
        // First, check if customer has explicit territory assignment
        var explicitAssignment = await GetByCustomerAssignmentAsync(customerId, cancellationToken);
        if (explicitAssignment != null)
        {
            return explicitAssignment;
        }

        // Try to find territory by postal code coverage
        if (!string.IsNullOrWhiteSpace(postalCode))
        {
            var postalCodeTerritory = await _dbSet
                .Include(t => t.Assignments)
                .Include(t => t.PostalCodes)
                .Where(t => t.Status == TerritoryStatus.Active)
                .Where(t => t.PostalCodes.Any(pc => pc.PostalCode == postalCode))
                .FirstOrDefaultAsync(cancellationToken);

            if (postalCodeTerritory != null)
            {
                return postalCodeTerritory;
            }
        }

        // Try to find territory by city
        if (!string.IsNullOrWhiteSpace(city))
        {
            var cityTerritory = await _dbSet
                .Include(t => t.Assignments)
                .Where(t => t.Status == TerritoryStatus.Active)
                .Where(t => t.TerritoryType == TerritoryType.District || t.TerritoryType == TerritoryType.Province)
                .Where(t => t.City != null && t.City.ToLower() == city.ToLower())
                .FirstOrDefaultAsync(cancellationToken);

            if (cityTerritory != null)
            {
                return cityTerritory;
            }
        }

        // Try to find territory by region
        if (!string.IsNullOrWhiteSpace(region))
        {
            var regionTerritory = await _dbSet
                .Include(t => t.Assignments)
                .Where(t => t.Status == TerritoryStatus.Active)
                .Where(t => t.TerritoryType == TerritoryType.Region)
                .Where(t => t.Region != null && t.Region.ToLower() == region.ToLower())
                .FirstOrDefaultAsync(cancellationToken);

            if (regionTerritory != null)
            {
                return regionTerritory;
            }
        }

        // Return null if no matching territory found
        return null;
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<SalesTerritory>> GetBySalesRepresentativeAsync(
        Guid salesRepId,
        CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(t => t.Assignments)
            .Include(t => t.Customers)
            .Where(t => t.Status == TerritoryStatus.Active)
            .Where(t => t.Assignments.Any(a =>
                a.SalesRepresentativeId == salesRepId &&
                a.IsActive &&
                a.EffectiveFrom <= DateTime.UtcNow &&
                (!a.EffectiveTo.HasValue || a.EffectiveTo > DateTime.UtcNow)))
            .OrderBy(t => t.Name)
            .ToListAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task<SalesTerritory?> GetByCustomerAssignmentAsync(
        Guid customerId,
        CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(t => t.Assignments)
            .Include(t => t.Customers)
            .Where(t => t.Status == TerritoryStatus.Active)
            .Where(t => t.Customers.Any(c =>
                c.CustomerId == customerId &&
                c.IsActive))
            .FirstOrDefaultAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task<string> GenerateTerritoryCodeAsync(
        TerritoryType type,
        CancellationToken cancellationToken = default)
    {
        var prefix = type switch
        {
            TerritoryType.Country => "CTY",
            TerritoryType.Region => "REG",
            TerritoryType.Province => "PRV",
            TerritoryType.District => "DST",
            TerritoryType.FreeZone => "FRZ",
            TerritoryType.SpecialZone => "SPZ",
            TerritoryType.CustomerSegment => "CSG",
            TerritoryType.Channel => "CHN",
            _ => "TER"
        };

        var fullPrefix = $"{prefix}-";

        var lastTerritory = await _dbSet
            .Where(t => t.TerritoryCode.StartsWith(fullPrefix))
            .OrderByDescending(t => t.TerritoryCode)
            .FirstOrDefaultAsync(cancellationToken);

        if (lastTerritory == null)
        {
            return $"{fullPrefix}0001";
        }

        var lastNumber = lastTerritory.TerritoryCode.Replace(fullPrefix, "");
        if (int.TryParse(lastNumber, out var number))
        {
            return $"{fullPrefix}{(number + 1):D4}";
        }

        return $"{fullPrefix}0001";
    }
}
