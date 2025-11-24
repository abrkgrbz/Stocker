namespace Stocker.Application.Features.TenantRegistration.Commands.VerifyEmail;

/// <summary>
/// Response for email verification containing registration ID for SignalR subscription
/// </summary>
public sealed record VerifyTenantEmailResponse
{
    /// <summary>
    /// Whether email verification was successful
    /// </summary>
    public bool Success { get; init; }

    /// <summary>
    /// Registration ID for subscribing to tenant creation progress updates via SignalR
    /// </summary>
    public Guid RegistrationId { get; init; }

    /// <summary>
    /// Optional message for additional context
    /// </summary>
    public string? Message { get; init; }
}
