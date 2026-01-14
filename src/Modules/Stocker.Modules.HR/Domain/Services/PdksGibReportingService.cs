namespace Stocker.Modules.HR.Domain.Services;

/// <summary>
/// PDKS (Personel Devam Kontrol Sistemi) GİB Bildirimi Servisi
///
/// Yasal Dayanak:
/// - 5510 Sayılı Sosyal Sigortalar ve Genel Sağlık Sigortası Kanunu
/// - SGK Elektronik Bildirge Yönetmeliği
/// - GİB PDKS Bildirge Sistemi
///
/// Bu servis, çalışan giriş-çıkış kayıtlarını GİB formatında hazırlar.
/// Zorunluluk: 10+ çalışanı olan işyerleri için PDKS bildirimi zorunludur.
/// </summary>
public class PdksGibReportingService : IPdksGibReportingService
{
    /// <summary>
    /// Aylık PDKS bildirimi oluşturur
    /// </summary>
    /// <param name="tenantId">Tenant ID</param>
    /// <param name="workplaceCode">İşyeri SGK sicil numarası</param>
    /// <param name="period">Dönem (YYYYMM formatında)</param>
    /// <param name="attendanceRecords">Puantaj kayıtları</param>
    /// <returns>GİB formatında PDKS bildirisi</returns>
    public PdksGibReport GenerateMonthlyReport(
        Guid tenantId,
        string workplaceCode,
        string period,
        IEnumerable<AttendanceRecord> attendanceRecords)
    {
        ValidateInputs(workplaceCode, period);

        var report = new PdksGibReport
        {
            TenantId = tenantId,
            WorkplaceCode = workplaceCode,
            Period = period,
            GeneratedAt = DateTime.UtcNow,
            Status = PdksReportStatus.Draft,
            Items = new List<PdksGibReportItem>()
        };

        // Çalışan bazında grupla
        var groupedRecords = attendanceRecords
            .GroupBy(r => r.EmployeeId)
            .ToList();

        foreach (var employeeGroup in groupedRecords)
        {
            var item = CreateReportItem(employeeGroup.Key, employeeGroup.ToList(), period);
            report.Items.Add(item);
        }

        // Özet bilgileri hesapla
        report.TotalEmployees = report.Items.Count;
        report.TotalWorkDays = report.Items.Sum(i => i.WorkDays);
        report.TotalWorkHours = report.Items.Sum(i => i.TotalHours);
        report.TotalOvertimeHours = report.Items.Sum(i => i.OvertimeHours);

        return report;
    }

    /// <summary>
    /// PDKS bildirisi doğrulama
    /// </summary>
    public PdksValidationResult ValidateReport(PdksGibReport report)
    {
        var errors = new List<string>();
        var warnings = new List<string>();

        // İşyeri kodu kontrolü
        if (string.IsNullOrEmpty(report.WorkplaceCode) || report.WorkplaceCode.Length < 10)
        {
            errors.Add("Geçersiz SGK işyeri sicil numarası.");
        }

        // Dönem kontrolü
        if (!IsValidPeriod(report.Period))
        {
            errors.Add("Geçersiz dönem formatı. YYYYMM formatında olmalıdır.");
        }

        // Çalışan sayısı kontrolü
        if (report.TotalEmployees == 0)
        {
            warnings.Add("Bildirilecek çalışan kaydı bulunmamaktadır.");
        }

        // Her çalışan için kontrol
        foreach (var item in report.Items)
        {
            // TC Kimlik No kontrolü
            if (string.IsNullOrEmpty(item.NationalId) || item.NationalId.Length != 11)
            {
                errors.Add($"Çalışan {item.EmployeeCode}: Geçersiz TC Kimlik No.");
            }

            // Çalışma saati kontrolü (haftalık 45 saat aşımı)
            if (item.WeeklyAverageHours > 45)
            {
                warnings.Add($"Çalışan {item.EmployeeCode}: Haftalık ortalama çalışma saati 45 saati aşıyor ({item.WeeklyAverageHours:F1} saat).");
            }

            // Günlük çalışma saati kontrolü (11 saat maksimum)
            if (item.MaxDailyHours > 11)
            {
                warnings.Add($"Çalışan {item.EmployeeCode}: Günlük maksimum çalışma saati 11 saati aşıyor ({item.MaxDailyHours:F1} saat).");
            }

            // Eksik gün kontrolü
            if (item.AbsentDays > 0 && string.IsNullOrEmpty(item.AbsenceReasonCode))
            {
                errors.Add($"Çalışan {item.EmployeeCode}: Eksik gün için neden kodu belirtilmeli.");
            }
        }

        return new PdksValidationResult
        {
            IsValid = errors.Count == 0,
            Errors = errors,
            Warnings = warnings
        };
    }

    /// <summary>
    /// GİB formatında XML çıktısı oluşturur
    /// </summary>
    public string GenerateGibXml(PdksGibReport report)
    {
        var xml = new System.Text.StringBuilder();

        xml.AppendLine("<?xml version=\"1.0\" encoding=\"UTF-8\"?>");
        xml.AppendLine("<PdksBildirge xmlns=\"http://www.gib.gov.tr/pdks\">");
        xml.AppendLine($"  <IsyeriKodu>{report.WorkplaceCode}</IsyeriKodu>");
        xml.AppendLine($"  <Donem>{report.Period}</Donem>");
        xml.AppendLine($"  <OlusturmaTarihi>{report.GeneratedAt:yyyy-MM-ddTHH:mm:ss}</OlusturmaTarihi>");
        xml.AppendLine($"  <ToplamCalisan>{report.TotalEmployees}</ToplamCalisan>");
        xml.AppendLine("  <Calisanlar>");

        foreach (var item in report.Items)
        {
            xml.AppendLine("    <Calisan>");
            xml.AppendLine($"      <TcKimlikNo>{item.NationalId}</TcKimlikNo>");
            xml.AppendLine($"      <SicilNo>{item.EmployeeCode}</SicilNo>");
            xml.AppendLine($"      <AdSoyad>{item.FullName}</AdSoyad>");
            xml.AppendLine($"      <CalismaGunSayisi>{item.WorkDays}</CalismaGunSayisi>");
            xml.AppendLine($"      <ToplamCalismaS aati>{item.TotalHours:F2}</ToplamCalismaS aati>");
            xml.AppendLine($"      <FazlaMesaiSaati>{item.OvertimeHours:F2}</FazlaMesaiSaati>");
            xml.AppendLine($"      <EksikGunSayisi>{item.AbsentDays}</EksikGunSayisi>");

            if (!string.IsNullOrEmpty(item.AbsenceReasonCode))
            {
                xml.AppendLine($"      <EksikGunNedeni>{item.AbsenceReasonCode}</EksikGunNedeni>");
            }

            xml.AppendLine("      <GunlukKayitlar>");
            foreach (var daily in item.DailyRecords)
            {
                xml.AppendLine("        <Gun>");
                xml.AppendLine($"          <Tarih>{daily.Date:yyyy-MM-dd}</Tarih>");
                xml.AppendLine($"          <GirisSaati>{daily.CheckIn:HH:mm}</GirisSaati>");
                xml.AppendLine($"          <CikisSaati>{daily.CheckOut:HH:mm}</CikisSaati>");
                xml.AppendLine($"          <CalismaSuresi>{daily.WorkHours:F2}</CalismaSuresi>");
                xml.AppendLine($"          <MolaSuresi>{daily.BreakMinutes}</MolaSuresi>");
                xml.AppendLine("        </Gun>");
            }
            xml.AppendLine("      </GunlukKayitlar>");
            xml.AppendLine("    </Calisan>");
        }

        xml.AppendLine("  </Calisanlar>");
        xml.AppendLine($"  <Ozet>");
        xml.AppendLine($"    <ToplamIsGunu>{report.TotalWorkDays}</ToplamIsGunu>");
        xml.AppendLine($"    <ToplamCalismaS aati>{report.TotalWorkHours:F2}</ToplamCalismaS aati>");
        xml.AppendLine($"    <ToplamFazlaMesai>{report.TotalOvertimeHours:F2}</ToplamFazlaMesai>");
        xml.AppendLine($"  </Ozet>");
        xml.AppendLine("</PdksBildirge>");

        return xml.ToString();
    }

    /// <summary>
    /// Eksik gün kodları (SGK)
    /// </summary>
    public static IReadOnlyDictionary<string, string> GetAbsenceReasonCodes()
    {
        return new Dictionary<string, string>
        {
            { "01", "İstirahat" },
            { "02", "Ücretsiz/Aylıksız İzin" },
            { "03", "Disiplin Cezası" },
            { "04", "Gözaltına Alınma" },
            { "05", "Tutukluluk" },
            { "06", "Kısmi İstihdam" },
            { "07", "Puantaj Kayıtları" },
            { "08", "Grev" },
            { "09", "Lokavt" },
            { "10", "Genel Hayatı Etkileyen Olaylar" },
            { "11", "Doğal Afet" },
            { "12", "Birden Fazla" },
            { "13", "Diğer" },
            { "14", "Devamsızlık" },
            { "15", "Fesih Tarihinde Eksik" },
            { "16", "Kısa Çalışma Ödeneği" },
            { "17", "Yarım Çalışma" },
            { "18", "Yarım Çalışma (Engelli Çocuk)" },
            { "19", "Askerlik Borçlanması (67 gün)" },
            { "20", "Yarım Çalışma (7 yaş altı)" },
            { "21", "Pandemi Ücretsiz İzin" },
            { "22", "Pandemi Kısa Çalışma" },
            { "23", "Yoğun Bakım (Engelli Çocuk)" }
        };
    }

    private PdksGibReportItem CreateReportItem(int employeeId, List<AttendanceRecord> records, string period)
    {
        var firstRecord = records.First();
        var periodDays = GetPeriodWorkDays(period);

        var workDays = records.Count(r => r.WorkHours > 0);
        var totalHours = records.Sum(r => r.WorkHours);
        var overtimeHours = records.Sum(r => Math.Max(0, r.WorkHours - 7.5m)); // Günlük 7.5 saat üzeri
        var absentDays = periodDays - workDays;

        return new PdksGibReportItem
        {
            EmployeeId = employeeId,
            EmployeeCode = firstRecord.EmployeeCode,
            NationalId = firstRecord.NationalId,
            FullName = firstRecord.FullName,
            WorkDays = workDays,
            TotalHours = totalHours,
            OvertimeHours = overtimeHours,
            AbsentDays = absentDays,
            AbsenceReasonCode = absentDays > 0 ? "07" : null, // Varsayılan: Puantaj
            WeeklyAverageHours = totalHours / Math.Max(1, workDays / 5m),
            MaxDailyHours = records.Max(r => r.WorkHours),
            DailyRecords = records.Select(r => new PdksDailyRecord
            {
                Date = r.Date,
                CheckIn = r.CheckIn,
                CheckOut = r.CheckOut,
                WorkHours = r.WorkHours,
                BreakMinutes = r.BreakMinutes
            }).ToList()
        };
    }

    private int GetPeriodWorkDays(string period)
    {
        // YYYYMM formatından ayın iş günü sayısını hesapla
        if (int.TryParse(period.Substring(0, 4), out int year) &&
            int.TryParse(period.Substring(4, 2), out int month))
        {
            var daysInMonth = DateTime.DaysInMonth(year, month);
            int workDays = 0;

            for (int day = 1; day <= daysInMonth; day++)
            {
                var date = new DateTime(year, month, day);
                if (date.DayOfWeek != DayOfWeek.Saturday && date.DayOfWeek != DayOfWeek.Sunday)
                {
                    workDays++;
                }
            }

            return workDays;
        }

        return 22; // Varsayılan
    }

    private void ValidateInputs(string workplaceCode, string period)
    {
        if (string.IsNullOrWhiteSpace(workplaceCode))
            throw new ArgumentException("İşyeri kodu boş olamaz.", nameof(workplaceCode));

        if (!IsValidPeriod(period))
            throw new ArgumentException("Geçersiz dönem formatı. YYYYMM formatında olmalıdır.", nameof(period));
    }

    private bool IsValidPeriod(string period)
    {
        if (string.IsNullOrEmpty(period) || period.Length != 6)
            return false;

        if (!int.TryParse(period.Substring(0, 4), out int year) ||
            !int.TryParse(period.Substring(4, 2), out int month))
            return false;

        return year >= 2020 && year <= 2100 && month >= 1 && month <= 12;
    }
}

#region Interfaces and Models

/// <summary>
/// PDKS GİB Raporlama Servisi Interface
/// </summary>
public interface IPdksGibReportingService
{
    PdksGibReport GenerateMonthlyReport(Guid tenantId, string workplaceCode, string period, IEnumerable<AttendanceRecord> attendanceRecords);
    PdksValidationResult ValidateReport(PdksGibReport report);
    string GenerateGibXml(PdksGibReport report);
}

/// <summary>
/// Puantaj kaydı
/// </summary>
public class AttendanceRecord
{
    public int EmployeeId { get; set; }
    public string EmployeeCode { get; set; } = string.Empty;
    public string NationalId { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public DateTime CheckIn { get; set; }
    public DateTime CheckOut { get; set; }
    public decimal WorkHours { get; set; }
    public int BreakMinutes { get; set; }
}

/// <summary>
/// PDKS GİB Raporu
/// </summary>
public class PdksGibReport
{
    public Guid TenantId { get; set; }
    public string WorkplaceCode { get; set; } = string.Empty;
    public string Period { get; set; } = string.Empty;
    public DateTime GeneratedAt { get; set; }
    public PdksReportStatus Status { get; set; }
    public List<PdksGibReportItem> Items { get; set; } = new();
    public int TotalEmployees { get; set; }
    public int TotalWorkDays { get; set; }
    public decimal TotalWorkHours { get; set; }
    public decimal TotalOvertimeHours { get; set; }
}

/// <summary>
/// PDKS Rapor Kalemi
/// </summary>
public class PdksGibReportItem
{
    public int EmployeeId { get; set; }
    public string EmployeeCode { get; set; } = string.Empty;
    public string NationalId { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public int WorkDays { get; set; }
    public decimal TotalHours { get; set; }
    public decimal OvertimeHours { get; set; }
    public int AbsentDays { get; set; }
    public string? AbsenceReasonCode { get; set; }
    public decimal WeeklyAverageHours { get; set; }
    public decimal MaxDailyHours { get; set; }
    public List<PdksDailyRecord> DailyRecords { get; set; } = new();
}

/// <summary>
/// Günlük PDKS Kaydı
/// </summary>
public class PdksDailyRecord
{
    public DateTime Date { get; set; }
    public DateTime CheckIn { get; set; }
    public DateTime CheckOut { get; set; }
    public decimal WorkHours { get; set; }
    public int BreakMinutes { get; set; }
}

/// <summary>
/// PDKS Doğrulama Sonucu
/// </summary>
public class PdksValidationResult
{
    public bool IsValid { get; set; }
    public List<string> Errors { get; set; } = new();
    public List<string> Warnings { get; set; } = new();
}

/// <summary>
/// PDKS Rapor Durumu
/// </summary>
public enum PdksReportStatus
{
    Draft,      // Taslak
    Validated,  // Doğrulandı
    Submitted,  // Gönderildi
    Accepted,   // Kabul edildi
    Rejected    // Reddedildi
}

#endregion
