using System.Text.RegularExpressions;
using FluentValidation;
using Stocker.Modules.Sales.Application.Features.SalesOrders.Commands;

namespace Stocker.Modules.Sales.Application.Features.SalesOrders.Validators;

public class CreateSalesOrderCommandValidator : AbstractValidator<CreateSalesOrderCommand>
{
    // ISO 4217 currency code pattern
    private static readonly Regex CurrencyRegex = new(@"^[A-Z]{3}$", RegexOptions.Compiled);

    // Prevents script injection in text fields
    private static readonly Regex DangerousPatternRegex = new(
        @"<\s*script|javascript\s*:|on\w+\s*=|<\s*iframe|<\s*object|<\s*embed",
        RegexOptions.Compiled | RegexOptions.IgnoreCase);

    private const int MaxItemsPerOrder = 500;

    public CreateSalesOrderCommandValidator()
    {
        // Sipariş Tarihi - makul aralıkta olmalı
        RuleFor(x => x.OrderDate)
            .NotEmpty().WithMessage("Sipariş tarihi zorunludur")
            .LessThanOrEqualTo(DateTime.UtcNow.AddDays(1)).WithMessage("Sipariş tarihi gelecekte olamaz")
            .GreaterThanOrEqualTo(DateTime.UtcNow.AddYears(-1)).WithMessage("Sipariş tarihi 1 yıldan daha eski olamaz");

        // Para Birimi - ISO 4217 format zorunluluğu
        RuleFor(x => x.Currency)
            .NotEmpty().WithMessage("Para birimi zorunludur")
            .Length(3).WithMessage("Para birimi tam olarak 3 karakter olmalıdır (ISO 4217)")
            .Matches(CurrencyRegex).WithMessage("Para birimi geçerli bir ISO 4217 kodu olmalıdır (ör: TRY, USD, EUR)");

        // Müşteri alanları - injection koruması ile
        RuleFor(x => x.CustomerName)
            .MaximumLength(200).WithMessage("Müşteri adı 200 karakteri aşmamalıdır")
            .Must(NotContainDangerousContent).WithMessage("Müşteri adı geçersiz karakterler içermektedir")
            .When(x => !string.IsNullOrEmpty(x.CustomerName));

        RuleFor(x => x.CustomerEmail)
            .MaximumLength(254).WithMessage("E-posta adresi 254 karakteri aşmamalıdır")
            .EmailAddress().WithMessage("Geçersiz e-posta adresi")
            .When(x => !string.IsNullOrEmpty(x.CustomerEmail));

        RuleFor(x => x.CustomerOrderNumber)
            .MaximumLength(100).WithMessage("Müşteri sipariş numarası 100 karakteri aşmamalıdır")
            .Must(NotContainDangerousContent).WithMessage("Müşteri sipariş numarası geçersiz karakterler içermektedir")
            .When(x => !string.IsNullOrEmpty(x.CustomerOrderNumber));

        // Adres alanları
        RuleFor(x => x.ShippingAddress)
            .MaximumLength(500).WithMessage("Teslimat adresi 500 karakteri aşmamalıdır")
            .Must(NotContainDangerousContent).WithMessage("Teslimat adresi geçersiz karakterler içermektedir")
            .When(x => !string.IsNullOrEmpty(x.ShippingAddress));

        RuleFor(x => x.BillingAddress)
            .MaximumLength(500).WithMessage("Fatura adresi 500 karakteri aşmamalıdır")
            .Must(NotContainDangerousContent).WithMessage("Fatura adresi geçersiz karakterler içermektedir")
            .When(x => !string.IsNullOrEmpty(x.BillingAddress));

        // Notlar
        RuleFor(x => x.Notes)
            .MaximumLength(2000).WithMessage("Notlar 2000 karakteri aşmamalıdır")
            .Must(NotContainDangerousContent).WithMessage("Notlar geçersiz karakterler içermektedir")
            .When(x => !string.IsNullOrEmpty(x.Notes));

        RuleFor(x => x.SalesPersonName)
            .MaximumLength(200).WithMessage("Satış temsilcisi adı 200 karakteri aşmamalıdır")
            .Must(NotContainDangerousContent).WithMessage("Satış temsilcisi adı geçersiz karakterler içermektedir")
            .When(x => !string.IsNullOrEmpty(x.SalesPersonName));

        RuleFor(x => x.QuotationNumber)
            .MaximumLength(50).WithMessage("Teklif numarası 50 karakteri aşmamalıdır")
            .When(x => !string.IsNullOrEmpty(x.QuotationNumber));

        // Kalemler - sınırlı koleksiyon
        RuleFor(x => x.Items)
            .NotEmpty().WithMessage("En az bir sipariş kalemi gereklidir")
            .Must(items => items.Count <= MaxItemsPerOrder)
                .WithMessage($"Sipariş en fazla {MaxItemsPerOrder} kalem içerebilir");

        RuleForEach(x => x.Items)
            .SetValidator(new CreateSalesOrderItemCommandValidator());

        // Adres Snapshot doğrulama
        RuleFor(x => x.ShippingAddressSnapshot)
            .SetValidator(new AddressSnapshotInputValidator()!)
            .When(x => x.ShippingAddressSnapshot != null);

        RuleFor(x => x.BillingAddressSnapshot)
            .SetValidator(new AddressSnapshotInputValidator()!)
            .When(x => x.BillingAddressSnapshot != null);

        #region Phase 3: Gelişmiş Doğrulama Kuralları

        RuleFor(x => x.ReservationExpiryHours)
            .InclusiveBetween(1, 720).WithMessage("Rezervasyon süresi 1 ile 720 saat (30 gün) arasında olmalıdır");

        RuleFor(x => x.PaymentDueDays)
            .InclusiveBetween(0, 365).WithMessage("Ödeme vadesi 0 ile 365 gün arasında olmalıdır")
            .When(x => x.PaymentDueDays.HasValue);

        RuleFor(x => x.CurrentOutstandingBalance)
            .GreaterThanOrEqualTo(0).WithMessage("Bakiye tutarı negatif olamaz")
            .LessThanOrEqualTo(999_999_999m).WithMessage("Bakiye tutarı izin verilen maksimum değeri aşmaktadır")
            .When(x => x.CurrentOutstandingBalance.HasValue);

        // ValidateCreditLimit true ise ve sözleşme belirtilmişse CustomerId zorunlu
        RuleFor(x => x.CustomerId)
            .NotEmpty().WithMessage("Kredi limiti doğrulaması etkinken müşteri kimliği zorunludur")
            .When(x => x.ValidateCreditLimit && x.CustomerContractId.HasValue);

        #endregion
    }

    private static bool NotContainDangerousContent(string? value)
    {
        if (string.IsNullOrEmpty(value))
            return true;
        return !DangerousPatternRegex.IsMatch(value);
    }
}

public class CreateSalesOrderItemCommandValidator : AbstractValidator<CreateSalesOrderItemCommand>
{
    // Alphanumeric with dashes, dots, underscores
    private static readonly Regex ProductCodeRegex = new(@"^[a-zA-Z0-9\-._/]+$", RegexOptions.Compiled);

    private const decimal MaxQuantity = 999_999m;
    private const decimal MaxUnitPrice = 999_999_999m;

    public CreateSalesOrderItemCommandValidator()
    {
        RuleFor(x => x.ProductCode)
            .NotEmpty().WithMessage("Ürün kodu zorunludur")
            .MaximumLength(50).WithMessage("Ürün kodu 50 karakteri aşmamalıdır")
            .Matches(ProductCodeRegex).WithMessage("Ürün kodu yalnızca harf, rakam, tire, nokta, alt çizgi ve eğik çizgi içerebilir");

        RuleFor(x => x.ProductName)
            .NotEmpty().WithMessage("Ürün adı zorunludur")
            .MaximumLength(200).WithMessage("Ürün adı 200 karakteri aşmamalıdır");

        RuleFor(x => x.Description)
            .MaximumLength(500).WithMessage("Açıklama 500 karakteri aşmamalıdır")
            .When(x => !string.IsNullOrEmpty(x.Description));

        RuleFor(x => x.Unit)
            .NotEmpty().WithMessage("Birim zorunludur")
            .MaximumLength(20).WithMessage("Birim 20 karakteri aşmamalıdır");

        RuleFor(x => x.Quantity)
            .GreaterThan(0).WithMessage("Miktar 0'dan büyük olmalıdır")
            .LessThanOrEqualTo(MaxQuantity).WithMessage($"Miktar {MaxQuantity:N0} değerini aşmamalıdır");

        RuleFor(x => x.UnitPrice)
            .GreaterThanOrEqualTo(0).WithMessage("Birim fiyat negatif olamaz")
            .LessThanOrEqualTo(MaxUnitPrice).WithMessage($"Birim fiyat {MaxUnitPrice:N0} değerini aşmamalıdır");

        RuleFor(x => x.VatRate)
            .InclusiveBetween(0, 100).WithMessage("KDV oranı 0 ile 100 arasında olmalıdır");

        RuleFor(x => x.DiscountRate)
            .InclusiveBetween(0, 100).WithMessage("İndirim oranı 0 ile 100 arasında olmalıdır");
    }
}

public class AddressSnapshotInputValidator : AbstractValidator<AddressSnapshotInput>
{
    public AddressSnapshotInputValidator()
    {
        RuleFor(x => x.RecipientName)
            .NotEmpty().WithMessage("Alıcı adı zorunludur")
            .MaximumLength(200).WithMessage("Alıcı adı 200 karakteri aşmamalıdır");

        RuleFor(x => x.RecipientPhone)
            .MaximumLength(20).WithMessage("Telefon numarası 20 karakteri aşmamalıdır")
            .Matches(@"^[\d\s\+\-\(\)]+$").WithMessage("Telefon numarası geçersiz karakterler içermektedir")
            .When(x => !string.IsNullOrEmpty(x.RecipientPhone));

        RuleFor(x => x.CompanyName)
            .MaximumLength(200).WithMessage("Firma adı 200 karakteri aşmamalıdır")
            .When(x => !string.IsNullOrEmpty(x.CompanyName));

        RuleFor(x => x.AddressLine1)
            .NotEmpty().WithMessage("Adres satırı 1 zorunludur")
            .MaximumLength(300).WithMessage("Adres satırı 1, 300 karakteri aşmamalıdır");

        RuleFor(x => x.AddressLine2)
            .MaximumLength(300).WithMessage("Adres satırı 2, 300 karakteri aşmamalıdır")
            .When(x => !string.IsNullOrEmpty(x.AddressLine2));

        RuleFor(x => x.District)
            .MaximumLength(100).WithMessage("Mahalle/Semt 100 karakteri aşmamalıdır")
            .When(x => !string.IsNullOrEmpty(x.District));

        RuleFor(x => x.Town)
            .MaximumLength(100).WithMessage("İlçe 100 karakteri aşmamalıdır")
            .When(x => !string.IsNullOrEmpty(x.Town));

        RuleFor(x => x.City)
            .NotEmpty().WithMessage("İl zorunludur")
            .MaximumLength(100).WithMessage("İl 100 karakteri aşmamalıdır");

        RuleFor(x => x.State)
            .MaximumLength(100).WithMessage("Bölge 100 karakteri aşmamalıdır")
            .When(x => !string.IsNullOrEmpty(x.State));

        RuleFor(x => x.Country)
            .NotEmpty().WithMessage("Ülke zorunludur")
            .MaximumLength(100).WithMessage("Ülke 100 karakteri aşmamalıdır");

        RuleFor(x => x.PostalCode)
            .MaximumLength(10).WithMessage("Posta kodu 10 karakteri aşmamalıdır")
            .Matches(@"^[a-zA-Z0-9\s\-]+$").WithMessage("Posta kodu geçersiz karakterler içermektedir")
            .When(x => !string.IsNullOrEmpty(x.PostalCode));

        RuleFor(x => x.TaxId)
            .MaximumLength(20).WithMessage("Vergi numarası 20 karakteri aşmamalıdır")
            .Matches(@"^[\d]+$").WithMessage("Vergi numarası yalnızca rakam içermelidir")
            .When(x => !string.IsNullOrEmpty(x.TaxId));

        RuleFor(x => x.TaxOffice)
            .MaximumLength(100).WithMessage("Vergi dairesi 100 karakteri aşmamalıdır")
            .When(x => !string.IsNullOrEmpty(x.TaxOffice));
    }
}

public class UpdateSalesOrderCommandValidator : AbstractValidator<UpdateSalesOrderCommand>
{
    private static readonly Regex DangerousPatternRegex = new(
        @"<\s*script|javascript\s*:|on\w+\s*=|<\s*iframe|<\s*object|<\s*embed",
        RegexOptions.Compiled | RegexOptions.IgnoreCase);

    private const decimal MaxDiscountAmount = 999_999_999m;

    public UpdateSalesOrderCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Sipariş kimliği zorunludur");

        RuleFor(x => x.CustomerName)
            .MaximumLength(200).WithMessage("Müşteri adı 200 karakteri aşmamalıdır")
            .Must(NotContainDangerousContent).WithMessage("Müşteri adı geçersiz karakterler içermektedir")
            .When(x => !string.IsNullOrEmpty(x.CustomerName));

        RuleFor(x => x.CustomerEmail)
            .MaximumLength(254).WithMessage("E-posta adresi 254 karakteri aşmamalıdır")
            .EmailAddress().WithMessage("Geçersiz e-posta adresi")
            .When(x => !string.IsNullOrEmpty(x.CustomerEmail));

        RuleFor(x => x.CustomerOrderNumber)
            .MaximumLength(100).WithMessage("Müşteri sipariş numarası 100 karakteri aşmamalıdır")
            .Must(NotContainDangerousContent).WithMessage("Müşteri sipariş numarası geçersiz karakterler içermektedir")
            .When(x => !string.IsNullOrEmpty(x.CustomerOrderNumber));

        RuleFor(x => x.DeliveryDate)
            .GreaterThanOrEqualTo(DateTime.UtcNow.Date).WithMessage("Teslimat tarihi geçmişte olamaz")
            .LessThanOrEqualTo(DateTime.UtcNow.AddYears(2)).WithMessage("Teslimat tarihi şu andan itibaren 2 yıldan fazla olamaz")
            .When(x => x.DeliveryDate.HasValue);

        RuleFor(x => x.ShippingAddress)
            .MaximumLength(500).WithMessage("Teslimat adresi 500 karakteri aşmamalıdır")
            .Must(NotContainDangerousContent).WithMessage("Teslimat adresi geçersiz karakterler içermektedir")
            .When(x => !string.IsNullOrEmpty(x.ShippingAddress));

        RuleFor(x => x.BillingAddress)
            .MaximumLength(500).WithMessage("Fatura adresi 500 karakteri aşmamalıdır")
            .Must(NotContainDangerousContent).WithMessage("Fatura adresi geçersiz karakterler içermektedir")
            .When(x => !string.IsNullOrEmpty(x.BillingAddress));

        RuleFor(x => x.Notes)
            .MaximumLength(2000).WithMessage("Notlar 2000 karakteri aşmamalıdır")
            .Must(NotContainDangerousContent).WithMessage("Notlar geçersiz karakterler içermektedir")
            .When(x => !string.IsNullOrEmpty(x.Notes));

        RuleFor(x => x.SalesPersonName)
            .MaximumLength(200).WithMessage("Satış temsilcisi adı 200 karakteri aşmamalıdır")
            .Must(NotContainDangerousContent).WithMessage("Satış temsilcisi adı geçersiz karakterler içermektedir")
            .When(x => !string.IsNullOrEmpty(x.SalesPersonName));

        RuleFor(x => x.DiscountAmount)
            .GreaterThanOrEqualTo(0).WithMessage("İndirim tutarı negatif olamaz")
            .LessThanOrEqualTo(MaxDiscountAmount).WithMessage($"İndirim tutarı {MaxDiscountAmount:N0} değerini aşmamalıdır");

        RuleFor(x => x.DiscountRate)
            .InclusiveBetween(0, 100).WithMessage("İndirim oranı 0 ile 100 arasında olmalıdır");
    }

    private static bool NotContainDangerousContent(string? value)
    {
        if (string.IsNullOrEmpty(value))
            return true;
        return !DangerousPatternRegex.IsMatch(value);
    }
}

public class AddSalesOrderItemCommandValidator : AbstractValidator<AddSalesOrderItemCommand>
{
    private static readonly Regex ProductCodeRegex = new(@"^[a-zA-Z0-9\-._/]+$", RegexOptions.Compiled);
    private const decimal MaxQuantity = 999_999m;
    private const decimal MaxUnitPrice = 999_999_999m;

    public AddSalesOrderItemCommandValidator()
    {
        RuleFor(x => x.SalesOrderId)
            .NotEmpty().WithMessage("Sipariş kimliği zorunludur");

        RuleFor(x => x.ProductCode)
            .NotEmpty().WithMessage("Ürün kodu zorunludur")
            .MaximumLength(50).WithMessage("Ürün kodu 50 karakteri aşmamalıdır")
            .Matches(ProductCodeRegex).WithMessage("Ürün kodu yalnızca harf, rakam, tire, nokta, alt çizgi ve eğik çizgi içerebilir");

        RuleFor(x => x.ProductName)
            .NotEmpty().WithMessage("Ürün adı zorunludur")
            .MaximumLength(200).WithMessage("Ürün adı 200 karakteri aşmamalıdır");

        RuleFor(x => x.Unit)
            .NotEmpty().WithMessage("Birim zorunludur")
            .MaximumLength(20).WithMessage("Birim 20 karakteri aşmamalıdır");

        RuleFor(x => x.Quantity)
            .GreaterThan(0).WithMessage("Miktar 0'dan büyük olmalıdır")
            .LessThanOrEqualTo(MaxQuantity).WithMessage($"Miktar {MaxQuantity:N0} değerini aşmamalıdır");

        RuleFor(x => x.UnitPrice)
            .GreaterThanOrEqualTo(0).WithMessage("Birim fiyat negatif olamaz")
            .LessThanOrEqualTo(MaxUnitPrice).WithMessage($"Birim fiyat {MaxUnitPrice:N0} değerini aşmamalıdır");

        RuleFor(x => x.VatRate)
            .InclusiveBetween(0, 100).WithMessage("KDV oranı 0 ile 100 arasında olmalıdır");

        RuleFor(x => x.DiscountRate)
            .InclusiveBetween(0, 100).WithMessage("İndirim oranı 0 ile 100 arasında olmalıdır");
    }
}

public class CancelSalesOrderCommandValidator : AbstractValidator<CancelSalesOrderCommand>
{
    public CancelSalesOrderCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Sipariş kimliği zorunludur");

        RuleFor(x => x.Reason)
            .NotEmpty().WithMessage("İptal nedeni zorunludur")
            .MaximumLength(500).WithMessage("İptal nedeni 500 karakteri aşmamalıdır");
    }
}
