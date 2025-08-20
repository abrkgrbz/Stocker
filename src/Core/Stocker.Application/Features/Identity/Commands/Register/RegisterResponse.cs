namespace Stocker.Application.Features.Identity.Commands.Register;

public sealed class RegisterResponse
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public Guid UserId { get; set; }
    public Guid TenantId { get; set; }
    public Guid CompanyId { get; set; }
    
    // Auto-login fields
    public string Token { get; set; } = string.Empty;
    public string RefreshToken { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string CompanyName { get; set; } = string.Empty;
    
    // Subdomain info
    public string Subdomain { get; set; } = string.Empty;
    public string SubdomainUrl { get; set; } = string.Empty;
    
    // Flow control fields
    public bool RequiresEmailVerification { get; set; }
    public string RedirectUrl { get; set; } = string.Empty;
}