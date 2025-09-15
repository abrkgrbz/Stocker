namespace Stocker.SharedKernel.Pagination;

/// <summary>
/// Represents pagination parameters for a request
/// </summary>
public class PaginationRequest
{
    private const int MaxPageSize = 100;
    private int _pageSize = 10;

    public int PageNumber { get; set; } = 1;

    public int PageSize
    {
        get => _pageSize;
        set => _pageSize = value > MaxPageSize ? MaxPageSize : value;
    }

    public string? SortBy { get; set; }
    public bool SortDescending { get; set; }
    public string? SearchTerm { get; set; }

    public int Skip => (PageNumber - 1) * PageSize;
    public int Take => PageSize;
}