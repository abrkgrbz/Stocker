namespace Stocker.Application.Common.Resources;

/// <summary>
/// Centralized error messages for localization
/// </summary>
public static class ErrorMessages
{
    // General Errors
    public const string UnexpectedError = "Beklenmeyen bir hata oluştu. Lütfen daha sonra tekrar deneyin.";
    public const string ValidationError = "Bir veya daha fazla doğrulama hatası oluştu.";
    public const string UnauthorizedAccess = "Bu kaynağa erişim yetkiniz bulunmamaktadır.";
    public const string ForbiddenAccess = "Bu kaynağa erişim yasaklanmıştır.";
    public const string ResourceNotFound = "İstenen kaynak bulunamadı.";
    public const string ConflictError = "İşlem mevcut durumla çakışmaktadır.";

    // Authentication Errors
    public const string InvalidCredentials = "E-posta veya şifre hatalı.";
    public const string AccountLocked = "Hesabınız kilitlenmiştir. Lütfen destek ile iletişime geçin.";
    public const string AccountNotActive = "Hesabınız aktif değil.";
    public const string EmailNotVerified = "Giriş yapmadan önce lütfen e-posta adresinizi doğrulayın.";
    public const string InvalidRefreshToken = "Geçersiz veya süresi dolmuş yenileme token'ı.";
    public const string TokenExpired = "Oturumunuzun süresi doldu. Lütfen tekrar giriş yapın.";

    // Tenant Errors
    public const string TenantNotFound = "Kiracı bulunamadı.";
    public const string TenantAlreadyExists = "Bu kodla bir kiracı zaten mevcut.";
    public const string TenantNotActive = "Kiracı aktif değil.";
    public const string TenantQuotaExceeded = "Kiracı kotası aşıldı.";

    // User Errors
    public const string UserNotFound = "Kullanıcı bulunamadı.";
    public const string UserAlreadyExists = "Bu e-posta adresiyle bir kullanıcı zaten mevcut.";
    public const string InvalidPassword = "Şifre güvenlik gereksinimlerini karşılamıyor.";
    public const string PasswordResetTokenInvalid = "Geçersiz veya süresi dolmuş şifre sıfırlama token'ı.";

    // Package Errors
    public const string PackageNotFound = "Paket bulunamadı.";
    public const string PackageNotActive = "Seçilen paket aktif değil.";
    public const string PackageDowngradeNotAllowed = "Bu pakete düşürme yapılamaz.";

    // Subscription Errors
    public const string SubscriptionNotFound = "Abonelik bulunamadı.";
    public const string SubscriptionExpired = "Aboneliğinizin süresi doldu.";
    public const string PaymentRequired = "Devam etmek için ödeme gereklidir.";
    public const string TrialExpired = "Deneme süreniz sona erdi.";

    // Business Rule Errors
    public const string InvalidOperation = "Bu işlem mevcut bağlamda geçerli değil.";
    public const string DuplicateEntry = "Aynı anahtarla bir kayıt zaten mevcut.";
    public const string InvalidDateRange = "Tarih aralığı geçersiz.";
    public const string MaximumLimitReached = "Maksimum limite ulaşıldı.";

    // Infrastructure Errors
    public const string DatabaseConnectionError = "Veritabanına bağlanılamıyor.";
    public const string ExternalServiceError = "Harici bir servis şu anda kullanılamıyor.";
    public const string FileUploadError = "Dosya yükleme başarısız.";
    public const string EmailSendError = "E-posta gönderilemedi.";
}