namespace Stocker.Web.Admin.Models;

public class ApiResponse<T>
{
    public bool Success { get; set; }
    public T? Data { get; set; }
    public string? Message { get; set; }
    public List<string> Errors { get; set; } = new();
    public DateTime Timestamp { get; set; }
    public string? TraceId { get; set; }
}

public class PagedApiResponse<T>
{
    public bool Success { get; set; }
    public PagedData<T>? Data { get; set; }
    public string? Message { get; set; }
    public List<string> Errors { get; set; } = new();
    public DateTime Timestamp { get; set; }
    public string? TraceId { get; set; }
}

public class PagedData<T>
{
    public List<T> Items { get; set; } = new();
    public int TotalCount { get; set; }
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
}