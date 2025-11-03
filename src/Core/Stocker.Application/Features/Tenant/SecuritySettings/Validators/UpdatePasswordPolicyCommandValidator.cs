using FluentValidation;
using Stocker.Application.Features.Tenant.SecuritySettings.Commands;

namespace Stocker.Application.Features.Tenant.SecuritySettings.Validators;

/// <summary>
/// Validator for UpdatePasswordPolicyCommand
/// </summary>
public class UpdatePasswordPolicyCommandValidator : AbstractValidator<UpdatePasswordPolicyCommand>
{
    public UpdatePasswordPolicyCommandValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty()
            .WithMessage("Tenant ID gerekli");

        RuleFor(x => x.MinPasswordLength)
            .InclusiveBetween(6, 32)
            .WithMessage("Minimum şifre uzunluğu 6-32 karakter arasında olmalıdır");

        RuleFor(x => x.PasswordExpiryDays)
            .GreaterThanOrEqualTo(0)
            .LessThanOrEqualTo(365)
            .WithMessage("Şifre geçerlilik süresi 0-365 gün arasında olmalıdır (0 = süresiz)");

        RuleFor(x => x.PreventPasswordReuse)
            .GreaterThanOrEqualTo(0)
            .LessThanOrEqualTo(10)
            .WithMessage("Şifre tekrar kullanım engeli 0-10 arasında olmalıdır");

        RuleFor(x => x.ModifiedBy)
            .NotEmpty()
            .WithMessage("Değiştiren kullanıcı bilgisi gerekli");
    }
}
