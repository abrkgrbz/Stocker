namespace Stocker.Modules.Finance.Domain.Enums;

/// <summary>
/// Vergi Türleri (Tax Types in Turkish Tax System)
/// </summary>
public enum TaxType
{
    /// <summary>
    /// KDV - Katma Değer Vergisi (Value Added Tax)
    /// </summary>
    VAT = 1,

    /// <summary>
    /// ÖTV - Özel Tüketim Vergisi (Special Consumption Tax)
    /// </summary>
    SCT = 2,

    /// <summary>
    /// Stopaj - Gelir Vergisi Tevkifatı (Withholding Tax)
    /// </summary>
    Withholding = 3,

    /// <summary>
    /// Damga Vergisi (Stamp Tax)
    /// </summary>
    Stamp = 4,

    /// <summary>
    /// ÖİV - Özel İletişim Vergisi (Special Communication Tax)
    /// </summary>
    CommunicationTax = 5,

    /// <summary>
    /// Konaklama Vergisi (Accommodation Tax)
    /// </summary>
    AccommodationTax = 6,

    /// <summary>
    /// BSMV - Banka ve Sigorta Muameleleri Vergisi (Banking and Insurance Transaction Tax)
    /// </summary>
    BITT = 7,

    /// <summary>
    /// Kurumlar Vergisi (Corporate Tax)
    /// </summary>
    CorporateTax = 8,

    /// <summary>
    /// Gelir Vergisi (Income Tax)
    /// </summary>
    IncomeTax = 9
}

/// <summary>
/// KDV Oranları (VAT Rates)
/// </summary>
public enum VatRate
{
    /// <summary>
    /// %0 - İstisna (Exemption)
    /// </summary>
    Zero = 0,

    /// <summary>
    /// %1 - İndirimli Oran (Reduced Rate - Basic food, newspapers)
    /// </summary>
    One = 1,

    /// <summary>
    /// %8 - İndirimli Oran (Reduced Rate - Food, textiles, tourism)
    /// Deprectaed from 2024, changed to 10%
    /// </summary>
    Eight = 8,

    /// <summary>
    /// %10 - İndirimli Oran (Reduced Rate - Food, textiles, tourism - from 2024)
    /// </summary>
    Ten = 10,

    /// <summary>
    /// %18 - Standart Oran (Standard Rate)
    /// Deprectaed from 2024, changed to 20%
    /// </summary>
    Eighteen = 18,

    /// <summary>
    /// %20 - Standart Oran (Standard Rate - from 2024)
    /// </summary>
    Twenty = 20
}

/// <summary>
/// KDV Tevkifat Oranları (VAT Withholding Rates)
/// </summary>
public enum VatWithholdingRate
{
    /// <summary>
    /// Tevkifat Yok (No Withholding)
    /// </summary>
    None = 0,

    /// <summary>
    /// 2/10 Tevkifat
    /// </summary>
    TwoTenths = 20,

    /// <summary>
    /// 3/10 Tevkifat
    /// </summary>
    ThreeTenths = 30,

    /// <summary>
    /// 4/10 Tevkifat
    /// </summary>
    FourTenths = 40,

    /// <summary>
    /// 5/10 Tevkifat
    /// </summary>
    FiveTenths = 50,

    /// <summary>
    /// 7/10 Tevkifat
    /// </summary>
    SevenTenths = 70,

    /// <summary>
    /// 9/10 Tevkifat
    /// </summary>
    NineTenths = 90,

    /// <summary>
    /// Tam Tevkifat (Full Withholding)
    /// </summary>
    Full = 100
}

/// <summary>
/// Tevkifat Kodları (Withholding Codes - GİB)
/// </summary>
public enum WithholdingCode
{
    /// <summary>
    /// 601 - Yapım İşleri ile Bu İşlerle Birlikte İfa Edilen Mühendislik-Mimarlık ve Etüt-Proje Hizmetleri
    /// </summary>
    Construction = 601,

    /// <summary>
    /// 602 - Etüt, Plan-Proje, Danışmanlık, Denetim ve Benzeri Hizmetler
    /// </summary>
    Consulting = 602,

    /// <summary>
    /// 603 - Makine, Teçhizat, Demirbaş ve Taşıtlara Ait Tadil, Bakım ve Onarım Hizmetleri
    /// </summary>
    MaintenanceRepair = 603,

    /// <summary>
    /// 604 - Yemek Servis ve Organizasyon Hizmetleri
    /// </summary>
    FoodService = 604,

    /// <summary>
    /// 605 - İşgücü Temin Hizmetleri
    /// </summary>
    Manpower = 605,

    /// <summary>
    /// 606 - Yapı Denetim Hizmetleri
    /// </summary>
    BuildingInspection = 606,

    /// <summary>
    /// 607 - Fason Olarak Yaptırılan Tekstil ve Konfeksiyon İşleri
    /// </summary>
    TextileFason = 607,

    /// <summary>
    /// 608 - Turistik Mağazalara Verilen Müşteri Bulma/Götürme Hizmetleri
    /// </summary>
    TouristGuiding = 608,

    /// <summary>
    /// 609 - Spor Kulüplerinin Yayın, Reklam ve İsim Hakkı Gelirlerine Konu İşlemler
    /// </summary>
    SportsClub = 609,

    /// <summary>
    /// 610 - Temizlik, Çevre ve Bahçe Bakım Hizmetleri
    /// </summary>
    Cleaning = 610,

    /// <summary>
    /// 611 - Taşımacılık Hizmetleri
    /// </summary>
    Transportation = 611,

    /// <summary>
    /// 612 - Her Türlü Baskı ve Basım Hizmetleri
    /// </summary>
    Printing = 612,

    /// <summary>
    /// 613 - Diğer Hizmetler
    /// </summary>
    Other = 613,

    /// <summary>
    /// 614 - Servis Taşımacılığı Hizmeti
    /// </summary>
    ServiceTransport = 614,

    /// <summary>
    /// 615 - Her Türlü Hurda Metal Teslimleri
    /// </summary>
    ScrapMetal = 615,

    /// <summary>
    /// 616 - Ağaç ve Orman Ürünleri Teslimleri
    /// </summary>
    ForestProducts = 616,

    /// <summary>
    /// 617 - Külçe Metal Teslimleri
    /// </summary>
    BullionMetal = 617,

    /// <summary>
    /// 618 - Bakır, Çinko, Alüminyum Ürün Teslimleri
    /// </summary>
    MetalProducts = 618,

    /// <summary>
    /// 619 - İstisnadan Vazgeçenlerin Akaryakıt Teslimleri
    /// </summary>
    FuelDelivery = 619,

    /// <summary>
    /// 620 - Demir-Çelik Ürünlerinin Teslimleri
    /// </summary>
    SteelProducts = 620
}

/// <summary>
/// KDV İstisna Nedenleri (VAT Exemption Reasons)
/// </summary>
public enum VatExemptionReason
{
    /// <summary>
    /// İstisna Yok (No Exemption)
    /// </summary>
    None = 0,

    /// <summary>
    /// 301 - Mal İhracatı (Export of Goods)
    /// </summary>
    GoodsExport = 301,

    /// <summary>
    /// 302 - Hizmet İhracatı (Export of Services)
    /// </summary>
    ServiceExport = 302,

    /// <summary>
    /// 303 - Serbest Bölgelerde Verilen Hizmetler (Services in Free Zones)
    /// </summary>
    FreeZoneServices = 303,

    /// <summary>
    /// 304 - Roaming Hizmetleri (Roaming Services)
    /// </summary>
    RoamingServices = 304,

    /// <summary>
    /// 305 - Diplomatik İstisna (Diplomatic Exemption)
    /// </summary>
    Diplomatic = 305,

    /// <summary>
    /// 306 - Uluslararası Taşımacılık (International Transportation)
    /// </summary>
    InternationalTransport = 306,

    /// <summary>
    /// 307 - Petrol Araştırma (Petroleum Exploration)
    /// </summary>
    PetroleumExploration = 307,

    /// <summary>
    /// 308 - Altın, Gümüş, Platin Teslimleri (Gold, Silver, Platinum Delivery)
    /// </summary>
    PreciousMetals = 308,

    /// <summary>
    /// 309 - Türkiye'de İkamet Etmeyenlere Yapılan Teslimat (Tax-Free Shopping)
    /// </summary>
    TaxFreeShopping = 309,

    /// <summary>
    /// 350 - Diğer İstisnalar (Other Exemptions)
    /// </summary>
    Other = 350
}

/// <summary>
/// Stopaj Türleri (Withholding Tax Types)
/// </summary>
public enum WithholdingTaxType
{
    /// <summary>
    /// Kira Stopajı (Rent Withholding) - %20
    /// </summary>
    Rent = 1,

    /// <summary>
    /// Serbest Meslek Stopajı (Freelance Withholding) - %20
    /// </summary>
    Freelance = 2,

    /// <summary>
    /// Yurt Dışı Hizmet Stopajı (Foreign Service Withholding)
    /// </summary>
    ForeignService = 3,

    /// <summary>
    /// Temettü Stopajı (Dividend Withholding) - %10
    /// </summary>
    Dividend = 4,

    /// <summary>
    /// Faiz Stopajı (Interest Withholding)
    /// </summary>
    Interest = 5,

    /// <summary>
    /// Telif Hakkı Stopajı (Royalty Withholding) - %20
    /// </summary>
    Royalty = 6
}
