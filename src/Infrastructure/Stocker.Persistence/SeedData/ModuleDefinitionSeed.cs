using Microsoft.EntityFrameworkCore;
using Stocker.Domain.Common.ValueObjects;
using Stocker.Domain.Master.Entities;
using Stocker.Persistence.Contexts;

namespace Stocker.Persistence.SeedData;

public static class ModuleDefinitionSeed
{
    // Predefined GUIDs for consistent seeding
    private static readonly Guid CrmModuleId = new("10000000-0000-0000-0000-000000000001");
    private static readonly Guid SalesModuleId = new("10000000-0000-0000-0000-000000000002");
    private static readonly Guid InventoryModuleId = new("10000000-0000-0000-0000-000000000003");
    private static readonly Guid FinanceModuleId = new("10000000-0000-0000-0000-000000000004");
    private static readonly Guid HrModuleId = new("10000000-0000-0000-0000-000000000005");
    private static readonly Guid PurchaseModuleId = new("10000000-0000-0000-0000-000000000006");
    private static readonly Guid CmsModuleId = new("10000000-0000-0000-0000-000000000007");
    private static readonly Guid ManufacturingModuleId = new("10000000-0000-0000-0000-000000000008");

    public static async Task SeedAsync(MasterDbContext context)
    {
        // Get existing module codes to avoid duplicates
        var existingModuleCodes = await context.ModuleDefinitions
            .Select(m => m.Code)
            .ToListAsync();

        var modules = new List<ModuleDefinition>
        {
            CreateModule(
                CrmModuleId, "CRM", "Müşteri İlişkileri Yönetimi",
                "Müşteri takibi, iletişim geçmişi, satış fırsatları ve müşteri segmentasyonu",
                "users", 99m, "TRY", false, 1, "Satış",
                new[] {
                    ("Müşteri Yönetimi", "Müşteri kayıtları ve detaylı profil yönetimi"),
                    ("İletişim Geçmişi", "Tüm müşteri iletişimlerinin kaydı"),
                    ("Satış Fırsatları", "Potansiyel satış takibi ve yönetimi"),
                    ("Müşteri Segmentasyonu", "Müşterileri gruplara ayırma ve hedefleme")
                }),

            CreateModule(
                SalesModuleId, "SALES", "Satış Yönetimi",
                "Satış siparişleri, teklifler, fiyatlandırma ve satış raporları",
                "shopping-cart", 149m, "TRY", false, 2, "Satış",
                new[] {
                    ("Sipariş Yönetimi", "Satış siparişlerinin oluşturulması ve takibi"),
                    ("Teklif Yönetimi", "Müşterilere teklif hazırlama"),
                    ("Fiyat Listeleri", "Ürün ve hizmet fiyatlandırması"),
                    ("Satış Raporları", "Satış performans analizleri")
                }),

            CreateModule(
                InventoryModuleId, "INVENTORY", "Stok Yönetimi",
                "Stok takibi, depo yönetimi, sayım ve envanter kontrolü",
                "package", 129m, "TRY", false, 3, "Operasyon",
                new[] {
                    ("Stok Takibi", "Gerçek zamanlı stok miktarı izleme"),
                    ("Depo Yönetimi", "Çoklu depo ve lokasyon yönetimi"),
                    ("Stok Sayımı", "Periyodik ve sürekli sayım işlemleri"),
                    ("Minimum Stok Uyarıları", "Kritik stok seviyesi bildirimleri"),
                    ("Seri/Lot Takibi", "Ürün parti ve seri numarası takibi")
                }),

            CreateModule(
                FinanceModuleId, "FINANCE", "Finans Yönetimi",
                "Fatura yönetimi, cari hesaplar, tahsilat ve ödeme takibi",
                "credit-card", 199m, "TRY", false, 4, "Finans",
                new[] {
                    ("Fatura Yönetimi", "Satış ve alış faturası işlemleri"),
                    ("Cari Hesaplar", "Müşteri ve tedarikçi hesap takibi"),
                    ("Tahsilat Yönetimi", "Alacak takibi ve tahsilat planları"),
                    ("Ödeme Yönetimi", "Tedarikçi ödemeleri ve planlaması"),
                    ("Finansal Raporlar", "Bilanço, gelir tablosu ve nakit akışı")
                }),

            CreateModule(
                HrModuleId, "HR", "İnsan Kaynakları",
                "Personel yönetimi, izin takibi, bordro ve organizasyon yapısı",
                "user-check", 89m, "TRY", false, 5, "İK",
                new[] {
                    ("Personel Yönetimi", "Çalışan kayıtları ve özlük bilgileri"),
                    ("İzin Yönetimi", "İzin talepleri ve onay süreçleri"),
                    ("Organizasyon Şeması", "Şirket yapısı ve hiyerarşi"),
                    ("Performans Değerlendirme", "Çalışan performans takibi")
                }),

            CreateModule(
                PurchaseModuleId, "PURCHASE", "Satın Alma",
                "Tedarikçi yönetimi, satın alma siparişleri ve tedarik zinciri",
                "truck", 99m, "TRY", false, 6, "Operasyon",
                new[] {
                    ("Tedarikçi Yönetimi", "Tedarikçi kayıtları ve değerlendirme"),
                    ("Satın Alma Siparişleri", "Satın alma talebi ve sipariş yönetimi"),
                    ("Teklif Karşılaştırma", "Tedarikçi tekliflerini karşılaştırma"),
                    ("Mal Kabul", "Gelen ürün kontrolü ve kabul işlemleri")
                }),

            CreateModule(
                CmsModuleId, "CMS", "İçerik Yönetimi",
                "Web sitesi içerik yönetimi, blog, sayfa ve medya yönetimi",
                "file-text", 79m, "TRY", false, 7, "İçerik",
                new[] {
                    ("Sayfa Yönetimi", "Web sitesi sayfaları oluşturma ve düzenleme"),
                    ("Blog Yönetimi", "Blog yazıları ve kategoriler"),
                    ("Medya Kütüphanesi", "Görsel ve dosya yönetimi"),
                    ("SEO Ayarları", "Arama motoru optimizasyonu")
                }),

            CreateModule(
                ManufacturingModuleId, "MANUFACTURING", "Üretim Yönetimi",
                "Üretim planlama, iş emirleri, malzeme ihtiyaç planlaması ve kalite kontrol",
                "settings", 249m, "TRY", false, 8, "Operasyon",
                new[] {
                    ("Üretim Planlama", "MRP/MPS üretim planlaması ve kapasite yönetimi"),
                    ("İş Emri Yönetimi", "Üretim iş emirleri oluşturma ve takibi"),
                    ("Reçete Yönetimi", "Ürün ağaçları (BOM) ve üretim reçeteleri"),
                    ("İş Merkezi Yönetimi", "Üretim hatları ve iş merkezleri tanımı"),
                    ("Kalite Kontrol", "Kalite muayene ve uygunsuzluk raporları"),
                    ("Bakım Yönetimi", "Makine bakım planları ve kayıtları"),
                    ("Maliyet Muhasebesi", "Üretim maliyet analizi ve raporları"),
                    ("OEE Takibi", "Ekipman etkinliği ve performans metrikleri")
                })
        };

        // Add dependencies
        // Sales depends on CRM (needs customer data)
        var salesModule = modules.First(m => m.Code == "SALES");
        salesModule.AddDependency("CRM");

        // Finance depends on Sales (needs sales data for invoicing)
        var financeModule = modules.First(m => m.Code == "FINANCE");
        financeModule.AddDependency("SALES");

        // Purchase depends on Inventory (needs stock data)
        var purchaseModule = modules.First(m => m.Code == "PURCHASE");
        purchaseModule.AddDependency("INVENTORY");

        // Manufacturing depends on Inventory (needs stock/material data)
        var manufacturingModule = modules.First(m => m.Code == "MANUFACTURING");
        manufacturingModule.AddDependency("INVENTORY");

        // Filter out existing modules - only add new ones
        var newModules = modules.Where(m => !existingModuleCodes.Contains(m.Code)).ToList();

        if (newModules.Any())
        {
            context.ModuleDefinitions.AddRange(newModules);
            await context.SaveChangesAsync();
        }
    }

    private static ModuleDefinition CreateModule(
        Guid id,
        string code,
        string name,
        string description,
        string icon,
        decimal monthlyPrice,
        string currency,
        bool isCore,
        int displayOrder,
        string category,
        (string Name, string Description)[] features)
    {
        var module = ModuleDefinition.Create(
            code,
            name,
            Money.Create(monthlyPrice, currency),
            description,
            icon,
            isCore,
            displayOrder,
            category);

        // Use reflection to set the ID for seed data consistency
        var idProperty = typeof(ModuleDefinition).BaseType?.GetProperty("Id");
        if (idProperty != null)
        {
            idProperty.SetValue(module, id);
        }

        foreach (var (featureName, featureDescription) in features)
        {
            module.AddFeature(featureName, featureDescription);
        }

        return module;
    }
}
