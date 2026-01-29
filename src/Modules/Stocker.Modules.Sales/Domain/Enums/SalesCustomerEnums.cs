namespace Stocker.Modules.Sales.Domain.Enums;

/// <summary>
/// Satış müşteri tipi
/// Türkiye e-Fatura prosedürlerine uygun
/// </summary>
public enum SalesCustomerType
{
    /// <summary>
    /// Kurumsal müşteri (Tüzel kişi)
    /// VKN ve Vergi Dairesi zorunlu
    /// </summary>
    Corporate = 1,

    /// <summary>
    /// Bireysel müşteri (Gerçek kişi)
    /// Ad-Soyad zorunlu, TCKN opsiyonel (9.900 TL üzeri zorunlu)
    /// </summary>
    Individual = 2,

    /// <summary>
    /// Nihai tüketici (Anonim)
    /// 9.900 TL altı satışlarda TCKN: 11111111111
    /// </summary>
    Retail = 3,

    /// <summary>
    /// Yurt dışı müşteri
    /// VKN: 2222222222 (GİB standart)
    /// </summary>
    Foreign = 4
}

/// <summary>
/// Müşteri veri kaynağı
/// Hangi modülden geldiğini belirtir
/// </summary>
public enum CustomerDataSource
{
    /// <summary>
    /// Sales modülünden (bu modül)
    /// </summary>
    Sales = 1,

    /// <summary>
    /// CRM modülünden
    /// </summary>
    CRM = 2
}

/// <summary>
/// Ürün veri kaynağı
/// Hangi modülden geldiğini belirtir
/// </summary>
public enum ProductDataSource
{
    /// <summary>
    /// Sales modülünden (bu modül)
    /// </summary>
    Sales = 1,

    /// <summary>
    /// Inventory modülünden
    /// </summary>
    Inventory = 2
}

/// <summary>
/// Satış ürün tipi
/// </summary>
public enum SalesProductType
{
    /// <summary>
    /// Mal (fiziksel ürün)
    /// İrsaliye gerektirir
    /// </summary>
    Product = 1,

    /// <summary>
    /// Hizmet
    /// Stok takibi yok, irsaliye gerekmez
    /// </summary>
    Service = 2,

    /// <summary>
    /// Karma (mal + hizmet)
    /// </summary>
    Mixed = 3
}

/// <summary>
/// GİB Birim Kodları (UBL TR 1.2.1)
/// En sık kullanılan birimler
/// </summary>
public static class GibUnitCodes
{
    /// <summary>Adet</summary>
    public const string Piece = "C62";

    /// <summary>Paket</summary>
    public const string Package = "PA";

    /// <summary>Kutu</summary>
    public const string Box = "BX";

    /// <summary>Koli</summary>
    public const string Carton = "CT";

    /// <summary>Düzine</summary>
    public const string Dozen = "DZN";

    /// <summary>Kilogram</summary>
    public const string Kilogram = "KGM";

    /// <summary>Gram</summary>
    public const string Gram = "GRM";

    /// <summary>Ton</summary>
    public const string Ton = "TNE";

    /// <summary>Litre</summary>
    public const string Liter = "LTR";

    /// <summary>Mililitre</summary>
    public const string Milliliter = "MLT";

    /// <summary>Metre</summary>
    public const string Meter = "MTR";

    /// <summary>Santimetre</summary>
    public const string Centimeter = "CMT";

    /// <summary>Metrekare</summary>
    public const string SquareMeter = "MTK";

    /// <summary>Metreküp</summary>
    public const string CubicMeter = "MTQ";

    /// <summary>Saat</summary>
    public const string Hour = "HUR";

    /// <summary>Dakika</summary>
    public const string Minute = "MIN";

    /// <summary>Gün</summary>
    public const string Day = "DAY";

    /// <summary>Ay</summary>
    public const string Month = "MON";

    /// <summary>Yıl</summary>
    public const string Year = "ANN";

    /// <summary>Set</summary>
    public const string Set = "SET";

    /// <summary>Çift</summary>
    public const string Pair = "PR";

    /// <summary>
    /// Birim kodundan açıklama döner
    /// </summary>
    public static string GetDescription(string code) => code switch
    {
        "C62" => "Adet",
        "PA" => "Paket",
        "BX" => "Kutu",
        "CT" => "Koli",
        "DZN" => "Düzine",
        "KGM" => "Kilogram",
        "GRM" => "Gram",
        "TNE" => "Ton",
        "LTR" => "Litre",
        "MLT" => "Mililitre",
        "MTR" => "Metre",
        "CMT" => "Santimetre",
        "MTK" => "Metrekare",
        "MTQ" => "Metreküp",
        "HUR" => "Saat",
        "MIN" => "Dakika",
        "DAY" => "Gün",
        "MON" => "Ay",
        "ANN" => "Yıl",
        "SET" => "Set",
        "PR" => "Çift",
        _ => code
    };
}

/// <summary>
/// GİB KDV İstisna Kodları
/// e-Fatura'da KDV oranı 0 ise zorunlu
/// </summary>
public static class VatExemptionCodes
{
    // İhracat İstisnaları
    public const string Export = "301"; // Mal ihracatı
    public const string TransitTrade = "302"; // Transit ticaret
    public const string PetrolExploration = "303"; // Petrol arama
    public const string FreeTrade = "304"; // Serbest bölge
    public const string DiplomaticExemption = "305"; // Diplomatik istisna
    public const string InternationalTransport = "306"; // Uluslararası taşımacılık
    public const string ShipBuilding = "307"; // Gemi inşa
    public const string AviationExemption = "308"; // Havayolu istisnası
    public const string GoldExemption = "309"; // Altın, gümüş
    public const string DefenseExemption = "310"; // Savunma sanayi
    public const string InvestmentIncentive = "311"; // Yatırım teşvik
    public const string OtherExemptions = "350"; // Diğer istisnalar

    // Tam İstisna (KDV Kanunu 17. Madde)
    public const string HealthServices = "201"; // Sağlık hizmetleri
    public const string EducationServices = "202"; // Eğitim hizmetleri
    public const string CulturalServices = "203"; // Kültürel hizmetler
    public const string SocialServices = "204"; // Sosyal amaçlı
    public const string MilitaryDeliveries = "205"; // Askeri teslimat
    public const string BankInsurance = "206"; // Banka/sigorta
    public const string RealEstate = "207"; // Gayrimenkul
    public const string PublicTransport = "208"; // Toplu taşıma
    public const string PostalServices = "209"; // Posta hizmetleri
    public const string FarmProducts = "210"; // Tarım ürünleri
    public const string OtherFullExemptions = "250"; // Diğer tam istisnalar

    /// <summary>
    /// İstisna kodundan açıklama döner
    /// </summary>
    public static string GetDescription(string code) => code switch
    {
        "301" => "Mal ihracatı (KDVK 11/1-a)",
        "302" => "Transit ticaret (KDVK 11/1-a)",
        "303" => "Petrol arama faaliyetleri (KDVK 11/1-a)",
        "304" => "Serbest bölgelere yapılan teslimler",
        "305" => "Diplomatik istisna (KDVK 15/1-a)",
        "306" => "Uluslararası taşımacılık (KDVK 14)",
        "307" => "Gemi ve yat inşa teslimler (KDVK 13/a)",
        "308" => "Havayolu taşımacılığı istisnası",
        "309" => "Altın, gümüş teslimi",
        "310" => "Savunma sanayi istisnası",
        "311" => "Yatırım teşvik belgesi kapsamı",
        "350" => "KDV Kanunu kapsamındaki diğer istisnalar",
        "201" => "Sağlık hizmetleri istisnası (KDVK 17/2-a)",
        "202" => "Eğitim hizmetleri istisnası (KDVK 17/2-a)",
        "203" => "Kültürel hizmetler istisnası",
        "204" => "Sosyal amaçlı istisna",
        "205" => "Askeri teslimat istisnası",
        "206" => "Banka ve sigorta muameleleri",
        "207" => "Gayrimenkul teslimleri",
        "208" => "Toplu taşıma hizmetleri",
        "209" => "Posta hizmetleri",
        "210" => "Tarım ürünleri teslimi",
        "250" => "KDV Kanunu 17. Madde kapsamındaki diğer istisnalar",
        _ => "Bilinmeyen istisna kodu"
    };
}

/// <summary>
/// Türkiye geçerli KDV oranları
/// </summary>
public static class TurkeyVatRates
{
    /// <summary>İstisna/Muaf</summary>
    public const decimal Exempt = 0;

    /// <summary>İndirimli oran 1 (temel gıda vb.)</summary>
    public const decimal Reduced1 = 1;

    /// <summary>İndirimli oran 2 (temel tüketim)</summary>
    public const decimal Reduced8 = 8;

    /// <summary>İndirimli oran 3</summary>
    public const decimal Reduced10 = 10;

    /// <summary>Genel oran (varsayılan)</summary>
    public const decimal Standard = 20;

    /// <summary>
    /// Geçerli KDV oranı mı kontrolü
    /// </summary>
    public static bool IsValidRate(decimal rate) =>
        rate == Exempt || rate == Reduced1 || rate == Reduced8 || rate == Reduced10 || rate == Standard;
}
