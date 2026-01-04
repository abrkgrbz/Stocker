using Stocker.Modules.Finance.Domain.Entities;

namespace Stocker.Modules.Finance.Domain.Repositories;

/// <summary>
/// Repository interface for FixedAsset entity
/// Sabit Kıymet repository arayüzü
/// </summary>
public interface IFixedAssetRepository : IFinanceRepository<FixedAsset>
{
    /// <summary>
    /// Get fixed asset by code
    /// Kod ile sabit kıymet getirir
    /// </summary>
    Task<FixedAsset?> GetByCodeAsync(string code, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get fixed assets by category
    /// Kategoriye göre sabit kıymetleri getirir
    /// </summary>
    Task<IReadOnlyList<FixedAsset>> GetByCategoryAsync(FixedAssetCategory category, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get fixed assets by type
    /// Türe göre sabit kıymetleri getirir
    /// </summary>
    Task<IReadOnlyList<FixedAsset>> GetByTypeAsync(FixedAssetType assetType, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get fixed assets by status
    /// Duruma göre sabit kıymetleri getirir
    /// </summary>
    Task<IReadOnlyList<FixedAsset>> GetByStatusAsync(FixedAssetStatus status, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get fixed assets by location
    /// Lokasyona göre sabit kıymetleri getirir
    /// </summary>
    Task<IReadOnlyList<FixedAsset>> GetByLocationAsync(int locationId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get fixed assets by department
    /// Departmana göre sabit kıymetleri getirir
    /// </summary>
    Task<IReadOnlyList<FixedAsset>> GetByDepartmentAsync(int departmentId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get fixed assets by custodian
    /// Zimmetliye göre sabit kıymetleri getirir
    /// </summary>
    Task<IReadOnlyList<FixedAsset>> GetByCustodianAsync(int custodianUserId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get active fixed assets
    /// Aktif sabit kıymetleri getirir
    /// </summary>
    Task<IReadOnlyList<FixedAsset>> GetActiveAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Get fixed assets due for depreciation
    /// Amortismana tabi sabit kıymetleri getirir
    /// </summary>
    Task<IReadOnlyList<FixedAsset>> GetDueForDepreciationAsync(DateTime asOfDate, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get fully depreciated fixed assets
    /// Tamamen amortize edilmiş sabit kıymetleri getirir
    /// </summary>
    Task<IReadOnlyList<FixedAsset>> GetFullyDepreciatedAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Get fixed assets with warranty expiring
    /// Garantisi bitmek üzere olan sabit kıymetleri getirir
    /// </summary>
    Task<IReadOnlyList<FixedAsset>> GetWarrantyExpiringAsync(int daysBeforeExpiry = 30, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get fixed assets with insurance expiring
    /// Sigortası bitmek üzere olan sabit kıymetleri getirir
    /// </summary>
    Task<IReadOnlyList<FixedAsset>> GetInsuranceExpiringAsync(int daysBeforeExpiry = 30, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get fixed asset with depreciations
    /// Sabit kıymeti amortismanlarıyla birlikte getirir
    /// </summary>
    Task<FixedAsset?> GetWithDepreciationsAsync(int id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get total net book value
    /// Toplam net defter değerini getirir
    /// </summary>
    Task<decimal> GetTotalNetBookValueAsync(string? currency = null, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get total net book value by category
    /// Kategoriye göre toplam net defter değerini getirir
    /// </summary>
    Task<Dictionary<FixedAssetCategory, decimal>> GetTotalNetBookValueByCategoryAsync(CancellationToken cancellationToken = default);
}
