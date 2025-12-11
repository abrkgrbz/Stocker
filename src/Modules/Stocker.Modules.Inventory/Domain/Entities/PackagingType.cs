using Stocker.SharedKernel.Common;

namespace Stocker.Modules.Inventory.Domain.Entities;

/// <summary>
/// Ambalaj türü entity'si - Koli, palet, kutu vb. tanımları
/// Packaging Type entity - Box, pallet, carton definitions
/// Lojistik ve depo yönetimi için kritik
/// </summary>
public class PackagingType : BaseEntity
{
    #region Temel Bilgiler (Basic Information)

    /// <summary>
    /// Ambalaj kodu / Packaging code
    /// </summary>
    public string Code { get; private set; } = string.Empty;

    /// <summary>
    /// Ambalaj adı / Packaging name
    /// </summary>
    public string Name { get; private set; } = string.Empty;

    /// <summary>
    /// Açıklama / Description
    /// </summary>
    public string? Description { get; private set; }

    /// <summary>
    /// Ambalaj kategorisi / Packaging category
    /// </summary>
    public PackagingCategory Category { get; private set; }

    /// <summary>
    /// Aktif mi? / Is active?
    /// </summary>
    public bool IsActive { get; private set; }

    #endregion

    #region Boyut Bilgileri (Dimension Information)

    /// <summary>
    /// Uzunluk (cm) / Length (cm)
    /// </summary>
    public decimal? Length { get; private set; }

    /// <summary>
    /// Genişlik (cm) / Width (cm)
    /// </summary>
    public decimal? Width { get; private set; }

    /// <summary>
    /// Yükseklik (cm) / Height (cm)
    /// </summary>
    public decimal? Height { get; private set; }

    /// <summary>
    /// Hacim (m³) / Volume (m³)
    /// </summary>
    public decimal? Volume { get; private set; }

    #endregion

    #region Ağırlık Bilgileri (Weight Information)

    /// <summary>
    /// Boş ağırlık (kg) / Empty weight (kg) - Dara
    /// </summary>
    public decimal? EmptyWeight { get; private set; }

    /// <summary>
    /// Maksimum ağırlık kapasitesi (kg) / Max weight capacity (kg)
    /// </summary>
    public decimal? MaxWeightCapacity { get; private set; }

    #endregion

    #region Kapasite Bilgileri (Capacity Information)

    /// <summary>
    /// Varsayılan içerik miktarı / Default content quantity
    /// </summary>
    public decimal? DefaultQuantity { get; private set; }

    /// <summary>
    /// Maksimum içerik miktarı / Maximum content quantity
    /// </summary>
    public decimal? MaxQuantity { get; private set; }

    /// <summary>
    /// İstiflenebilir adet / Stackable count
    /// </summary>
    public int? StackableCount { get; private set; }

    /// <summary>
    /// İstiflenebilir mi? / Is stackable?
    /// </summary>
    public bool IsStackable { get; private set; }

    #endregion

    #region Lojistik Bilgileri (Logistics Information)

    /// <summary>
    /// Palet başına adet / Units per pallet
    /// </summary>
    public int? UnitsPerPallet { get; private set; }

    /// <summary>
    /// Palet katı başına adet / Units per pallet layer
    /// </summary>
    public int? UnitsPerPalletLayer { get; private set; }

    /// <summary>
    /// Barkod öneki / Barcode prefix
    /// </summary>
    public string? BarcodePrefix { get; private set; }

    /// <summary>
    /// Varsayılan barkod türü / Default barcode type
    /// </summary>
    public BarcodeType? DefaultBarcodeType { get; private set; }

    #endregion

    #region Malzeme Bilgileri (Material Information)

    /// <summary>
    /// Malzeme türü / Material type
    /// </summary>
    public string? MaterialType { get; private set; }

    /// <summary>
    /// Geri dönüştürülebilir mi? / Is recyclable?
    /// </summary>
    public bool IsRecyclable { get; private set; }

    /// <summary>
    /// İade edilebilir ambalaj mı? / Is returnable packaging?
    /// </summary>
    public bool IsReturnable { get; private set; }

    /// <summary>
    /// Depozito tutarı / Deposit amount
    /// </summary>
    public decimal? DepositAmount { get; private set; }

    #endregion

    protected PackagingType() { }

    public PackagingType(string code, string name, PackagingCategory category)
    {
        Code = code;
        Name = name;
        Category = category;
        IsActive = true;
        IsStackable = true;
    }

    public static PackagingType CreateBox(string code, string name)
    {
        return new PackagingType(code, name, PackagingCategory.Box);
    }

    public static PackagingType CreatePallet(string code, string name)
    {
        var pallet = new PackagingType(code, name, PackagingCategory.Pallet);
        pallet.IsReturnable = true;
        return pallet;
    }

    public void SetDimensions(decimal? length, decimal? width, decimal? height)
    {
        Length = length;
        Width = width;
        Height = height;

        if (length.HasValue && width.HasValue && height.HasValue)
        {
            Volume = (length.Value * width.Value * height.Value) / 1000000; // cm³ to m³
        }
    }

    public void SetWeightInfo(decimal? emptyWeight, decimal? maxCapacity)
    {
        EmptyWeight = emptyWeight;
        MaxWeightCapacity = maxCapacity;
    }

    public void SetCapacity(decimal? defaultQty, decimal? maxQty)
    {
        DefaultQuantity = defaultQty;
        MaxQuantity = maxQty;
    }

    public void SetStackingInfo(bool isStackable, int? stackableCount)
    {
        IsStackable = isStackable;
        StackableCount = stackableCount;
    }

    public void SetPalletInfo(int? unitsPerPallet, int? unitsPerLayer)
    {
        UnitsPerPallet = unitsPerPallet;
        UnitsPerPalletLayer = unitsPerLayer;
    }

    public void SetBarcodeInfo(string? prefix, BarcodeType? defaultType)
    {
        BarcodePrefix = prefix;
        DefaultBarcodeType = defaultType;
    }

    public void SetMaterialInfo(string? materialType, bool isRecyclable)
    {
        MaterialType = materialType;
        IsRecyclable = isRecyclable;
    }

    public void SetReturnableInfo(bool isReturnable, decimal? depositAmount)
    {
        IsReturnable = isReturnable;
        DepositAmount = depositAmount;
    }

    public void SetDescription(string? description) => Description = description;
    public void Activate() => IsActive = true;
    public void Deactivate() => IsActive = false;
}

/// <summary>
/// Ambalaj kategorisi / Packaging category
/// </summary>
public enum PackagingCategory
{
    /// <summary>Kutu / Box</summary>
    Box = 1,

    /// <summary>Koli / Carton</summary>
    Carton = 2,

    /// <summary>Palet / Pallet</summary>
    Pallet = 3,

    /// <summary>Kasa / Crate</summary>
    Crate = 4,

    /// <summary>Torba / Bag</summary>
    Bag = 5,

    /// <summary>Bidon / Drum</summary>
    Drum = 6,

    /// <summary>Konteyner / Container</summary>
    Container = 7,

    /// <summary>Şişe / Bottle</summary>
    Bottle = 8,

    /// <summary>Kavanoz / Jar</summary>
    Jar = 9,

    /// <summary>Tüp / Tube</summary>
    Tube = 10,

    /// <summary>Poşet / Pouch</summary>
    Pouch = 11,

    /// <summary>Rulo / Roll</summary>
    Roll = 12,

    /// <summary>Diğer / Other</summary>
    Other = 99
}
