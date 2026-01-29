using Stocker.Modules.Sales.Domain.Enums;
using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Sales.Domain.Entities;

/// <summary>
/// Satış modülü için temel müşteri entity'si.
/// Türkiye e-Fatura/e-Arşiv prosedürlerine uygun zorunlu alanları içerir.
///
/// NOT: CRM modülü aktifse, müşteri verileri CRM.Customer'dan alınır.
/// Bu entity sadece Sales modülü tek başına kullanıldığında aktiftir.
/// </summary>
public class SalesCustomer : TenantAggregateRoot
{
    #region Temel Bilgiler

    /// <summary>
    /// Müşteri kodu (benzersiz, tenant bazında)
    /// </summary>
    public string CustomerCode { get; private set; } = string.Empty;

    /// <summary>
    /// Müşteri tipi (Bireysel/Kurumsal)
    /// Fatura düzenlemede VKN/TCKN ayrımı için önemli
    /// </summary>
    public SalesCustomerType CustomerType { get; private set; }

    #endregion

    #region Kimlik Bilgileri (Türkiye e-Fatura Zorunlu Alanlar)

    /// <summary>
    /// Şirket Unvanı (Kurumsal müşteriler için zorunlu)
    /// VUK 230. Madde gereği faturada tam unvan olmalı
    /// </summary>
    public string? CompanyName { get; private set; }

    /// <summary>
    /// Ad (Bireysel müşteriler için zorunlu)
    /// </summary>
    public string? FirstName { get; private set; }

    /// <summary>
    /// Soyad (Bireysel müşteriler için zorunlu)
    /// </summary>
    public string? LastName { get; private set; }

    /// <summary>
    /// Görüntülenecek isim (computed)
    /// </summary>
    public string DisplayName => CustomerType == SalesCustomerType.Corporate
        ? CompanyName ?? string.Empty
        : $"{FirstName} {LastName}".Trim();

    /// <summary>
    /// Vergi Kimlik Numarası (10 hane - Kurumsal için zorunlu)
    /// GİB e-Fatura sisteminde VKN alanı
    /// </summary>
    public string? TaxNumber { get; private set; }

    /// <summary>
    /// T.C. Kimlik Numarası (11 hane - Bireysel için)
    /// Nihai tüketici 9.900 TL üzeri alışverişlerde zorunlu
    /// </summary>
    public string? IdentityNumber { get; private set; }

    /// <summary>
    /// Vergi Dairesi (Kurumsal müşteriler için zorunlu)
    /// </summary>
    public string? TaxOffice { get; private set; }

    #endregion

    #region İletişim Bilgileri

    /// <summary>
    /// E-posta adresi
    /// e-Fatura/e-Arşiv gönderimi için gerekli
    /// </summary>
    public string? Email { get; private set; }

    /// <summary>
    /// Telefon numarası
    /// </summary>
    public string? Phone { get; private set; }

    /// <summary>
    /// Mobil telefon
    /// </summary>
    public string? MobilePhone { get; private set; }

    #endregion

    #region Adres Bilgileri (Fatura Zorunlu Alan)

    /// <summary>
    /// Adres satırı (VUK 230. Madde gereği zorunlu)
    /// </summary>
    public string? AddressLine { get; private set; }

    /// <summary>
    /// İlçe
    /// </summary>
    public string? District { get; private set; }

    /// <summary>
    /// İl
    /// </summary>
    public string? City { get; private set; }

    /// <summary>
    /// Posta kodu
    /// </summary>
    public string? PostalCode { get; private set; }

    /// <summary>
    /// Ülke (varsayılan: Türkiye)
    /// </summary>
    public string Country { get; private set; } = "Türkiye";

    /// <summary>
    /// Ülke kodu (ISO 3166-1 alpha-2, varsayılan: TR)
    /// e-Fatura için gerekli
    /// </summary>
    public string CountryCode { get; private set; } = "TR";

    /// <summary>
    /// Tam adres (computed/cached)
    /// </summary>
    public string FullAddress => BuildFullAddress();

    #endregion

    #region e-Fatura Bilgileri

    /// <summary>
    /// e-Fatura mükellefi mi?
    /// GİB e-Fatura sistemine kayıtlı mı kontrolü
    /// </summary>
    public bool IsEInvoiceRegistered { get; private set; }

    /// <summary>
    /// e-Fatura Posta Kutusu (PK) etiketi
    /// Örn: urn:mail:defaultpk@firma.com.tr
    /// </summary>
    public string? EInvoiceAlias { get; private set; }

    /// <summary>
    /// Son e-Fatura mükellef kontrolü tarihi
    /// </summary>
    public DateTime? EInvoiceLastCheckedAt { get; private set; }

    #endregion

    #region Finansal Bilgiler

    /// <summary>
    /// Para birimi (varsayılan: TRY)
    /// </summary>
    public string Currency { get; private set; } = "TRY";

    /// <summary>
    /// Kredi limiti
    /// </summary>
    public decimal CreditLimit { get; private set; }

    /// <summary>
    /// Mevcut bakiye (cari hesap)
    /// Pozitif: Müşteri borçlu, Negatif: Firmamız borçlu
    /// </summary>
    public decimal CurrentBalance { get; private set; }

    /// <summary>
    /// Varsayılan ödeme vadesi (gün)
    /// </summary>
    public int DefaultPaymentTermDays { get; private set; }

    /// <summary>
    /// Varsayılan KDV oranı (%)
    /// Müşteriye özel KDV istisnası varsa 0
    /// </summary>
    public decimal DefaultVatRate { get; private set; } = 20;

    /// <summary>
    /// KDV muafiyet kodu (varsa)
    /// GİB KDV istisna kodları
    /// </summary>
    public string? VatExemptionCode { get; private set; }

    /// <summary>
    /// KDV muafiyet açıklaması
    /// </summary>
    public string? VatExemptionReason { get; private set; }

    #endregion

    #region Sevkiyat Bilgileri

    /// <summary>
    /// Varsayılan sevkiyat adresi (fatura adresinden farklıysa)
    /// </summary>
    public string? ShippingAddressLine { get; private set; }
    public string? ShippingDistrict { get; private set; }
    public string? ShippingCity { get; private set; }
    public string? ShippingPostalCode { get; private set; }
    public string? ShippingCountry { get; private set; }

    /// <summary>
    /// Sevkiyat adresi fatura adresiyle aynı mı?
    /// </summary>
    public bool ShippingSameAsBilling { get; private set; } = true;

    #endregion

    #region Durum ve Metadata

    /// <summary>
    /// Aktif mi?
    /// </summary>
    public bool IsActive { get; private set; } = true;

    /// <summary>
    /// Notlar
    /// </summary>
    public string? Notes { get; private set; }

    /// <summary>
    /// CRM modülündeki karşılık gelen müşteri ID'si
    /// CRM modülü aktifse bu alan dolu olur ve veriler senkronize edilir
    /// </summary>
    public Guid? CrmCustomerId { get; private set; }

    /// <summary>
    /// Veri kaynağı modülü
    /// </summary>
    public CustomerDataSource DataSource { get; private set; } = CustomerDataSource.Sales;

    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }
    public string? CreatedBy { get; private set; }
    public string? UpdatedBy { get; private set; }

    #endregion

    #region Constructors

    private SalesCustomer() : base() { }

    #endregion

    #region Factory Methods

    /// <summary>
    /// Kurumsal müşteri oluşturur
    /// </summary>
    public static Result<SalesCustomer> CreateCorporate(
        Guid tenantId,
        string customerCode,
        string companyName,
        string taxNumber,
        string taxOffice,
        string? email = null,
        string? phone = null,
        string? createdBy = null)
    {
        // Validasyonlar
        if (string.IsNullOrWhiteSpace(customerCode))
            return Result<SalesCustomer>.Failure(Error.Validation("SalesCustomer.CustomerCode", "Müşteri kodu zorunludur"));

        if (string.IsNullOrWhiteSpace(companyName))
            return Result<SalesCustomer>.Failure(Error.Validation("SalesCustomer.CompanyName", "Şirket unvanı zorunludur"));

        if (string.IsNullOrWhiteSpace(taxNumber))
            return Result<SalesCustomer>.Failure(Error.Validation("SalesCustomer.TaxNumber", "Vergi numarası zorunludur"));

        if (taxNumber.Length != 10 || !taxNumber.All(char.IsDigit))
            return Result<SalesCustomer>.Failure(Error.Validation("SalesCustomer.TaxNumber", "Vergi numarası 10 haneli olmalıdır"));

        if (string.IsNullOrWhiteSpace(taxOffice))
            return Result<SalesCustomer>.Failure(Error.Validation("SalesCustomer.TaxOffice", "Vergi dairesi zorunludur"));

        var customer = new SalesCustomer
        {
            Id = Guid.NewGuid(),
            CustomerCode = customerCode.ToUpperInvariant(),
            CustomerType = SalesCustomerType.Corporate,
            CompanyName = companyName.Trim(),
            TaxNumber = taxNumber,
            TaxOffice = taxOffice.Trim(),
            Email = email?.ToLowerInvariant(),
            Phone = phone,
            IsActive = true,
            DataSource = CustomerDataSource.Sales,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = createdBy
        };
        customer.SetTenantId(tenantId);

        return Result<SalesCustomer>.Success(customer);
    }

    /// <summary>
    /// Bireysel müşteri oluşturur
    /// </summary>
    public static Result<SalesCustomer> CreateIndividual(
        Guid tenantId,
        string customerCode,
        string firstName,
        string lastName,
        string? identityNumber = null,
        string? email = null,
        string? phone = null,
        string? createdBy = null)
    {
        if (string.IsNullOrWhiteSpace(customerCode))
            return Result<SalesCustomer>.Failure(Error.Validation("SalesCustomer.CustomerCode", "Müşteri kodu zorunludur"));

        if (string.IsNullOrWhiteSpace(firstName))
            return Result<SalesCustomer>.Failure(Error.Validation("SalesCustomer.FirstName", "Ad zorunludur"));

        if (string.IsNullOrWhiteSpace(lastName))
            return Result<SalesCustomer>.Failure(Error.Validation("SalesCustomer.LastName", "Soyad zorunludur"));

        // TCKN validasyonu (opsiyonel ama girilmişse doğru olmalı)
        if (!string.IsNullOrWhiteSpace(identityNumber))
        {
            if (identityNumber.Length != 11 || !identityNumber.All(char.IsDigit))
                return Result<SalesCustomer>.Failure(Error.Validation("SalesCustomer.IdentityNumber", "T.C. Kimlik numarası 11 haneli olmalıdır"));

            if (identityNumber[0] == '0')
                return Result<SalesCustomer>.Failure(Error.Validation("SalesCustomer.IdentityNumber", "T.C. Kimlik numarası 0 ile başlayamaz"));
        }

        var customer = new SalesCustomer
        {
            Id = Guid.NewGuid(),
            CustomerCode = customerCode.ToUpperInvariant(),
            CustomerType = SalesCustomerType.Individual,
            FirstName = firstName.Trim(),
            LastName = lastName.Trim(),
            IdentityNumber = identityNumber,
            Email = email?.ToLowerInvariant(),
            Phone = phone,
            IsActive = true,
            DataSource = CustomerDataSource.Sales,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = createdBy
        };
        customer.SetTenantId(tenantId);

        return Result<SalesCustomer>.Success(customer);
    }

    /// <summary>
    /// Nihai tüketici (anonim) oluşturur
    /// 9.900 TL altı satışlar için
    /// </summary>
    public static Result<SalesCustomer> CreateRetailCustomer(
        Guid tenantId,
        string? createdBy = null)
    {
        var customer = new SalesCustomer
        {
            Id = Guid.NewGuid(),
            CustomerCode = "RETAIL",
            CustomerType = SalesCustomerType.Retail,
            FirstName = "Nihai",
            LastName = "Tüketici",
            IdentityNumber = "11111111111", // GİB standart değeri
            IsActive = true,
            DataSource = CustomerDataSource.Sales,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = createdBy
        };
        customer.SetTenantId(tenantId);

        return Result<SalesCustomer>.Success(customer);
    }

    /// <summary>
    /// Yurt dışı müşteri oluşturur
    /// </summary>
    public static Result<SalesCustomer> CreateForeign(
        Guid tenantId,
        string customerCode,
        string companyName,
        string countryCode,
        string country,
        string? taxNumber = null,
        string? email = null,
        string? createdBy = null)
    {
        if (string.IsNullOrWhiteSpace(customerCode))
            return Result<SalesCustomer>.Failure(Error.Validation("SalesCustomer.CustomerCode", "Müşteri kodu zorunludur"));

        if (string.IsNullOrWhiteSpace(companyName))
            return Result<SalesCustomer>.Failure(Error.Validation("SalesCustomer.CompanyName", "Şirket adı zorunludur"));

        if (string.IsNullOrWhiteSpace(countryCode) || countryCode.Length != 2)
            return Result<SalesCustomer>.Failure(Error.Validation("SalesCustomer.CountryCode", "Geçerli bir ülke kodu giriniz (2 hane)"));

        var customer = new SalesCustomer
        {
            Id = Guid.NewGuid(),
            CustomerCode = customerCode.ToUpperInvariant(),
            CustomerType = SalesCustomerType.Foreign,
            CompanyName = companyName.Trim(),
            TaxNumber = taxNumber ?? "2222222222", // GİB yurt dışı standart değeri
            CountryCode = countryCode.ToUpperInvariant(),
            Country = country,
            Email = email?.ToLowerInvariant(),
            IsActive = true,
            DataSource = CustomerDataSource.Sales,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = createdBy
        };
        customer.SetTenantId(tenantId);

        return Result<SalesCustomer>.Success(customer);
    }

    #endregion

    #region Update Methods

    public Result UpdateBasicInfo(
        string? companyName,
        string? firstName,
        string? lastName,
        string? updatedBy = null)
    {
        if (CustomerType == SalesCustomerType.Corporate && string.IsNullOrWhiteSpace(companyName))
            return Result.Failure(Error.Validation("SalesCustomer.CompanyName", "Kurumsal müşteri için şirket unvanı zorunludur"));

        if (CustomerType == SalesCustomerType.Individual)
        {
            if (string.IsNullOrWhiteSpace(firstName))
                return Result.Failure(Error.Validation("SalesCustomer.FirstName", "Bireysel müşteri için ad zorunludur"));
            if (string.IsNullOrWhiteSpace(lastName))
                return Result.Failure(Error.Validation("SalesCustomer.LastName", "Bireysel müşteri için soyad zorunludur"));
        }

        CompanyName = companyName?.Trim();
        FirstName = firstName?.Trim();
        LastName = lastName?.Trim();
        UpdatedAt = DateTime.UtcNow;
        UpdatedBy = updatedBy;

        return Result.Success();
    }

    public Result UpdateTaxInfo(
        string? taxNumber,
        string? taxOffice,
        string? identityNumber,
        string? updatedBy = null)
    {
        // VKN validasyonu
        if (!string.IsNullOrWhiteSpace(taxNumber) && (taxNumber.Length != 10 || !taxNumber.All(char.IsDigit)))
            return Result.Failure(Error.Validation("SalesCustomer.TaxNumber", "Vergi numarası 10 haneli olmalıdır"));

        // TCKN validasyonu
        if (!string.IsNullOrWhiteSpace(identityNumber))
        {
            if (identityNumber.Length != 11 || !identityNumber.All(char.IsDigit))
                return Result.Failure(Error.Validation("SalesCustomer.IdentityNumber", "T.C. Kimlik numarası 11 haneli olmalıdır"));

            if (identityNumber[0] == '0')
                return Result.Failure(Error.Validation("SalesCustomer.IdentityNumber", "T.C. Kimlik numarası 0 ile başlayamaz"));
        }

        TaxNumber = taxNumber;
        TaxOffice = taxOffice?.Trim();
        IdentityNumber = identityNumber;
        UpdatedAt = DateTime.UtcNow;
        UpdatedBy = updatedBy;

        return Result.Success();
    }

    public Result UpdateContactInfo(
        string? email,
        string? phone,
        string? mobilePhone,
        string? updatedBy = null)
    {
        Email = email?.ToLowerInvariant();
        Phone = phone;
        MobilePhone = mobilePhone;
        UpdatedAt = DateTime.UtcNow;
        UpdatedBy = updatedBy;

        return Result.Success();
    }

    public Result UpdateAddress(
        string? addressLine,
        string? district,
        string? city,
        string? postalCode,
        string? country = null,
        string? countryCode = null,
        string? updatedBy = null)
    {
        AddressLine = addressLine?.Trim();
        District = district?.Trim();
        City = city?.Trim();
        PostalCode = postalCode;

        if (!string.IsNullOrWhiteSpace(country))
            Country = country;

        if (!string.IsNullOrWhiteSpace(countryCode))
            CountryCode = countryCode.ToUpperInvariant();

        UpdatedAt = DateTime.UtcNow;
        UpdatedBy = updatedBy;

        return Result.Success();
    }

    public Result UpdateShippingAddress(
        string? addressLine,
        string? district,
        string? city,
        string? postalCode,
        string? country,
        bool sameAsBilling,
        string? updatedBy = null)
    {
        ShippingSameAsBilling = sameAsBilling;

        if (!sameAsBilling)
        {
            ShippingAddressLine = addressLine?.Trim();
            ShippingDistrict = district?.Trim();
            ShippingCity = city?.Trim();
            ShippingPostalCode = postalCode;
            ShippingCountry = country;
        }
        else
        {
            ShippingAddressLine = null;
            ShippingDistrict = null;
            ShippingCity = null;
            ShippingPostalCode = null;
            ShippingCountry = null;
        }

        UpdatedAt = DateTime.UtcNow;
        UpdatedBy = updatedBy;

        return Result.Success();
    }

    public Result UpdateFinancialInfo(
        decimal creditLimit,
        int defaultPaymentTermDays,
        decimal defaultVatRate,
        string? currency = null,
        string? vatExemptionCode = null,
        string? vatExemptionReason = null,
        string? updatedBy = null)
    {
        if (creditLimit < 0)
            return Result.Failure(Error.Validation("SalesCustomer.CreditLimit", "Kredi limiti negatif olamaz"));

        if (defaultPaymentTermDays < 0)
            return Result.Failure(Error.Validation("SalesCustomer.DefaultPaymentTermDays", "Ödeme vadesi negatif olamaz"));

        if (defaultVatRate < 0 || defaultVatRate > 100)
            return Result.Failure(Error.Validation("SalesCustomer.DefaultVatRate", "KDV oranı 0-100 arasında olmalıdır"));

        CreditLimit = creditLimit;
        DefaultPaymentTermDays = defaultPaymentTermDays;
        DefaultVatRate = defaultVatRate;
        VatExemptionCode = vatExemptionCode;
        VatExemptionReason = vatExemptionReason;

        if (!string.IsNullOrWhiteSpace(currency))
            Currency = currency.ToUpperInvariant();

        UpdatedAt = DateTime.UtcNow;
        UpdatedBy = updatedBy;

        return Result.Success();
    }

    public Result UpdateEInvoiceInfo(
        bool isRegistered,
        string? alias,
        string? updatedBy = null)
    {
        IsEInvoiceRegistered = isRegistered;
        EInvoiceAlias = alias;
        EInvoiceLastCheckedAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
        UpdatedBy = updatedBy;

        return Result.Success();
    }

    public void UpdateBalance(decimal amount)
    {
        CurrentBalance += amount;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetBalance(decimal balance)
    {
        CurrentBalance = balance;
        UpdatedAt = DateTime.UtcNow;
    }

    #endregion

    #region Status Methods

    public Result Activate(string? updatedBy = null)
    {
        if (IsActive)
            return Result.Failure(Error.Conflict("SalesCustomer.Status", "Müşteri zaten aktif"));

        IsActive = true;
        UpdatedAt = DateTime.UtcNow;
        UpdatedBy = updatedBy;

        return Result.Success();
    }

    public Result Deactivate(string? updatedBy = null)
    {
        if (!IsActive)
            return Result.Failure(Error.Conflict("SalesCustomer.Status", "Müşteri zaten pasif"));

        IsActive = false;
        UpdatedAt = DateTime.UtcNow;
        UpdatedBy = updatedBy;

        return Result.Success();
    }

    #endregion

    #region CRM Integration

    /// <summary>
    /// CRM modülündeki müşteri ile ilişkilendirir
    /// </summary>
    public void LinkToCrmCustomer(Guid crmCustomerId)
    {
        CrmCustomerId = crmCustomerId;
        DataSource = CustomerDataSource.CRM;
        UpdatedAt = DateTime.UtcNow;
    }

    /// <summary>
    /// CRM ilişkisini kaldırır
    /// </summary>
    public void UnlinkFromCrm()
    {
        CrmCustomerId = null;
        DataSource = CustomerDataSource.Sales;
        UpdatedAt = DateTime.UtcNow;
    }

    #endregion

    #region Helper Methods

    private string BuildFullAddress()
    {
        var parts = new List<string>();

        if (!string.IsNullOrWhiteSpace(AddressLine))
            parts.Add(AddressLine);
        if (!string.IsNullOrWhiteSpace(District))
            parts.Add(District);
        if (!string.IsNullOrWhiteSpace(City))
            parts.Add(City);
        if (!string.IsNullOrWhiteSpace(PostalCode))
            parts.Add(PostalCode);
        if (!string.IsNullOrWhiteSpace(Country) && Country != "Türkiye")
            parts.Add(Country);

        return string.Join(", ", parts);
    }

    /// <summary>
    /// e-Fatura için VKN/TCKN değerini döner
    /// </summary>
    public string GetTaxIdentifier()
    {
        return CustomerType switch
        {
            SalesCustomerType.Corporate => TaxNumber ?? string.Empty,
            SalesCustomerType.Individual => IdentityNumber ?? TaxNumber ?? "11111111111",
            SalesCustomerType.Retail => "11111111111",
            SalesCustomerType.Foreign => TaxNumber ?? "2222222222",
            _ => TaxNumber ?? IdentityNumber ?? string.Empty
        };
    }

    /// <summary>
    /// Fatura kesilebilir mi kontrolü
    /// </summary>
    public bool CanInvoice()
    {
        // Temel bilgiler
        if (string.IsNullOrWhiteSpace(DisplayName))
            return false;

        // Kurumsal için VKN ve vergi dairesi zorunlu
        if (CustomerType == SalesCustomerType.Corporate)
        {
            if (string.IsNullOrWhiteSpace(TaxNumber) || string.IsNullOrWhiteSpace(TaxOffice))
                return false;
        }

        // Adres zorunlu
        if (string.IsNullOrWhiteSpace(AddressLine) && string.IsNullOrWhiteSpace(City))
            return false;

        return true;
    }

    /// <summary>
    /// Kredi limiti aşılmış mı kontrolü
    /// </summary>
    public bool IsCreditLimitExceeded(decimal additionalAmount = 0)
    {
        if (CreditLimit <= 0)
            return false; // Limit tanımlanmamış

        return (CurrentBalance + additionalAmount) > CreditLimit;
    }

    #endregion
}
