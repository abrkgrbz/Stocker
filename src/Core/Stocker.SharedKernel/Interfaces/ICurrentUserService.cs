namespace Stocker.SharedKernel.Interfaces;

public interface ICurrentUserService
{
    Guid? UserId { get; }
    string? UserName { get; }
    string? Email { get; }
    Guid? TenantId { get; }
    bool IsAuthenticated { get; }
    bool IsSuperAdmin { get; }
    string? Role { get; }
    IEnumerable<string> Permissions { get; }
}