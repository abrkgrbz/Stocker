using Stocker.Modules.Sales.Domain.Enums;
using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Sales.Domain.Entities;

/// <summary>
/// Satış modülü için temel ürün entity'si.
/// Türkiye e-Fatura/e-Arşiv prosedürlerine uygun zorunlu alanları içerir.
///
/// NOT: Inventory modülü aktifse, ürün verileri Inventory.Product'tan alınır.
/// Bu entity sadece Sales modülü tek başına kullanıldığında aktiftir.
/// </summary>
public class SalesProduct : TenantAggregateRoot
{
    #region Temel Bilgiler

    /// <summary>
    /// Ürün kodu (benzersiz, tenant bazında)
    /// Faturada mal/hizmet kodu olarak kullanılır
    /// </summary>
    public string ProductCode { get; private set; } = string.Empty;

    /// <summary>
    /// Ürün/Hizmet adı
    /// Faturada mal/hizmet cinsi olarak görünür
    /// </summary>
    public string Name { get; private set; } = string.Empty;

    /// <summary>
    /// Açıklama
    /// </summary>
    public string? Description { get; private set; }

    /// <summary>
    /// Ürün tipi (Mal/Hizmet/Karma)
    /// e-Fatura'da önemli - hizmet için irsaliye gerekmez
    /// </summary>
    public SalesProductType ProductType { get; private set; }

    #endregion

    #region Barkod ve SKU

    /// <summary>
    /// Barkod numarası (EAN-13, EAN-8, UPC-A vb.)
    /// </summary>
    public string? Barcode { get; private set; }

    /// <summary>
    /// Stok Kodu (SKU)
    /// </summary>
    public string? SKU { get; private set; }

    /// <summary>
    /// GTİP Kodu (Gümrük Tarife İstatistik Pozisyonu)
    /// İhracat faturalarında zorunlu
    /// </summary>
    public string? GtipCode { get; private set; }

    #endregion

    #region Birim Bilgileri

    /// <summary>
    /// Birim (Adet, Kg, Lt, M2, Saat vb.)
    /// GİB e-Fatura birim kodları ile uyumlu
    /// </summary>
    public string Unit { get; private set; } = "C62"; // C62 = Adet (GİB kodu)

    /// <summary>
    /// Birim açıklaması (görüntüleme için)
    /// </summary>
    public string UnitDescription { get; private set; } = "Adet";

    #endregion

    #region Fiyatlandırma

    /// <summary>
    /// Birim satış fiyatı (KDV hariç)
    /// </summary>
    public decimal UnitPrice { get; private set; }

    /// <summary>
    /// Para birimi (varsayılan: TRY)
    /// </summary>
    public string Currency { get; private set; } = "TRY";

    /// <summary>
    /// Maliyet fiyatı (opsiyonel)
    /// Kar marjı hesaplama için
    /// </summary>
    public decimal? CostPrice { get; private set; }

    /// <summary>
    /// Minimum satış fiyatı
    /// Satış temsilcileri bu fiyatın altına inemez
    /// </summary>
    public decimal? MinimumSalePrice { get; private set; }

    /// <summary>
    /// Liste fiyatı (tavsiye edilen satış fiyatı)
    /// </summary>
    public decimal? ListPrice { get; private set; }

    #endregion

    #region KDV Bilgileri

    /// <summary>
    /// KDV oranı (%)
    /// Türkiye: 0, 1, 8, 10, 20
    /// </summary>
    public decimal VatRate { get; private set; } = 20;

    /// <summary>
    /// KDV dahil mi?
    /// true: UnitPrice KDV dahil, false: KDV hariç
    /// </summary>
    public bool IsPriceIncludingVat { get; private set; } = false;

    /// <summary>
    /// KDV muafiyet kodu (varsa)
    /// GİB istisna kodları: 201, 202, 301, 302 vb.
    /// </summary>
    public string? VatExemptionCode { get; private set; }

    /// <summary>
    /// KDV muafiyet açıklaması
    /// </summary>
    public string? VatExemptionReason { get; private set; }

    /// <summary>
    /// ÖTV oranı (varsa)
    /// </summary>
    public decimal? SpecialConsumptionTaxRate { get; private set; }

    /// <summary>
    /// ÖTV tutarı (birim başına sabit tutar şeklindeyse)
    /// </summary>
    public decimal? SpecialConsumptionTaxAmount { get; private set; }

    #endregion

    #region Stok Bilgileri (Basit Takip)

    /// <summary>
    /// Stok takibi yapılsın mı?
    /// Hizmetler için false
    /// </summary>
    public bool TrackStock { get; private set; } = true;

    /// <summary>
    /// Mevcut stok miktarı
    /// NOT: Inventory modülü yoksa basit takip için
    /// </summary>
    public decimal StockQuantity { get; private set; }

    /// <summary>
    /// Minimum stok seviyesi (uyarı için)
    /// </summary>
    public decimal MinimumStock { get; private set; }

    /// <summary>
    /// Stok birimi başına ağırlık (kg)
    /// İrsaliye ve kargo için
    /// </summary>
    public decimal? Weight { get; private set; }

    #endregion

    #region Kategorizasyon

    /// <summary>
    /// Kategori adı (basit kategorizasyon)
    /// </summary>
    public string? Category { get; private set; }

    /// <summary>
    /// Alt kategori
    /// </summary>
    public string? SubCategory { get; private set; }

    /// <summary>
    /// Marka
    /// </summary>
    public string? Brand { get; private set; }

    /// <summary>
    /// Etiketler (virgülle ayrılmış)
    /// </summary>
    public string? Tags { get; private set; }

    #endregion

    #region Görsel

    /// <summary>
    /// Ana ürün görseli URL'i
    /// </summary>
    public string? ImageUrl { get; private set; }

    /// <summary>
    /// Küçük resim URL'i
    /// </summary>
    public string? ThumbnailUrl { get; private set; }

    #endregion

    #region Durum ve Metadata

    /// <summary>
    /// Aktif mi?
    /// </summary>
    public bool IsActive { get; private set; } = true;

    /// <summary>
    /// Satışa açık mı?
    /// Aktif olsa bile satışa kapatılabilir
    /// </summary>
    public bool IsAvailableForSale { get; private set; } = true;

    /// <summary>
    /// Web sitesinde gösterilsin mi?
    /// </summary>
    public bool ShowOnWeb { get; private set; } = true;

    /// <summary>
    /// Notlar
    /// </summary>
    public string? Notes { get; private set; }

    /// <summary>
    /// Inventory modülündeki karşılık gelen ürün ID'si
    /// Inventory modülü aktifse bu alan dolu olur ve veriler senkronize edilir
    /// </summary>
    public int? InventoryProductId { get; private set; }

    /// <summary>
    /// Veri kaynağı modülü
    /// </summary>
    public ProductDataSource DataSource { get; private set; } = ProductDataSource.Sales;

    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }
    public string? CreatedBy { get; private set; }
    public string? UpdatedBy { get; private set; }

    #endregion

    #region Constructors

    private SalesProduct() : base() { }

    #endregion

    #region Factory Methods

    /// <summary>
    /// Yeni ürün (mal) oluşturur
    /// </summary>
    public static Result<SalesProduct> CreateProduct(
        Guid tenantId,
        string productCode,
        string name,
        decimal unitPrice,
        string unit = "C62",
        string unitDescription = "Adet",
        decimal vatRate = 20,
        string? createdBy = null)
    {
        if (string.IsNullOrWhiteSpace(productCode))
            return Result<SalesProduct>.Failure(Error.Validation("SalesProduct.ProductCode", "Ürün kodu zorunludur"));

        if (string.IsNullOrWhiteSpace(name))
            return Result<SalesProduct>.Failure(Error.Validation("SalesProduct.Name", "Ürün adı zorunludur"));

        if (unitPrice < 0)
            return Result<SalesProduct>.Failure(Error.Validation("SalesProduct.UnitPrice", "Birim fiyat negatif olamaz"));

        if (vatRate < 0 || vatRate > 100)
            return Result<SalesProduct>.Failure(Error.Validation("SalesProduct.VatRate", "KDV oranı 0-100 arasında olmalıdır"));

        var product = new SalesProduct
        {
            Id = Guid.NewGuid(),
            ProductCode = productCode.ToUpperInvariant(),
            Name = name.Trim(),
            ProductType = SalesProductType.Product,
            Unit = unit,
            UnitDescription = unitDescription,
            UnitPrice = unitPrice,
            VatRate = vatRate,
            TrackStock = true,
            IsActive = true,
            IsAvailableForSale = true,
            DataSource = ProductDataSource.Sales,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = createdBy
        };
        product.SetTenantId(tenantId);

        return Result<SalesProduct>.Success(product);
    }

    /// <summary>
    /// Yeni hizmet oluşturur
    /// </summary>
    public static Result<SalesProduct> CreateService(
        Guid tenantId,
        string productCode,
        string name,
        decimal unitPrice,
        string unit = "HUR",
        string unitDescription = "Saat",
        decimal vatRate = 20,
        string? createdBy = null)
    {
        if (string.IsNullOrWhiteSpace(productCode))
            return Result<SalesProduct>.Failure(Error.Validation("SalesProduct.ProductCode", "Hizmet kodu zorunludur"));

        if (string.IsNullOrWhiteSpace(name))
            return Result<SalesProduct>.Failure(Error.Validation("SalesProduct.Name", "Hizmet adı zorunludur"));

        if (unitPrice < 0)
            return Result<SalesProduct>.Failure(Error.Validation("SalesProduct.UnitPrice", "Birim fiyat negatif olamaz"));

        var product = new SalesProduct
        {
            Id = Guid.NewGuid(),
            ProductCode = productCode.ToUpperInvariant(),
            Name = name.Trim(),
            ProductType = SalesProductType.Service,
            Unit = unit,
            UnitDescription = unitDescription,
            UnitPrice = unitPrice,
            VatRate = vatRate,
            TrackStock = false, // Hizmetler için stok takibi yok
            IsActive = true,
            IsAvailableForSale = true,
            DataSource = ProductDataSource.Sales,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = createdBy
        };
        product.SetTenantId(tenantId);

        return Result<SalesProduct>.Success(product);
    }

    #endregion

    #region Update Methods

    public Result UpdateBasicInfo(
        string name,
        string? description,
        SalesProductType productType,
        string? updatedBy = null)
    {
        if (string.IsNullOrWhiteSpace(name))
            return Result.Failure(Error.Validation("SalesProduct.Name", "Ürün adı zorunludur"));

        Name = name.Trim();
        Description = description?.Trim();
        ProductType = productType;

        // Hizmet ise stok takibini kapat
        if (productType == SalesProductType.Service)
            TrackStock = false;

        UpdatedAt = DateTime.UtcNow;
        UpdatedBy = updatedBy;

        return Result.Success();
    }

    public Result UpdateCodes(
        string? barcode,
        string? sku,
        string? gtipCode,
        string? updatedBy = null)
    {
        Barcode = barcode;
        SKU = sku;
        GtipCode = gtipCode;
        UpdatedAt = DateTime.UtcNow;
        UpdatedBy = updatedBy;

        return Result.Success();
    }

    public Result UpdateUnit(
        string unit,
        string unitDescription,
        string? updatedBy = null)
    {
        if (string.IsNullOrWhiteSpace(unit))
            return Result.Failure(Error.Validation("SalesProduct.Unit", "Birim kodu zorunludur"));

        Unit = unit;
        UnitDescription = unitDescription;
        UpdatedAt = DateTime.UtcNow;
        UpdatedBy = updatedBy;

        return Result.Success();
    }

    public Result UpdatePricing(
        decimal unitPrice,
        decimal? costPrice,
        decimal? minimumSalePrice,
        decimal? listPrice,
        string? currency = null,
        bool? isPriceIncludingVat = null,
        string? updatedBy = null)
    {
        if (unitPrice < 0)
            return Result.Failure(Error.Validation("SalesProduct.UnitPrice", "Birim fiyat negatif olamaz"));

        if (costPrice.HasValue && costPrice.Value < 0)
            return Result.Failure(Error.Validation("SalesProduct.CostPrice", "Maliyet fiyatı negatif olamaz"));

        if (minimumSalePrice.HasValue && minimumSalePrice.Value < 0)
            return Result.Failure(Error.Validation("SalesProduct.MinimumSalePrice", "Minimum satış fiyatı negatif olamaz"));

        if (minimumSalePrice.HasValue && minimumSalePrice.Value > unitPrice)
            return Result.Failure(Error.Validation("SalesProduct.MinimumSalePrice", "Minimum satış fiyatı birim fiyattan büyük olamaz"));

        UnitPrice = unitPrice;
        CostPrice = costPrice;
        MinimumSalePrice = minimumSalePrice;
        ListPrice = listPrice;

        if (!string.IsNullOrWhiteSpace(currency))
            Currency = currency.ToUpperInvariant();

        if (isPriceIncludingVat.HasValue)
            IsPriceIncludingVat = isPriceIncludingVat.Value;

        UpdatedAt = DateTime.UtcNow;
        UpdatedBy = updatedBy;

        return Result.Success();
    }

    public Result UpdateVatInfo(
        decimal vatRate,
        string? exemptionCode = null,
        string? exemptionReason = null,
        string? updatedBy = null)
    {
        if (vatRate < 0 || vatRate > 100)
            return Result.Failure(Error.Validation("SalesProduct.VatRate", "KDV oranı 0-100 arasında olmalıdır"));

        // KDV 0 ise istisna kodu zorunlu
        if (vatRate == 0 && string.IsNullOrWhiteSpace(exemptionCode))
            return Result.Failure(Error.Validation("SalesProduct.VatExemptionCode", "KDV oranı 0 ise istisna kodu zorunludur"));

        VatRate = vatRate;
        VatExemptionCode = exemptionCode;
        VatExemptionReason = exemptionReason;
        UpdatedAt = DateTime.UtcNow;
        UpdatedBy = updatedBy;

        return Result.Success();
    }

    public Result UpdateSpecialConsumptionTax(
        decimal? rate,
        decimal? amount,
        string? updatedBy = null)
    {
        if (rate.HasValue && (rate.Value < 0 || rate.Value > 100))
            return Result.Failure(Error.Validation("SalesProduct.SpecialConsumptionTaxRate", "ÖTV oranı 0-100 arasında olmalıdır"));

        if (amount.HasValue && amount.Value < 0)
            return Result.Failure(Error.Validation("SalesProduct.SpecialConsumptionTaxAmount", "ÖTV tutarı negatif olamaz"));

        SpecialConsumptionTaxRate = rate;
        SpecialConsumptionTaxAmount = amount;
        UpdatedAt = DateTime.UtcNow;
        UpdatedBy = updatedBy;

        return Result.Success();
    }

    public Result UpdateStockInfo(
        bool trackStock,
        decimal minimumStock,
        decimal? weight = null,
        string? updatedBy = null)
    {
        // Hizmetler için stok takibi yapılamaz
        if (ProductType == SalesProductType.Service && trackStock)
            return Result.Failure(Error.Validation("SalesProduct.TrackStock", "Hizmetler için stok takibi yapılamaz"));

        if (minimumStock < 0)
            return Result.Failure(Error.Validation("SalesProduct.MinimumStock", "Minimum stok negatif olamaz"));

        TrackStock = trackStock;
        MinimumStock = minimumStock;
        Weight = weight;
        UpdatedAt = DateTime.UtcNow;
        UpdatedBy = updatedBy;

        return Result.Success();
    }

    public Result UpdateCategory(
        string? category,
        string? subCategory,
        string? brand,
        string? tags,
        string? updatedBy = null)
    {
        Category = category?.Trim();
        SubCategory = subCategory?.Trim();
        Brand = brand?.Trim();
        Tags = tags;
        UpdatedAt = DateTime.UtcNow;
        UpdatedBy = updatedBy;

        return Result.Success();
    }

    public Result UpdateImages(
        string? imageUrl,
        string? thumbnailUrl,
        string? updatedBy = null)
    {
        ImageUrl = imageUrl;
        ThumbnailUrl = thumbnailUrl;
        UpdatedAt = DateTime.UtcNow;
        UpdatedBy = updatedBy;

        return Result.Success();
    }

    public Result UpdateAvailability(
        bool isAvailableForSale,
        bool showOnWeb,
        string? updatedBy = null)
    {
        IsAvailableForSale = isAvailableForSale;
        ShowOnWeb = showOnWeb;
        UpdatedAt = DateTime.UtcNow;
        UpdatedBy = updatedBy;

        return Result.Success();
    }

    public void SetNotes(string? notes)
    {
        Notes = notes;
        UpdatedAt = DateTime.UtcNow;
    }

    #endregion

    #region Stock Methods

    /// <summary>
    /// Stok miktarını günceller
    /// </summary>
    public Result UpdateStock(decimal quantity, string? updatedBy = null)
    {
        if (!TrackStock)
            return Result.Failure(Error.Validation("SalesProduct.TrackStock", "Bu ürün için stok takibi yapılmıyor"));

        if (quantity < 0)
            return Result.Failure(Error.Validation("SalesProduct.StockQuantity", "Stok miktarı negatif olamaz"));

        StockQuantity = quantity;
        UpdatedAt = DateTime.UtcNow;
        UpdatedBy = updatedBy;

        return Result.Success();
    }

    /// <summary>
    /// Stok miktarını artırır
    /// </summary>
    public Result IncreaseStock(decimal quantity, string? updatedBy = null)
    {
        if (!TrackStock)
            return Result.Failure(Error.Validation("SalesProduct.TrackStock", "Bu ürün için stok takibi yapılmıyor"));

        if (quantity <= 0)
            return Result.Failure(Error.Validation("SalesProduct.Quantity", "Miktar pozitif olmalıdır"));

        StockQuantity += quantity;
        UpdatedAt = DateTime.UtcNow;
        UpdatedBy = updatedBy;

        return Result.Success();
    }

    /// <summary>
    /// Stok miktarını azaltır
    /// </summary>
    public Result DecreaseStock(decimal quantity, string? updatedBy = null)
    {
        if (!TrackStock)
            return Result.Failure(Error.Validation("SalesProduct.TrackStock", "Bu ürün için stok takibi yapılmıyor"));

        if (quantity <= 0)
            return Result.Failure(Error.Validation("SalesProduct.Quantity", "Miktar pozitif olmalıdır"));

        if (StockQuantity < quantity)
            return Result.Failure(Error.Validation("SalesProduct.StockQuantity", "Yetersiz stok"));

        StockQuantity -= quantity;
        UpdatedAt = DateTime.UtcNow;
        UpdatedBy = updatedBy;

        return Result.Success();
    }

    /// <summary>
    /// Stok durumu kontrolü
    /// </summary>
    public bool IsInStock(decimal requiredQuantity = 1)
    {
        if (!TrackStock)
            return true; // Stok takibi yoksa her zaman mevcut

        return StockQuantity >= requiredQuantity;
    }

    /// <summary>
    /// Stok seviyesi düşük mü?
    /// </summary>
    public bool IsLowStock()
    {
        if (!TrackStock)
            return false;

        return StockQuantity <= MinimumStock;
    }

    #endregion

    #region Status Methods

    public Result Activate(string? updatedBy = null)
    {
        if (IsActive)
            return Result.Failure(Error.Conflict("SalesProduct.Status", "Ürün zaten aktif"));

        IsActive = true;
        UpdatedAt = DateTime.UtcNow;
        UpdatedBy = updatedBy;

        return Result.Success();
    }

    public Result Deactivate(string? updatedBy = null)
    {
        if (!IsActive)
            return Result.Failure(Error.Conflict("SalesProduct.Status", "Ürün zaten pasif"));

        IsActive = false;
        IsAvailableForSale = false; // Pasif ürün satışa da kapalı
        UpdatedAt = DateTime.UtcNow;
        UpdatedBy = updatedBy;

        return Result.Success();
    }

    #endregion

    #region Inventory Integration

    /// <summary>
    /// Inventory modülündeki ürün ile ilişkilendirir
    /// </summary>
    public void LinkToInventoryProduct(int inventoryProductId)
    {
        InventoryProductId = inventoryProductId;
        DataSource = ProductDataSource.Inventory;
        UpdatedAt = DateTime.UtcNow;
    }

    /// <summary>
    /// Inventory ilişkisini kaldırır
    /// </summary>
    public void UnlinkFromInventory()
    {
        InventoryProductId = null;
        DataSource = ProductDataSource.Sales;
        UpdatedAt = DateTime.UtcNow;
    }

    #endregion

    #region Calculation Methods

    /// <summary>
    /// KDV dahil fiyat hesaplar
    /// </summary>
    public decimal GetPriceWithVat()
    {
        if (IsPriceIncludingVat)
            return UnitPrice;

        return UnitPrice * (1 + VatRate / 100);
    }

    /// <summary>
    /// KDV hariç fiyat hesaplar
    /// </summary>
    public decimal GetPriceWithoutVat()
    {
        if (!IsPriceIncludingVat)
            return UnitPrice;

        return UnitPrice / (1 + VatRate / 100);
    }

    /// <summary>
    /// Kar marjı hesaplar
    /// </summary>
    public decimal? GetProfitMargin()
    {
        if (!CostPrice.HasValue || CostPrice.Value == 0)
            return null;

        var sellingPrice = GetPriceWithoutVat();
        return ((sellingPrice - CostPrice.Value) / CostPrice.Value) * 100;
    }

    /// <summary>
    /// Toplam satır tutarı hesaplar
    /// </summary>
    public (decimal SubTotal, decimal VatAmount, decimal Total) CalculateLineTotal(
        decimal quantity,
        decimal discountRate = 0)
    {
        var unitPriceExVat = GetPriceWithoutVat();
        var subTotal = unitPriceExVat * quantity;
        var discountAmount = subTotal * discountRate / 100;
        var discountedSubTotal = subTotal - discountAmount;
        var vatAmount = discountedSubTotal * VatRate / 100;
        var total = discountedSubTotal + vatAmount;

        return (discountedSubTotal, vatAmount, total);
    }

    #endregion
}
