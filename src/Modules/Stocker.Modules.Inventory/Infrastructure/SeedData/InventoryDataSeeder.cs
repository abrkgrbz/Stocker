using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Modules.Inventory.Domain.Entities;
using Stocker.Modules.Inventory.Infrastructure.Persistence;

namespace Stocker.Modules.Inventory.Infrastructure.SeedData;

/// <summary>
/// Envanter modulu icin varsayilan seed data
/// Birimler, ambalaj tipleri, kategoriler ve siparis kurallari
/// </summary>
public class InventoryDataSeeder
{
    private readonly InventoryDbContext _context;
    private readonly ILogger<InventoryDataSeeder> _logger;
    private readonly Guid _tenantId;

    public InventoryDataSeeder(
        InventoryDbContext context,
        ILogger<InventoryDataSeeder> logger,
        Guid tenantId)
    {
        _context = context ?? throw new ArgumentNullException(nameof(context));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        _tenantId = tenantId;
    }

    /// <summary>
    /// Tum seed data'yi yukle
    /// </summary>
    public async Task SeedAsync()
    {
        await SeedUnitsAsync();
        await SeedPackagingTypesAsync();
        await SeedDefaultCategoriesAsync();
        await SeedDefaultWarehouseAsync();
        await _context.SaveChangesAsync();

        _logger.LogInformation("Inventory seed data completed for tenant: {TenantId}", _tenantId);
    }

    #region Units - Birimler

    private async Task SeedUnitsAsync()
    {
        if (await _context.Units.IgnoreQueryFilters().AnyAsync(u => u.TenantId == _tenantId))
        {
            _logger.LogInformation("Units already seeded for tenant: {TenantId}", _tenantId);
            return;
        }

        var units = new List<Unit>();

        // Temel Birimler (Base Units)
        var adet = CreateUnit("ADET", "Adet", "ad", isBase: true, allowDecimals: false, displayOrder: 1);
        var kg = CreateUnit("KG", "Kilogram", "kg", isBase: true, allowDecimals: true, decimalPlaces: 3, displayOrder: 2);
        var lt = CreateUnit("LT", "Litre", "lt", isBase: true, allowDecimals: true, decimalPlaces: 2, displayOrder: 3);
        var mt = CreateUnit("MT", "Metre", "m", isBase: true, allowDecimals: true, decimalPlaces: 2, displayOrder: 4);
        var m2 = CreateUnit("M2", "Metrekare", "m²", isBase: true, allowDecimals: true, decimalPlaces: 2, displayOrder: 5);
        var m3 = CreateUnit("M3", "Metrekup", "m³", isBase: true, allowDecimals: true, decimalPlaces: 3, displayOrder: 6);

        units.AddRange(new[] { adet, kg, lt, mt, m2, m3 });

        // Turetilmis Birimler (Derived Units)
        units.Add(CreateUnit("GR", "Gram", "g", isBase: true, allowDecimals: true, decimalPlaces: 0, displayOrder: 10));
        units.Add(CreateUnit("MG", "Miligram", "mg", isBase: true, allowDecimals: false, displayOrder: 11));
        units.Add(CreateUnit("TON", "Ton", "ton", isBase: true, allowDecimals: true, decimalPlaces: 3, displayOrder: 12));

        units.Add(CreateUnit("ML", "Mililitre", "ml", isBase: true, allowDecimals: false, displayOrder: 15));
        units.Add(CreateUnit("CL", "Santilitre", "cl", isBase: true, allowDecimals: true, decimalPlaces: 1, displayOrder: 16));

        units.Add(CreateUnit("CM", "Santimetre", "cm", isBase: true, allowDecimals: true, decimalPlaces: 1, displayOrder: 20));
        units.Add(CreateUnit("MM", "Milimetre", "mm", isBase: true, allowDecimals: false, displayOrder: 21));

        // Paket Birimleri
        units.Add(CreateUnit("KOLI", "Koli", "koli", isBase: true, allowDecimals: false, displayOrder: 30));
        units.Add(CreateUnit("PAKET", "Paket", "pkt", isBase: true, allowDecimals: false, displayOrder: 31));
        units.Add(CreateUnit("KUTU", "Kutu", "kutu", isBase: true, allowDecimals: false, displayOrder: 32));
        units.Add(CreateUnit("PALET", "Palet", "plt", isBase: true, allowDecimals: false, displayOrder: 33));
        units.Add(CreateUnit("KASA", "Kasa", "kasa", isBase: true, allowDecimals: false, displayOrder: 34));
        units.Add(CreateUnit("TORBA", "Torba", "torba", isBase: true, allowDecimals: false, displayOrder: 35));
        units.Add(CreateUnit("CUVAL", "Cuval", "cuval", isBase: true, allowDecimals: false, displayOrder: 36));

        // Ozel Birimler
        units.Add(CreateUnit("DUZINE", "Duzine", "dzn", isBase: true, allowDecimals: false, displayOrder: 40, description: "12 adet"));
        units.Add(CreateUnit("TAKIM", "Takim", "tkm", isBase: true, allowDecimals: false, displayOrder: 41));
        units.Add(CreateUnit("SET", "Set", "set", isBase: true, allowDecimals: false, displayOrder: 42));
        units.Add(CreateUnit("CIFT", "Cift", "cft", isBase: true, allowDecimals: false, displayOrder: 43, description: "2 adet"));
        units.Add(CreateUnit("RULO", "Rulo", "rulo", isBase: true, allowDecimals: false, displayOrder: 44));
        units.Add(CreateUnit("TOP", "Top", "top", isBase: true, allowDecimals: false, displayOrder: 45));

        await _context.Units.AddRangeAsync(units);
        _logger.LogInformation("Seeded {Count} units for tenant: {TenantId}", units.Count, _tenantId);
    }

    private Unit CreateUnit(string code, string name, string symbol, bool isBase, bool allowDecimals, int decimalPlaces = 0, int displayOrder = 0, string? description = null)
    {
        var unit = new Unit(code, name, symbol);
        unit.SetDecimalSettings(allowDecimals, decimalPlaces);
        unit.SetDisplayOrder(displayOrder);
        if (!string.IsNullOrEmpty(description))
        {
            unit.UpdateUnit(name, symbol, description);
        }

        // TenantId ayarla
        unit.SetTenantId(_tenantId);

        return unit;
    }

    #endregion

    #region Packaging Types - Ambalaj Tipleri

    private async Task SeedPackagingTypesAsync()
    {
        if (await _context.PackagingTypes.IgnoreQueryFilters().AnyAsync(p => p.TenantId == _tenantId))
        {
            _logger.LogInformation("Packaging types already seeded for tenant: {TenantId}", _tenantId);
            return;
        }

        var packagingTypes = new List<PackagingType>();

        // Kutu Tipleri
        packagingTypes.Add(CreatePackagingType("KUTU-S", "Kucuk Kutu", PackagingCategory.Box, 20, 15, 10, 0.2m));
        packagingTypes.Add(CreatePackagingType("KUTU-M", "Orta Kutu", PackagingCategory.Box, 40, 30, 20, 0.5m));
        packagingTypes.Add(CreatePackagingType("KUTU-L", "Buyuk Kutu", PackagingCategory.Box, 60, 40, 30, 0.8m));
        packagingTypes.Add(CreatePackagingType("KUTU-XL", "Ekstra Buyuk Kutu", PackagingCategory.Box, 80, 60, 40, 1.2m));

        // Koli Tipleri
        packagingTypes.Add(CreatePackagingType("KOLI-S", "Kucuk Koli", PackagingCategory.Carton, 30, 20, 15, 0.3m, stackableCount: 5));
        packagingTypes.Add(CreatePackagingType("KOLI-M", "Orta Koli", PackagingCategory.Carton, 50, 35, 25, 0.6m, stackableCount: 4));
        packagingTypes.Add(CreatePackagingType("KOLI-L", "Buyuk Koli", PackagingCategory.Carton, 60, 40, 40, 1.0m, stackableCount: 3));
        packagingTypes.Add(CreatePackagingType("KOLI-XL", "Ekstra Buyuk Koli", PackagingCategory.Carton, 80, 60, 50, 1.5m, stackableCount: 2));

        // Palet Tipleri
        packagingTypes.Add(CreatePackagingType("PALET-EUR", "Euro Palet", PackagingCategory.Pallet, 120, 80, 15, 25m, isReturnable: true, maxWeight: 1500));
        packagingTypes.Add(CreatePackagingType("PALET-IND", "Endustri Paleti", PackagingCategory.Pallet, 120, 100, 15, 30m, isReturnable: true, maxWeight: 2000));
        packagingTypes.Add(CreatePackagingType("PALET-HAF", "Hafif Palet", PackagingCategory.Pallet, 120, 80, 12, 15m, isReturnable: false, maxWeight: 500));

        // Kasa Tipleri
        packagingTypes.Add(CreatePackagingType("KASA-PLS", "Plastik Kasa", PackagingCategory.Crate, 60, 40, 30, 2.5m, isReturnable: true, stackableCount: 6));
        packagingTypes.Add(CreatePackagingType("KASA-AHB", "Ahsap Kasa", PackagingCategory.Crate, 60, 40, 30, 5m, stackableCount: 4));
        packagingTypes.Add(CreatePackagingType("KASA-MTL", "Metal Kasa", PackagingCategory.Crate, 80, 60, 40, 15m, isReturnable: true, stackableCount: 3));

        // Torba/Cuval
        packagingTypes.Add(CreatePackagingType("TORBA-5", "5 Kg Torba", PackagingCategory.Bag, maxWeight: 5));
        packagingTypes.Add(CreatePackagingType("TORBA-10", "10 Kg Torba", PackagingCategory.Bag, maxWeight: 10));
        packagingTypes.Add(CreatePackagingType("TORBA-25", "25 Kg Torba", PackagingCategory.Bag, maxWeight: 25));
        packagingTypes.Add(CreatePackagingType("CUVAL-50", "50 Kg Cuval", PackagingCategory.Bag, maxWeight: 50));

        // Bidon/Varil
        packagingTypes.Add(CreatePackagingType("BIDON-5", "5 Lt Bidon", PackagingCategory.Drum, defaultQuantity: 5));
        packagingTypes.Add(CreatePackagingType("BIDON-20", "20 Lt Bidon", PackagingCategory.Drum, defaultQuantity: 20));
        packagingTypes.Add(CreatePackagingType("VARIL-200", "200 Lt Varil", PackagingCategory.Drum, defaultQuantity: 200, isReturnable: true));

        // Sise/Kavanoz
        packagingTypes.Add(CreatePackagingType("SISE-250", "250 ml Sise", PackagingCategory.Bottle, defaultQuantity: 0.25m));
        packagingTypes.Add(CreatePackagingType("SISE-500", "500 ml Sise", PackagingCategory.Bottle, defaultQuantity: 0.5m));
        packagingTypes.Add(CreatePackagingType("SISE-1000", "1 Lt Sise", PackagingCategory.Bottle, defaultQuantity: 1));
        packagingTypes.Add(CreatePackagingType("KAVANOZ-S", "Kucuk Kavanoz", PackagingCategory.Jar, defaultQuantity: 0.25m));
        packagingTypes.Add(CreatePackagingType("KAVANOZ-M", "Orta Kavanoz", PackagingCategory.Jar, defaultQuantity: 0.5m));

        // Rulo
        packagingTypes.Add(CreatePackagingType("RULO-S", "Kucuk Rulo", PackagingCategory.Roll));
        packagingTypes.Add(CreatePackagingType("RULO-M", "Orta Rulo", PackagingCategory.Roll));
        packagingTypes.Add(CreatePackagingType("RULO-L", "Buyuk Rulo", PackagingCategory.Roll));

        await _context.PackagingTypes.AddRangeAsync(packagingTypes);
        _logger.LogInformation("Seeded {Count} packaging types for tenant: {TenantId}", packagingTypes.Count, _tenantId);
    }

    private PackagingType CreatePackagingType(
        string code,
        string name,
        PackagingCategory category,
        decimal? length = null,
        decimal? width = null,
        decimal? height = null,
        decimal? emptyWeight = null,
        bool isReturnable = false,
        decimal? maxWeight = null,
        int? stackableCount = null,
        decimal? defaultQuantity = null)
    {
        var packagingType = new PackagingType(code, name, category);

        if (length.HasValue && width.HasValue && height.HasValue)
        {
            packagingType.SetDimensions(length, width, height);
        }

        if (emptyWeight.HasValue || maxWeight.HasValue)
        {
            packagingType.SetWeightInfo(emptyWeight, maxWeight);
        }

        if (stackableCount.HasValue)
        {
            packagingType.SetStackingInfo(true, stackableCount);
        }

        if (defaultQuantity.HasValue)
        {
            packagingType.SetCapacity(defaultQuantity, null);
        }

        if (isReturnable)
        {
            packagingType.SetReturnableInfo(true, null);
        }

        // TenantId ayarla
        packagingType.SetTenantId(_tenantId);

        return packagingType;
    }

    #endregion

    #region Categories - Kategoriler

    private async Task SeedDefaultCategoriesAsync()
    {
        if (await _context.Categories.IgnoreQueryFilters().AnyAsync(c => c.TenantId == _tenantId))
        {
            _logger.LogInformation("Categories already seeded for tenant: {TenantId}", _tenantId);
            return;
        }

        var categories = new List<Category>();

        // Ana Kategoriler
        var hammadde = CreateCategory("HAMMADDE", "Hammadde", "Ham maddeler ve temel malzemeler", displayOrder: 1);
        var yarimamul = CreateCategory("YARI-MAMUL", "Yari Mamul", "Uretim surecindeki ara urunler", displayOrder: 2);
        var mamul = CreateCategory("MAMUL", "Mamul", "Satis icin hazir urunler", displayOrder: 3);
        var sarf = CreateCategory("SARF", "Sarf Malzemesi", "Tuketim malzemeleri", displayOrder: 4);
        var yedek = CreateCategory("YEDEK-PARCA", "Yedek Parca", "Makine ve ekipman yedek parcalari", displayOrder: 5);
        var ambalaj = CreateCategory("AMBALAJ", "Ambalaj Malzemesi", "Paketleme ve ambalaj malzemeleri", displayOrder: 6);
        var hizmet = CreateCategory("HIZMET", "Hizmet", "Hizmet kalemleri", displayOrder: 7);
        var diger = CreateCategory("DIGER", "Diger", "Diger kategoriler", displayOrder: 99);

        categories.AddRange(new[] { hammadde, yarimamul, mamul, sarf, yedek, ambalaj, hizmet, diger });

        await _context.Categories.AddRangeAsync(categories);
        _logger.LogInformation("Seeded {Count} categories for tenant: {TenantId}", categories.Count, _tenantId);
    }

    private Category CreateCategory(string code, string name, string? description = null, int displayOrder = 0)
    {
        var category = new Category(code, name);
        if (!string.IsNullOrEmpty(description))
        {
            category.UpdateCategory(name, description, null);
        }
        category.SetDisplayOrder(displayOrder);

        // TenantId ayarla
        category.SetTenantId(_tenantId);

        return category;
    }

    #endregion

    #region Default Warehouse - Varsayilan Depo

    private async Task SeedDefaultWarehouseAsync()
    {
        if (await _context.Warehouses.IgnoreQueryFilters().AnyAsync(w => w.TenantId == _tenantId))
        {
            _logger.LogInformation("Warehouse already seeded for tenant: {TenantId}", _tenantId);
            return;
        }

        var warehouse = new Warehouse("MERKEZ", "Merkez Depo");
        warehouse.UpdateWarehouse("Merkez Depo", "Ana depo", null, null, null);
        warehouse.SetAsDefault();

        // TenantId ayarla
        warehouse.SetTenantId(_tenantId);

        await _context.Warehouses.AddAsync(warehouse);
        _logger.LogInformation("Seeded default warehouse for tenant: {TenantId}", _tenantId);
    }

    #endregion
}
