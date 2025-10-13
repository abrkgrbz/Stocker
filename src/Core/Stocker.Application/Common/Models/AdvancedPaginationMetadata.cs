using System.Collections.Generic;

namespace Stocker.Application.Common.Models;

/// <summary>
/// Enhanced pagination metadata with advanced features
/// </summary>
public class AdvancedPaginationMetadata : PaginationMetadata
{
    /// <summary>
    /// Available page sizes for client selection
    /// </summary>
    public int[] AvailablePageSizes { get; set; } = { 10, 25, 50, 100 };

    /// <summary>
    /// Sort information
    /// </summary>
    public SortInfo? Sort { get; set; }

    /// <summary>
    /// Filter information
    /// </summary>
    public List<FilterInfo> Filters { get; set; } = new();

    /// <summary>
    /// Links for pagination navigation (HATEOAS)
    /// </summary>
    public new PaginationLinks? Links { get; set; }

    /// <summary>
    /// Statistics about the result set
    /// </summary>
    public ResultStatistics? Statistics { get; set; }

    /// <summary>
    /// Cursor for cursor-based pagination
    /// </summary>
    public string? NextCursor { get; set; }

    /// <summary>
    /// Previous cursor for backward navigation
    /// </summary>
    public string? PreviousCursor { get; set; }
}

/// <summary>
/// Sort information for paginated results
/// </summary>
public class SortInfo
{
    /// <summary>
    /// Field being sorted by
    /// </summary>
    public string SortBy { get; set; } = string.Empty;

    /// <summary>
    /// Sort direction (asc/desc)
    /// </summary>
    public string SortOrder { get; set; } = "asc";

    /// <summary>
    /// Available fields for sorting
    /// </summary>
    public string[] AvailableSortFields { get; set; } = Array.Empty<string>();
}

/// <summary>
/// Filter information for paginated results
/// </summary>
public class FilterInfo
{
    /// <summary>
    /// Filter field name
    /// </summary>
    public string Field { get; set; } = string.Empty;

    /// <summary>
    /// Filter operator (eq, ne, gt, lt, contains, etc.)
    /// </summary>
    public string Operator { get; set; } = "eq";

    /// <summary>
    /// Filter value
    /// </summary>
    public object? Value { get; set; }

    /// <summary>
    /// Available operators for this field
    /// </summary>
    public string[]? AvailableOperators { get; set; }
}

/// <summary>
/// HATEOAS links for pagination navigation
/// </summary>
public class PaginationLinks
{
    /// <summary>
    /// Link to the first page
    /// </summary>
    public string? First { get; set; }

    /// <summary>
    /// Link to the previous page
    /// </summary>
    public string? Previous { get; set; }

    /// <summary>
    /// Link to the current page
    /// </summary>
    public string? Current { get; set; }

    /// <summary>
    /// Link to the next page
    /// </summary>
    public string? Next { get; set; }

    /// <summary>
    /// Link to the last page
    /// </summary>
    public string? Last { get; set; }
}

/// <summary>
/// Statistics about the paginated result set
/// </summary>
public class ResultStatistics
{
    /// <summary>
    /// Time taken to execute the query (ms)
    /// </summary>
    public long QueryTime { get; set; }

    /// <summary>
    /// Total count before filtering
    /// </summary>
    public int UnfilteredCount { get; set; }

    /// <summary>
    /// Count after filtering
    /// </summary>
    public int FilteredCount { get; set; }

    /// <summary>
    /// Indicates if the result set is cached
    /// </summary>
    public bool IsCached { get; set; }

    /// <summary>
    /// Cache key if cached
    /// </summary>
    public string? CacheKey { get; set; }

    /// <summary>
    /// Aggregated values if any
    /// </summary>
    public Dictionary<string, object>? Aggregations { get; set; }
}