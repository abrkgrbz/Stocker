using FluentValidation;

namespace Stocker.Application.Common.Validators;

/// <summary>
/// Ortak kullanılabilir validator sınıfları - Türkçe hata mesajları ile
/// </summary>
public static class CommonValidators
{
    /// <summary>
    /// Adres bilgilerini doğrular
    /// </summary>
    public class AddressValidator<T> : AbstractValidator<T> where T : class
    {
        public AddressValidator(
            Func<T, string?> streetSelector,
            Func<T, string?> citySelector,
            Func<T, string?> countrySelector,
            Func<T, string?> postalCodeSelector,
            bool required = false)
        {
            When(x => required || !string.IsNullOrWhiteSpace(streetSelector(x)), () =>
            {
                RuleFor(x => streetSelector(x))
                    .NotEmpty().WithMessage("Sokak/cadde adresi zorunludur.")
                    .MaximumLength(200).WithMessage("Sokak/cadde adresi en fazla 200 karakter olabilir.");

                RuleFor(x => citySelector(x))
                    .NotEmpty().WithMessage("Şehir zorunludur.")
                    .MaximumLength(100).WithMessage("Şehir en fazla 100 karakter olabilir.");

                RuleFor(x => countrySelector(x))
                    .NotEmpty().WithMessage("Ülke zorunludur.")
                    .MaximumLength(100).WithMessage("Ülke en fazla 100 karakter olabilir.");

                RuleFor(x => postalCodeSelector(x))
                    .MaximumLength(20).WithMessage("Posta kodu en fazla 20 karakter olabilir.");
            });
        }
    }

    /// <summary>
    /// İletişim bilgilerini doğrular
    /// </summary>
    public class ContactInfoValidator<T> : AbstractValidator<T> where T : class
    {
        public ContactInfoValidator(
            Func<T, string?> emailSelector,
            Func<T, string?> phoneSelector,
            bool emailRequired = false,
            bool phoneRequired = false)
        {
            if (emailRequired)
            {
                RuleFor(x => emailSelector(x))
                    .NotEmpty().WithMessage("E-posta adresi zorunludur.")
                    .EmailAddress().WithMessage("Geçersiz e-posta formatı.")
                    .MaximumLength(256).WithMessage("E-posta adresi en fazla 256 karakter olabilir.");
            }
            else
            {
                RuleFor(x => emailSelector(x))
                    .EmailAddress().WithMessage("Geçersiz e-posta formatı.")
                    .When(x => !string.IsNullOrWhiteSpace(emailSelector(x)))
                    .MaximumLength(256).WithMessage("E-posta adresi en fazla 256 karakter olabilir.");
            }

            if (phoneRequired)
            {
                RuleFor(x => phoneSelector(x))
                    .NotEmpty().WithMessage("Telefon numarası zorunludur.")
                    .MaximumLength(20).WithMessage("Telefon numarası en fazla 20 karakter olabilir.");
            }
            else
            {
                RuleFor(x => phoneSelector(x))
                    .MaximumLength(20).WithMessage("Telefon numarası en fazla 20 karakter olabilir.")
                    .When(x => !string.IsNullOrWhiteSpace(phoneSelector(x)));
            }
        }
    }

    /// <summary>
    /// Sayfalama parametrelerini doğrular
    /// </summary>
    public class PaginationValidator<T> : AbstractValidator<T> where T : class
    {
        public PaginationValidator(
            Func<T, int> pageNumberSelector,
            Func<T, int> pageSizeSelector,
            int maxPageSize = 100)
        {
            RuleFor(x => pageNumberSelector(x))
                .GreaterThan(0).WithMessage("Sayfa numarası 0'dan büyük olmalıdır.");

            RuleFor(x => pageSizeSelector(x))
                .GreaterThan(0).WithMessage("Sayfa boyutu 0'dan büyük olmalıdır.")
                .LessThanOrEqualTo(maxPageSize).WithMessage($"Sayfa boyutu en fazla {maxPageSize} olabilir.");
        }
    }

    /// <summary>
    /// Tarih aralığını doğrular
    /// </summary>
    public class DateRangeValidator<T> : AbstractValidator<T> where T : class
    {
        public DateRangeValidator(
            Func<T, DateTime?> startDateSelector,
            Func<T, DateTime?> endDateSelector,
            bool required = false,
            int? maxDaysSpan = null)
        {
            if (required)
            {
                RuleFor(x => startDateSelector(x))
                    .NotNull().WithMessage("Başlangıç tarihi zorunludur.");

                RuleFor(x => endDateSelector(x))
                    .NotNull().WithMessage("Bitiş tarihi zorunludur.");
            }

            When(x => startDateSelector(x).HasValue && endDateSelector(x).HasValue, () =>
            {
                RuleFor(x => endDateSelector(x))
                    .Must((model, endDate) => endDate >= startDateSelector(model))
                    .WithMessage("Bitiş tarihi başlangıç tarihinden sonra veya aynı gün olmalıdır.");

                if (maxDaysSpan.HasValue)
                {
                    RuleFor(x => x)
                        .Must(x =>
                        {
                            var start = startDateSelector(x);
                            var end = endDateSelector(x);
                            return (end!.Value - start!.Value).TotalDays <= maxDaysSpan.Value;
                        })
                        .WithMessage($"Tarih aralığı en fazla {maxDaysSpan} gün olabilir.");
                }
            });
        }
    }

    /// <summary>
    /// Dosya yüklemesini doğrular
    /// </summary>
    public class FileUploadValidator<T> : AbstractValidator<T> where T : class
    {
        public FileUploadValidator(
            Func<T, string?> fileNameSelector,
            Func<T, long> fileSizeSelector,
            string[] allowedExtensions,
            long maxSizeInBytes = 10 * 1024 * 1024) // Varsayılan 10MB
        {
            RuleFor(x => fileNameSelector(x))
                .NotEmpty().WithMessage("Dosya adı zorunludur.")
                .Must(fileName => allowedExtensions.Any(ext =>
                    fileName?.EndsWith(ext, StringComparison.OrdinalIgnoreCase) ?? false))
                .WithMessage($"Dosya şu uzantılardan birine sahip olmalıdır: {string.Join(", ", allowedExtensions)}");

            RuleFor(x => fileSizeSelector(x))
                .GreaterThan(0).WithMessage("Dosya boş olamaz.")
                .LessThanOrEqualTo(maxSizeInBytes)
                .WithMessage($"Dosya boyutu en fazla {maxSizeInBytes / (1024 * 1024)}MB olabilir.");
        }
    }
}

/// <summary>
/// Para/fiyat ile ilgili komutlar için validator
/// </summary>
public class MoneyCommandValidator<T> : AbstractValidator<T> where T : class
{
    public MoneyCommandValidator(
        Func<T, decimal> amountSelector,
        Func<T, string?> currencySelector,
        decimal minAmount = 0,
        decimal maxAmount = 999_999_999.99m)
    {
        RuleFor(x => amountSelector(x))
            .GreaterThanOrEqualTo(minAmount)
            .WithMessage($"Tutar en az {minAmount:N2} olmalıdır.")
            .LessThanOrEqualTo(maxAmount)
            .WithMessage($"Tutar en fazla {maxAmount:N2} olabilir.")
            .ScalePrecision(2, 18)
            .WithMessage("Tutar en fazla 2 ondalık basamak içerebilir.");

        RuleFor(x => currencySelector(x))
            .NotEmpty().WithMessage("Para birimi zorunludur.")
            .Length(3).WithMessage("Para birimi 3 harfli ISO kodu olmalıdır.")
            .Matches("^[A-Z]{3}$").WithMessage("Para birimi geçerli bir 3 harfli ISO kodu olmalıdır (örn: TRY, USD, EUR).");
    }
}
