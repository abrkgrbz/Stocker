using Stocker.Modules.Sales.Domain.Entities;
using Stocker.SharedKernel.Interfaces;

namespace Stocker.Modules.Sales.Domain.Repositories;

/// <summary>
/// Repository interface for SalesTerritory entity
/// </summary>
public interface ISalesTerritoryRepository : IRepository<SalesTerritory>
{
    /// <summary>
    /// Gets a territory by its code
    /// </summary>
    Task<SalesTerritory?> GetByCodeAsync(
        string territoryCode,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a territory with all related collections loaded
    /// </summary>
    Task<SalesTerritory?> GetWithDetailsAsync(
        Guid id,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets all active territories
    /// </summary>
    Task<IReadOnlyList<SalesTerritory>> GetActiveTerritoriesAsync(
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets territories by type (Country, Region, City, etc.)
    /// </summary>
    Task<IReadOnlyList<SalesTerritory>> GetByTypeAsync(
        TerritoryType type,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets child territories of a parent territory
    /// </summary>
    Task<IReadOnlyList<SalesTerritory>> GetChildTerritoriesAsync(
        Guid parentTerritoryId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets the territory for a customer based on postal code or city
    /// </summary>
    Task<SalesTerritory?> GetTerritoryForCustomerAsync(
        Guid customerId,
        string? postalCode,
        string? city,
        string? region,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets territories assigned to a sales representative
    /// </summary>
    Task<IReadOnlyList<SalesTerritory>> GetBySalesRepresentativeAsync(
        Guid salesRepId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets the territory that has a customer explicitly assigned
    /// </summary>
    Task<SalesTerritory?> GetByCustomerAssignmentAsync(
        Guid customerId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Generates a unique territory code
    /// </summary>
    Task<string> GenerateTerritoryCodeAsync(
        TerritoryType type,
        CancellationToken cancellationToken = default);
}
