using Stocker.SharedKernel.MultiTenancy;

namespace Stocker.Modules.Purchase.Domain.Entities;

public class Supplier : TenantAggregateRoot
{
    public string Code { get; private set; } = string.Empty;
    public string Name { get; private set; } = string.Empty;
    public string? TaxNumber { get; private set; }
    public string? TaxOffice { get; private set; }
    public string? Email { get; private set; }
    public string? Phone { get; private set; }
    public string? Fax { get; private set; }
    public string? Website { get; private set; }
    public string? Address { get; private set; }
    public string? City { get; private set; }
    public string? District { get; private set; }
    public string? PostalCode { get; private set; }
    public string? Country { get; private set; }
    public string? ContactPerson { get; private set; }
    public string? ContactPhone { get; private set; }
    public string? ContactEmail { get; private set; }
    public SupplierType Type { get; private set; }
    public SupplierStatus Status { get; private set; }
    public int PaymentTermDays { get; private set; }
    public string Currency { get; private set; } = "TRY";
    public decimal? CreditLimit { get; private set; }
    public decimal CurrentBalance { get; private set; }
    public string? BankName { get; private set; }
    public string? BankBranch { get; private set; }
    public string? BankAccountNumber { get; private set; }
    public string? IBAN { get; private set; }
    public string? SwiftCode { get; private set; }
    public decimal? DiscountRate { get; private set; }
    public string? Notes { get; private set; }
    public bool IsActive { get; private set; }
    public DateTime? LastPurchaseDate { get; private set; }
    public decimal TotalPurchaseAmount { get; private set; }
    public int TotalOrderCount { get; private set; }
    public decimal? Rating { get; private set; }
    public Guid? CategoryId { get; private set; }
    public string? Tags { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }

    private readonly List<SupplierContact> _contacts = new();
    public IReadOnlyCollection<SupplierContact> Contacts => _contacts.AsReadOnly();

    private readonly List<SupplierProduct> _products = new();
    public IReadOnlyCollection<SupplierProduct> Products => _products.AsReadOnly();

    protected Supplier() : base() { }

    public static Supplier Create(
        string code,
        string name,
        SupplierType type,
        Guid tenantId,
        string? taxNumber = null,
        string? email = null,
        string? phone = null)
    {
        var supplier = new Supplier();
        supplier.Id = Guid.NewGuid();
        supplier.SetTenantId(tenantId);
        supplier.Code = code;
        supplier.Name = name;
        supplier.Type = type;
        supplier.TaxNumber = taxNumber;
        supplier.Email = email;
        supplier.Phone = phone;
        supplier.Status = SupplierStatus.Active;
        supplier.IsActive = true;
        supplier.PaymentTermDays = 30;
        supplier.Currency = "TRY";
        supplier.CurrentBalance = 0;
        supplier.TotalPurchaseAmount = 0;
        supplier.TotalOrderCount = 0;
        supplier.Country = "Türkiye";
        supplier.CreatedAt = DateTime.UtcNow;
        return supplier;
    }

    public void Update(
        string name,
        string? taxNumber,
        string? taxOffice,
        string? email,
        string? phone,
        string? address,
        string? city,
        string? district,
        int paymentTermDays,
        string currency)
    {
        Name = name;
        TaxNumber = taxNumber;
        TaxOffice = taxOffice;
        Email = email;
        Phone = phone;
        Address = address;
        City = city;
        District = district;
        PaymentTermDays = paymentTermDays;
        Currency = currency;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetBankInfo(string? bankName, string? iban, string? swiftCode)
    {
        BankName = bankName;
        IBAN = iban;
        SwiftCode = swiftCode;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetCreditLimit(decimal? creditLimit)
    {
        CreditLimit = creditLimit;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetDiscountRate(decimal? discountRate)
    {
        if (discountRate.HasValue && (discountRate < 0 || discountRate > 100))
            throw new ArgumentException("Discount rate must be between 0 and 100");
        DiscountRate = discountRate;
        UpdatedAt = DateTime.UtcNow;
    }

    public void UpdateBalance(decimal amount)
    {
        CurrentBalance += amount;
        UpdatedAt = DateTime.UtcNow;
    }

    public void RecordPurchase(decimal amount)
    {
        TotalPurchaseAmount += amount;
        TotalOrderCount++;
        LastPurchaseDate = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetRating(decimal rating)
    {
        if (rating < 0 || rating > 5)
            throw new ArgumentException("Rating must be between 0 and 5");
        Rating = rating;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Activate()
    {
        Status = SupplierStatus.Active;
        IsActive = true;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Deactivate()
    {
        Status = SupplierStatus.Inactive;
        IsActive = false;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Blacklist(string reason)
    {
        Status = SupplierStatus.Blacklisted;
        IsActive = false;
        Notes = $"Blacklisted: {reason}. Previous notes: {Notes}";
        UpdatedAt = DateTime.UtcNow;
    }

    public void AddContact(SupplierContact contact)
    {
        _contacts.Add(contact);
    }

    public void RemoveContact(Guid contactId)
    {
        var contact = _contacts.FirstOrDefault(c => c.Id == contactId);
        if (contact != null)
            _contacts.Remove(contact);
    }

    public void AddProduct(SupplierProduct product)
    {
        _products.Add(product);
    }

    public void RemoveProduct(Guid productId)
    {
        var product = _products.FirstOrDefault(p => p.Id == productId);
        if (product != null)
            _products.Remove(product);
    }
}

public class SupplierContact : TenantAggregateRoot
{
    public Guid SupplierId { get; private set; }
    public string Name { get; private set; } = string.Empty;
    public string? Title { get; private set; }
    public string? Department { get; private set; }
    public string? Email { get; private set; }
    public string? Phone { get; private set; }
    public string? Mobile { get; private set; }
    public bool IsPrimary { get; private set; }
    public string? Notes { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }

    public virtual Supplier Supplier { get; private set; } = null!;

    protected SupplierContact() : base() { }

    public static SupplierContact Create(
        Guid supplierId,
        string name,
        string? email,
        string? phone,
        bool isPrimary,
        Guid tenantId)
    {
        var contact = new SupplierContact();
        contact.Id = Guid.NewGuid();
        contact.SetTenantId(tenantId);
        contact.SupplierId = supplierId;
        contact.Name = name;
        contact.Email = email;
        contact.Phone = phone;
        contact.IsPrimary = isPrimary;
        contact.CreatedAt = DateTime.UtcNow;
        return contact;
    }
}

public class SupplierProduct : TenantAggregateRoot
{
    public Guid SupplierId { get; private set; }
    public Guid ProductId { get; private set; }
    public string? SupplierProductCode { get; private set; }
    public string? SupplierProductName { get; private set; }
    public decimal? UnitPrice { get; private set; }
    public string? Currency { get; private set; }
    public int? LeadTimeDays { get; private set; }
    public decimal? MinimumOrderQuantity { get; private set; }
    public bool IsPreferred { get; private set; }
    public string? Notes { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }

    public virtual Supplier Supplier { get; private set; } = null!;

    protected SupplierProduct() : base() { }

    public static SupplierProduct Create(
        Guid supplierId,
        Guid productId,
        decimal? unitPrice,
        string? currency,
        bool isPreferred,
        Guid tenantId)
    {
        var product = new SupplierProduct();
        product.Id = Guid.NewGuid();
        product.SetTenantId(tenantId);
        product.SupplierId = supplierId;
        product.ProductId = productId;
        product.UnitPrice = unitPrice;
        product.Currency = currency ?? "TRY";
        product.IsPreferred = isPreferred;
        product.CreatedAt = DateTime.UtcNow;
        return product;
    }
}

public enum SupplierType
{
    Manufacturer,
    Wholesaler,
    Distributor,
    Importer,
    Retailer,
    ServiceProvider,
    Other
}

public enum SupplierStatus
{
    Active,
    Inactive,
    Pending,
    Blacklisted,
    OnHold
}
