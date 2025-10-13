using MediatR;
using Stocker.Application.DTOs.Auth;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Identity.Commands.Login;

public record LoginCommand : IRequest<Result<AuthResponse>>
{
    public string Email { get; init; } = string.Empty;
    public string Password { get; init; } = string.Empty;
    public string? IpAddress { get; init; }
    public string? UserAgent { get; init; }
}

public class AuthResponse
{
    public string AccessToken { get; set; } = string.Empty;
    public string RefreshToken { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public string TokenType { get; set; } = "Bearer";
    public UserInfo User { get; set; } = new();
    public bool Requires2FA { get; set; }
    public string? TempToken { get; set; }
}

public class UserInfo
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string? FullName { get; set; }
    public List<string> Roles { get; set; } = new();
    public Guid? TenantId { get; set; }
    public string? TenantName { get; set; }
}