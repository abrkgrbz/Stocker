using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Modules.Finance.Domain.Entities;
using Stocker.Modules.Finance.Domain.Enums;
using Stocker.Modules.Finance.Infrastructure.Persistence;

// Resolve ambiguity between Domain.Entities and Domain.Enums
using CostCenterType = Stocker.Modules.Finance.Domain.Entities.CostCenterType;
using CostCenterCategory = Stocker.Modules.Finance.Domain.Entities.CostCenterCategory;

namespace Stocker.Modules.Finance.Infrastructure.SeedData;

/// <summary>
/// Finance modülü için varsayılan seed data
/// Türkiye Tekdüzen Hesap Planı (Turkish Uniform Chart of Accounts)
/// </summary>
public class FinanceDataSeeder
{
    private readonly FinanceDbContext _context;
    private readonly ILogger<FinanceDataSeeder> _logger;
    private readonly Guid _tenantId;

    public FinanceDataSeeder(
        FinanceDbContext context,
        ILogger<FinanceDataSeeder> logger,
        Guid tenantId)
    {
        _context = context ?? throw new ArgumentNullException(nameof(context));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        _tenantId = tenantId;
    }

    /// <summary>
    /// Tüm seed data'yı yükle
    /// </summary>
    public async Task SeedAsync()
    {
        await SeedChartOfAccountsAsync();
        await SeedCostCentersAsync();
        await _context.SaveChangesAsync();

        _logger.LogInformation("Finance seed data completed for tenant: {TenantId}", _tenantId);
    }

    #region Chart of Accounts - Tekdüzen Hesap Planı

    private async Task SeedChartOfAccountsAsync()
    {
        if (await _context.Accounts.IgnoreQueryFilters().AnyAsync(a => a.TenantId == _tenantId))
        {
            _logger.LogInformation("Chart of accounts already seeded for tenant: {TenantId}", _tenantId);
            return;
        }

        var accounts = new List<Account>();

        // ============================================
        // 1 - DÖNEN VARLIKLAR (CURRENT ASSETS)
        // ============================================

        // 10 - Hazır Değerler
        accounts.Add(CreateAccount("100", "Kasa", AccountType.CurrentAssets, AccountSubGroup.CashAndCashEquivalents));
        accounts.Add(CreateAccount("100.01", "TL Kasası", AccountType.CurrentAssets, AccountSubGroup.CashAndCashEquivalents, "100"));
        accounts.Add(CreateAccount("100.02", "USD Kasası", AccountType.CurrentAssets, AccountSubGroup.CashAndCashEquivalents, "100", "USD"));
        accounts.Add(CreateAccount("100.03", "EUR Kasası", AccountType.CurrentAssets, AccountSubGroup.CashAndCashEquivalents, "100", "EUR"));

        accounts.Add(CreateAccount("101", "Alınan Çekler", AccountType.CurrentAssets, AccountSubGroup.CashAndCashEquivalents));
        accounts.Add(CreateAccount("102", "Bankalar", AccountType.CurrentAssets, AccountSubGroup.CashAndCashEquivalents));
        accounts.Add(CreateAccount("102.01", "Vadesiz TL Hesaplar", AccountType.CurrentAssets, AccountSubGroup.CashAndCashEquivalents, "102"));
        accounts.Add(CreateAccount("102.02", "Vadesiz Döviz Hesapları", AccountType.CurrentAssets, AccountSubGroup.CashAndCashEquivalents, "102"));
        accounts.Add(CreateAccount("103", "Verilen Çekler ve Ödeme Emirleri (-)", AccountType.CurrentAssets, AccountSubGroup.CashAndCashEquivalents));
        accounts.Add(CreateAccount("108", "Diğer Hazır Değerler", AccountType.CurrentAssets, AccountSubGroup.CashAndCashEquivalents));

        // 11 - Menkul Kıymetler
        accounts.Add(CreateAccount("110", "Hisse Senetleri", AccountType.CurrentAssets, AccountSubGroup.MarketableSecurities));
        accounts.Add(CreateAccount("111", "Özel Kesim Tahvil, Senet ve Bonoları", AccountType.CurrentAssets, AccountSubGroup.MarketableSecurities));
        accounts.Add(CreateAccount("112", "Kamu Kesimi Tahvil, Senet ve Bonoları", AccountType.CurrentAssets, AccountSubGroup.MarketableSecurities));
        accounts.Add(CreateAccount("118", "Diğer Menkul Kıymetler", AccountType.CurrentAssets, AccountSubGroup.MarketableSecurities));
        accounts.Add(CreateAccount("119", "Menkul Kıymetler Değer Düşüklüğü Karşılığı (-)", AccountType.CurrentAssets, AccountSubGroup.MarketableSecurities));

        // 12 - Ticari Alacaklar
        accounts.Add(CreateAccount("120", "Alıcılar", AccountType.CurrentAssets, AccountSubGroup.TradeReceivables));
        accounts.Add(CreateAccount("120.01", "Yurtiçi Alıcılar", AccountType.CurrentAssets, AccountSubGroup.TradeReceivables, "120"));
        accounts.Add(CreateAccount("120.02", "Yurtdışı Alıcılar", AccountType.CurrentAssets, AccountSubGroup.TradeReceivables, "120"));
        accounts.Add(CreateAccount("121", "Alacak Senetleri", AccountType.CurrentAssets, AccountSubGroup.TradeReceivables));
        accounts.Add(CreateAccount("122", "Alacak Senetleri Reeskontu (-)", AccountType.CurrentAssets, AccountSubGroup.TradeReceivables));
        accounts.Add(CreateAccount("126", "Verilen Depozito ve Teminatlar", AccountType.CurrentAssets, AccountSubGroup.TradeReceivables));
        accounts.Add(CreateAccount("127", "Diğer Ticari Alacaklar", AccountType.CurrentAssets, AccountSubGroup.TradeReceivables));
        accounts.Add(CreateAccount("128", "Şüpheli Ticari Alacaklar", AccountType.CurrentAssets, AccountSubGroup.TradeReceivables));
        accounts.Add(CreateAccount("129", "Şüpheli Ticari Alacaklar Karşılığı (-)", AccountType.CurrentAssets, AccountSubGroup.TradeReceivables));

        // 13 - Diğer Alacaklar
        accounts.Add(CreateAccount("131", "Ortaklardan Alacaklar", AccountType.CurrentAssets, AccountSubGroup.OtherReceivables));
        accounts.Add(CreateAccount("132", "İştiraklerden Alacaklar", AccountType.CurrentAssets, AccountSubGroup.OtherReceivables));
        accounts.Add(CreateAccount("133", "Bağlı Ortaklıklardan Alacaklar", AccountType.CurrentAssets, AccountSubGroup.OtherReceivables));
        accounts.Add(CreateAccount("135", "Personelden Alacaklar", AccountType.CurrentAssets, AccountSubGroup.OtherReceivables));
        accounts.Add(CreateAccount("136", "Diğer Çeşitli Alacaklar", AccountType.CurrentAssets, AccountSubGroup.OtherReceivables));
        accounts.Add(CreateAccount("137", "Diğer Alacak Senetleri Reeskontu (-)", AccountType.CurrentAssets, AccountSubGroup.OtherReceivables));
        accounts.Add(CreateAccount("138", "Şüpheli Diğer Alacaklar", AccountType.CurrentAssets, AccountSubGroup.OtherReceivables));
        accounts.Add(CreateAccount("139", "Şüpheli Diğer Alacaklar Karşılığı (-)", AccountType.CurrentAssets, AccountSubGroup.OtherReceivables));

        // 15 - Stoklar
        accounts.Add(CreateAccount("150", "İlk Madde ve Malzeme", AccountType.CurrentAssets, AccountSubGroup.Inventories));
        accounts.Add(CreateAccount("151", "Yarı Mamuller - Üretim", AccountType.CurrentAssets, AccountSubGroup.Inventories));
        accounts.Add(CreateAccount("152", "Mamuller", AccountType.CurrentAssets, AccountSubGroup.Inventories));
        accounts.Add(CreateAccount("153", "Ticari Mallar", AccountType.CurrentAssets, AccountSubGroup.Inventories));
        accounts.Add(CreateAccount("157", "Diğer Stoklar", AccountType.CurrentAssets, AccountSubGroup.Inventories));
        accounts.Add(CreateAccount("158", "Stok Değer Düşüklüğü Karşılığı (-)", AccountType.CurrentAssets, AccountSubGroup.Inventories));
        accounts.Add(CreateAccount("159", "Verilen Sipariş Avansları", AccountType.CurrentAssets, AccountSubGroup.Inventories));

        // 18 - Gelecek Aylara Ait Giderler
        accounts.Add(CreateAccount("180", "Gelecek Aylara Ait Giderler", AccountType.CurrentAssets, AccountSubGroup.PrepaidExpenses));
        accounts.Add(CreateAccount("181", "Gelir Tahakkukları", AccountType.CurrentAssets, AccountSubGroup.PrepaidExpenses));

        // 19 - Diğer Dönen Varlıklar
        accounts.Add(CreateAccount("190", "Devreden KDV", AccountType.CurrentAssets, AccountSubGroup.OtherCurrentAssets));
        accounts.Add(CreateAccount("191", "İndirilecek KDV", AccountType.CurrentAssets, AccountSubGroup.OtherCurrentAssets));
        accounts.Add(CreateAccount("192", "Diğer KDV", AccountType.CurrentAssets, AccountSubGroup.OtherCurrentAssets));
        accounts.Add(CreateAccount("193", "Peşin Ödenen Vergiler ve Fonlar", AccountType.CurrentAssets, AccountSubGroup.OtherCurrentAssets));
        accounts.Add(CreateAccount("195", "İş Avansları", AccountType.CurrentAssets, AccountSubGroup.OtherCurrentAssets));
        accounts.Add(CreateAccount("196", "Personel Avansları", AccountType.CurrentAssets, AccountSubGroup.OtherCurrentAssets));
        accounts.Add(CreateAccount("197", "Sayım ve Tesellüm Noksanları", AccountType.CurrentAssets, AccountSubGroup.OtherCurrentAssets));
        accounts.Add(CreateAccount("199", "Diğer Çeşitli Dönen Varlıklar", AccountType.CurrentAssets, AccountSubGroup.OtherCurrentAssets));

        // ============================================
        // 2 - DURAN VARLIKLAR (NON-CURRENT ASSETS)
        // ============================================

        // 25 - Maddi Duran Varlıklar
        accounts.Add(CreateAccount("250", "Arazi ve Arsalar", AccountType.NonCurrentAssets, AccountSubGroup.TangibleFixedAssets));
        accounts.Add(CreateAccount("251", "Yeraltı ve Yerüstü Düzenleri", AccountType.NonCurrentAssets, AccountSubGroup.TangibleFixedAssets));
        accounts.Add(CreateAccount("252", "Binalar", AccountType.NonCurrentAssets, AccountSubGroup.TangibleFixedAssets));
        accounts.Add(CreateAccount("253", "Tesis, Makine ve Cihazlar", AccountType.NonCurrentAssets, AccountSubGroup.TangibleFixedAssets));
        accounts.Add(CreateAccount("254", "Taşıtlar", AccountType.NonCurrentAssets, AccountSubGroup.TangibleFixedAssets));
        accounts.Add(CreateAccount("255", "Demirbaşlar", AccountType.NonCurrentAssets, AccountSubGroup.TangibleFixedAssets));
        accounts.Add(CreateAccount("256", "Diğer Maddi Duran Varlıklar", AccountType.NonCurrentAssets, AccountSubGroup.TangibleFixedAssets));
        accounts.Add(CreateAccount("257", "Birikmiş Amortismanlar (-)", AccountType.NonCurrentAssets, AccountSubGroup.TangibleFixedAssets));
        accounts.Add(CreateAccount("258", "Yapılmakta Olan Yatırımlar", AccountType.NonCurrentAssets, AccountSubGroup.TangibleFixedAssets));
        accounts.Add(CreateAccount("259", "Verilen Avanslar", AccountType.NonCurrentAssets, AccountSubGroup.TangibleFixedAssets));

        // 26 - Maddi Olmayan Duran Varlıklar
        accounts.Add(CreateAccount("260", "Haklar", AccountType.NonCurrentAssets, AccountSubGroup.IntangibleFixedAssets));
        accounts.Add(CreateAccount("261", "Şerefiye", AccountType.NonCurrentAssets, AccountSubGroup.IntangibleFixedAssets));
        accounts.Add(CreateAccount("262", "Kuruluş ve Örgütlenme Giderleri", AccountType.NonCurrentAssets, AccountSubGroup.IntangibleFixedAssets));
        accounts.Add(CreateAccount("263", "Araştırma ve Geliştirme Giderleri", AccountType.NonCurrentAssets, AccountSubGroup.IntangibleFixedAssets));
        accounts.Add(CreateAccount("264", "Özel Maliyetler", AccountType.NonCurrentAssets, AccountSubGroup.IntangibleFixedAssets));
        accounts.Add(CreateAccount("267", "Diğer Maddi Olmayan Duran Varlıklar", AccountType.NonCurrentAssets, AccountSubGroup.IntangibleFixedAssets));
        accounts.Add(CreateAccount("268", "Birikmiş Amortismanlar (-)", AccountType.NonCurrentAssets, AccountSubGroup.IntangibleFixedAssets));
        accounts.Add(CreateAccount("269", "Verilen Avanslar", AccountType.NonCurrentAssets, AccountSubGroup.IntangibleFixedAssets));

        // ============================================
        // 3 - KISA VADELİ YABANCI KAYNAKLAR (SHORT-TERM LIABILITIES)
        // ============================================

        // 30 - Mali Borçlar
        accounts.Add(CreateAccount("300", "Banka Kredileri", AccountType.ShortTermLiabilities, AccountSubGroup.FinancialLiabilities));
        accounts.Add(CreateAccount("303", "Uzun Vadeli Kredilerin Anapara Taksitleri ve Faizleri", AccountType.ShortTermLiabilities, AccountSubGroup.FinancialLiabilities));
        accounts.Add(CreateAccount("304", "Tahvil Anapara Borç, Taksit ve Faizleri", AccountType.ShortTermLiabilities, AccountSubGroup.FinancialLiabilities));
        accounts.Add(CreateAccount("305", "Çıkarılmış Bonolar ve Senetler", AccountType.ShortTermLiabilities, AccountSubGroup.FinancialLiabilities));
        accounts.Add(CreateAccount("306", "Çıkarılmış Diğer Menkul Kıymetler", AccountType.ShortTermLiabilities, AccountSubGroup.FinancialLiabilities));
        accounts.Add(CreateAccount("308", "Menkul Kıymetler İhraç Farkı (-)", AccountType.ShortTermLiabilities, AccountSubGroup.FinancialLiabilities));
        accounts.Add(CreateAccount("309", "Diğer Mali Borçlar", AccountType.ShortTermLiabilities, AccountSubGroup.FinancialLiabilities));

        // 32 - Ticari Borçlar
        accounts.Add(CreateAccount("320", "Satıcılar", AccountType.ShortTermLiabilities, AccountSubGroup.TradePayables));
        accounts.Add(CreateAccount("320.01", "Yurtiçi Satıcılar", AccountType.ShortTermLiabilities, AccountSubGroup.TradePayables, "320"));
        accounts.Add(CreateAccount("320.02", "Yurtdışı Satıcılar", AccountType.ShortTermLiabilities, AccountSubGroup.TradePayables, "320"));
        accounts.Add(CreateAccount("321", "Borç Senetleri", AccountType.ShortTermLiabilities, AccountSubGroup.TradePayables));
        accounts.Add(CreateAccount("322", "Borç Senetleri Reeskontu (-)", AccountType.ShortTermLiabilities, AccountSubGroup.TradePayables));
        accounts.Add(CreateAccount("326", "Alınan Depozito ve Teminatlar", AccountType.ShortTermLiabilities, AccountSubGroup.TradePayables));
        accounts.Add(CreateAccount("329", "Diğer Ticari Borçlar", AccountType.ShortTermLiabilities, AccountSubGroup.TradePayables));

        // 33 - Diğer Borçlar
        accounts.Add(CreateAccount("331", "Ortaklara Borçlar", AccountType.ShortTermLiabilities, AccountSubGroup.OtherPayables));
        accounts.Add(CreateAccount("332", "İştiraklere Borçlar", AccountType.ShortTermLiabilities, AccountSubGroup.OtherPayables));
        accounts.Add(CreateAccount("333", "Bağlı Ortaklıklara Borçlar", AccountType.ShortTermLiabilities, AccountSubGroup.OtherPayables));
        accounts.Add(CreateAccount("335", "Personele Borçlar", AccountType.ShortTermLiabilities, AccountSubGroup.OtherPayables));
        accounts.Add(CreateAccount("336", "Diğer Çeşitli Borçlar", AccountType.ShortTermLiabilities, AccountSubGroup.OtherPayables));
        accounts.Add(CreateAccount("337", "Diğer Borç Senetleri Reeskontu (-)", AccountType.ShortTermLiabilities, AccountSubGroup.OtherPayables));

        // 34 - Alınan Avanslar
        accounts.Add(CreateAccount("340", "Alınan Sipariş Avansları", AccountType.ShortTermLiabilities, AccountSubGroup.AdvancesReceived));
        accounts.Add(CreateAccount("349", "Alınan Diğer Avanslar", AccountType.ShortTermLiabilities, AccountSubGroup.AdvancesReceived));

        // 36 - Ödenecek Vergi ve Diğer Yükümlülükler
        accounts.Add(CreateAccount("360", "Ödenecek Vergi ve Fonlar", AccountType.ShortTermLiabilities, AccountSubGroup.TaxesPayable));
        accounts.Add(CreateAccount("361", "Ödenecek Sosyal Güvenlik Kesintileri", AccountType.ShortTermLiabilities, AccountSubGroup.TaxesPayable));
        accounts.Add(CreateAccount("368", "Vadesi Geçmiş, Ertelenmiş veya Taksitlendirilmiş Vergi ve Diğer Yükümlülükler", AccountType.ShortTermLiabilities, AccountSubGroup.TaxesPayable));
        accounts.Add(CreateAccount("369", "Ödenecek Diğer Yükümlülükler", AccountType.ShortTermLiabilities, AccountSubGroup.TaxesPayable));

        // 37 - Borç ve Gider Karşılıkları
        accounts.Add(CreateAccount("370", "Dönem Kârı Vergi ve Diğer Yasal Yükümlülük Karşılıkları", AccountType.ShortTermLiabilities, AccountSubGroup.Provisions));
        accounts.Add(CreateAccount("371", "Dönem Kârının Peşin Ödenen Vergi ve Diğer Yükümlülükleri (-)", AccountType.ShortTermLiabilities, AccountSubGroup.Provisions));
        accounts.Add(CreateAccount("372", "Kıdem Tazminatı Karşılığı", AccountType.ShortTermLiabilities, AccountSubGroup.Provisions));
        accounts.Add(CreateAccount("373", "Maliyet Giderleri Karşılığı", AccountType.ShortTermLiabilities, AccountSubGroup.Provisions));
        accounts.Add(CreateAccount("379", "Diğer Borç ve Gider Karşılıkları", AccountType.ShortTermLiabilities, AccountSubGroup.Provisions));

        // 38 - Gelecek Aylara Ait Gelirler
        accounts.Add(CreateAccount("380", "Gelecek Aylara Ait Gelirler", AccountType.ShortTermLiabilities, AccountSubGroup.DeferredIncome));
        accounts.Add(CreateAccount("381", "Gider Tahakkukları", AccountType.ShortTermLiabilities, AccountSubGroup.DeferredIncome));

        // ============================================
        // 5 - ÖZKAYNAKLAR (EQUITY)
        // ============================================

        // 50 - Ödenmiş Sermaye
        accounts.Add(CreateAccount("500", "Sermaye", AccountType.Equity, AccountSubGroup.PaidInCapital));
        accounts.Add(CreateAccount("501", "Ödenmemiş Sermaye (-)", AccountType.Equity, AccountSubGroup.PaidInCapital));

        // 52 - Sermaye Yedekleri
        accounts.Add(CreateAccount("520", "Hisse Senedi İhraç Primleri", AccountType.Equity, AccountSubGroup.CapitalReserves));
        accounts.Add(CreateAccount("521", "Hisse Senedi İptal Kârları", AccountType.Equity, AccountSubGroup.CapitalReserves));
        accounts.Add(CreateAccount("522", "MDV Yeniden Değerleme Artışları", AccountType.Equity, AccountSubGroup.CapitalReserves));
        accounts.Add(CreateAccount("523", "İştirakler Yeniden Değerleme Artışları", AccountType.Equity, AccountSubGroup.CapitalReserves));
        accounts.Add(CreateAccount("529", "Diğer Sermaye Yedekleri", AccountType.Equity, AccountSubGroup.CapitalReserves));

        // 54 - Kâr Yedekleri
        accounts.Add(CreateAccount("540", "Yasal Yedekler", AccountType.Equity, AccountSubGroup.RetainedEarnings));
        accounts.Add(CreateAccount("541", "Statü Yedekleri", AccountType.Equity, AccountSubGroup.RetainedEarnings));
        accounts.Add(CreateAccount("542", "Olağanüstü Yedekler", AccountType.Equity, AccountSubGroup.RetainedEarnings));
        accounts.Add(CreateAccount("548", "Diğer Kâr Yedekleri", AccountType.Equity, AccountSubGroup.RetainedEarnings));
        accounts.Add(CreateAccount("549", "Özel Fonlar", AccountType.Equity, AccountSubGroup.RetainedEarnings));

        // 57-59 - Geçmiş Yıllar Kârları/Zararları ve Dönem Net Kârı
        accounts.Add(CreateAccount("570", "Geçmiş Yıllar Kârları", AccountType.Equity, AccountSubGroup.PriorYearsProfits));
        accounts.Add(CreateAccount("580", "Geçmiş Yıllar Zararları (-)", AccountType.Equity, AccountSubGroup.PriorYearsLosses));
        accounts.Add(CreateAccount("590", "Dönem Net Kârı", AccountType.Equity, AccountSubGroup.NetIncomeLoss));
        accounts.Add(CreateAccount("591", "Dönem Net Zararı (-)", AccountType.Equity, AccountSubGroup.NetIncomeLoss));

        // ============================================
        // 6 - GELİR TABLOSU HESAPLARI (INCOME STATEMENT)
        // ============================================

        // 60 - Brüt Satışlar
        accounts.Add(CreateAccount("600", "Yurtiçi Satışlar", AccountType.Revenue, AccountSubGroup.GrossSales));
        accounts.Add(CreateAccount("601", "Yurtdışı Satışlar", AccountType.Revenue, AccountSubGroup.GrossSales));
        accounts.Add(CreateAccount("602", "Diğer Gelirler", AccountType.Revenue, AccountSubGroup.GrossSales));

        // 61 - Satış İndirimleri
        accounts.Add(CreateAccount("610", "Satıştan İadeler (-)", AccountType.Revenue, AccountSubGroup.SalesDiscounts));
        accounts.Add(CreateAccount("611", "Satış İskontoları (-)", AccountType.Revenue, AccountSubGroup.SalesDiscounts));
        accounts.Add(CreateAccount("612", "Diğer İndirimler (-)", AccountType.Revenue, AccountSubGroup.SalesDiscounts));

        // 62 - Satışların Maliyeti
        accounts.Add(CreateAccount("620", "Satılan Mamuller Maliyeti (-)", AccountType.Revenue, AccountSubGroup.CostOfSales));
        accounts.Add(CreateAccount("621", "Satılan Ticari Mallar Maliyeti (-)", AccountType.Revenue, AccountSubGroup.CostOfSales));
        accounts.Add(CreateAccount("622", "Satılan Hizmet Maliyeti (-)", AccountType.Revenue, AccountSubGroup.CostOfSales));
        accounts.Add(CreateAccount("623", "Diğer Satışların Maliyeti (-)", AccountType.Revenue, AccountSubGroup.CostOfSales));

        // 63 - Faaliyet Giderleri
        accounts.Add(CreateAccount("630", "Araştırma ve Geliştirme Giderleri (-)", AccountType.Revenue, AccountSubGroup.OperatingExpenses));
        accounts.Add(CreateAccount("631", "Pazarlama, Satış ve Dağıtım Giderleri (-)", AccountType.Revenue, AccountSubGroup.OperatingExpenses));
        accounts.Add(CreateAccount("632", "Genel Yönetim Giderleri (-)", AccountType.Revenue, AccountSubGroup.OperatingExpenses));

        // 64 - Diğer Faaliyetlerden Olağan Gelir ve Kârlar
        accounts.Add(CreateAccount("640", "İştiraklerden Temettü Gelirleri", AccountType.Revenue, AccountSubGroup.OtherOperatingIncome));
        accounts.Add(CreateAccount("641", "Bağlı Ortaklıklardan Temettü Gelirleri", AccountType.Revenue, AccountSubGroup.OtherOperatingIncome));
        accounts.Add(CreateAccount("642", "Faiz Gelirleri", AccountType.Revenue, AccountSubGroup.OtherOperatingIncome));
        accounts.Add(CreateAccount("643", "Komisyon Gelirleri", AccountType.Revenue, AccountSubGroup.OtherOperatingIncome));
        accounts.Add(CreateAccount("644", "Konusu Kalmayan Karşılıklar", AccountType.Revenue, AccountSubGroup.OtherOperatingIncome));
        accounts.Add(CreateAccount("645", "Menkul Kıymet Satış Kârları", AccountType.Revenue, AccountSubGroup.OtherOperatingIncome));
        accounts.Add(CreateAccount("646", "Kambiyo Kârları", AccountType.Revenue, AccountSubGroup.OtherOperatingIncome));
        accounts.Add(CreateAccount("647", "Reeskont Faiz Gelirleri", AccountType.Revenue, AccountSubGroup.OtherOperatingIncome));
        accounts.Add(CreateAccount("648", "Enflasyon Düzeltmesi Kârları", AccountType.Revenue, AccountSubGroup.OtherOperatingIncome));
        accounts.Add(CreateAccount("649", "Diğer Olağan Gelir ve Kârlar", AccountType.Revenue, AccountSubGroup.OtherOperatingIncome));

        // 65 - Diğer Faaliyetlerden Olağan Gider ve Zararlar
        accounts.Add(CreateAccount("653", "Komisyon Giderleri (-)", AccountType.Revenue, AccountSubGroup.OtherOperatingExpenses));
        accounts.Add(CreateAccount("654", "Karşılık Giderleri (-)", AccountType.Revenue, AccountSubGroup.OtherOperatingExpenses));
        accounts.Add(CreateAccount("655", "Menkul Kıymet Satış Zararları (-)", AccountType.Revenue, AccountSubGroup.OtherOperatingExpenses));
        accounts.Add(CreateAccount("656", "Kambiyo Zararları (-)", AccountType.Revenue, AccountSubGroup.OtherOperatingExpenses));
        accounts.Add(CreateAccount("657", "Reeskont Faiz Giderleri (-)", AccountType.Revenue, AccountSubGroup.OtherOperatingExpenses));
        accounts.Add(CreateAccount("658", "Enflasyon Düzeltmesi Zararları (-)", AccountType.Revenue, AccountSubGroup.OtherOperatingExpenses));
        accounts.Add(CreateAccount("659", "Diğer Olağan Gider ve Zararlar (-)", AccountType.Revenue, AccountSubGroup.OtherOperatingExpenses));

        // 66 - Finansman Giderleri
        accounts.Add(CreateAccount("660", "Kısa Vadeli Borçlanma Giderleri (-)", AccountType.Revenue, AccountSubGroup.FinanceCosts));
        accounts.Add(CreateAccount("661", "Uzun Vadeli Borçlanma Giderleri (-)", AccountType.Revenue, AccountSubGroup.FinanceCosts));

        // 67 - Olağandışı Gelir ve Kârlar
        accounts.Add(CreateAccount("671", "Önceki Dönem Gelir ve Kârları", AccountType.Revenue, AccountSubGroup.ExtraordinaryIncome));
        accounts.Add(CreateAccount("679", "Diğer Olağandışı Gelir ve Kârlar", AccountType.Revenue, AccountSubGroup.ExtraordinaryIncome));

        // 68 - Olağandışı Gider ve Zararlar
        accounts.Add(CreateAccount("680", "Çalışmayan Kısım Gider ve Zararları (-)", AccountType.Revenue, AccountSubGroup.ExtraordinaryExpenses));
        accounts.Add(CreateAccount("681", "Önceki Dönem Gider ve Zararları (-)", AccountType.Revenue, AccountSubGroup.ExtraordinaryExpenses));
        accounts.Add(CreateAccount("689", "Diğer Olağandışı Gider ve Zararlar (-)", AccountType.Revenue, AccountSubGroup.ExtraordinaryExpenses));

        // 69 - Dönem Net Kârı/Zararı
        accounts.Add(CreateAccount("690", "Dönem Kârı veya Zararı", AccountType.Revenue, AccountSubGroup.PeriodNetIncome));
        accounts.Add(CreateAccount("691", "Dönem Kârı Vergi ve Diğer Yasal Yükümlülük Karşılıkları (-)", AccountType.Revenue, AccountSubGroup.PeriodNetIncome));
        accounts.Add(CreateAccount("692", "Dönem Net Kârı veya Zararı", AccountType.Revenue, AccountSubGroup.PeriodNetIncome));

        // ============================================
        // 7 - MALİYET HESAPLARI (COST ACCOUNTS)
        // ============================================

        // 71 - Direkt İlk Madde ve Malzeme Giderleri
        accounts.Add(CreateAccount("710", "Direkt İlk Madde ve Malzeme Giderleri", AccountType.Cost, AccountSubGroup.DirectMaterialCosts));
        accounts.Add(CreateAccount("711", "Direkt İlk Madde ve Malzeme Yansıtma Hesabı", AccountType.Cost, AccountSubGroup.DirectMaterialCosts));

        // 72 - Direkt İşçilik Giderleri
        accounts.Add(CreateAccount("720", "Direkt İşçilik Giderleri", AccountType.Cost, AccountSubGroup.DirectLaborCosts));
        accounts.Add(CreateAccount("721", "Direkt İşçilik Giderleri Yansıtma Hesabı", AccountType.Cost, AccountSubGroup.DirectLaborCosts));

        // 73 - Genel Üretim Giderleri
        accounts.Add(CreateAccount("730", "Genel Üretim Giderleri", AccountType.Cost, AccountSubGroup.ManufacturingOverhead));
        accounts.Add(CreateAccount("731", "Genel Üretim Giderleri Yansıtma Hesabı", AccountType.Cost, AccountSubGroup.ManufacturingOverhead));

        await _context.Accounts.AddRangeAsync(accounts);
        _logger.LogInformation("Seeded {Count} accounts (Tekdüzen Hesap Planı) for tenant: {TenantId}", accounts.Count, _tenantId);
    }

    private Account CreateAccount(
        string code,
        string name,
        AccountType accountType,
        AccountSubGroup? subGroup = null,
        string? parentCode = null,
        string currency = "TRY")
    {
        var account = new Account(code, name, accountType, currency, null, subGroup);

        // Set as system account
        account.MarkAsSystemAccount();

        // Set tenant
        account.SetTenantId(_tenantId);

        // Determine if leaf account (can have transactions)
        // Accounts without sub-levels are leaf accounts
        if (!code.Contains('.') || code.Split('.').Length >= 2)
        {
            // Check if it's a leaf account based on typical pattern
            var parts = code.Split('.');
            if (parts.Length >= 2)
            {
                account.SetAsLeafAccount();
            }
        }

        return account;
    }

    #endregion

    #region Cost Centers - Maliyet Merkezleri

    private async Task SeedCostCentersAsync()
    {
        if (await _context.CostCenters.IgnoreQueryFilters().AnyAsync(c => c.TenantId == _tenantId))
        {
            _logger.LogInformation("Cost centers already seeded for tenant: {TenantId}", _tenantId);
            return;
        }

        var costCenters = new List<CostCenter>();

        costCenters.Add(CreateCostCenter("GENEL", "Genel Giderler", CostCenterType.Main, CostCenterCategory.Administrative, "Genel işletme giderleri"));
        costCenters.Add(CreateCostCenter("URETIM", "Üretim", CostCenterType.Department, CostCenterCategory.Production, "Üretim maliyetleri"));
        costCenters.Add(CreateCostCenter("SATIS", "Satış ve Pazarlama", CostCenterType.Department, CostCenterCategory.Sales, "Satış ve pazarlama giderleri"));
        costCenters.Add(CreateCostCenter("YONETIM", "Yönetim", CostCenterType.Department, CostCenterCategory.Administrative, "Genel yönetim giderleri"));
        costCenters.Add(CreateCostCenter("ARGE", "Ar-Ge", CostCenterType.Department, CostCenterCategory.RnD, "Araştırma ve geliştirme giderleri"));
        costCenters.Add(CreateCostCenter("LOJISTIK", "Lojistik", CostCenterType.Department, CostCenterCategory.Distribution, "Depo ve dağıtım giderleri"));
        costCenters.Add(CreateCostCenter("IT", "Bilgi Teknolojileri", CostCenterType.Department, CostCenterCategory.Administrative, "BT giderleri"));
        costCenters.Add(CreateCostCenter("IK", "İnsan Kaynakları", CostCenterType.Department, CostCenterCategory.Administrative, "İK giderleri"));

        await _context.CostCenters.AddRangeAsync(costCenters);
        _logger.LogInformation("Seeded {Count} cost centers for tenant: {TenantId}", costCenters.Count, _tenantId);
    }

    private CostCenter CreateCostCenter(string code, string name, CostCenterType type, CostCenterCategory category, string? description = null)
    {
        var costCenter = new CostCenter(code, name, type, category);
        if (!string.IsNullOrEmpty(description))
        {
            costCenter.UpdateBasicInfo(name, description);
        }
        costCenter.SetTenantId(_tenantId);
        return costCenter;
    }

    #endregion
}
