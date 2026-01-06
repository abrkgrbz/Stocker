namespace Stocker.Modules.HR.Application.Common;

/// <summary>
/// Centralized Turkish error messages for HR module
/// All user-facing error messages should be defined here for consistency and maintainability
/// </summary>
public static class HRErrorMessages
{
    // ═══════════════════════════════════════════════════════════════════════════════
    // LEAVE (İZİN) ERRORS
    // ═══════════════════════════════════════════════════════════════════════════════
    public static class Leave
    {
        public const string NotFound = "İzin talebi bulunamadı";
        public const string DateRangeConflict = "Bu tarih aralığında zaten bir izin talebi bulunmaktadır";
        public const string InsufficientBalance = "Yetersiz izin bakiyesi. Mevcut: {0}, Talep edilen: {1}";
        public const string HalfDayNotAllowed = "Bu izin türü için yarım gün izin kullanılamaz";
        public const string InvalidDateRange = "Bitiş tarihi başlangıç tarihinden önce olamaz";
        public const string StartDateInPast = "Başlangıç tarihi geçmişte olamaz";
        public const string AlreadyApproved = "Bu izin talebi zaten onaylanmış";
        public const string AlreadyRejected = "Bu izin talebi zaten reddedilmiş";
        public const string AlreadyCancelled = "Bu izin talebi zaten iptal edilmiş";
        public const string AlreadyTaken = "Kullanılmış izin iptal edilemez";
        public const string AlreadyStarted = "Başlamış izin iptal edilemez";
        public const string CannotCancel = "Bu izin talebi iptal edilemez";
        public const string CannotModify = "Onaylanmış veya reddedilmiş izin talepleri değiştirilemez";
        public const string OnlyPendingCanBeApproved = "Sadece bekleyen izin talepleri onaylanabilir veya reddedilebilir";
        public const string RequiresReason = "İzin nedeni zorunludur";
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // LEAVE TYPE (İZİN TÜRÜ) ERRORS
    // ═══════════════════════════════════════════════════════════════════════════════
    public static class LeaveType
    {
        public const string NotFound = "İzin türü bulunamadı";
        public const string NotActive = "Bu izin türü aktif değil";
        public const string NameExists = "Bu isimde bir izin türü zaten mevcut";
        public const string HasLeaves = "Bu izin türü kullanımda olduğu için silinemez";
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // EMPLOYEE (ÇALIŞAN) ERRORS
    // ═══════════════════════════════════════════════════════════════════════════════
    public static class Employee
    {
        public const string NotFound = "Çalışan bulunamadı";
        public const string SubstituteNotFound = "Vekil çalışan bulunamadı";
        public const string ApproverNotFound = "Onaylayan bulunamadı";
        public const string EmailExists = "Bu e-posta adresi ile kayıtlı bir çalışan zaten mevcut";
        public const string EmployeeCodeExists = "Bu sicil numarası ile kayıtlı bir çalışan zaten mevcut";
        public const string HasActiveLeaves = "Çalışanın aktif izin talepleri bulunmaktadır";
        public const string HasActiveRecords = "Çalışanın aktif kayıtları bulunmaktadır";
        public const string AlreadyTerminated = "Çalışan zaten işten ayrılmış";
        public const string CannotTerminate = "Bu çalışan işten çıkarılamaz";
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // DEPARTMENT (DEPARTMAN) ERRORS
    // ═══════════════════════════════════════════════════════════════════════════════
    public static class Department
    {
        public const string NotFound = "Departman bulunamadı";
        public const string NameExists = "Bu isimde bir departman zaten mevcut";
        public const string HasEmployees = "Bu departmanda çalışanlar bulunmaktadır";
        public const string HasSubDepartments = "Bu departmanın alt departmanları bulunmaktadır";
        public const string ParentNotFound = "Üst departman bulunamadı";
        public const string CircularReference = "Departman kendisinin üst departmanı olamaz";
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // POSITION (POZİSYON) ERRORS
    // ═══════════════════════════════════════════════════════════════════════════════
    public static class Position
    {
        public const string NotFound = "Pozisyon bulunamadı";
        public const string NameExists = "Bu isimde bir pozisyon zaten mevcut";
        public const string HasEmployees = "Bu pozisyonda çalışanlar bulunmaktadır";
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // ATTENDANCE (DEVAM/DEVAMSIZLIK) ERRORS
    // ═══════════════════════════════════════════════════════════════════════════════
    public static class Attendance
    {
        public const string NotFound = "Devam kaydı bulunamadı";
        public const string AlreadyCheckedIn = "Bugün için giriş kaydı zaten mevcut";
        public const string NotCheckedIn = "Henüz giriş kaydı bulunmamaktadır";
        public const string AlreadyCheckedOut = "Çıkış kaydı zaten yapılmış";
        public const string InvalidCheckOutTime = "Çıkış saati giriş saatinden önce olamaz";
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // SHIFT (VARDİYA) ERRORS
    // ═══════════════════════════════════════════════════════════════════════════════
    public static class Shift
    {
        public const string NotFound = "Vardiya bulunamadı";
        public const string NameExists = "Bu isimde bir vardiya zaten mevcut";
        public const string HasEmployees = "Bu vardiyaya atanmış çalışanlar bulunmaktadır";
        public const string InvalidTimeRange = "Vardiya bitiş saati başlangıç saatinden önce olamaz";
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // TRAINING (EĞİTİM) ERRORS
    // ═══════════════════════════════════════════════════════════════════════════════
    public static class Training
    {
        public const string NotFound = "Eğitim bulunamadı";
        public const string AlreadyEnrolled = "Çalışan bu eğitime zaten kayıtlı";
        public const string MaxCapacityReached = "Eğitim kapasitesi dolmuş";
        public const string NotEnrolled = "Çalışan bu eğitime kayıtlı değil";
        public const string AlreadyCompleted = "Bu eğitim zaten tamamlanmış";
        public const string CannotComplete = "Eğitim henüz tamamlanamaz";
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // PAYROLL (BORDRO) ERRORS
    // ═══════════════════════════════════════════════════════════════════════════════
    public static class Payroll
    {
        public const string NotFound = "Bordro bulunamadı";
        public const string AlreadyExists = "Bu dönem için bordro zaten oluşturulmuş";
        public const string AlreadyApproved = "Bu bordro zaten onaylanmış";
        public const string AlreadyPaid = "Bu bordro zaten ödenmiş";
        public const string CannotApprove = "Bu bordro onaylanamaz";
        public const string CannotPay = "Bu bordro ödenemez";
        public const string CannotCalculate = "Bordro hesaplanamadı";
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // PAYSLIP (MAAŞ BORDROSU) ERRORS
    // ═══════════════════════════════════════════════════════════════════════════════
    public static class Payslip
    {
        public const string NotFound = "Maaş bordrosu bulunamadı";
        public const string AlreadyExists = "Bu dönem için maaş bordrosu zaten oluşturulmuş";
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // EXPENSE (MASRAF) ERRORS
    // ═══════════════════════════════════════════════════════════════════════════════
    public static class Expense
    {
        public const string NotFound = "Masraf kaydı bulunamadı";
        public const string AlreadyApproved = "Bu masraf zaten onaylanmış";
        public const string AlreadyRejected = "Bu masraf zaten reddedilmiş";
        public const string AlreadyPaid = "Bu masraf zaten ödenmiş";
        public const string CannotSubmit = "Bu masraf gönderilemez";
        public const string CannotApprove = "Bu masraf onaylanamaz";
        public const string CannotReject = "Bu masraf reddedilemez";
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // PERFORMANCE (PERFORMANS) ERRORS
    // ═══════════════════════════════════════════════════════════════════════════════
    public static class Performance
    {
        public const string ReviewNotFound = "Performans değerlendirmesi bulunamadı";
        public const string GoalNotFound = "Performans hedefi bulunamadı";
        public const string ReviewAlreadyCompleted = "Bu değerlendirme zaten tamamlanmış";
        public const string GoalAlreadyCompleted = "Bu hedef zaten tamamlanmış";
        public const string InvalidRating = "Geçersiz değerlendirme puanı";
        public const string InvalidProgress = "Geçersiz ilerleme değeri (0-100 arası olmalı)";
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // DOCUMENT (BELGE) ERRORS
    // ═══════════════════════════════════════════════════════════════════════════════
    public static class Document
    {
        public const string NotFound = "Belge bulunamadı";
        public const string AlreadyVerified = "Bu belge zaten doğrulanmış";
        public const string Expired = "Bu belgenin süresi dolmuş";
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // ANNOUNCEMENT (DUYURU) ERRORS
    // ═══════════════════════════════════════════════════════════════════════════════
    public static class Announcement
    {
        public const string NotFound = "Duyuru bulunamadı";
        public const string AlreadyPublished = "Bu duyuru zaten yayınlanmış";
        public const string AlreadyAcknowledged = "Bu duyuru zaten okundu olarak işaretlenmiş";
        public const string NotPublished = "Bu duyuru henüz yayınlanmamış";
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // HOLIDAY (TATİL) ERRORS
    // ═══════════════════════════════════════════════════════════════════════════════
    public static class Holiday
    {
        public const string NotFound = "Tatil günü bulunamadı";
        public const string DateExists = "Bu tarihte zaten bir tatil tanımlanmış";
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // WORK LOCATION (ÇALIŞMA LOKASYONU) ERRORS
    // ═══════════════════════════════════════════════════════════════════════════════
    public static class WorkLocation
    {
        public const string NotFound = "Çalışma lokasyonu bulunamadı";
        public const string NameExists = "Bu isimde bir lokasyon zaten mevcut";
        public const string HasEmployees = "Bu lokasyonda çalışanlar bulunmaktadır";
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // WORK SCHEDULE (ÇALIŞMA TAKVİMİ) ERRORS
    // ═══════════════════════════════════════════════════════════════════════════════
    public static class WorkSchedule
    {
        public const string NotFound = "Çalışma takvimi bulunamadı";
        public const string NameExists = "Bu isimde bir çalışma takvimi zaten mevcut";
        public const string HasEmployees = "Bu takvime atanmış çalışanlar bulunmaktadır";
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // OVERTIME (FAZLA MESAİ) ERRORS
    // ═══════════════════════════════════════════════════════════════════════════════
    public static class Overtime
    {
        public const string NotFound = "Fazla mesai kaydı bulunamadı";
        public const string AlreadyApproved = "Bu fazla mesai zaten onaylanmış";
        public const string AlreadyRejected = "Bu fazla mesai zaten reddedilmiş";
        public const string InvalidHours = "Geçersiz mesai saati";
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // TIMESHEET (ZAMAN ÇİZELGESİ) ERRORS
    // ═══════════════════════════════════════════════════════════════════════════════
    public static class TimeSheet
    {
        public const string NotFound = "Zaman çizelgesi bulunamadı";
        public const string AlreadyExists = "Bu dönem için zaman çizelgesi zaten mevcut";
        public const string AlreadySubmitted = "Bu zaman çizelgesi zaten gönderilmiş";
        public const string AlreadyApproved = "Bu zaman çizelgesi zaten onaylanmış";
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // JOB POSTING (İŞ İLANI) ERRORS
    // ═══════════════════════════════════════════════════════════════════════════════
    public static class JobPosting
    {
        public const string NotFound = "İş ilanı bulunamadı";
        public const string AlreadyClosed = "Bu ilan zaten kapatılmış";
        public const string HasApplications = "Bu ilana başvurular bulunmaktadır";
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // JOB APPLICATION (İŞ BAŞVURUSU) ERRORS
    // ═══════════════════════════════════════════════════════════════════════════════
    public static class JobApplication
    {
        public const string NotFound = "İş başvurusu bulunamadı";
        public const string AlreadyExists = "Bu ilana zaten başvuru yapılmış";
        public const string JobPostingClosed = "Bu iş ilanı başvuruya kapalı";
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // INTERVIEW (MÜLAKAT) ERRORS
    // ═══════════════════════════════════════════════════════════════════════════════
    public static class Interview
    {
        public const string NotFound = "Mülakat bulunamadı";
        public const string AlreadyScheduled = "Bu başvuru için mülakat zaten planlanmış";
        public const string InterviewerNotAvailable = "Mülakatçı bu tarihte müsait değil";
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // ONBOARDING (İŞE ALIŞTIRMA) ERRORS
    // ═══════════════════════════════════════════════════════════════════════════════
    public static class Onboarding
    {
        public const string NotFound = "İşe alıştırma kaydı bulunamadı";
        public const string AlreadyCompleted = "İşe alıştırma süreci zaten tamamlanmış";
        public const string CannotDelete = "Tamamlanmış işe alıştırma kaydı silinemez";
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // CAREER PATH (KARİYER YOLU) ERRORS
    // ═══════════════════════════════════════════════════════════════════════════════
    public static class CareerPath
    {
        public const string NotFound = "Kariyer yolu bulunamadı";
        public const string AlreadyExists = "Bu çalışan için kariyer yolu zaten tanımlanmış";
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // CERTIFICATION (SERTİFİKA) ERRORS
    // ═══════════════════════════════════════════════════════════════════════════════
    public static class Certification
    {
        public const string NotFound = "Sertifika bulunamadı";
        public const string AlreadyExists = "Bu sertifika zaten kayıtlı";
        public const string Expired = "Bu sertifikanın süresi dolmuş";
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // EMPLOYEE SKILL (ÇALIŞAN YETKİNLİĞİ) ERRORS
    // ═══════════════════════════════════════════════════════════════════════════════
    public static class EmployeeSkill
    {
        public const string NotFound = "Yetkinlik kaydı bulunamadı";
        public const string AlreadyExists = "Bu yetkinlik zaten tanımlanmış";
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // SUCCESSION PLAN (HALEFİYET PLANI) ERRORS
    // ═══════════════════════════════════════════════════════════════════════════════
    public static class SuccessionPlan
    {
        public const string NotFound = "Halefiyet planı bulunamadı";
        public const string AlreadyExists = "Bu pozisyon için halefiyet planı zaten mevcut";
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // DISCIPLINARY ACTION (DİSİPLİN İŞLEMİ) ERRORS
    // ═══════════════════════════════════════════════════════════════════════════════
    public static class DisciplinaryAction
    {
        public const string NotFound = "Disiplin işlemi bulunamadı";
        public const string AlreadyClosed = "Bu disiplin işlemi zaten kapatılmış";
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // GRIEVANCE (ŞİKAYET) ERRORS
    // ═══════════════════════════════════════════════════════════════════════════════
    public static class Grievance
    {
        public const string NotFound = "Şikayet kaydı bulunamadı";
        public const string AlreadyResolved = "Bu şikayet zaten çözülmüş";
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // EMPLOYEE ASSET (ÇALIŞAN ZİMMETİ) ERRORS
    // ═══════════════════════════════════════════════════════════════════════════════
    public static class EmployeeAsset
    {
        public const string NotFound = "Zimmet kaydı bulunamadı";
        public const string AlreadyReturned = "Bu zimmet zaten iade edilmiş";
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // EMPLOYEE BENEFIT (ÇALIŞAN YANI HAKKI) ERRORS
    // ═══════════════════════════════════════════════════════════════════════════════
    public static class EmployeeBenefit
    {
        public const string NotFound = "Yan hak kaydı bulunamadı";
        public const string AlreadyExists = "Bu yan hak zaten tanımlanmış";
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // GENERAL VALIDATION ERRORS
    // ═══════════════════════════════════════════════════════════════════════════════
    public static class Validation
    {
        public const string Required = "{0} alanı zorunludur";
        public const string InvalidFormat = "{0} formatı geçersiz";
        public const string InvalidValue = "{0} değeri geçersiz";
        public const string MinLength = "{0} en az {1} karakter olmalıdır";
        public const string MaxLength = "{0} en fazla {1} karakter olabilir";
        public const string Range = "{0} değeri {1} ile {2} arasında olmalıdır";
    }
}
