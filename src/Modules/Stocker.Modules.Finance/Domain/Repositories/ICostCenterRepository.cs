using Stocker.Modules.Finance.Domain.Entities;

namespace Stocker.Modules.Finance.Domain.Repositories;

/// <summary>
/// Repository interface for CostCenter entity
/// Masraf Merkezi Repository Arayüzü
/// </summary>
public interface ICostCenterRepository : IFinanceRepository<CostCenter>
{
    /// <summary>
    /// Get cost center by code
    /// Koda göre masraf merkezi getir
    /// </summary>
    Task<CostCenter?> GetByCodeAsync(string code, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get all active cost centers
    /// Tüm aktif masraf merkezlerini getir
    /// </summary>
    Task<IReadOnlyList<CostCenter>> GetActiveAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Get cost centers by type
    /// Türe göre masraf merkezlerini getir
    /// </summary>
    Task<IReadOnlyList<CostCenter>> GetByTypeAsync(CostCenterType type, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get cost centers by category
    /// Kategoriye göre masraf merkezlerini getir
    /// </summary>
    Task<IReadOnlyList<CostCenter>> GetByCategoryAsync(CostCenterCategory category, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get root cost centers (no parent)
    /// Kök masraf merkezlerini getir (üst merkezi olmayanlar)
    /// </summary>
    Task<IReadOnlyList<CostCenter>> GetRootCostCentersAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Get child cost centers of a parent
    /// Bir üst merkezin alt merkezlerini getir
    /// </summary>
    Task<IReadOnlyList<CostCenter>> GetChildrenAsync(int parentId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get cost center with its children
    /// Masraf merkezini alt merkezleriyle birlikte getir
    /// </summary>
    Task<CostCenter?> GetWithChildrenAsync(int id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get the default cost center
    /// Varsayılan masraf merkezini getir
    /// </summary>
    Task<CostCenter?> GetDefaultAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Get cost centers by department
    /// Departmana göre masraf merkezlerini getir
    /// </summary>
    Task<IReadOnlyList<CostCenter>> GetByDepartmentAsync(int departmentId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get cost centers by branch
    /// Şubeye göre masraf merkezlerini getir
    /// </summary>
    Task<IReadOnlyList<CostCenter>> GetByBranchAsync(int branchId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get cost centers with budget warnings
    /// Bütçe uyarısı olan masraf merkezlerini getir
    /// </summary>
    Task<IReadOnlyList<CostCenter>> GetBudgetWarningsAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Get cost centers that are over budget
    /// Bütçeyi aşmış masraf merkezlerini getir
    /// </summary>
    Task<IReadOnlyList<CostCenter>> GetOverBudgetAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Get all descendants of a cost center
    /// Bir masraf merkezinin tüm alt hiyerarşisini getir
    /// </summary>
    Task<IReadOnlyList<CostCenter>> GetDescendantsAsync(int costCenterId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Check if a code is unique
    /// Kodun benzersiz olup olmadığını kontrol et
    /// </summary>
    Task<bool> IsCodeUniqueAsync(string code, int? excludeId = null, CancellationToken cancellationToken = default);
}
