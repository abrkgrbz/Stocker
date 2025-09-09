namespace Stocker.Application.Common.Interfaces;

public interface ICurrentUserService
{
    string? UserId { get; }
    string? UserName { get; }
    string? Email { get; }
    string? TenantId { get; }
    bool IsAuthenticated { get; }
    bool IsMasterAdmin { get; }
    string[]? Roles { get; }
    Dictionary<string, string>? Claims { get; }
}