using Stocker.Modules.Inventory.Domain.Entities;

namespace Stocker.Modules.Inventory.Domain.Repositories;

/// <summary>
/// Repository interface for Unit entity
/// </summary>
public interface IUnitRepository : IInventoryRepository<Unit>
{
    /// <summary>
    /// Gets a unit by code
    /// </summary>
    Task<Unit?> GetByCodeAsync(string code, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets base units (not derived from another unit)
    /// </summary>
    Task<IReadOnlyList<Unit>> GetBaseUnitsAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets derived units for a base unit
    /// </summary>
    Task<IReadOnlyList<Unit>> GetDerivedUnitsAsync(int baseUnitId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets active units
    /// </summary>
    Task<IReadOnlyList<Unit>> GetActiveUnitsAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Checks if a unit with the given code exists
    /// </summary>
    Task<bool> ExistsWithCodeAsync(string code, int? excludeUnitId = null, CancellationToken cancellationToken = default);
}
