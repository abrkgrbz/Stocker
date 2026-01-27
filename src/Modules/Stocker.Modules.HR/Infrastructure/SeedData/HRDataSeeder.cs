using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Modules.HR.Domain.Entities;
using Stocker.Modules.HR.Domain.Enums;
using Stocker.Modules.HR.Infrastructure.Persistence;

namespace Stocker.Modules.HR.Infrastructure.SeedData;

/// <summary>
/// HR modülü için varsayılan seed data
/// İzin türleri, resmi tatiller, vardiyalar
/// </summary>
public class HRDataSeeder
{
    private readonly HRDbContext _context;
    private readonly ILogger<HRDataSeeder> _logger;
    private readonly Guid _tenantId;

    public HRDataSeeder(
        HRDbContext context,
        ILogger<HRDataSeeder> logger,
        Guid tenantId)
    {
        _context = context ?? throw new ArgumentNullException(nameof(context));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        _tenantId = tenantId;
    }

    /// <summary>
    /// Tüm seed data'yı yükle
    /// </summary>
    public async Task SeedAsync()
    {
        await SeedLeaveTypesAsync();
        await SeedHolidaysAsync();
        await SeedShiftsAsync();
        await _context.SaveChangesAsync();

        _logger.LogInformation("HR seed data completed for tenant: {TenantId}", _tenantId);
    }

    #region Leave Types - İzin Türleri

    private async Task SeedLeaveTypesAsync()
    {
        if (await _context.LeaveTypes.IgnoreQueryFilters().AnyAsync(lt => lt.TenantId == _tenantId))
        {
            _logger.LogInformation("Leave types already seeded for tenant: {TenantId}", _tenantId);
            return;
        }

        var leaveTypes = new List<LeaveType>();

        // Yıllık İzin (4857 sayılı İş Kanunu Madde 53)
        var yillikIzin = CreateLeaveType(
            "YILLIK", "Yıllık Ücretli İzin", 14,
            isPaid: true, requiresApproval: true,
            description: "4857 sayılı İş Kanunu'na göre yıllık ücretli izin",
            minNoticeDays: 7,
            maxDays: 26,
            isCarryForward: true, maxCarryForwardDays: 14,
            color: "#3B82F6", displayOrder: 1);

        // Hastalık İzni
        var hastalikIzni = CreateLeaveType(
            "HASTALIK", "Hastalık İzni", 0,
            isPaid: true, requiresApproval: true, requiresDocument: true,
            description: "Sağlık raporu ile belgelenen hastalık izni",
            minNoticeDays: 0,
            color: "#EF4444", displayOrder: 2);

        // Mazeret İzni
        var mazeretIzni = CreateLeaveType(
            "MAZERET", "Mazeret İzni", 5,
            isPaid: true, requiresApproval: true,
            description: "Kişisel mazeret izni",
            minNoticeDays: 1, allowHalfDay: true,
            color: "#F59E0B", displayOrder: 3);

        // Evlilik İzni (İş Kanunu uygulaması)
        var evlilikIzni = CreateLeaveType(
            "EVLILIK", "Evlilik İzni", 3,
            isPaid: true, requiresApproval: true, requiresDocument: true,
            description: "Evlilik durumunda verilen izin",
            minNoticeDays: 7,
            color: "#EC4899", displayOrder: 4);

        // Doğum İzni (4857 sayılı İş Kanunu Madde 74)
        var dogumIzni = CreateLeaveType(
            "DOGUM", "Doğum İzni", 112,
            isPaid: true, requiresApproval: true, requiresDocument: true,
            description: "Doğum öncesi 8 hafta, doğum sonrası 8 hafta (toplam 16 hafta)",
            minNoticeDays: 0,
            color: "#8B5CF6", displayOrder: 5);

        // Babalık İzni
        var babalikIzni = CreateLeaveType(
            "BABALIK", "Babalık İzni", 5,
            isPaid: true, requiresApproval: true, requiresDocument: true,
            description: "Eşin doğum yapması halinde verilen izin",
            minNoticeDays: 0,
            color: "#06B6D4", displayOrder: 6);

        // Ölüm İzni
        var olumIzni = CreateLeaveType(
            "OLUM", "Ölüm İzni", 3,
            isPaid: true, requiresApproval: true, requiresDocument: true,
            description: "1. derece yakın ölümünde verilen izin",
            minNoticeDays: 0,
            color: "#6B7280", displayOrder: 7);

        // Süt İzni (4857 sayılı İş Kanunu Madde 74)
        var sutIzni = CreateLeaveType(
            "SUT", "Süt İzni", 0,
            isPaid: true, requiresApproval: false,
            description: "1 yaşından küçük çocuğu olan annelere günde 1.5 saat",
            minNoticeDays: 0, allowHalfDay: true,
            color: "#14B8A6", displayOrder: 8);

        // Ücretsiz İzin
        var ucretsizIzin = CreateLeaveType(
            "UCRETSIZ", "Ücretsiz İzin", 0,
            isPaid: false, requiresApproval: true,
            description: "Ücret ödenmeksizin kullanılan izin",
            minNoticeDays: 7,
            color: "#9CA3AF", displayOrder: 9);

        // İdari İzin
        var idariIzin = CreateLeaveType(
            "IDARI", "İdari İzin", 0,
            isPaid: true, requiresApproval: false,
            description: "İşveren tarafından verilen idari izin",
            minNoticeDays: 0,
            color: "#64748B", displayOrder: 10);

        leaveTypes.AddRange(new[] {
            yillikIzin, hastalikIzni, mazeretIzni, evlilikIzni,
            dogumIzni, babalikIzni, olumIzni, sutIzni,
            ucretsizIzin, idariIzin
        });

        await _context.LeaveTypes.AddRangeAsync(leaveTypes);
        _logger.LogInformation("Seeded {Count} leave types for tenant: {TenantId}", leaveTypes.Count, _tenantId);
    }

    private LeaveType CreateLeaveType(
        string code,
        string name,
        decimal defaultDays,
        bool isPaid = true,
        bool requiresApproval = true,
        bool requiresDocument = false,
        string? description = null,
        int minNoticeDays = 0,
        decimal? maxDays = null,
        bool allowHalfDay = true,
        bool allowNegativeBalance = false,
        bool isCarryForward = false,
        decimal? maxCarryForwardDays = null,
        int? carryForwardExpiryMonths = null,
        string? color = null,
        int displayOrder = 0)
    {
        var leaveType = new LeaveType(code, name, defaultDays, isPaid, requiresApproval, description, minNoticeDays);

        leaveType.Update(name, description, defaultDays, maxDays, isPaid, requiresApproval,
            requiresDocument, minNoticeDays, allowHalfDay, allowNegativeBalance);

        if (isCarryForward)
        {
            leaveType.SetCarryForwardPolicy(true, maxCarryForwardDays, carryForwardExpiryMonths);
        }

        if (!string.IsNullOrEmpty(color))
        {
            leaveType.SetColor(color);
        }

        leaveType.SetDisplayOrder(displayOrder);
        leaveType.SetTenantId(_tenantId);

        return leaveType;
    }

    #endregion

    #region Holidays - Resmi Tatiller

    private async Task SeedHolidaysAsync()
    {
        if (await _context.Holidays.IgnoreQueryFilters().AnyAsync(h => h.TenantId == _tenantId))
        {
            _logger.LogInformation("Holidays already seeded for tenant: {TenantId}", _tenantId);
            return;
        }

        var currentYear = DateTime.Now.Year;
        var holidays = new List<Holiday>();

        // Yılbaşı (1 Ocak)
        holidays.Add(CreateHoliday(
            "Yılbaşı", new DateTime(currentYear, 1, 1),
            isRecurring: true,
            description: "Yılbaşı tatili"));

        // Ulusal Egemenlik ve Çocuk Bayramı (23 Nisan)
        holidays.Add(CreateHoliday(
            "Ulusal Egemenlik ve Çocuk Bayramı", new DateTime(currentYear, 4, 23),
            isRecurring: true,
            description: "23 Nisan Ulusal Egemenlik ve Çocuk Bayramı"));

        // Emek ve Dayanışma Günü (1 Mayıs)
        holidays.Add(CreateHoliday(
            "Emek ve Dayanışma Günü", new DateTime(currentYear, 5, 1),
            isRecurring: true,
            description: "1 Mayıs İşçi Bayramı"));

        // Atatürk'ü Anma, Gençlik ve Spor Bayramı (19 Mayıs)
        holidays.Add(CreateHoliday(
            "Atatürk'ü Anma, Gençlik ve Spor Bayramı", new DateTime(currentYear, 5, 19),
            isRecurring: true,
            description: "19 Mayıs Gençlik ve Spor Bayramı"));

        // Demokrasi ve Milli Birlik Günü (15 Temmuz)
        holidays.Add(CreateHoliday(
            "Demokrasi ve Milli Birlik Günü", new DateTime(currentYear, 7, 15),
            isRecurring: true,
            description: "15 Temmuz Demokrasi ve Milli Birlik Günü"));

        // Zafer Bayramı (30 Ağustos)
        holidays.Add(CreateHoliday(
            "Zafer Bayramı", new DateTime(currentYear, 8, 30),
            isRecurring: true,
            description: "30 Ağustos Zafer Bayramı"));

        // Cumhuriyet Bayramı (29 Ekim)
        // Arife günü yarım gün dahil
        holidays.Add(CreateHoliday(
            "Cumhuriyet Bayramı Arifesi", new DateTime(currentYear, 10, 28),
            isRecurring: true, isHalfDay: true,
            description: "28 Ekim Cumhuriyet Bayramı Arifesi (yarım gün)"));

        holidays.Add(CreateHoliday(
            "Cumhuriyet Bayramı", new DateTime(currentYear, 10, 29),
            isRecurring: true,
            description: "29 Ekim Cumhuriyet Bayramı"));

        // 2025 Ramazan Bayramı tahmini (değişken tarih)
        // Not: Dini bayramlar her yıl farklı tarihlere denk gelir
        holidays.Add(CreateHoliday(
            "Ramazan Bayramı", new DateTime(2025, 3, 30),
            endDate: new DateTime(2025, 4, 1),
            isRecurring: false,
            description: "Ramazan Bayramı (3 gün)"));

        // 2025 Kurban Bayramı tahmini (değişken tarih)
        holidays.Add(CreateHoliday(
            "Kurban Bayramı", new DateTime(2025, 6, 6),
            endDate: new DateTime(2025, 6, 9),
            isRecurring: false,
            description: "Kurban Bayramı (4 gün)"));

        // 2026 Ramazan Bayramı tahmini
        holidays.Add(CreateHoliday(
            "Ramazan Bayramı", new DateTime(2026, 3, 20),
            endDate: new DateTime(2026, 3, 22),
            isRecurring: false,
            description: "Ramazan Bayramı (3 gün)"));

        // 2026 Kurban Bayramı tahmini
        holidays.Add(CreateHoliday(
            "Kurban Bayramı", new DateTime(2026, 5, 27),
            endDate: new DateTime(2026, 5, 30),
            isRecurring: false,
            description: "Kurban Bayramı (4 gün)"));

        await _context.Holidays.AddRangeAsync(holidays);
        _logger.LogInformation("Seeded {Count} holidays for tenant: {TenantId}", holidays.Count, _tenantId);
    }

    private Holiday CreateHoliday(
        string name,
        DateTime date,
        DateTime? endDate = null,
        bool isRecurring = false,
        bool isHalfDay = false,
        string? description = null)
    {
        var holiday = new Holiday(name, date, endDate, isRecurring, isHalfDay, description);
        holiday.SetTenantId(_tenantId);
        return holiday;
    }

    #endregion

    #region Shifts - Vardiyalar

    private async Task SeedShiftsAsync()
    {
        if (await _context.Shifts.IgnoreQueryFilters().AnyAsync(s => s.TenantId == _tenantId))
        {
            _logger.LogInformation("Shifts already seeded for tenant: {TenantId}", _tenantId);
            return;
        }

        var shifts = new List<Shift>();

        // Standart Mesai (08:00-17:00)
        shifts.Add(CreateShift(
            "STANDART", "Standart Mesai", ShiftType.FullDay,
            new TimeSpan(8, 0, 0), new TimeSpan(17, 0, 0),
            breakMinutes: 60,
            description: "Standart ofis mesaisi (08:00-17:00)"));

        // Sabah Vardiyası (06:00-14:00)
        shifts.Add(CreateShift(
            "SABAH", "Sabah Vardiyası", ShiftType.Morning,
            new TimeSpan(6, 0, 0), new TimeSpan(14, 0, 0),
            breakMinutes: 30,
            description: "Sabah vardiyası (06:00-14:00)"));

        // Akşam Vardiyası (14:00-22:00)
        shifts.Add(CreateShift(
            "AKSAM", "Akşam Vardiyası", ShiftType.Evening,
            new TimeSpan(14, 0, 0), new TimeSpan(22, 0, 0),
            breakMinutes: 30,
            description: "Akşam vardiyası (14:00-22:00)"));

        // Gece Vardiyası (22:00-06:00)
        shifts.Add(CreateShift(
            "GECE", "Gece Vardiyası", ShiftType.Night,
            new TimeSpan(22, 0, 0), new TimeSpan(6, 0, 0),
            breakMinutes: 30,
            description: "Gece vardiyası (22:00-06:00)"));

        // Esnek Mesai (09:00-18:00)
        var esnekShift = CreateShift(
            "ESNEK", "Esnek Mesai", ShiftType.Flexible,
            new TimeSpan(9, 0, 0), new TimeSpan(18, 0, 0),
            breakMinutes: 60,
            description: "Esnek çalışma saatleri (09:00-18:00)");
        esnekShift.SetFlexibleHours(true, new TimeSpan(8, 0, 0), new TimeSpan(10, 0, 0));
        shifts.Add(esnekShift);

        // Part-Time Sabah (09:00-13:00)
        shifts.Add(CreateShift(
            "PART-SABAH", "Part-Time Sabah", ShiftType.Morning,
            new TimeSpan(9, 0, 0), new TimeSpan(13, 0, 0),
            breakMinutes: 0,
            description: "Yarı zamanlı sabah (09:00-13:00)"));

        // Part-Time Öğleden Sonra (14:00-18:00)
        shifts.Add(CreateShift(
            "PART-OGLEDEN", "Part-Time Öğleden Sonra", ShiftType.Afternoon,
            new TimeSpan(14, 0, 0), new TimeSpan(18, 0, 0),
            breakMinutes: 0,
            description: "Yarı zamanlı öğleden sonra (14:00-18:00)"));

        await _context.Shifts.AddRangeAsync(shifts);
        _logger.LogInformation("Seeded {Count} shifts for tenant: {TenantId}", shifts.Count, _tenantId);
    }

    private Shift CreateShift(
        string code,
        string name,
        ShiftType shiftType,
        TimeSpan startTime,
        TimeSpan endTime,
        int breakMinutes = 60,
        int gracePeriodMinutes = 15,
        string? description = null)
    {
        var shift = new Shift(code, name, shiftType, startTime, endTime, breakMinutes, gracePeriodMinutes, description);
        shift.SetTenantId(_tenantId);
        return shift;
    }

    #endregion
}
