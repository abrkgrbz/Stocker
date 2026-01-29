using Stocker.Modules.Sales.Domain.Entities;
using Stocker.Modules.Sales.Domain.Enums;

namespace Stocker.Modules.Sales.Domain.Services;

/// <summary>
/// Müşteri ve ürün verilerini çözmek için kullanılan arayüz.
/// Hangi modülün aktif olduğuna göre doğru kaynaktan veri çeker.
///
/// Modül Kombinasyonları:
/// - Sadece Sales: SalesCustomer ve SalesProduct kullanılır
/// - Sales + CRM: Müşteriler CRM'den, ürünler SalesProduct'tan
/// - Sales + Inventory: Müşteriler SalesCustomer'dan, ürünler Inventory'den
/// - Sales + CRM + Inventory: Her ikisi de kendi modülünden
/// </summary>
public interface ISalesDataResolver
{
    #region Module Check

    /// <summary>
    /// CRM modülü aktif mi?
    /// </summary>
    Task<bool> IsCrmModuleActiveAsync(Guid tenantId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Inventory modülü aktif mi?
    /// </summary>
    Task<bool> IsInventoryModuleActiveAsync(Guid tenantId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Müşteri veri kaynağını belirler
    /// </summary>
    Task<CustomerDataSource> GetCustomerDataSourceAsync(Guid tenantId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Ürün veri kaynağını belirler
    /// </summary>
    Task<ProductDataSource> GetProductDataSourceAsync(Guid tenantId, CancellationToken cancellationToken = default);

    #endregion

    #region Customer Resolution

    /// <summary>
    /// Unified müşteri bilgisi döner.
    /// CRM modülü aktifse CRM.Customer'dan, değilse SalesCustomer'dan alır.
    /// </summary>
    Task<ResolvedCustomer?> ResolveCustomerAsync(
        Guid tenantId,
        Guid customerId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Müşteri listesi döner.
    /// CRM modülü aktifse CRM.Customer'dan, değilse SalesCustomer'dan alır.
    /// </summary>
    Task<IReadOnlyList<ResolvedCustomer>> ResolveCustomersAsync(
        Guid tenantId,
        CustomerSearchFilter? filter = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Müşteri ID'den resolved customer'a çevirir
    /// </summary>
    Task<ResolvedCustomer?> ResolveCustomerByCodeAsync(
        Guid tenantId,
        string customerCode,
        CancellationToken cancellationToken = default);

    #endregion

    #region Product Resolution

    /// <summary>
    /// Unified ürün bilgisi döner.
    /// Inventory modülü aktifse Inventory.Product'tan, değilse SalesProduct'tan alır.
    /// </summary>
    Task<ResolvedProduct?> ResolveProductAsync(
        Guid tenantId,
        Guid productId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Inventory ID ile ürün çözümler (Inventory modülü int ID kullanıyor)
    /// </summary>
    Task<ResolvedProduct?> ResolveProductByInventoryIdAsync(
        Guid tenantId,
        int inventoryProductId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Ürün listesi döner.
    /// Inventory modülü aktifse Inventory.Product'tan, değilse SalesProduct'tan alır.
    /// </summary>
    Task<IReadOnlyList<ResolvedProduct>> ResolveProductsAsync(
        Guid tenantId,
        ProductSearchFilter? filter = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Ürün kodu ile çözümler
    /// </summary>
    Task<ResolvedProduct?> ResolveProductByCodeAsync(
        Guid tenantId,
        string productCode,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Barkod ile ürün çözümler
    /// </summary>
    Task<ResolvedProduct?> ResolveProductByBarcodeAsync(
        Guid tenantId,
        string barcode,
        CancellationToken cancellationToken = default);

    #endregion

    #region Stock Check (Integration with Inventory)

    /// <summary>
    /// Ürün stok miktarını kontrol eder.
    /// Inventory modülü aktifse oradan, değilse SalesProduct'tan alır.
    /// </summary>
    Task<decimal> GetAvailableStockAsync(
        Guid tenantId,
        Guid productId,
        int? warehouseId = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Stok rezervasyonu yapar (Inventory modülü varsa)
    /// </summary>
    Task<bool> ReserveStockAsync(
        Guid tenantId,
        Guid productId,
        decimal quantity,
        string referenceNumber,
        int? warehouseId = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Stok rezervasyonunu iptal eder
    /// </summary>
    Task<bool> ReleaseStockReservationAsync(
        Guid tenantId,
        string referenceNumber,
        CancellationToken cancellationToken = default);

    #endregion
}

/// <summary>
/// Çözümlenmiş (unified) müşteri modeli.
/// CRM veya Sales modülünden gelen veriyi standart formata çevirir.
/// </summary>
public record ResolvedCustomer
{
    /// <summary>
    /// Kaynak modüldeki ID
    /// </summary>
    public Guid Id { get; init; }

    /// <summary>
    /// Veri kaynağı
    /// </summary>
    public CustomerDataSource DataSource { get; init; }

    /// <summary>
    /// Müşteri kodu
    /// </summary>
    public string CustomerCode { get; init; } = string.Empty;

    /// <summary>
    /// Müşteri tipi
    /// </summary>
    public SalesCustomerType CustomerType { get; init; }

    /// <summary>
    /// Görüntülenecek isim
    /// </summary>
    public string DisplayName { get; init; } = string.Empty;

    /// <summary>
    /// Şirket adı (kurumsal için)
    /// </summary>
    public string? CompanyName { get; init; }

    /// <summary>
    /// Ad (bireysel için)
    /// </summary>
    public string? FirstName { get; init; }

    /// <summary>
    /// Soyad (bireysel için)
    /// </summary>
    public string? LastName { get; init; }

    #region Tax Info (e-Fatura için)

    /// <summary>
    /// VKN (Vergi Kimlik Numarası)
    /// </summary>
    public string? TaxNumber { get; init; }

    /// <summary>
    /// TCKN (T.C. Kimlik Numarası)
    /// </summary>
    public string? IdentityNumber { get; init; }

    /// <summary>
    /// Vergi Dairesi
    /// </summary>
    public string? TaxOffice { get; init; }

    /// <summary>
    /// e-Fatura için vergi tanımlayıcısı
    /// </summary>
    public string TaxIdentifier => CustomerType switch
    {
        SalesCustomerType.Corporate => TaxNumber ?? string.Empty,
        SalesCustomerType.Individual => IdentityNumber ?? TaxNumber ?? "11111111111",
        SalesCustomerType.Retail => "11111111111",
        SalesCustomerType.Foreign => TaxNumber ?? "2222222222",
        _ => TaxNumber ?? IdentityNumber ?? string.Empty
    };

    #endregion

    #region Contact Info

    public string? Email { get; init; }
    public string? Phone { get; init; }
    public string? MobilePhone { get; init; }

    #endregion

    #region Address

    public string? AddressLine { get; init; }
    public string? District { get; init; }
    public string? City { get; init; }
    public string? PostalCode { get; init; }
    public string Country { get; init; } = "Türkiye";
    public string CountryCode { get; init; } = "TR";

    public string FullAddress
    {
        get
        {
            var parts = new List<string>();
            if (!string.IsNullOrWhiteSpace(AddressLine)) parts.Add(AddressLine);
            if (!string.IsNullOrWhiteSpace(District)) parts.Add(District);
            if (!string.IsNullOrWhiteSpace(City)) parts.Add(City);
            if (!string.IsNullOrWhiteSpace(PostalCode)) parts.Add(PostalCode);
            if (!string.IsNullOrWhiteSpace(Country) && Country != "Türkiye") parts.Add(Country);
            return string.Join(", ", parts);
        }
    }

    #endregion

    #region Financial

    public decimal CreditLimit { get; init; }
    public decimal CurrentBalance { get; init; }
    public int DefaultPaymentTermDays { get; init; }
    public decimal DefaultVatRate { get; init; } = 20;
    public string Currency { get; init; } = "TRY";

    #endregion

    #region e-Fatura

    public bool IsEInvoiceRegistered { get; init; }
    public string? EInvoiceAlias { get; init; }

    #endregion

    public bool IsActive { get; init; } = true;

    /// <summary>
    /// Fatura kesilebilir mi?
    /// </summary>
    public bool CanInvoice()
    {
        if (string.IsNullOrWhiteSpace(DisplayName))
            return false;

        if (CustomerType == SalesCustomerType.Corporate)
        {
            if (string.IsNullOrWhiteSpace(TaxNumber) || string.IsNullOrWhiteSpace(TaxOffice))
                return false;
        }

        return true;
    }
}

/// <summary>
/// Çözümlenmiş (unified) ürün modeli.
/// Inventory veya Sales modülünden gelen veriyi standart formata çevirir.
/// </summary>
public record ResolvedProduct
{
    /// <summary>
    /// Kaynak modüldeki ID (Guid)
    /// Sales modülü için geçerli
    /// </summary>
    public Guid Id { get; init; }

    /// <summary>
    /// Inventory modülü ID'si (int)
    /// Inventory modülü aktifse dolu
    /// </summary>
    public int? InventoryProductId { get; init; }

    /// <summary>
    /// Veri kaynağı
    /// </summary>
    public ProductDataSource DataSource { get; init; }

    /// <summary>
    /// Ürün kodu
    /// </summary>
    public string ProductCode { get; init; } = string.Empty;

    /// <summary>
    /// Ürün adı
    /// </summary>
    public string Name { get; init; } = string.Empty;

    /// <summary>
    /// Açıklama
    /// </summary>
    public string? Description { get; init; }

    /// <summary>
    /// Ürün tipi
    /// </summary>
    public SalesProductType ProductType { get; init; }

    #region Codes

    public string? Barcode { get; init; }
    public string? SKU { get; init; }
    public string? GtipCode { get; init; }

    #endregion

    #region Unit

    public string Unit { get; init; } = "C62";
    public string UnitDescription { get; init; } = "Adet";

    #endregion

    #region Pricing

    public decimal UnitPrice { get; init; }
    public string Currency { get; init; } = "TRY";
    public decimal? CostPrice { get; init; }
    public decimal? MinimumSalePrice { get; init; }
    public decimal? ListPrice { get; init; }
    public bool IsPriceIncludingVat { get; init; }

    #endregion

    #region Tax

    public decimal VatRate { get; init; } = 20;
    public string? VatExemptionCode { get; init; }
    public string? VatExemptionReason { get; init; }

    #endregion

    #region Stock

    public bool TrackStock { get; init; } = true;
    public decimal StockQuantity { get; init; }
    public decimal MinimumStock { get; init; }
    public decimal? AvailableStock { get; init; }

    #endregion

    #region Category

    public string? Category { get; init; }
    public string? SubCategory { get; init; }
    public string? Brand { get; init; }

    #endregion

    #region Images

    public string? ImageUrl { get; init; }
    public string? ThumbnailUrl { get; init; }

    #endregion

    public bool IsActive { get; init; } = true;
    public bool IsAvailableForSale { get; init; } = true;

    /// <summary>
    /// KDV dahil fiyat
    /// </summary>
    public decimal GetPriceWithVat() =>
        IsPriceIncludingVat ? UnitPrice : UnitPrice * (1 + VatRate / 100);

    /// <summary>
    /// KDV hariç fiyat
    /// </summary>
    public decimal GetPriceWithoutVat() =>
        IsPriceIncludingVat ? UnitPrice / (1 + VatRate / 100) : UnitPrice;

    /// <summary>
    /// Stok kontrolü
    /// </summary>
    public bool IsInStock(decimal requiredQuantity = 1)
    {
        if (!TrackStock) return true;
        var available = AvailableStock ?? StockQuantity;
        return available >= requiredQuantity;
    }
}

/// <summary>
/// Müşteri arama filtresi
/// </summary>
public record CustomerSearchFilter
{
    public string? SearchTerm { get; init; }
    public SalesCustomerType? CustomerType { get; init; }
    public bool? IsActive { get; init; }
    public string? City { get; init; }
    public bool? IsEInvoiceRegistered { get; init; }
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 50;
    public string? SortBy { get; init; }
    public bool SortDescending { get; init; }
}

/// <summary>
/// Ürün arama filtresi
/// </summary>
public record ProductSearchFilter
{
    public string? SearchTerm { get; init; }
    public SalesProductType? ProductType { get; init; }
    public bool? IsActive { get; init; }
    public bool? IsAvailableForSale { get; init; }
    public string? Category { get; init; }
    public string? Brand { get; init; }
    public decimal? MinPrice { get; init; }
    public decimal? MaxPrice { get; init; }
    public bool? InStockOnly { get; init; }
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 50;
    public string? SortBy { get; init; }
    public bool SortDescending { get; init; }
}
