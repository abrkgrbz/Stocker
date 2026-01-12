namespace Stocker.Modules.Manufacturing.Domain.Enums;

/// <summary>
/// Üretim emri durumu
/// </summary>
public enum ProductionOrderStatus
{
    Taslak = 0,
    Planlandı = 1,
    Onaylandı = 2,
    Serbest = 3,
    Başladı = 4,
    Beklemede = 5,
    Tamamlandı = 6,
    Kapatıldı = 7,
    İptal = 8
}

/// <summary>
/// Üretim emri tipi
/// </summary>
public enum ProductionOrderType
{
    Normal = 0,
    Yeniden_İşleme = 1,
    Montaj = 2,
    Demontaj = 3,
    Numune = 4,
    Prototip = 5,
    Bakım = 6
}

/// <summary>
/// Üretim emri önceliği
/// </summary>
public enum ProductionOrderPriority
{
    Düşük = 0,
    Normal = 1,
    Yüksek = 2,
    Acil = 3,
    Kritik = 4
}

/// <summary>
/// Operasyon durumu
/// </summary>
public enum OperationStatus
{
    Beklemede = 0,
    Hazır = 1,
    Başladı = 2,
    Devam_Ediyor = 3,
    Duraklatıldı = 4,
    Tamamlandı = 5,
    İptal = 6,
    Atlandi = 7
}

/// <summary>
/// İş merkezi tipi
/// </summary>
public enum WorkCenterType
{
    Makine = 0,
    İş_İstasyonu = 1,
    Hat = 2,
    Hücre = 3,
    Taşeron = 4,
    Manuel = 5
}

/// <summary>
/// İş merkezi durumu
/// </summary>
public enum WorkCenterStatus
{
    Aktif = 0,
    Pasif = 1,
    Bakımda = 2,
    Arızalı = 3,
    Kurulumda = 4
}

/// <summary>
/// Makine durumu
/// </summary>
public enum MachineStatus
{
    Çalışıyor = 0,
    Boşta = 1,
    Setup = 2,
    Bakımda = 3,
    Arızalı = 4,
    Kapalı = 5
}

/// <summary>
/// Ürün reçetesi (BOM) tipi
/// </summary>
public enum BomType
{
    Üretim = 0,
    Mühendislik = 1,
    Phantom = 2,
    Konfigürasyon = 3
}

/// <summary>
/// Yan ürün (Co-Product) tipi
/// </summary>
public enum CoProductType
{
    Ana_Ürün = 0,
    Yan_Ürün = 1,
    Hurda = 2
}

/// <summary>
/// Maliyet dağıtım yöntemi
/// </summary>
public enum CostAllocationMethod
{
    Miktar_Bazlı = 0,
    Değer_Bazlı = 1,
    Ağırlık_Bazlı = 2,
    Sabit_Yüzde = 3
}

/// <summary>
/// Ürün reçetesi (BOM) durumu
/// </summary>
public enum BomStatus
{
    Taslak = 0,
    Onaylandı = 1,
    Aktif = 2,
    Pasif = 3,
    Geçersiz = 4
}

/// <summary>
/// BOM satır tipi
/// </summary>
public enum BomLineType
{
    Standard = 0,
    Hammadde = 1,
    Yarı_Mamul = 2,
    Ambalaj = 3,
    Yardımcı_Malzeme = 4,
    Phantom = 5
}

/// <summary>
/// Rota durumu
/// </summary>
public enum RoutingStatus
{
    Taslak = 0,
    Onaylandı = 1,
    Aktif = 2,
    Pasif = 3,
    Geçersiz = 4
}

/// <summary>
/// Operasyon tipi
/// </summary>
public enum OperationType
{
    Üretim = 0,
    Setup = 1,
    Kalite_Kontrol = 2,
    Paketleme = 3,
    Transfer = 4,
    Bekleme = 5,
    Taşeron = 6
}

/// <summary>
/// Kalite kontrol sonucu
/// </summary>
public enum QualityResult
{
    Beklemede = 0,
    Geçti = 1,
    Kaldı = 2,
    Şartlı_Geçti = 3,
    Yeniden_Test = 4
}

/// <summary>
/// Kalite kontrol tipi
/// </summary>
public enum QualityInspectionType
{
    Girdi = 0,
    Proses = 1,
    Final = 2,
    Rutin = 3,
    Özel = 4
}

/// <summary>
/// Karar (disposition) tipi
/// </summary>
public enum DispositionDecision
{
    Kabul = 0,
    Red = 1,
    Yeniden_İşleme = 2,
    İmha = 3,
    Şartlı_Kabul = 4,
    İade = 5
}

/// <summary>
/// Duruş tipi
/// </summary>
public enum DowntimeType
{
    Planlı = 0,
    Plansız = 1
}

/// <summary>
/// Duruş kategorisi
/// </summary>
public enum DowntimeCategory
{
    Arıza = 0,
    Bakım = 1,
    Setup = 2,
    Malzeme_Bekleme = 3,
    Operatör = 4,
    Kalite = 5,
    Enerji = 6,
    Diğer = 7
}

/// <summary>
/// Zaman kaydı tipi
/// </summary>
public enum TimeLogType
{
    Setup = 0,
    Run = 1,
    Wait = 2,
    Move = 3,
    Queue = 4,
    Inspection = 5
}

/// <summary>
/// Maliyet yöntemi
/// </summary>
public enum CostingMethod
{
    Yedi_A = 0,         // 7/A
    Yedi_B = 1,         // 7/B
    Standart = 2,
    Fiili = 3,
    ABC = 4             // Activity Based Costing
}

/// <summary>
/// Maliyet türü
/// </summary>
public enum CostType
{
    Direkt = 0,
    Endirekt = 1
}

/// <summary>
/// Maliyet kategorisi
/// </summary>
public enum CostCategory
{
    Malzeme = 0,
    İşçilik = 1,
    GÜG = 2,            // Genel Üretim Giderleri
    Amortisman = 3,
    Enerji = 4,
    Diğer = 5
}

/// <summary>
/// Dağıtım anahtarı
/// </summary>
public enum AllocationBasis
{
    İşçilik_Saati = 0,
    Makine_Saati = 1,
    Üretim_Miktarı = 2,
    Direkt_Maliyet = 3,
    Yüzey_Alanı = 4,
    Ağırlık = 5
}

/// <summary>
/// Numune alma yöntemi
/// </summary>
public enum SamplingMethod
{
    Rastgele = 0,
    Sistematik = 1,
    Tabakalı = 2,
    Yüzde_100 = 3
}

/// <summary>
/// Gün tipi (takvim)
/// </summary>
public enum DayType
{
    Normal = 0,
    Tatil = 1,
    Bakım = 2,
    Kapalı = 3
}

/// <summary>
/// OEE kategorisi
/// </summary>
public enum OEECategory
{
    Kullanılabilirlik = 0,
    Performans = 1,
    Kalite = 2
}

/// <summary>
/// Malzeme tüketim yöntemi
/// </summary>
public enum ConsumptionMethod
{
    Manuel = 0,
    Otomatik = 1,
    Backflush = 2
}

/// <summary>
/// Malzeme tüketim zamanlaması
/// </summary>
public enum ConsumptionTiming
{
    Operasyon_Başlangıcı = 0,
    Operasyon_Bitişi = 1,
    Üretim_Girişi = 2
}

/// <summary>
/// Malzeme tüketim tipi
/// </summary>
public enum ConsumptionType
{
    Normal = 0,
    Ek_Tüketim = 1,
    Düzeltme = 2,
    İade = 3
}

/// <summary>
/// Üretim operasyonu durumu
/// </summary>
public enum ProductionOperationStatus
{
    Beklemede = 0,
    Hazır = 1,
    Başladı = 2,
    Devam_Ediyor = 3,
    Duraklatıldı = 4,
    Tamamlandı = 5,
    İptal = 6,
    Atlandı = 7
}

/// <summary>
/// Üretim emri satır tipi
/// </summary>
public enum ProductionOrderLineType
{
    Ana_Ürün = 0,
    Yan_Ürün = 1,
    İkincil_Ürün = 2,
    Material = 3
}

/// <summary>
/// Üretim emri satır durumu
/// </summary>
public enum ProductionOrderLineStatus
{
    Pending = 0,
    PartiallyReserved = 1,
    FullyReserved = 2,
    PartiallyIssued = 3,
    Completed = 4,
    Cancelled = 5
}

/// <summary>
/// Rota tipi
/// </summary>
public enum RoutingType
{
    Üretim = 0,
    Mühendislik = 1,
    Taşeron = 2,
    Bakım = 3,
    Alternatif = 4
}

// ========== MRP/MPS Enums ==========

/// <summary>
/// MRP Plan tipi
/// </summary>
public enum MrpPlanType
{
    Regenerative = 0,     // Tam yeniden hesaplama
    NetChange = 1,        // Sadece değişiklikler
    NetChangeHorizon = 2  // Belirli dönem için net değişim
}

/// <summary>
/// MRP Plan durumu
/// </summary>
public enum MrpPlanStatus
{
    Taslak = 0,
    Hazır = 1,
    Çalışıyor = 2,
    Tamamlandı = 3,
    Onaylandı = 4,
    Hatalı = 5,
    İptal = 6
}

/// <summary>
/// Lot boyutlandırma yöntemi
/// </summary>
public enum LotSizingMethod
{
    LotForLot = 0,        // L4L - Her dönem için ayrı sipariş
    FixedOrderQuantity = 1, // FOQ - Sabit sipariş miktarı
    EconomicOrderQuantity = 2, // EOQ - Ekonomik sipariş miktarı
    PeriodsOfSupply = 3,  // POQ - Dönemlik tedarik
    MinMaxOrder = 4       // Min-Max sipariş miktarı
}

/// <summary>
/// Planlı sipariş tipi
/// </summary>
public enum PlannedOrderType
{
    ÜretimEmri = 0,
    SatınAlmaSiparişi = 1,
    TransferEmri = 2,
    TaşeronEmri = 3
}

/// <summary>
/// Planlı sipariş durumu
/// </summary>
public enum PlannedOrderStatus
{
    Önerildi = 0,
    Onaylandı = 1,
    Serbest = 2,
    Dönüştürüldü = 3,
    İptal = 4
}

/// <summary>
/// MRP İstisna tipi
/// </summary>
public enum MrpExceptionType
{
    BomEksik = 0,
    RotaEksik = 1,
    LeadTimeAşımı = 2,
    KapasiteYetersiz = 3,
    StokYetersiz = 4,
    TedarikçiEksik = 5,
    TarihÇakışması = 6,
    MiktarUyumsuzluğu = 7,
    BirimUyumsuzluğu = 8,
    DöngüselBağımlılık = 9
}

/// <summary>
/// MRP İstisna önem derecesi
/// </summary>
public enum MrpExceptionSeverity
{
    Bilgi = 0,
    Düşük = 1,
    Orta = 2,
    Yüksek = 3,
    Kritik = 4
}

/// <summary>
/// MPS durumu
/// </summary>
public enum MpsStatus
{
    Taslak = 0,
    Onay_Bekliyor = 1,
    Onaylandı = 2,
    Aktif = 3,
    Tamamlandı = 4,
    İptal = 5
}

/// <summary>
/// MPS dönem tipi
/// </summary>
public enum MpsPeriodType
{
    Günlük = 0,
    Haftalık = 1,
    Aylık = 2
}

/// <summary>
/// MPS çit (fence) tipi
/// </summary>
public enum MpsFenceType
{
    Frozen = 0,   // Dondurulmuş - değiştirilemez
    Slushy = 1,   // Yarı esnek - onay gerekir
    Free = 2      // Esnek - serbestçe değiştirilebilir
}

// ========== CRP Enums ==========

/// <summary>
/// Kapasite yükleme tipi
/// </summary>
public enum CapacityLoadType
{
    Setup = 0,
    Run = 1,
    Queue = 2,
    Move = 3,
    Total = 4
}

/// <summary>
/// Kapasite durumu
/// </summary>
public enum CapacityStatus
{
    Uygun = 0,       // < 80%
    Yüksek = 1,      // 80-100%
    Aşırı = 2,       // > 100%
    Darboğaz = 3     // Kritik
}

// ========== Fason Enums ==========

/// <summary>
/// Fason iş emri durumu
/// </summary>
public enum SubcontractOrderStatus
{
    Taslak = 0,
    Onaylandı = 1,
    MalzemeGönderildi = 2,
    ÜretimdeGönderildi = 3,
    Tamamlandı = 4,
    Kapatıldı = 5,
    İptal = 6
}

/// <summary>
/// Fason sevkiyat tipi
/// </summary>
public enum SubcontractShipmentType
{
    MalzemeSevk = 0,
    MamulTesellüm = 1,
    FireTesellüm = 2,
    İade = 3
}

// ========== Cost Accounting Enums ==========

/// <summary>
/// Maliyet muhasebesi yöntemi
/// </summary>
public enum CostAccountingMethod
{
    Yedi_A = 0,   // 7/A - Fonksiyon esaslı (Üretim Maliyeti, Satış, Yönetim, Ar-Ge)
    Yedi_B = 1    // 7/B - Çeşit esaslı (Malzeme, İşçilik, Amortisman, Dışarıdan Sağlanan Fayda)
}

/// <summary>
/// Maliyet dağıtım yönü
/// </summary>
public enum CostAllocationDirection
{
    Borç = 0,     // Debit
    Alacak = 1    // Credit
}

/// <summary>
/// Maliyet merkezi tipi
/// </summary>
public enum CostCenterType
{
    Üretim = 0,           // Üretim maliyet merkezi
    Yardımcı = 1,         // Yardımcı üretim yeri
    Servis = 2,           // Servis/destek birimi
    Yönetim = 3,          // Yönetim birimi
    Satış = 4,            // Satış ve pazarlama
    ArGe = 5              // Ar-Ge birimi
}

// Note: CapacityPlanStatus, CapacityExceptionType, CapacityExceptionSeverity are defined in CapacityPlan.cs

// ========== KPI Dashboard Enums ==========

/// <summary>
/// KPI tipi
/// </summary>
public enum KpiType
{
    OEE = 0,                    // Overall Equipment Effectiveness
    Verimlilik = 1,             // Production Efficiency
    Kalite = 2,                 // Quality Rate
    Kapasite = 3,               // Capacity Utilization
    TeslimPerformansi = 4,      // On-Time Delivery
    MaliyetVaryansi = 5,        // Cost Variance
    Stok = 6,                   // Inventory Turnover
    Duruş = 7,                  // Downtime
    Fire = 8,                   // Scrap Rate
    ÜretimHizi = 9              // Production Speed
}

/// <summary>
/// KPI hesaplama periyodu
/// </summary>
public enum KpiPeriodType
{
    Saatlik = 0,
    Günlük = 1,
    Haftalık = 2,
    Aylık = 3,
    Çeyreklik = 4,
    Yıllık = 5
}

/// <summary>
/// KPI hedef durumu
/// </summary>
public enum KpiTargetStatus
{
    Başarılı = 0,       // Target achieved
    Uyarı = 1,          // Within tolerance
    Başarısız = 2,      // Target missed
    Belirsiz = 3        // No data or target
}

/// <summary>
/// Dashboard widget tipi
/// </summary>
public enum DashboardWidgetType
{
    KpiCard = 0,        // Single KPI value
    TrendChart = 1,     // Line/trend chart
    BarChart = 2,       // Bar chart
    PieChart = 3,       // Pie chart
    Gauge = 4,          // Gauge/speedometer
    Table = 5,          // Data table
    Heatmap = 6,        // Heat map
    Timeline = 7        // Timeline view
}

/// <summary>
/// Rapor tipi
/// </summary>
public enum ReportType
{
    ÜretimPerformans = 0,       // Production Performance Report
    OEE = 1,                     // OEE Report
    MaliyetAnaliz = 2,          // Cost Analysis Report
    KaliteRaporu = 3,           // Quality Report
    KapasiteKullanım = 4,       // Capacity Utilization Report
    DuruşAnaliz = 5,            // Downtime Analysis Report
    İşEmriDurum = 6,            // Work Order Status Report
    VaryanAnaliz = 7,           // Variance Analysis Report
    TrendAnaliz = 8             // Trend Analysis Report
}

/// <summary>
/// Rapor formatı
/// </summary>
public enum ReportFormat
{
    PDF = 0,
    Excel = 1,
    CSV = 2,
    HTML = 3,
    JSON = 4
}

// ========== Maintenance Enums ==========

/// <summary>
/// Bakım tipi
/// </summary>
public enum MaintenanceType
{
    Önleyici = 0,           // Preventive maintenance - scheduled
    Kestirimci = 1,         // Predictive maintenance - condition-based
    Arıza = 2,              // Corrective/breakdown maintenance
    Planlı = 3,             // Planned maintenance (overhaul)
    Acil = 4,               // Emergency maintenance
    Rutin = 5               // Routine maintenance (daily checks)
}

/// <summary>
/// Bakım önceliği
/// </summary>
public enum MaintenancePriority
{
    Düşük = 0,
    Normal = 1,
    Yüksek = 2,
    Acil = 3,
    Kritik = 4
}

/// <summary>
/// Bakım planı durumu
/// </summary>
public enum MaintenancePlanStatus
{
    Taslak = 0,
    Aktif = 1,
    Askıda = 2,
    Tamamlandı = 3,
    İptal = 4
}

/// <summary>
/// Bakım görevi durumu
/// </summary>
public enum MaintenanceTaskStatus
{
    Beklemede = 0,
    Planlandı = 1,
    DevamEdiyor = 2,
    Tamamlandı = 3,
    Ertelendi = 4,
    İptal = 5
}

/// <summary>
/// Bakım kaydı durumu
/// </summary>
public enum MaintenanceRecordStatus
{
    Açık = 0,
    DevamEdiyor = 1,
    Tamamlandı = 2,
    Onaylandı = 3,
    İptal = 4
}

/// <summary>
/// Bakım tetikleme tipi
/// </summary>
public enum MaintenanceTriggerType
{
    ZamanBazlı = 0,         // Time-based (every X days)
    SayaçBazlı = 1,         // Counter-based (every X hours/cycles)
    DurumBazlı = 2,         // Condition-based (sensor values)
    Takvim = 3,             // Calendar-based (specific dates)
    Olay = 4                // Event-based (after breakdown)
}

/// <summary>
/// Bakım sıklık birimi
/// </summary>
public enum MaintenanceFrequencyUnit
{
    Saat = 0,
    Gün = 1,
    Hafta = 2,
    Ay = 3,
    Yıl = 4,
    Çevrim = 5,             // Cycle count
    ÇalışmaSaati = 6        // Operating hours
}

/// <summary>
/// Yedek parça durumu
/// </summary>
public enum SparePartStatus
{
    Aktif = 0,
    Pasif = 1,
    Sipariş_Edilecek = 2,
    Tedarik_Edilemez = 3
}

/// <summary>
/// Yedek parça kritiklik seviyesi
/// </summary>
public enum SparePartCriticality
{
    Düşük = 0,
    Normal = 1,
    Yüksek = 2,
    Kritik = 3
}

#region NCR/CAPA Quality Management Enums

/// <summary>
/// Uygunsuzluk Raporu (NCR) durumu
/// </summary>
public enum NcrStatus
{
    Taslak = 0,
    Açık = 1,
    Araştırılıyor = 2,
    KökNedenAnalizi = 3,
    DüzelticiAksiyonBekleniyor = 4,
    DoğrulamaBekleniyor = 5,
    Kapatıldı = 6,
    İptal = 7
}

/// <summary>
/// NCR kaynağı
/// </summary>
public enum NcrSource
{
    ÜretimHattı = 0,
    GirdiKontrol = 1,
    ProsesKontrol = 2,
    FinalKontrol = 3,
    MüşteriŞikayeti = 4,
    İçDenetim = 5,
    TedarikçiDenetim = 6,
    Sahaİadesi = 7
}

/// <summary>
/// NCR önem derecesi (Severity)
/// </summary>
public enum NcrSeverity
{
    Minör = 0,      // Küçük sapma, kullanımı etkilemez
    Majör = 1,      // Önemli sapma, düzeltme gerekli
    Kritik = 2,     // Kritik kusur, kullanılamaz
    Güvenlik = 3    // Güvenlik riski taşıyor
}

/// <summary>
/// NCR karar türü (Disposition)
/// </summary>
public enum NcrDisposition
{
    Kabul = 0,              // Olduğu gibi kabul
    ŞartlıKabul = 1,        // Şartlı kabul
    YenidenİşleRework = 2,  // Yeniden işleme
    TamirRepair = 3,        // Tamir
    HurdalıkScrap = 4,      // Hurda
    İade = 5,               // Tedarikçiye iade
    SınıflandırmaDegrade = 6, // Sınıf düşürme
    MüşteriFesih = 7        // Müşteri kararı bekleniyor
}

/// <summary>
/// Düzeltici/Önleyici aksiyon türü
/// </summary>
public enum CapaType
{
    DüzelticiAksiyon = 0,   // Corrective Action (CA)
    ÖnleyiciAksiyon = 1     // Preventive Action (PA)
}

/// <summary>
/// CAPA durumu
/// </summary>
public enum CapaStatus
{
    Taslak = 0,
    Açık = 1,
    Planlama = 2,
    Uygulama = 3,
    Doğrulama = 4,
    EtkinlikDeğerlendirme = 5,
    Kapatıldı = 6,
    İptal = 7
}

/// <summary>
/// CAPA öncelik seviyesi
/// </summary>
public enum CapaPriority
{
    Düşük = 0,
    Normal = 1,
    Yüksek = 2,
    Acil = 3
}

/// <summary>
/// Kök neden kategorisi (5 Why / Ishikawa)
/// </summary>
public enum RootCauseCategory
{
    İnsan = 0,          // Man - Operatör hatası, eğitim eksikliği
    Makine = 1,         // Machine - Ekipman arızası, bakım eksikliği
    Malzeme = 2,        // Material - Hammadde kalitesi
    Metod = 3,          // Method - Prosedür eksikliği, yanlış talimat
    Ölçüm = 4,          // Measurement - Kalibrasyon, ölçüm hatası
    Ortam = 5           // Environment - Çevre koşulları
}

/// <summary>
/// Malzeme rezervasyon durumu
/// </summary>
public enum MaterialReservationStatus
{
    Aktif = 0,
    KısmenTahsis = 1,
    TamTahsis = 2,
    KısmenTüketildi = 3,
    Tamamlandı = 4,
    İptal = 5,
    Süresi_Doldu = 6
}

/// <summary>
/// Malzeme rezervasyon türü
/// </summary>
public enum MaterialReservationType
{
    Üretim_Emri = 0,
    Satış_Siparişi = 1,
    Proje = 2,
    Fason = 3,
    Transfer = 4,
    Manuel = 5
}

#endregion
