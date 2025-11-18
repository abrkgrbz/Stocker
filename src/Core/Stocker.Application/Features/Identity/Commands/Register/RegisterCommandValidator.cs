using FluentValidation;

namespace Stocker.Application.Features.Identity.Commands.Register;

/// <summary>
/// Minimal registration validator - Paraşüt-inspired PLG model
/// Only validates essential fields for quick signup
/// Additional details collected in onboarding flow
/// </summary>
public sealed class RegisterCommandValidator : AbstractValidator<RegisterCommand>
{
    public RegisterCommandValidator()
    {
        // Essential fields for minimal registration
        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("E-posta adresi zorunludur")
            .EmailAddress().WithMessage("Geçerli bir e-posta adresi girin");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Şifre zorunludur")
            .MinimumLength(8).WithMessage("Şifre en az 8 karakter olmalıdır")
            .Matches(@"[A-Z]").WithMessage("Şifre en az bir büyük harf içermelidir")
            .Matches(@"[a-z]").WithMessage("Şifre en az bir küçük harf içermelidir")
            .Matches(@"[0-9]").WithMessage("Şifre en az bir rakam içermelidir");

        RuleFor(x => x.TeamName)
            .NotEmpty().WithMessage("Takım adı zorunludur")
            .MinimumLength(3).WithMessage("Takım adı en az 3 karakter olmalıdır")
            .Matches(@"^[a-z0-9]+$").WithMessage("Takım adı sadece küçük harf ve rakam içerebilir");

        RuleFor(x => x.FirstName)
            .NotEmpty().WithMessage("Ad zorunludur")
            .MinimumLength(2).WithMessage("Ad en az 2 karakter olmalıdır");

        RuleFor(x => x.LastName)
            .NotEmpty().WithMessage("Soyad zorunludur")
            .MinimumLength(2).WithMessage("Soyad en az 2 karakter olmalıdır");

        // NOTE: All other fields (CompanyName, CompanyCode, IdentityType, IdentityNumber,
        // Sector, EmployeeCount, ContactName, ContactEmail, ContactPhone, ContactTitle,
        // Username, Domain) are deprecated and collected during onboarding flow instead.
        // This reduces abandonment rate from 99% to <10% (Paraşüt model).
    }
}
