namespace Stocker.Modules.Inventory.Infrastructure.Caching;

/// <summary>
/// Generic paginated response wrapper for list endpoints.
/// Provides consistent pagination metadata across all inventory endpoints.
/// </summary>
public class PaginatedResponse<T>
{
    public List<T> Items { get; init; } = new();
    public PaginationMetadata Pagination { get; init; } = new();

    public static PaginatedResponse<T> Create(List<T> items, int totalCount, int page, int pageSize)
    {
        return new PaginatedResponse<T>
        {
            Items = items,
            Pagination = new PaginationMetadata
            {
                CurrentPage = page,
                PageSize = pageSize,
                TotalCount = totalCount,
                TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize),
                HasPreviousPage = page > 1,
                HasNextPage = page < (int)Math.Ceiling(totalCount / (double)pageSize)
            }
        };
    }

    public static PaginatedResponse<T> Empty(int page = 1, int pageSize = 20)
    {
        return new PaginatedResponse<T>
        {
            Items = new List<T>(),
            Pagination = new PaginationMetadata
            {
                CurrentPage = page,
                PageSize = pageSize,
                TotalCount = 0,
                TotalPages = 0,
                HasPreviousPage = false,
                HasNextPage = false
            }
        };
    }
}

/// <summary>
/// Pagination metadata included in API responses.
/// </summary>
public class PaginationMetadata
{
    public int CurrentPage { get; init; }
    public int PageSize { get; init; }
    public int TotalCount { get; init; }
    public int TotalPages { get; init; }
    public bool HasPreviousPage { get; init; }
    public bool HasNextPage { get; init; }
}

/// <summary>
/// Standard pagination parameters for query endpoints.
/// </summary>
public class PaginationParams
{
    private int _page = 1;
    private int _pageSize = 20;

    public int Page
    {
        get => _page;
        set => _page = value < 1 ? 1 : value;
    }

    public int PageSize
    {
        get => _pageSize;
        set => _pageSize = value switch
        {
            < 1 => 20,
            > 500 => 500,
            _ => value
        };
    }

    public string? SortBy { get; set; }
    public bool SortDescending { get; set; } = true;
}

/// <summary>
/// Performance timing action filter that adds server timing headers.
/// Helps diagnose slow endpoints.
/// </summary>
[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
public class ServerTimingAttribute : Microsoft.AspNetCore.Mvc.TypeFilterAttribute
{
    public ServerTimingAttribute() : base(typeof(ServerTimingFilter)) { }
}

/// <summary>
/// Filter that measures and reports server-side processing time.
/// </summary>
public class ServerTimingFilter : Microsoft.AspNetCore.Mvc.Filters.IAsyncActionFilter
{
    public async Task OnActionExecutionAsync(
        Microsoft.AspNetCore.Mvc.Filters.ActionExecutingContext context,
        Microsoft.AspNetCore.Mvc.Filters.ActionExecutionDelegate next)
    {
        var stopwatch = System.Diagnostics.Stopwatch.StartNew();

        await next();

        stopwatch.Stop();

        context.HttpContext.Response.Headers["Server-Timing"] =
            $"app;dur={stopwatch.Elapsed.TotalMilliseconds:F1};desc=\"Server Processing\"";
        context.HttpContext.Response.Headers["X-Response-Time-Ms"] =
            stopwatch.Elapsed.TotalMilliseconds.ToString("F1");
    }
}
