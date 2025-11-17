using MediatR;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Identity.Commands.Register;

/// <summary>
/// Minimal registration command - Paraşüt-inspired PLG model
/// Only collects essential information: Email, Password, Team Name, Full Name
/// </summary>
public sealed record RegisterCommand : IRequest<Result<RegisterResponse>>
{
    // Essential fields only
    public string Email { get; init; } = string.Empty;
    public string Password { get; init; } = string.Empty;
    public string TeamName { get; init; } = string.Empty; // Subdomain: [teamname].stoocker.app
    public string FirstName { get; init; } = string.Empty;
    public string LastName { get; init; } = string.Empty;

    // Deprecated fields - kept for backward compatibility, will be removed
    [Obsolete("No longer required in minimal registration flow")]
    public string CompanyName { get; init; } = string.Empty;

    [Obsolete("No longer required in minimal registration flow")]
    public string CompanyCode { get; init; } = string.Empty;

    [Obsolete("No longer required - causing 99% abandonment rate")]
    public string IdentityType { get; init; } = string.Empty;

    [Obsolete("No longer required - causing 99% abandonment rate")]
    public string IdentityNumber { get; init; } = string.Empty;

    [Obsolete("No longer required in minimal registration flow")]
    public string Sector { get; init; } = string.Empty;

    [Obsolete("No longer required in minimal registration flow")]
    public string EmployeeCount { get; init; } = string.Empty;

    [Obsolete("No longer required in minimal registration flow")]
    public string ContactName { get; init; } = string.Empty;

    [Obsolete("No longer required in minimal registration flow")]
    public string ContactEmail { get; init; } = string.Empty;

    [Obsolete("No longer required in minimal registration flow")]
    public string ContactPhone { get; init; } = string.Empty;

    [Obsolete("No longer required in minimal registration flow")]
    public string ContactTitle { get; init; } = string.Empty;

    [Obsolete("Use Email instead")]
    public string Username { get; init; } = string.Empty;

    [Obsolete("Use TeamName instead")]
    public string Domain { get; init; } = string.Empty;
}
