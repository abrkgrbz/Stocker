using Stocker.SharedKernel.MultiTenancy;

namespace Stocker.Modules.Purchase.Domain.Entities;

/// <summary>
/// Tedarikçi Fiyat Listesi / Supplier Price List
/// </summary>
public class PriceList : TenantAggregateRoot
{
    public string Code { get; private set; } = string.Empty;
    public string Name { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public PriceListStatus Status { get; private set; }
    public PriceListType Type { get; private set; }

    // Supplier (nullable for general price lists)
    public Guid? SupplierId { get; private set; }
    public string? SupplierCode { get; private set; }
    public string? SupplierName { get; private set; }

    // Validity
    public DateTime EffectiveFrom { get; private set; }
    public DateTime? EffectiveTo { get; private set; }
    public bool IsDefault { get; private set; }

    // Currency
    public string Currency { get; private set; } = "TRY";
    public decimal ExchangeRate { get; private set; }

    // Pricing settings
    public decimal? GlobalDiscountRate { get; private set; }
    public bool IncludesVat { get; private set; }
    public decimal DefaultVatRate { get; private set; }

    // Version control
    public int Version { get; private set; }
    public Guid? PreviousVersionId { get; private set; }
    public string? ChangeNotes { get; private set; }

    // Notes
    public string? Notes { get; private set; }
    public string? InternalNotes { get; private set; }

    // Audit
    public Guid? CreatedById { get; private set; }
    public string? CreatedByName { get; private set; }
    public Guid? ApprovedById { get; private set; }
    public string? ApprovedByName { get; private set; }
    public DateTime? ApprovalDate { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }

    private readonly List<PriceListItem> _items = new();
    public IReadOnlyCollection<PriceListItem> Items => _items.AsReadOnly();

    protected PriceList() : base() { }

    // Original Create (for backward compatibility)
    public static PriceList Create(
        string code,
        string name,
        Guid supplierId,
        string supplierCode,
        string supplierName,
        DateTime effectiveFrom,
        Guid tenantId,
        PriceListType type = PriceListType.Standard,
        string currency = "TRY",
        DateTime? effectiveTo = null)
    {
        var priceList = new PriceList();
        priceList.Id = Guid.NewGuid();
        priceList.SetTenantId(tenantId);
        priceList.Code = code;
        priceList.Name = name;
        priceList.SupplierId = supplierId;
        priceList.SupplierCode = supplierCode;
        priceList.SupplierName = supplierName;
        priceList.EffectiveFrom = effectiveFrom;
        priceList.EffectiveTo = effectiveTo;
        priceList.Type = type;
        priceList.Status = PriceListStatus.Draft;
        priceList.Currency = currency;
        priceList.ExchangeRate = 1;
        priceList.DefaultVatRate = 20;
        priceList.Version = 1;
        priceList.CreatedAt = DateTime.UtcNow;
        return priceList;
    }

    // New Create for controller compatibility (nullable supplier)
    public static PriceList Create(
        string code,
        string name,
        DateTime effectiveFrom,
        Guid tenantId,
        PriceListType type = PriceListType.Standard,
        string currency = "TRY",
        DateTime? effectiveTo = null,
        Guid? supplierId = null,
        string? supplierCode = null,
        string? supplierName = null)
    {
        var priceList = new PriceList();
        priceList.Id = Guid.NewGuid();
        priceList.SetTenantId(tenantId);
        priceList.Code = code;
        priceList.Name = name;
        priceList.SupplierId = supplierId;
        priceList.SupplierCode = supplierCode;
        priceList.SupplierName = supplierName;
        priceList.EffectiveFrom = effectiveFrom;
        priceList.EffectiveTo = effectiveTo;
        priceList.Type = type;
        priceList.Status = PriceListStatus.Draft;
        priceList.Currency = currency;
        priceList.ExchangeRate = 1;
        priceList.DefaultVatRate = 20;
        priceList.Version = 1;
        priceList.CreatedAt = DateTime.UtcNow;
        return priceList;
    }

    public void Update(string name, DateTime? effectiveTo)
    {
        Name = name;
        EffectiveTo = effectiveTo;
        UpdatedAt = DateTime.UtcNow;
    }

    public void UpdateFull(
        string name,
        string? description,
        PriceListType type,
        DateTime effectiveFrom,
        DateTime? effectiveTo,
        decimal? globalDiscountRate,
        bool includesVat,
        decimal defaultVatRate,
        string? notes,
        string? internalNotes)
    {
        Name = name;
        Description = description;
        Type = type;
        EffectiveFrom = effectiveFrom;
        EffectiveTo = effectiveTo;
        GlobalDiscountRate = globalDiscountRate;
        IncludesVat = includesVat;
        DefaultVatRate = defaultVatRate;
        Notes = notes;
        InternalNotes = internalNotes;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetDescription(string? description)
    {
        Description = description;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetNotes(string? notes, string? internalNotes)
    {
        Notes = notes;
        InternalNotes = internalNotes;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetCurrency(string currency, decimal exchangeRate)
    {
        Currency = currency;
        ExchangeRate = exchangeRate;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetCreator(Guid createdById, string? createdByName)
    {
        CreatedById = createdById;
        CreatedByName = createdByName;
    }

    public void AddItem(PriceListItem item)
    {
        // Check if product already exists
        if (_items.Any(i => i.ProductId == item.ProductId))
            throw new InvalidOperationException("Product already exists in this price list.");

        _items.Add(item);
        UpdatedAt = DateTime.UtcNow;
    }

    public void UpdateItem(Guid itemId, decimal unitPrice, decimal? discountRate, int? minQuantity, int? leadTimeDays)
    {
        var item = _items.FirstOrDefault(i => i.Id == itemId);
        if (item == null)
            throw new InvalidOperationException("Item not found.");

        item.UpdatePrice(unitPrice, discountRate, minQuantity, leadTimeDays);
        UpdatedAt = DateTime.UtcNow;
    }

    public void RemoveItem(Guid itemId)
    {
        var item = _items.FirstOrDefault(i => i.Id == itemId);
        if (item != null)
        {
            _items.Remove(item);
            UpdatedAt = DateTime.UtcNow;
        }
    }

    public void ClearItems()
    {
        _items.Clear();
        UpdatedAt = DateTime.UtcNow;
    }

    public void Submit()
    {
        if (Status != PriceListStatus.Draft)
            throw new InvalidOperationException("Only draft price lists can be submitted.");

        if (!_items.Any())
            throw new InvalidOperationException("Price list must have at least one item.");

        Status = PriceListStatus.PendingApproval;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Approve(Guid approvedById, string approvedByName)
    {
        if (Status != PriceListStatus.PendingApproval && Status != PriceListStatus.Draft)
            throw new InvalidOperationException("Only pending or draft price lists can be approved.");

        Status = PriceListStatus.Approved;
        ApprovedById = approvedById;
        ApprovedByName = approvedByName;
        ApprovalDate = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Reject(string reason)
    {
        if (Status != PriceListStatus.PendingApproval)
            throw new InvalidOperationException("Only pending price lists can be rejected.");

        Status = PriceListStatus.Rejected;
        InternalNotes = reason;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Activate()
    {
        if (Status != PriceListStatus.Approved && Status != PriceListStatus.Inactive && Status != PriceListStatus.Draft)
            throw new InvalidOperationException("Only approved, draft, or inactive price lists can be activated.");

        Status = PriceListStatus.Active;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Deactivate()
    {
        if (Status != PriceListStatus.Active)
            throw new InvalidOperationException("Only active price lists can be deactivated.");

        Status = PriceListStatus.Inactive;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetAsDefault()
    {
        IsDefault = true;
        UpdatedAt = DateTime.UtcNow;
    }

    public void UnsetDefault()
    {
        IsDefault = false;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Expire()
    {
        if (EffectiveTo.HasValue && EffectiveTo.Value < DateTime.UtcNow && Status == PriceListStatus.Active)
        {
            Status = PriceListStatus.Expired;
            IsDefault = false;
            UpdatedAt = DateTime.UtcNow;
        }
    }

    public PriceList CreateNewVersion(Guid tenantId, string? changeNotes = null)
    {
        var newVersion = PriceList.Create(
            Code,
            Name,
            DateTime.UtcNow,
            tenantId,
            Type,
            Currency,
            EffectiveTo,
            SupplierId,
            SupplierCode,
            SupplierName);

        newVersion.Description = Description;
        newVersion.GlobalDiscountRate = GlobalDiscountRate;
        newVersion.IncludesVat = IncludesVat;
        newVersion.DefaultVatRate = DefaultVatRate;
        newVersion.Notes = Notes;
        newVersion.InternalNotes = InternalNotes;
        newVersion.Version = Version + 1;
        newVersion.PreviousVersionId = Id;
        newVersion.ChangeNotes = changeNotes;

        // Copy items
        foreach (var item in _items)
        {
            var newItem = PriceListItem.Create(
                newVersion.Id,
                tenantId,
                item.ProductCode,
                item.ProductName,
                item.UnitPrice,
                item.Unit,
                item.ProductId,
                item.Description,
                item.VatRate,
                item.DiscountRate,
                item.MinOrderQuantity,
                item.LeadTimeDays);
            newVersion.AddItem(newItem);
        }

        return newVersion;
    }

    public decimal? GetPrice(Guid productId, decimal quantity = 1)
    {
        var item = _items.FirstOrDefault(i => i.ProductId == productId && i.IsActive);
        if (item == null)
            return null;

        var basePrice = item.UnitPrice;

        // Apply item discount
        if (item.DiscountRate.HasValue)
            basePrice = basePrice * (1 - item.DiscountRate.Value / 100);

        // Apply global discount
        if (GlobalDiscountRate.HasValue)
            basePrice = basePrice * (1 - GlobalDiscountRate.Value / 100);

        // Check volume pricing
        var volumePrice = item.GetVolumePrice(quantity);
        if (volumePrice.HasValue && volumePrice.Value < basePrice)
            return volumePrice.Value;

        return basePrice;
    }

    public bool IsValid()
    {
        var now = DateTime.UtcNow;
        return Status == PriceListStatus.Active &&
               EffectiveFrom <= now &&
               (!EffectiveTo.HasValue || EffectiveTo.Value >= now);
    }
}

public class PriceListItem : TenantEntity
{
    public Guid PriceListId { get; private set; }
    public Guid? ProductId { get; private set; }
    public string ProductCode { get; private set; } = string.Empty;
    public string ProductName { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public string Unit { get; private set; } = "Adet";
    public decimal UnitPrice { get; private set; }
    public decimal? PreviousPrice { get; private set; }
    public DateTime? PriceChangeDate { get; private set; }
    public decimal VatRate { get; private set; }
    public decimal? DiscountRate { get; private set; }
    public int? MinOrderQuantity { get; private set; }
    public int? MaxOrderQuantity { get; private set; }
    public int? LeadTimeDays { get; private set; }
    public bool IsActive { get; private set; }
    public string? Notes { get; private set; }

    // Additional pricing properties
    public decimal BasePrice { get; private set; }
    public decimal DiscountedPrice => DiscountRate.HasValue ? BasePrice * (1 - DiscountRate.Value / 100) : BasePrice;
    public string Currency { get; private set; } = "TRY";
    public int? MinQuantity { get; private set; }
    public int? MaxQuantity { get; private set; }
    public DateTime? EffectiveFrom { get; private set; }
    public DateTime? EffectiveTo { get; private set; }

    private readonly List<PriceListItemTier> _tiers = new();
    public IReadOnlyCollection<PriceListItemTier> Tiers => _tiers.AsReadOnly();

    protected PriceListItem() : base() { }

    public static PriceListItem Create(
        Guid priceListId,
        Guid tenantId,
        string productCode,
        string productName,
        decimal unitPrice,
        string unit = "Adet",
        Guid? productId = null,
        string? description = null,
        decimal vatRate = 20,
        decimal? discountRate = null,
        int? minOrderQuantity = null,
        int? leadTimeDays = null)
    {
        var item = new PriceListItem();
        item.Id = Guid.NewGuid();
        item.SetTenantId(tenantId);
        item.PriceListId = priceListId;
        item.ProductId = productId;
        item.ProductCode = productCode;
        item.ProductName = productName;
        item.Description = description;
        item.Unit = unit;
        item.UnitPrice = unitPrice;
        item.BasePrice = unitPrice;
        item.VatRate = vatRate;
        item.DiscountRate = discountRate;
        item.MinOrderQuantity = minOrderQuantity;
        item.LeadTimeDays = leadTimeDays;
        item.IsActive = true;
        return item;
    }

    // New Create overload for controller compatibility
    public static PriceListItem Create(
        Guid priceListId,
        Guid tenantId,
        Guid? productId,
        string productCode,
        string productName,
        string unit,
        decimal basePrice,
        decimal? discountRate,
        string currency,
        int? minQuantity,
        int? maxQuantity,
        DateTime? effectiveFrom,
        DateTime? effectiveTo,
        string? notes)
    {
        var item = new PriceListItem();
        item.Id = Guid.NewGuid();
        item.SetTenantId(tenantId);
        item.PriceListId = priceListId;
        item.ProductId = productId;
        item.ProductCode = productCode;
        item.ProductName = productName;
        item.Unit = unit;
        item.UnitPrice = basePrice;
        item.BasePrice = basePrice;
        item.DiscountRate = discountRate;
        item.Currency = currency;
        item.MinQuantity = minQuantity;
        item.MaxQuantity = maxQuantity;
        item.EffectiveFrom = effectiveFrom;
        item.EffectiveTo = effectiveTo;
        item.Notes = notes;
        item.IsActive = true;
        return item;
    }

    // Create overload with decimal? quantity parameters for DTO compatibility
    public static PriceListItem Create(
        Guid priceListId,
        Guid tenantId,
        Guid? productId,
        string productCode,
        string productName,
        string unit,
        decimal basePrice,
        decimal? discountRate,
        string currency,
        decimal? minQuantity,
        decimal? maxQuantity,
        DateTime? effectiveFrom,
        DateTime? effectiveTo,
        string? notes)
    {
        return Create(
            priceListId,
            tenantId,
            productId,
            productCode,
            productName,
            unit,
            basePrice,
            discountRate,
            currency,
            minQuantity.HasValue ? (int?)Convert.ToInt32(minQuantity.Value) : null,
            maxQuantity.HasValue ? (int?)Convert.ToInt32(maxQuantity.Value) : null,
            effectiveFrom,
            effectiveTo,
            notes);
    }

    public void UpdatePrice(decimal unitPrice, decimal? discountRate = null, int? minQuantity = null, int? leadTimeDays = null)
    {
        if (UnitPrice != unitPrice)
        {
            PreviousPrice = UnitPrice;
            PriceChangeDate = DateTime.UtcNow;
        }
        UnitPrice = unitPrice;
        DiscountRate = discountRate;
        MinOrderQuantity = minQuantity;
        LeadTimeDays = leadTimeDays;
    }

    public void AddTier(PriceListItemTier tier)
    {
        _tiers.Add(tier);
    }

    public void RemoveTier(Guid tierId)
    {
        var tier = _tiers.FirstOrDefault(t => t.Id == tierId);
        if (tier != null)
            _tiers.Remove(tier);
    }

    public void ClearTiers()
    {
        _tiers.Clear();
    }

    public decimal? GetVolumePrice(decimal quantity)
    {
        return _tiers
            .Where(t => t.MinQuantity <= quantity && (!t.MaxQuantity.HasValue || t.MaxQuantity.Value >= quantity))
            .OrderByDescending(t => t.MinQuantity)
            .FirstOrDefault()?.UnitPrice;
    }

    public void Activate() => IsActive = true;
    public void Deactivate() => IsActive = false;
}

public class PriceListItemTier : TenantEntity
{
    public Guid PriceListItemId { get; private set; }
    public decimal MinQuantity { get; private set; }
    public decimal? MaxQuantity { get; private set; }
    public decimal UnitPrice { get; private set; }
    public decimal? DiscountRate { get; private set; }
    public int TierLevel { get; private set; }

    protected PriceListItemTier() : base() { }

    public static PriceListItemTier Create(
        Guid priceListItemId,
        Guid tenantId,
        decimal minQuantity,
        decimal unitPrice,
        decimal? maxQuantity = null,
        decimal? discountRate = null)
    {
        var tier = new PriceListItemTier();
        tier.Id = Guid.NewGuid();
        tier.SetTenantId(tenantId);
        tier.PriceListItemId = priceListItemId;
        tier.MinQuantity = minQuantity;
        tier.MaxQuantity = maxQuantity;
        tier.UnitPrice = unitPrice;
        tier.DiscountRate = discountRate;
        return tier;
    }

    // New Create overload for controller compatibility
    public static PriceListItemTier Create(
        Guid priceListItemId,
        Guid tenantId,
        decimal minQuantity,
        decimal? maxQuantity,
        decimal unitPrice,
        decimal? discountRate,
        int tierLevel)
    {
        var tier = new PriceListItemTier();
        tier.Id = Guid.NewGuid();
        tier.SetTenantId(tenantId);
        tier.PriceListItemId = priceListItemId;
        tier.MinQuantity = minQuantity;
        tier.MaxQuantity = maxQuantity;
        tier.UnitPrice = unitPrice;
        tier.DiscountRate = discountRate;
        tier.TierLevel = tierLevel;
        return tier;
    }
}

// Enums
public enum PriceListStatus
{
    Draft,
    PendingApproval,
    Approved,
    Rejected,
    Active,
    Inactive,
    Expired
}

public enum PriceListType
{
    Standard,
    Promotional,
    Contract,
    Seasonal,
    Volume,
    Supplier
}
