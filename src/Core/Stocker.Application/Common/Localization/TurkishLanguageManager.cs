using FluentValidation.Resources;

namespace Stocker.Application.Common.Localization;

public class TurkishLanguageManager : LanguageManager
{
    public TurkishLanguageManager()
    {
        AddTranslation("tr", "EmailValidator", "'{PropertyName}' geçerli bir e-posta adresi değil.");
        AddTranslation("tr", "GreaterThanOrEqualValidator", "'{PropertyName}' değeri '{ComparisonValue}' değerinden büyük veya eşit olmalıdır.");
        AddTranslation("tr", "GreaterThanValidator", "'{PropertyName}' değeri '{ComparisonValue}' değerinden büyük olmalıdır.");
        AddTranslation("tr", "LengthValidator", "'{PropertyName}' {MinLength} ile {MaxLength} karakter arasında olmalıdır. {TotalLength} karakter girdiniz.");
        AddTranslation("tr", "MinimumLengthValidator", "'{PropertyName}' en az {MinLength} karakter olmalıdır. {TotalLength} karakter girdiniz.");
        AddTranslation("tr", "MaximumLengthValidator", "'{PropertyName}' en fazla {MaxLength} karakter olmalıdır. {TotalLength} karakter girdiniz.");
        AddTranslation("tr", "LessThanOrEqualValidator", "'{PropertyName}' değeri '{ComparisonValue}' değerinden küçük veya eşit olmalıdır.");
        AddTranslation("tr", "LessThanValidator", "'{PropertyName}' değeri '{ComparisonValue}' değerinden küçük olmalıdır.");
        AddTranslation("tr", "NotEmptyValidator", "'{PropertyName}' boş olamaz.");
        AddTranslation("tr", "NotEqualValidator", "'{PropertyName}' değeri '{ComparisonValue}' değerine eşit olmamalıdır.");
        AddTranslation("tr", "NotNullValidator", "'{PropertyName}' boş olamaz.");
        AddTranslation("tr", "PredicateValidator", "'{PropertyName}' için belirtilen koşul sağlanmadı.");
        AddTranslation("tr", "AsyncPredicateValidator", "'{PropertyName}' için belirtilen koşul sağlanmadı.");
        AddTranslation("tr", "RegularExpressionValidator", "'{PropertyName}' doğru formatta değil.");
        AddTranslation("tr", "EqualValidator", "'{PropertyName}' değeri '{ComparisonValue}' değerine eşit olmalıdır.");
        AddTranslation("tr", "ExactLengthValidator", "'{PropertyName}' tam olarak {MaxLength} karakter olmalıdır. {TotalLength} karakter girdiniz.");
        AddTranslation("tr", "InclusiveBetweenValidator", "'{PropertyName}' {From} ile {To} arasında olmalıdır. {PropertyValue} değerini girdiniz.");
        AddTranslation("tr", "ExclusiveBetweenValidator", "'{PropertyName}' {From} ile {To} arasında olmalıdır (sınırlar hariç). {PropertyValue} değerini girdiniz.");
        AddTranslation("tr", "CreditCardValidator", "'{PropertyName}' geçerli bir kredi kartı numarası değil.");
        AddTranslation("tr", "ScalePrecisionValidator", "'{PropertyName}' toplamda {ExpectedPrecision} basamaktan fazla olamaz, {ExpectedScale} ondalık basamağa izin verilir. {Digits} basamak ve {ActualScale} ondalık basamak bulundu.");
        AddTranslation("tr", "EmptyValidator", "'{PropertyName}' boş olmalıdır.");
        AddTranslation("tr", "NullValidator", "'{PropertyName}' boş olmalıdır.");
        AddTranslation("tr", "EnumValidator", "'{PropertyName}' değeri '{PropertyValue}' geçerli değil.");
        
        // Custom property names
        AddTranslation("tr", "PropertyName_Email", "E-posta");
        AddTranslation("tr", "PropertyName_Password", "Şifre");
        AddTranslation("tr", "PropertyName_Username", "Kullanıcı Adı");
        AddTranslation("tr", "PropertyName_FirstName", "Ad");
        AddTranslation("tr", "PropertyName_LastName", "Soyad");
        AddTranslation("tr", "PropertyName_Phone", "Telefon");
        AddTranslation("tr", "PropertyName_CompanyName", "Şirket Adı");
        AddTranslation("tr", "PropertyName_Domain", "Domain");
        AddTranslation("tr", "PropertyName_IdentityNumber", "Kimlik Numarası");
    }
}