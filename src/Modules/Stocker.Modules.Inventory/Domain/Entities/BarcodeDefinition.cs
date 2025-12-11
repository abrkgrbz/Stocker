using Stocker.SharedKernel.Common;

namespace Stocker.Modules.Inventory.Domain.Entities;

/// <summary>
/// Barkod tanımlama entity'si - Ürün barkod yönetimi
/// Barcode Definition entity - Product barcode management
/// EAN-13, EAN-8, UPC-A, Code128, QR Code desteği
/// </summary>
public class BarcodeDefinition : BaseEntity
{
    #region Temel Bilgiler (Basic Information)

    /// <summary>
    /// Ürün ID / Product ID
    /// </summary>
    public int ProductId { get; private set; }

    /// <summary>
    /// Varyant ID (varsa) / Variant ID (if applicable)
    /// </summary>
    public int? ProductVariantId { get; private set; }

    /// <summary>
    /// Barkod değeri / Barcode value
    /// </summary>
    public string Barcode { get; private set; } = string.Empty;

    /// <summary>
    /// Barkod türü / Barcode type
    /// </summary>
    public BarcodeType BarcodeType { get; private set; }

    /// <summary>
    /// Birincil barkod mu? / Is primary barcode?
    /// </summary>
    public bool IsPrimary { get; private set; }

    /// <summary>
    /// Aktif mi? / Is active?
    /// </summary>
    public bool IsActive { get; private set; }

    #endregion

    #region Birim Bilgileri (Unit Information)

    /// <summary>
    /// Birim ID / Unit ID
    /// </summary>
    public int? UnitId { get; private set; }

    /// <summary>
    /// Birim içi adet / Quantity per unit
    /// </summary>
    public decimal QuantityPerUnit { get; private set; } = 1;

    /// <summary>
    /// Ambalaj türü ID / Packaging type ID
    /// </summary>
    public int? PackagingTypeId { get; private set; }

    #endregion

    #region Üretici Bilgileri (Manufacturer Information)

    /// <summary>
    /// Üretici barkodu mu? / Is manufacturer barcode?
    /// </summary>
    public bool IsManufacturerBarcode { get; private set; }

    /// <summary>
    /// Üretici kodu / Manufacturer code
    /// </summary>
    public string? ManufacturerCode { get; private set; }

    /// <summary>
    /// GTIN (Global Trade Item Number)
    /// </summary>
    public string? Gtin { get; private set; }

    #endregion

    #region Ek Bilgiler (Additional Information)

    /// <summary>
    /// Açıklama / Description
    /// </summary>
    public string? Description { get; private set; }

    /// <summary>
    /// Geçerlilik başlangıcı / Valid from
    /// </summary>
    public DateTime? ValidFrom { get; private set; }

    /// <summary>
    /// Geçerlilik bitişi / Valid until
    /// </summary>
    public DateTime? ValidUntil { get; private set; }

    #endregion

    // Navigation
    public virtual Product Product { get; private set; } = null!;
    public virtual ProductVariant? ProductVariant { get; private set; }
    public virtual Unit? Unit { get; private set; }
    public virtual PackagingType? PackagingType { get; private set; }

    protected BarcodeDefinition() { }

    public BarcodeDefinition(
        int productId,
        string barcode,
        BarcodeType barcodeType,
        bool isPrimary = false)
    {
        ProductId = productId;
        Barcode = barcode;
        BarcodeType = barcodeType;
        IsPrimary = isPrimary;
        IsActive = true;
        QuantityPerUnit = 1;
    }

    public static BarcodeDefinition CreateEan13(int productId, string barcode, bool isPrimary = true)
    {
        if (barcode.Length != 13 || !barcode.All(char.IsDigit))
            throw new ArgumentException("EAN-13 barkod 13 haneli sayısal olmalıdır.");

        return new BarcodeDefinition(productId, barcode, BarcodeType.EAN13, isPrimary)
        {
            IsManufacturerBarcode = true
        };
    }

    public static BarcodeDefinition CreateInternal(int productId, string barcode)
    {
        return new BarcodeDefinition(productId, barcode, BarcodeType.Internal, false)
        {
            IsManufacturerBarcode = false
        };
    }

    public void SetAsPrimary()
    {
        IsPrimary = true;
    }

    public void RemovePrimary()
    {
        IsPrimary = false;
    }

    public void Activate() => IsActive = true;
    public void Deactivate() => IsActive = false;

    public void SetVariant(int? variantId) => ProductVariantId = variantId;

    public void SetUnit(int? unitId, decimal quantityPerUnit = 1)
    {
        UnitId = unitId;
        QuantityPerUnit = quantityPerUnit > 0 ? quantityPerUnit : 1;
    }

    public void SetPackagingType(int? packagingTypeId) => PackagingTypeId = packagingTypeId;

    public void SetManufacturerInfo(bool isManufacturer, string? manufacturerCode, string? gtin)
    {
        IsManufacturerBarcode = isManufacturer;
        ManufacturerCode = manufacturerCode;
        Gtin = gtin;
    }

    public void SetDescription(string? description) => Description = description;

    public void SetValidityPeriod(DateTime? from, DateTime? until)
    {
        ValidFrom = from;
        ValidUntil = until;
    }

    public bool IsValid()
    {
        if (!IsActive) return false;

        var now = DateTime.UtcNow;
        if (ValidFrom.HasValue && now < ValidFrom.Value) return false;
        if (ValidUntil.HasValue && now > ValidUntil.Value) return false;

        return true;
    }
}

/// <summary>
/// Barkod türü / Barcode type
/// </summary>
public enum BarcodeType
{
    /// <summary>EAN-13 (Avrupa Ürün Numarası)</summary>
    EAN13 = 1,

    /// <summary>EAN-8</summary>
    EAN8 = 2,

    /// <summary>UPC-A (ABD)</summary>
    UPCA = 3,

    /// <summary>UPC-E</summary>
    UPCE = 4,

    /// <summary>Code 128</summary>
    Code128 = 5,

    /// <summary>Code 39</summary>
    Code39 = 6,

    /// <summary>QR Code</summary>
    QRCode = 7,

    /// <summary>Data Matrix</summary>
    DataMatrix = 8,

    /// <summary>PDF417</summary>
    PDF417 = 9,

    /// <summary>ITF-14 (Koli barkodu)</summary>
    ITF14 = 10,

    /// <summary>GS1-128</summary>
    GS1_128 = 11,

    /// <summary>Dahili barkod / Internal barcode</summary>
    Internal = 99
}
