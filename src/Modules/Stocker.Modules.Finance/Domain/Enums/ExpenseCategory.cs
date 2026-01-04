namespace Stocker.Modules.Finance.Domain.Enums;

/// <summary>
/// Gider Kategorileri (Expense Categories)
/// Türkiye muhasebe standartlarına uygun
/// </summary>
public enum ExpenseCategoryType
{
    // 63 - Faaliyet Giderleri (Operating Expenses)

    /// <summary>
    /// 630 - Araştırma ve Geliştirme Giderleri (R&D Expenses)
    /// </summary>
    ResearchAndDevelopment = 630,

    /// <summary>
    /// 631 - Pazarlama, Satış ve Dağıtım Giderleri (Marketing, Sales and Distribution Expenses)
    /// </summary>
    MarketingSalesDistribution = 631,

    /// <summary>
    /// 632 - Genel Yönetim Giderleri (General Administrative Expenses)
    /// </summary>
    GeneralAdministrative = 632,

    // Alt Kategoriler (Sub-categories)

    /// <summary>
    /// Personel Giderleri (Personnel Expenses)
    /// </summary>
    Personnel = 100,

    /// <summary>
    /// Kira Giderleri (Rent Expenses)
    /// </summary>
    Rent = 101,

    /// <summary>
    /// Elektrik, Su, Doğalgaz (Utilities)
    /// </summary>
    Utilities = 102,

    /// <summary>
    /// İletişim Giderleri (Communication Expenses)
    /// </summary>
    Communication = 103,

    /// <summary>
    /// Ulaşım Giderleri (Transportation Expenses)
    /// </summary>
    Transportation = 104,

    /// <summary>
    /// Seyahat ve Konaklama (Travel and Accommodation)
    /// </summary>
    TravelAccommodation = 105,

    /// <summary>
    /// Reklam ve Tanıtım (Advertising and Promotion)
    /// </summary>
    AdvertisingPromotion = 106,

    /// <summary>
    /// Temsil ve Ağırlama (Representation and Hospitality)
    /// </summary>
    RepresentationHospitality = 107,

    /// <summary>
    /// Sigorta Giderleri (Insurance Expenses)
    /// </summary>
    Insurance = 108,

    /// <summary>
    /// Bakım ve Onarım (Maintenance and Repair)
    /// </summary>
    MaintenanceRepair = 109,

    /// <summary>
    /// Danışmanlık ve Hizmet Alımları (Consulting and Services)
    /// </summary>
    ConsultingServices = 110,

    /// <summary>
    /// Kırtasiye ve Büro Malzemeleri (Stationery and Office Supplies)
    /// </summary>
    OfficeSupplies = 111,

    /// <summary>
    /// Bilgi İşlem Giderleri (IT Expenses)
    /// </summary>
    ITExpenses = 112,

    /// <summary>
    /// Vergi, Resim ve Harçlar (Taxes and Duties)
    /// </summary>
    TaxesDuties = 113,

    /// <summary>
    /// Amortisman Giderleri (Depreciation Expenses)
    /// </summary>
    Depreciation = 114,

    /// <summary>
    /// Finansman Giderleri (Finance Expenses)
    /// </summary>
    Finance = 115,

    /// <summary>
    /// Banka Komisyon ve Masrafları (Bank Commissions and Fees)
    /// </summary>
    BankFees = 116,

    /// <summary>
    /// Hukuki Giderler (Legal Expenses)
    /// </summary>
    Legal = 117,

    /// <summary>
    /// Eğitim Giderleri (Training Expenses)
    /// </summary>
    Training = 118,

    /// <summary>
    /// Üyelik ve Aidat (Membership and Dues)
    /// </summary>
    MembershipDues = 119,

    /// <summary>
    /// Diğer Giderler (Other Expenses)
    /// </summary>
    Other = 199
}

/// <summary>
/// Masraf Merkezi Türleri (Cost Center Types)
/// </summary>
public enum CostCenterType
{
    /// <summary>
    /// Üretim (Production)
    /// </summary>
    Production = 1,

    /// <summary>
    /// Satış (Sales)
    /// </summary>
    Sales = 2,

    /// <summary>
    /// Pazarlama (Marketing)
    /// </summary>
    Marketing = 3,

    /// <summary>
    /// Yönetim (Administration)
    /// </summary>
    Administration = 4,

    /// <summary>
    /// Finans (Finance)
    /// </summary>
    Finance = 5,

    /// <summary>
    /// İnsan Kaynakları (Human Resources)
    /// </summary>
    HumanResources = 6,

    /// <summary>
    /// Ar-Ge (Research & Development)
    /// </summary>
    ResearchDevelopment = 7,

    /// <summary>
    /// Lojistik (Logistics)
    /// </summary>
    Logistics = 8,

    /// <summary>
    /// Bilgi Teknolojileri (IT)
    /// </summary>
    IT = 9,

    /// <summary>
    /// Müşteri Hizmetleri (Customer Service)
    /// </summary>
    CustomerService = 10,

    /// <summary>
    /// Kalite Kontrol (Quality Control)
    /// </summary>
    QualityControl = 11,

    /// <summary>
    /// Proje (Project)
    /// </summary>
    Project = 12,

    /// <summary>
    /// Şube/Mağaza (Branch/Store)
    /// </summary>
    BranchStore = 13,

    /// <summary>
    /// Diğer (Other)
    /// </summary>
    Other = 99
}

/// <summary>
/// Gider Durumu (Expense Status)
/// </summary>
public enum ExpenseStatus
{
    /// <summary>
    /// Taslak (Draft)
    /// </summary>
    Draft = 1,

    /// <summary>
    /// Beklemede (Pending) - Onay gerektirmeyen giderler için
    /// </summary>
    Pending = 2,

    /// <summary>
    /// Onay Bekliyor (Pending Approval)
    /// </summary>
    PendingApproval = 3,

    /// <summary>
    /// Onaylandı (Approved)
    /// </summary>
    Approved = 4,

    /// <summary>
    /// Reddedildi (Rejected)
    /// </summary>
    Rejected = 5,

    /// <summary>
    /// İşleniyor (Processing) - Ödeme işlemi devam ediyor
    /// </summary>
    Processing = 6,

    /// <summary>
    /// Tamamlandı (Completed) - İşlem tamamlandı
    /// </summary>
    Completed = 7,

    /// <summary>
    /// Ödendi (Paid)
    /// </summary>
    Paid = 8,

    /// <summary>
    /// İptal Edildi (Cancelled)
    /// </summary>
    Cancelled = 9
}
