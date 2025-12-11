namespace Stocker.Modules.Finance.Domain.Enums;

/// <summary>
/// Tekdüzen Hesap Planı Ana Grupları (Turkish Chart of Accounts Main Groups)
/// </summary>
public enum AccountType
{
    // 1 - Dönen Varlıklar (Current Assets)
    CurrentAssets = 1,

    // 2 - Duran Varlıklar (Non-Current Assets)
    NonCurrentAssets = 2,

    // 3 - Kısa Vadeli Yabancı Kaynaklar (Short-Term Liabilities)
    ShortTermLiabilities = 3,

    // 4 - Uzun Vadeli Yabancı Kaynaklar (Long-Term Liabilities)
    LongTermLiabilities = 4,

    // 5 - Özkaynaklar (Equity)
    Equity = 5,

    // 6 - Gelir Tablosu Hesapları (Income Statement Accounts)
    Revenue = 6,

    // 7 - Maliyet Hesapları (Cost Accounts)
    Cost = 7,

    // 8 - Serbest (Free - Reserved for special purposes)
    Reserved = 8,

    // 9 - Nazım Hesaplar (Off-Balance Sheet Accounts)
    OffBalanceSheet = 9
}

/// <summary>
/// Hesap Alt Grupları (Account Sub-Groups)
/// </summary>
public enum AccountSubGroup
{
    // 10 - Hazır Değerler (Cash and Cash Equivalents)
    CashAndCashEquivalents = 10,

    // 11 - Menkul Kıymetler (Marketable Securities)
    MarketableSecurities = 11,

    // 12 - Ticari Alacaklar (Trade Receivables)
    TradeReceivables = 12,

    // 13 - Diğer Alacaklar (Other Receivables)
    OtherReceivables = 13,

    // 15 - Stoklar (Inventories)
    Inventories = 15,

    // 17 - Yıllara Yaygın İnşaat ve Onarım Maliyetleri (Construction Costs)
    ConstructionCosts = 17,

    // 18 - Gelecek Aylara Ait Giderler ve Gelir Tahakkukları (Prepaid Expenses)
    PrepaidExpenses = 18,

    // 19 - Diğer Dönen Varlıklar (Other Current Assets)
    OtherCurrentAssets = 19,

    // 22 - Ticari Alacaklar (Long-term Trade Receivables)
    LongTermTradeReceivables = 22,

    // 24 - Mali Duran Varlıklar (Financial Fixed Assets)
    FinancialFixedAssets = 24,

    // 25 - Maddi Duran Varlıklar (Tangible Fixed Assets)
    TangibleFixedAssets = 25,

    // 26 - Maddi Olmayan Duran Varlıklar (Intangible Fixed Assets)
    IntangibleFixedAssets = 26,

    // 30 - Mali Borçlar (Financial Liabilities)
    FinancialLiabilities = 30,

    // 32 - Ticari Borçlar (Trade Payables)
    TradePayables = 32,

    // 33 - Diğer Borçlar (Other Payables)
    OtherPayables = 33,

    // 34 - Alınan Avanslar (Advances Received)
    AdvancesReceived = 34,

    // 36 - Ödenecek Vergi ve Diğer Yükümlülükler (Taxes and Other Obligations Payable)
    TaxesPayable = 36,

    // 37 - Borç ve Gider Karşılıkları (Provisions)
    Provisions = 37,

    // 38 - Gelecek Aylara Ait Gelirler ve Gider Tahakkukları (Deferred Income)
    DeferredIncome = 38,

    // 50 - Ödenmiş Sermaye (Paid-in Capital)
    PaidInCapital = 50,

    // 52 - Sermaye Yedekleri (Capital Reserves)
    CapitalReserves = 52,

    // 54 - Kâr Yedekleri (Retained Earnings)
    RetainedEarnings = 54,

    // 57 - Geçmiş Yıllar Kârları (Prior Years' Profits)
    PriorYearsProfits = 57,

    // 58 - Geçmiş Yıllar Zararları (Prior Years' Losses)
    PriorYearsLosses = 58,

    // 59 - Dönem Net Kârı/Zararı (Net Income/Loss for the Period)
    NetIncomeLoss = 59,

    // 60 - Brüt Satışlar (Gross Sales)
    GrossSales = 60,

    // 61 - Satış İndirimleri (Sales Discounts)
    SalesDiscounts = 61,

    // 62 - Satışların Maliyeti (Cost of Sales)
    CostOfSales = 62,

    // 63 - Faaliyet Giderleri (Operating Expenses)
    OperatingExpenses = 63,

    // 64 - Diğer Faaliyetlerden Olağan Gelir ve Kârlar (Other Operating Income)
    OtherOperatingIncome = 64,

    // 65 - Diğer Faaliyetlerden Olağan Gider ve Zararlar (Other Operating Expenses)
    OtherOperatingExpenses = 65,

    // 66 - Finansman Giderleri (Finance Costs)
    FinanceCosts = 66,

    // 67 - Olağandışı Gelir ve Kârlar (Extraordinary Income)
    ExtraordinaryIncome = 67,

    // 68 - Olağandışı Gider ve Zararlar (Extraordinary Expenses)
    ExtraordinaryExpenses = 68,

    // 69 - Dönem Net Kârı/Zararı (Period Net Income/Loss)
    PeriodNetIncome = 69,

    // 71 - Direkt İlk Madde ve Malzeme Giderleri (Direct Material Costs)
    DirectMaterialCosts = 71,

    // 72 - Direkt İşçilik Giderleri (Direct Labor Costs)
    DirectLaborCosts = 72,

    // 73 - Genel Üretim Giderleri (Manufacturing Overhead)
    ManufacturingOverhead = 73
}
