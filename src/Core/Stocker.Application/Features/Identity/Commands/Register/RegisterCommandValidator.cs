using FluentValidation;

namespace Stocker.Application.Features.Identity.Commands.Register;

public sealed class RegisterCommandValidator : AbstractValidator<RegisterCommand>
{
    public RegisterCommandValidator()
    {
        RuleFor(x => x.CompanyName)
            .NotEmpty().WithMessage("Şirket adı zorunludur")
            .MinimumLength(3).WithMessage("Şirket adı en az 3 karakter olmalıdır");

        RuleFor(x => x.CompanyCode)
            .NotEmpty().WithMessage("Şirket kodu zorunludur");

        RuleFor(x => x.IdentityType)
            .NotEmpty().WithMessage("Kimlik türü zorunludur")
            .Must(x => x == "tc" || x == "vergi")
            .WithMessage("Kimlik türü 'tc' veya 'vergi' olmalıdır");

        RuleFor(x => x.IdentityNumber)
            .NotEmpty().WithMessage("Kimlik numarası zorunludur")
            .Must((command, identityNumber) =>
            {
                if (command.IdentityType == "tc")
                    return identityNumber.Length == 11 && identityNumber.All(char.IsDigit);
                if (command.IdentityType == "vergi")
                    return identityNumber.Length == 10 && identityNumber.All(char.IsDigit);
                return false;
            })
            .WithMessage("Geçersiz kimlik numarası formatı");

        RuleFor(x => x.Sector)
            .NotEmpty().WithMessage("Sektör seçimi zorunludur");

        RuleFor(x => x.EmployeeCount)
            .NotEmpty().WithMessage("Çalışan sayısı seçimi zorunludur");

        RuleFor(x => x.ContactName)
            .NotEmpty().WithMessage("İletişim kişisi adı zorunludur")
            .MinimumLength(3).WithMessage("Ad soyad en az 3 karakter olmalıdır");

        RuleFor(x => x.ContactEmail)
            .NotEmpty().WithMessage("E-posta adresi zorunludur")
            .EmailAddress().WithMessage("Geçerli bir e-posta adresi girin");

        RuleFor(x => x.ContactPhone)
            .NotEmpty().WithMessage("Telefon numarası zorunludur")
            .Matches(@"^[0-9]{10,11}$").WithMessage("Geçerli bir telefon numarası girin");

        RuleFor(x => x.ContactTitle)
            .NotEmpty().WithMessage("Unvan zorunludur");

        RuleFor(x => x.Username)
            .NotEmpty().WithMessage("Kullanıcı adı zorunludur")
            .MinimumLength(3).WithMessage("Kullanıcı adı en az 3 karakter olmalıdır");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Şifre zorunludur")
            .MinimumLength(8).WithMessage("Şifre en az 8 karakter olmalıdır")
            .Matches(@"[A-Z]").WithMessage("Şifre en az bir büyük harf içermelidir")
            .Matches(@"[a-z]").WithMessage("Şifre en az bir küçük harf içermelidir")
            .Matches(@"[0-9]").WithMessage("Şifre en az bir rakam içermelidir");

        RuleFor(x => x.Domain)
            .NotEmpty().WithMessage("Domain zorunludur")
            .MinimumLength(3).WithMessage("Domain en az 3 karakter olmalıdır")
            .Matches(@"^[a-z0-9]+$").WithMessage("Domain sadece küçük harf ve rakam içerebilir");
    }
}