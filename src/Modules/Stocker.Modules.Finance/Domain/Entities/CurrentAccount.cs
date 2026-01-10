using Stocker.SharedKernel.Common;
using Stocker.Domain.Common.ValueObjects;
using Stocker.Modules.Finance.Domain.Enums;

namespace Stocker.Modules.Finance.Domain.Entities;

/// <summary>
/// Cari Hesap (Current Account / Trade Partner Account)
/// Müşteri ve Tedarikçi hesaplarını yönetir
/// </summary>
public class CurrentAccount : BaseEntity
{
    /// <summary>
    /// Cari Hesap Kodu (Account Code)
    /// </summary>
    public string Code { get; private set; } = string.Empty;

    /// <summary>
    /// Cari Hesap Adı / Unvanı (Account Name / Title)
    /// </summary>
    public string Name { get; private set; } = string.Empty;

    /// <summary>
    /// Kısa Adı (Short Name)
    /// </summary>
    public string? ShortName { get; private set; }

    /// <summary>
    /// Cari Hesap Türü (Account Type)
    /// </summary>
    public CurrentAccountType AccountType { get; private set; }

    /// <summary>
    /// Vergi Mükellefiyet Türü (Tax Liability Type)
    /// </summary>
    public TaxLiabilityType TaxLiabilityType { get; private set; }

    /// <summary>
    /// Vergi Dairesi (Tax Office)
    /// </summary>
    public string? TaxOffice { get; private set; }

    /// <summary>
    /// Vergi Numarası (Tax Number - VKN)
    /// </summary>
    public string? TaxNumber { get; private set; }

    /// <summary>
    /// TC Kimlik Numarası (Turkish ID Number - TCKN)
    /// </summary>
    public string? IdentityNumber { get; private set; }

    /// <summary>
    /// Ticaret Sicil No (Trade Registry Number)
    /// </summary>
    public string? TradeRegistryNumber { get; private set; }

    /// <summary>
    /// MERSİS No
    /// </summary>
    public string? MersisNumber { get; private set; }

    /// <summary>
    /// e-Fatura Mükellef mi? (Is e-Invoice Registered)
    /// </summary>
    public bool IsEInvoiceRegistered { get; private set; }

    /// <summary>
    /// e-Fatura Posta Kutusu (e-Invoice Mailbox / Alias)
    /// </summary>
    public string? EInvoiceAlias { get; private set; }

    /// <summary>
    /// KEP Adresi (Registered Electronic Mail Address)
    /// </summary>
    public string? KepAddress { get; private set; }

    // İletişim Bilgileri (Contact Information)
    public string? Email { get; private set; }
    public string? Phone { get; private set; }
    public string? Fax { get; private set; }
    public string? Website { get; private set; }

    // Adres Bilgileri (Address Information)
    public string? Address { get; private set; }
    public string? District { get; private set; } // İlçe
    public string? City { get; private set; } // İl
    public string? Country { get; private set; }
    public string? PostalCode { get; private set; }

    // Finansal Bilgiler (Financial Information)

    /// <summary>
    /// Ana Para Birimi (Main Currency)
    /// </summary>
    public string Currency { get; private set; } = "TRY";

    /// <summary>
    /// Borç Bakiyesi (Debit Balance - Receivable)
    /// </summary>
    public Money DebitBalance { get; private set; } = null!;

    /// <summary>
    /// Alacak Bakiyesi (Credit Balance - Payable)
    /// </summary>
    public Money CreditBalance { get; private set; } = null!;

    /// <summary>
    /// Net Bakiye (Net Balance)
    /// Pozitif = Alacak (Receivable), Negatif = Borç (Payable)
    /// </summary>
    public Money Balance { get; private set; } = null!;

    /// <summary>
    /// Kredi Limiti (Credit Limit)
    /// </summary>
    public Money CreditLimit { get; private set; } = null!;

    /// <summary>
    /// Kullanılan Kredi (Used Credit)
    /// </summary>
    public Money UsedCredit { get; private set; } = null!;

    /// <summary>
    /// Kalan Kredi (Available Credit)
    /// </summary>
    public Money AvailableCredit { get; private set; } = null!;

    /// <summary>
    /// Risk Durumu (Risk Status)
    /// </summary>
    public RiskStatus RiskStatus { get; private set; }

    /// <summary>
    /// Risk Notu (Risk Notes)
    /// </summary>
    public string? RiskNotes { get; private set; }

    // Ödeme Koşulları (Payment Terms)

    /// <summary>
    /// Ödeme Vadesi Türü (Payment Term Type)
    /// </summary>
    public PaymentTermType PaymentTermType { get; private set; }

    /// <summary>
    /// Vade Günü (Payment Days)
    /// </summary>
    public int PaymentDays { get; private set; }

    /// <summary>
    /// İskonto Oranı % (Discount Rate)
    /// </summary>
    public decimal DiscountRate { get; private set; }

    /// <summary>
    /// Varsayılan KDV Oranı (Default VAT Rate)
    /// </summary>
    public VatRate DefaultVatRate { get; private set; }

    /// <summary>
    /// Tevkifat Uygulansın mı? (Apply Withholding)
    /// </summary>
    public bool ApplyWithholding { get; private set; }

    /// <summary>
    /// Tevkifat Kodu (Withholding Code)
    /// </summary>
    public WithholdingCode? WithholdingCode { get; private set; }

    // Durum Bilgileri (Status Information)

    /// <summary>
    /// Durum (Status)
    /// </summary>
    public CurrentAccountStatus Status { get; private set; }

    /// <summary>
    /// Kategori (Category)
    /// </summary>
    public string? Category { get; private set; }

    /// <summary>
    /// Etiketler (Tags)
    /// </summary>
    public string? Tags { get; private set; }

    /// <summary>
    /// Notlar (Notes)
    /// </summary>
    public string? Notes { get; private set; }

    // Bağlantılı Hesaplar (Linked Accounts)

    /// <summary>
    /// Muhasebe Hesabı ID - Alacak (Receivable Account ID)
    /// </summary>
    public int? ReceivableAccountId { get; private set; }

    /// <summary>
    /// Muhasebe Hesabı ID - Borç (Payable Account ID)
    /// </summary>
    public int? PayableAccountId { get; private set; }

    /// <summary>
    /// CRM Müşteri ID (CRM Customer ID)
    /// </summary>
    public int? CrmCustomerId { get; private set; }

    /// <summary>
    /// Satınalma Tedarikçi ID (Purchase Supplier ID)
    /// </summary>
    public int? PurchaseSupplierId { get; private set; }

    // Navigation Properties
    public virtual Account? ReceivableAccount { get; private set; }
    public virtual Account? PayableAccount { get; private set; }
    public virtual ICollection<CurrentAccountTransaction> Transactions { get; private set; } = new List<CurrentAccountTransaction>();
    public virtual ICollection<Invoice> Invoices { get; private set; } = new List<Invoice>();

    protected CurrentAccount() { }

    public CurrentAccount(
        string code,
        string name,
        CurrentAccountType accountType,
        TaxLiabilityType taxLiabilityType,
        string currency = "TRY")
    {
        Code = code;
        Name = name;
        AccountType = accountType;
        TaxLiabilityType = taxLiabilityType;
        Currency = currency;
        DebitBalance = Money.Zero(currency);
        CreditBalance = Money.Zero(currency);
        Balance = Money.Zero(currency);
        CreditLimit = Money.Zero(currency);
        UsedCredit = Money.Zero(currency);
        AvailableCredit = Money.Zero(currency);
        Status = CurrentAccountStatus.Active;
        RiskStatus = RiskStatus.NormalRisk;
        PaymentTermType = PaymentTermType.Cash;
        PaymentDays = 0;
        DiscountRate = 0;
        DefaultVatRate = VatRate.Twenty;
        ApplyWithholding = false;
        Country = "Türkiye";
    }

    public void UpdateBasicInfo(
        string name,
        string? shortName,
        string? email,
        string? phone,
        string? fax,
        string? website)
    {
        Name = name;
        ShortName = shortName;
        Email = email;
        Phone = phone;
        Fax = fax;
        Website = website;
    }

    public void UpdateTaxInfo(
        string? taxOffice,
        string? taxNumber,
        string? identityNumber,
        string? tradeRegistryNumber,
        string? mersisNumber)
    {
        TaxOffice = taxOffice;
        TaxNumber = taxNumber;
        IdentityNumber = identityNumber;
        TradeRegistryNumber = tradeRegistryNumber;
        MersisNumber = mersisNumber;
    }

    public void UpdateEInvoiceInfo(bool isRegistered, string? alias, string? kepAddress)
    {
        IsEInvoiceRegistered = isRegistered;
        EInvoiceAlias = alias;
        KepAddress = kepAddress;
    }

    public void UpdateAddress(
        string? address,
        string? district,
        string? city,
        string? country,
        string? postalCode)
    {
        Address = address;
        District = district;
        City = city;
        Country = country;
        PostalCode = postalCode;
    }

    public void UpdatePaymentTerms(
        PaymentTermType termType,
        int paymentDays,
        decimal discountRate,
        VatRate defaultVatRate)
    {
        PaymentTermType = termType;
        PaymentDays = paymentDays;
        DiscountRate = discountRate;
        DefaultVatRate = defaultVatRate;
    }

    public void SetWithholding(bool apply, WithholdingCode? code = null)
    {
        ApplyWithholding = apply;
        WithholdingCode = code;
    }

    public void SetCreditLimit(Money limit)
    {
        if (limit.Currency != Currency)
            throw new InvalidOperationException("Currency mismatch");

        CreditLimit = limit;
        RecalculateAvailableCredit();
    }

    public void Debit(Money amount)
    {
        if (amount.Currency != Currency)
            throw new InvalidOperationException("Currency mismatch");

        DebitBalance = Money.Create(DebitBalance.Amount + amount.Amount, Currency);
        RecalculateBalance();
    }

    public void Credit(Money amount)
    {
        if (amount.Currency != Currency)
            throw new InvalidOperationException("Currency mismatch");

        CreditBalance = Money.Create(CreditBalance.Amount + amount.Amount, Currency);
        RecalculateBalance();
    }


    /// <summary>
    /// Bakiyeyi doğrudan günceller (hareket toplamından hesaplanır)
    /// </summary>
    public void UpdateBalance(Money balance)
    {
        if (balance.Currency != Currency)
            throw new InvalidOperationException("Currency mismatch");

        Balance = balance;
        
        // Update used credit based on new balance
        if (balance.Amount > 0)
        {
            UsedCredit = balance;
        }
        else
        {
            UsedCredit = Money.Zero(Currency);
        }

        RecalculateAvailableCredit();
        UpdateRiskStatus();
    }

    private void RecalculateBalance()
    {
        // Net balance = Debit - Credit
        // Positive = Customer owes us (Receivable)
        // Negative = We owe customer (Payable)
        var netAmount = DebitBalance.Amount - CreditBalance.Amount;
        Balance = Money.Create(netAmount, Currency);

        // Update used credit
        if (netAmount > 0)
        {
            UsedCredit = Money.Create(netAmount, Currency);
        }
        else
        {
            UsedCredit = Money.Zero(Currency);
        }

        RecalculateAvailableCredit();
        UpdateRiskStatus();
    }

    private void RecalculateAvailableCredit()
    {
        var available = CreditLimit.Amount - UsedCredit.Amount;
        AvailableCredit = Money.Create(Math.Max(0, available), Currency);
    }

    private void UpdateRiskStatus()
    {
        if (CreditLimit.Amount == 0)
        {
            RiskStatus = RiskStatus.NormalRisk;
            return;
        }

        var usageRatio = UsedCredit.Amount / CreditLimit.Amount;

        RiskStatus = usageRatio switch
        {
            < 0.5m => RiskStatus.LowRisk,
            < 0.75m => RiskStatus.NormalRisk,
            < 0.9m => RiskStatus.HighRisk,
            < 1.0m => RiskStatus.VeryHighRisk,
            _ => RiskStatus.Blacklisted
        };
    }

    public void SetRiskStatus(RiskStatus status, string? notes = null)
    {
        RiskStatus = status;
        RiskNotes = notes;
    }

    public void LinkToAccounts(int? receivableAccountId, int? payableAccountId)
    {
        ReceivableAccountId = receivableAccountId;
        PayableAccountId = payableAccountId;
    }

    public void LinkToCrm(int? crmCustomerId)
    {
        CrmCustomerId = crmCustomerId;
    }

    public void LinkToPurchase(int? purchaseSupplierId)
    {
        PurchaseSupplierId = purchaseSupplierId;
    }

    public void SetCategoryAndTags(string? category, string? tags)
    {
        Category = category;
        Tags = tags;
    }

    public void SetNotes(string? notes)
    {
        Notes = notes;
    }

    public void Activate() => Status = CurrentAccountStatus.Active;
    public void Deactivate() => Status = CurrentAccountStatus.Inactive;
    public void Suspend() => Status = CurrentAccountStatus.Suspended;
    public void Blacklist() => Status = CurrentAccountStatus.Blacklisted;

    /// <summary>
    /// Kredi limiti aşılacak mı kontrol et (Check if credit limit will be exceeded)
    /// </summary>
    public bool WillExceedCreditLimit(Money amount)
    {
        if (CreditLimit.Amount == 0)
            return false; // No limit set

        return UsedCredit.Amount + amount.Amount > CreditLimit.Amount;
    }
}
