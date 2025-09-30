using FluentValidation;
using Stocker.Application.Features.Tenant.Settings.Commands;
using System.Text.RegularExpressions;

namespace Stocker.Application.Features.Tenant.Settings.Validators;

public class UpdateSettingCommandValidator : AbstractValidator<UpdateSettingCommand>
{
    public UpdateSettingCommandValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Tenant ID zorunludur")
            .NotEqual(Guid.Empty).WithMessage("Geçerli bir Tenant ID giriniz");

        RuleFor(x => x.SettingKey)
            .NotEmpty().WithMessage("Ayar anahtarı zorunludur")
            .MaximumLength(100).WithMessage("Ayar anahtarı en fazla 100 karakter olabilir")
            .Matches(@"^[a-z][a-z0-9_.]*$").WithMessage("Ayar anahtarı küçük harf ile başlamalı ve sadece küçük harf, rakam, nokta ve alt çizgi içerebilir");

        RuleFor(x => x.SettingValue)
            .NotNull().WithMessage("Ayar değeri null olamaz")
            .MaximumLength(4000).WithMessage("Ayar değeri en fazla 4000 karakter olabilir")
            .Must(BeValidBasedOnKey).WithMessage("Ayar değeri, ayar tipine uygun değil");

        // Email validations
        When(x => !string.IsNullOrEmpty(x.SettingKey) && x.SettingKey.Contains("email"), () =>
        {
            RuleFor(x => x.SettingValue)
                .EmailAddress().When(x => !string.IsNullOrEmpty(x.SettingValue))
                .WithMessage("Geçerli bir email adresi giriniz");
        });

        // URL validations
        When(x => !string.IsNullOrEmpty(x.SettingKey) && (x.SettingKey.Contains("url") || x.SettingKey.Contains("website")), () =>
        {
            RuleFor(x => x.SettingValue)
                .Must(BeValidUrl).When(x => !string.IsNullOrEmpty(x.SettingValue))
                .WithMessage("Geçerli bir URL giriniz");
        });

        // Phone validations
        When(x => !string.IsNullOrEmpty(x.SettingKey) && (x.SettingKey.Contains("phone") || x.SettingKey.Contains("tel")), () =>
        {
            RuleFor(x => x.SettingValue)
                .Must(BeValidPhoneNumber)
                .When(x => !string.IsNullOrEmpty(x.SettingValue))
                .WithMessage("Geçerli bir telefon numarası giriniz");
        });

        // Tax number validations
        When(x => !string.IsNullOrEmpty(x.SettingKey) && x.SettingKey.Contains("tax"), () =>
        {
            RuleFor(x => x.SettingValue)
                .Matches(@"^\d{10,11}$").When(x => !string.IsNullOrEmpty(x.SettingValue))
                .WithMessage("Vergi numarası 10 veya 11 haneli olmalıdır");
        });

        // Number validations
        When(x => !string.IsNullOrEmpty(x.SettingKey) && (x.SettingKey.Contains("limit") || x.SettingKey.Contains("count") || x.SettingKey.Contains("size")), () =>
        {
            RuleFor(x => x.SettingValue)
                .Must(BeNumeric).When(x => !string.IsNullOrEmpty(x.SettingValue))
                .WithMessage("Bu alan sadece sayı içerebilir");
        });

        // Boolean validations
        When(x => !string.IsNullOrEmpty(x.SettingKey) && (x.SettingKey.Contains("enabled") || x.SettingKey.Contains("active") || x.SettingKey.Contains("allow")), () =>
        {
            RuleFor(x => x.SettingValue)
                .Must(BeBoolean).When(x => !string.IsNullOrEmpty(x.SettingValue))
                .WithMessage("Bu alan sadece 'true' veya 'false' değeri alabilir");
        });
    }

    private bool BeValidBasedOnKey(UpdateSettingCommand command, string value)
    {
        // Skip validation for empty values (they might be optional)
        if (string.IsNullOrEmpty(value))
            return true;

        // Add more complex validations based on setting key patterns
        return true;
    }

    private bool BeValidUrl(string? url)
    {
        if (string.IsNullOrEmpty(url))
            return true;

        return Uri.TryCreate(url, UriKind.Absolute, out var result) &&
               (result.Scheme == Uri.UriSchemeHttp || result.Scheme == Uri.UriSchemeHttps);
    }

    private bool BeNumeric(string? value)
    {
        if (string.IsNullOrEmpty(value))
            return true;

        // Check for valid number format (int or decimal with single decimal point)
        return decimal.TryParse(value, System.Globalization.NumberStyles.Number,
            System.Globalization.CultureInfo.InvariantCulture, out _);
    }

    private bool BeBoolean(string? value)
    {
        if (string.IsNullOrEmpty(value))
            return true;

        return value.Equals("true", StringComparison.OrdinalIgnoreCase) ||
               value.Equals("false", StringComparison.OrdinalIgnoreCase);
    }

    private bool BeValidPhoneNumber(string? phoneNumber)
    {
        if (string.IsNullOrEmpty(phoneNumber))
            return true;

        // Remove all non-digit characters
        var digitsOnly = Regex.Replace(phoneNumber, @"[^\d]", "");

        // Phone number should be between 7 and 15 digits
        // Raw phone number should not exceed 17 characters (allowing for formatting)
        return digitsOnly.Length >= 7 && digitsOnly.Length <= 15 && phoneNumber.Length <= 17;
    }
}