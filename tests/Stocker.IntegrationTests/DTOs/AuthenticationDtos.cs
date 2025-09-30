namespace Stocker.IntegrationTests.DTOs;

public class ApiResponseWrapper<T>
{
    public bool Success { get; set; }
    public T? Data { get; set; }
    public string? Message { get; set; }
    public List<string>? Errors { get; set; }
    public DateTime Timestamp { get; set; }
}

public class LoginResponseDto
{
    public string AccessToken { get; set; } = default!;
    public string RefreshToken { get; set; } = default!;
    public DateTime ExpiresAt { get; set; }
    public string TokenType { get; set; } = default!;
    public UserInfoDto User { get; set; } = default!;
}

public class UserInfoDto
{
    public Guid Id { get; set; }
    public string Email { get; set; } = default!;
    public string Username { get; set; } = default!;
    public string? FullName { get; set; }
    public List<string> Roles { get; set; } = new();
    public Guid? TenantId { get; set; }
    public string? TenantName { get; set; }
}

public class RegisterResponseDto
{
    public bool Success { get; set; }
    public Guid UserId { get; set; }
    public string? Message { get; set; }
}

public class TenantDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = default!;
    public string Code { get; set; } = default!;
    public string? Domain { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public TenantSubscriptionDto? Subscription { get; set; }
}

public class TenantSubscriptionDto
{
    public string PackageName { get; set; } = default!;
    public string Status { get; set; } = default!;
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
}

public class PaginatedListDto<T>
{
    public List<T> Items { get; set; } = new();
    public int TotalCount { get; set; }
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
    public int TotalPages => (int)Math.Ceiling(TotalCount / (double)PageSize);
}

public class TenantStatisticsDto
{
    public int UserCount { get; set; }
    public bool ActiveSubscription { get; set; }
    public string? PackageName { get; set; }
    public int CompanyCount { get; set; }
    public int BranchCount { get; set; }
    public decimal MonthlyRevenue { get; set; }
}

public class TenantListDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string Domain { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public string? ContactEmail { get; set; }
    public string PackageName { get; set; } = string.Empty;
    public DateTime CreatedDate { get; set; }
    public DateTime? SubscriptionEndDate { get; set; }
}