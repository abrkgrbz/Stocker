using System.Linq.Expressions;

namespace Stocker.SharedKernel.Specifications;

/// <summary>
/// Specification pattern interface for building complex queries
/// </summary>
public interface ISpecification<T>
{
    /// <summary>
    /// The criteria expression for filtering
    /// </summary>
    Expression<Func<T, bool>>? Criteria { get; }

    /// <summary>
    /// Include expressions for eager loading
    /// </summary>
    List<Expression<Func<T, object>>> Includes { get; }

    /// <summary>
    /// Include string expressions for eager loading (for nested includes)
    /// </summary>
    List<string> IncludeStrings { get; }

    /// <summary>
    /// Order by expression
    /// </summary>
    Expression<Func<T, object>>? OrderBy { get; }

    /// <summary>
    /// Order by descending expression
    /// </summary>
    Expression<Func<T, object>>? OrderByDescending { get; }

    /// <summary>
    /// Group by expression
    /// </summary>
    Expression<Func<T, object>>? GroupBy { get; }

    /// <summary>
    /// Take number of records
    /// </summary>
    int? Take { get; }

    /// <summary>
    /// Skip number of records
    /// </summary>
    int? Skip { get; }

    /// <summary>
    /// Whether to enable tracking
    /// </summary>
    bool AsNoTracking { get; }

    /// <summary>
    /// Whether to ignore query filters
    /// </summary>
    bool IgnoreQueryFilters { get; }

    /// <summary>
    /// Whether to include soft-deleted entities
    /// </summary>
    bool IncludeDeleted { get; }
}