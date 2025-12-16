using MediatR;
using Stocker.SharedKernel.Results;
using Stocker.Application.DTOs.TenantRegistration;

namespace Stocker.Application.Features.TenantRegistration.Commands.CreateTenantRegistration;

public sealed class CreateTenantRegistrationCommand : IRequest<Result<TenantRegistrationDto>>
{
    // Minimal Registration - Other details collected via Setup Wizard after login

    // Required fields
    public string Email { get; set; } = string.Empty; // Used for both admin and contact
    public string Password { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string TeamName { get; set; } = string.Empty; // Used as company code/subdomain

    // Optional for registration
    public bool AcceptTerms { get; set; }
    public bool AcceptPrivacyPolicy { get; set; }

    // Security - reCAPTCHA v3 token
    public string? CaptchaToken { get; set; }
}