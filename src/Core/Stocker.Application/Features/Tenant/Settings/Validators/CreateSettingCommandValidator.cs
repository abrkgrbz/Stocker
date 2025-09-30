using FluentValidation;
using Stocker.Application.Features.Tenant.Settings.Commands;

namespace Stocker.Application.Features.Tenant.Settings.Validators;

public class CreateSettingCommandValidator : AbstractValidator<CreateSettingCommand>
{
    private readonly string[] _validDataTypes = { "string", "number", "boolean", "json", "date", "datetime" };
    private readonly string[] _validCategories = { "Genel", "Güvenlik", "E-posta", "Fatura", "Yerelleştirme", "Sistem" };

    public CreateSettingCommandValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Tenant ID zorunludur")
            .NotEqual(Guid.Empty).WithMessage("Geçerli bir Tenant ID giriniz");

        RuleFor(x => x.SettingKey)
            .NotEmpty().WithMessage("Ayar anahtarı zorunludur")
            .MaximumLength(100).WithMessage("Ayar anahtarı en fazla 100 karakter olabilir")
            .Matches(@"^[a-z][a-z0-9_.]*$").WithMessage("Ayar anahtarı küçük harf ile başlamalı ve sadece küçük harf, rakam, nokta ve alt çizgi içerebilir")
            .Must(NotBeReservedKey).WithMessage("Bu ayar anahtarı sistem tarafından rezerve edilmiştir");

        RuleFor(x => x.SettingValue)
            .NotNull().WithMessage("Ayar değeri null olamaz")
            .MaximumLength(4000).WithMessage("Ayar değeri en fazla 4000 karakter olabilir");

        RuleFor(x => x.Description)
            .MaximumLength(500).WithMessage("Açıklama en fazla 500 karakter olabilir");

        RuleFor(x => x.Category)
            .NotEmpty().WithMessage("Kategori zorunludur")
            .MaximumLength(50).WithMessage("Kategori en fazla 50 karakter olabilir")
            .Must(BeValidCategory).WithMessage($"Kategori şu değerlerden biri olmalıdır: {string.Join(", ", _validCategories)}");

        RuleFor(x => x.DataType)
            .NotEmpty().WithMessage("Veri tipi zorunludur")
            .Must(BeValidDataType).WithMessage($"Veri tipi şu değerlerden biri olmalıdır: {string.Join(", ", _validDataTypes)}");

        // Validate value based on data type
        When(x => x.DataType == "boolean", () =>
        {
            RuleFor(x => x.SettingValue)
                .Must(BeValidBoolean).WithMessage("Boolean tipindeki ayarlar sadece 'true' veya 'false' değeri alabilir");
        });

        When(x => x.DataType == "number", () =>
        {
            RuleFor(x => x.SettingValue)
                .Must(BeValidNumber).WithMessage("Number tipindeki ayarlar sadece sayısal değer alabilir");
        });

        When(x => x.DataType == "date", () =>
        {
            RuleFor(x => x.SettingValue)
                .Must(BeValidDate).WithMessage("Date tipindeki ayarlar geçerli bir tarih formatında olmalıdır (yyyy-MM-dd)");
        });

        When(x => x.DataType == "datetime", () =>
        {
            RuleFor(x => x.SettingValue)
                .Must(BeValidDateTime).WithMessage("DateTime tipindeki ayarlar geçerli bir tarih-saat formatında olmalıdır");
        });

        When(x => x.DataType == "json", () =>
        {
            RuleFor(x => x.SettingValue)
                .Must(BeValidJson).WithMessage("JSON tipindeki ayarlar geçerli JSON formatında olmalıdır");
        });

        // If encrypted, value should not be too long
        When(x => x.IsEncrypted, () =>
        {
            RuleFor(x => x.SettingValue)
                .MaximumLength(2000).WithMessage("Şifrelenmiş değerler en fazla 2000 karakter olabilir");
        });
    }

    private bool NotBeReservedKey(string key)
    {
        if (string.IsNullOrEmpty(key))
            return true; // Let other validators handle null/empty validation
            
        var reservedKeys = new[]
        {
            "system.version",
            "system.build",
            "system.environment",
            "database.connection",
            "api.key",
            "api.secret"
        };

        return !reservedKeys.Contains(key.ToLowerInvariant());
    }

    private bool BeValidCategory(string? category)
    {
        if (string.IsNullOrEmpty(category))
            return false;

        return _validCategories.Contains(category);
    }

    private bool BeValidDataType(string? dataType)
    {
        if (string.IsNullOrEmpty(dataType))
            return false;

        return _validDataTypes.Contains(dataType.ToLowerInvariant());
    }

    private bool BeValidBoolean(string? value)
    {
        if (string.IsNullOrEmpty(value))
            return false;

        return value.Equals("true", StringComparison.OrdinalIgnoreCase) ||
               value.Equals("false", StringComparison.OrdinalIgnoreCase);
    }

    private bool BeValidNumber(string? value)
    {
        if (string.IsNullOrEmpty(value))
            return false;

        // Check for valid number format (int or decimal with single decimal point)
        return decimal.TryParse(value, System.Globalization.NumberStyles.Number,
            System.Globalization.CultureInfo.InvariantCulture, out _);
    }

    private bool BeValidDate(string? value)
    {
        if (string.IsNullOrEmpty(value))
            return false;

        return DateTime.TryParseExact(value, "yyyy-MM-dd", null,
            System.Globalization.DateTimeStyles.None, out _);
    }

    private bool BeValidDateTime(string? value)
    {
        if (string.IsNullOrEmpty(value))
            return false;

        return DateTime.TryParse(value, out _);
    }

    private bool BeValidJson(string? value)
    {
        if (string.IsNullOrEmpty(value))
            return false;

        try
        {
            System.Text.Json.JsonDocument.Parse(value);
            return true;
        }
        catch
        {
            return false;
        }
    }
}