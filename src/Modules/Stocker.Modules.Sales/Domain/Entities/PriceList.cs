using Stocker.Domain.Common.ValueObjects;
using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Primitives;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Sales.Domain.Entities;

/// <summary>
/// Fiyat Listesi - B2B fiyatlandırma yönetimi
/// Price List - B2B pricing management with tiered pricing, customer-specific lists,
/// validity periods, and currency support
/// </summary>
public class PriceList : TenantAggregateRoot
{
    private readonly List<PriceListItem> _items = new();
    private readonly List<PriceListCustomer> _assignedCustomers = new();

    public string Code { get; private set; } = string.Empty;
    public string Name { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public PriceListType Type { get; private set; }
    public string CurrencyCode { get; private set; } = "TRY";
    public DateTime ValidFrom { get; private set; }
    public DateTime? ValidTo { get; private set; }
    public bool IsTaxIncluded { get; private set; }
    public int Priority { get; private set; }
    public Money? MinimumOrderAmount { get; private set; }
    public bool IsActive { get; private set; }
    public Guid? BasePriceListId { get; private set; }
    public decimal? BaseAdjustmentPercentage { get; private set; }
    public Guid? SalesTerritoryId { get; private set; }
    public string? CustomerSegment { get; private set; }

    public IReadOnlyCollection<PriceListItem> Items => _items.AsReadOnly();
    public IReadOnlyCollection<PriceListCustomer> AssignedCustomers => _assignedCustomers.AsReadOnly();

    private PriceList() { }

    public static Result<PriceList> Create(
        Guid tenantId,
        string code,
        string name,
        PriceListType type,
        string currencyCode,
        DateTime validFrom,
        DateTime? validTo,
        bool isTaxIncluded,
        int priority,
        string? description = null)
    {
        if (string.IsNullOrWhiteSpace(code))
            return Result<PriceList>.Failure(Error.Validation("PriceList.Code", "Fiyat listesi kodu boş olamaz."));

        if (string.IsNullOrWhiteSpace(name))
            return Result<PriceList>.Failure(Error.Validation("PriceList.Name", "Fiyat listesi adı boş olamaz."));

        if (validTo.HasValue && validTo.Value < validFrom)
            return Result<PriceList>.Failure(Error.Validation("PriceList.ValidTo", "Bitiş tarihi başlangıç tarihinden önce olamaz."));

        var priceList = new PriceList();
        priceList.Id = Guid.NewGuid();
        priceList.SetTenantId(tenantId);
        priceList.Code = code.ToUpperInvariant();
        priceList.Name = name;
        priceList.Description = description;
        priceList.Type = type;
        priceList.CurrencyCode = currencyCode;
        priceList.ValidFrom = validFrom;
        priceList.ValidTo = validTo;
        priceList.IsTaxIncluded = isTaxIncluded;
        priceList.Priority = priority;
        priceList.IsActive = true;

        return Result<PriceList>.Success(priceList);
    }

    public Result<PriceListItem> AddItem(
        Guid productId,
        string productCode,
        string productName,
        Money unitPrice,
        string unitOfMeasure,
        decimal? minimumQuantity = null,
        decimal? maximumQuantity = null)
    {
        var existingItem = _items.FirstOrDefault(i =>
            i.ProductId == productId &&
            i.MinimumQuantity == minimumQuantity &&
            i.MaximumQuantity == maximumQuantity);

        if (existingItem != null)
            return Result<PriceListItem>.Failure(Error.Conflict("PriceList.Item", "Bu ürün ve miktar aralığı için zaten bir kayıt mevcut."));

        var itemResult = PriceListItem.Create(
            Id, productId, productCode, productName,
            unitPrice, unitOfMeasure, minimumQuantity, maximumQuantity);

        if (!itemResult.IsSuccess)
            return itemResult;

        _items.Add(itemResult.Value!);
        return itemResult;
    }

    public Result UpdateItemPrice(Guid productId, Money newPrice, decimal? minimumQuantity = null)
    {
        var item = _items.FirstOrDefault(i =>
            i.ProductId == productId &&
            i.MinimumQuantity == minimumQuantity);

        if (item == null)
            return Result.Failure(Error.NotFound("PriceList.Item", "Ürün fiyat listesinde bulunamadı."));

        item.UpdatePrice(newPrice);
        return Result.Success();
    }

    public Result RemoveItem(Guid itemId)
    {
        var item = _items.FirstOrDefault(i => i.Id == itemId);
        if (item == null)
            return Result.Failure(Error.NotFound("PriceList.Item", "Kalem bulunamadı."));

        _items.Remove(item);
        return Result.Success();
    }

    public Result<PriceListCustomer> AssignToCustomer(Guid customerId, string customerName, DateTime? validFrom = null, DateTime? validTo = null)
    {
        if (_assignedCustomers.Any(c => c.CustomerId == customerId && c.IsActive))
            return Result<PriceListCustomer>.Failure(Error.Conflict("PriceList.Customer", "Bu müşteriye zaten atanmış."));

        var assignment = PriceListCustomer.Create(Id, customerId, customerName, validFrom ?? DateTime.UtcNow, validTo);
        if (!assignment.IsSuccess)
            return assignment;

        _assignedCustomers.Add(assignment.Value!);
        return assignment;
    }

    public Result RemoveCustomerAssignment(Guid customerId)
    {
        var assignment = _assignedCustomers.FirstOrDefault(c => c.CustomerId == customerId && c.IsActive);
        if (assignment == null)
            return Result.Failure(Error.NotFound("PriceList.Customer", "Müşteri ataması bulunamadı."));

        assignment.Deactivate();
        return Result.Success();
    }

    public Result<Money> GetProductPrice(Guid productId, decimal quantity = 1)
    {
        var applicableItems = _items
            .Where(i => i.ProductId == productId && i.IsActive)
            .Where(i => (!i.MinimumQuantity.HasValue || quantity >= i.MinimumQuantity.Value) &&
                       (!i.MaximumQuantity.HasValue || quantity <= i.MaximumQuantity.Value))
            .OrderByDescending(i => i.MinimumQuantity ?? 0)
            .ToList();

        if (!applicableItems.Any())
            return Result<Money>.Failure(Error.NotFound("PriceList.Product", "Ürün bu fiyat listesinde bulunamadı."));

        return Result<Money>.Success(applicableItems.First().UnitPrice);
    }

    public void Activate() => IsActive = true;
    public void Deactivate() => IsActive = false;

    public Result UpdateValidityPeriod(DateTime validFrom, DateTime? validTo)
    {
        if (validTo.HasValue && validTo.Value < validFrom)
            return Result.Failure(Error.Validation("PriceList.ValidTo", "Bitiş tarihi başlangıç tarihinden önce olamaz."));

        ValidFrom = validFrom;
        ValidTo = validTo;
        return Result.Success();
    }

    public Result ApplyBulkAdjustment(decimal percentageChange)
    {
        if (percentageChange < -100)
            return Result.Failure(Error.Validation("PriceList.Adjustment", "İndirim oranı %100'den fazla olamaz."));

        foreach (var item in _items.Where(i => i.IsActive))
        {
            var newAmount = item.UnitPrice.Amount * (1 + percentageChange / 100);
            var newPrice = Money.Create(Math.Round(newAmount, 2), item.UnitPrice.Currency);
            item.UpdatePrice(newPrice);
        }

        return Result.Success();
    }

    public bool IsValidAt(DateTime date)
    {
        return IsActive &&
               date >= ValidFrom &&
               (!ValidTo.HasValue || date <= ValidTo.Value);
    }
}

public class PriceListItem : Entity<Guid>
{
    public Guid PriceListId { get; private set; }
    public Guid ProductId { get; private set; }
    public string ProductCode { get; private set; } = string.Empty;
    public string ProductName { get; private set; } = string.Empty;
    public Money UnitPrice { get; private set; } = null!;
    public string UnitOfMeasure { get; private set; } = string.Empty;
    public decimal? MinimumQuantity { get; private set; }
    public decimal? MaximumQuantity { get; private set; }
    public decimal? DiscountPercentage { get; private set; }
    public DateTime LastPriceUpdate { get; private set; }
    public Money? PreviousPrice { get; private set; }
    public bool IsActive { get; private set; }

    private PriceListItem() { }

    internal static Result<PriceListItem> Create(
        Guid priceListId,
        Guid productId,
        string productCode,
        string productName,
        Money unitPrice,
        string unitOfMeasure,
        decimal? minimumQuantity,
        decimal? maximumQuantity)
    {
        if (unitPrice.Amount < 0)
            return Result<PriceListItem>.Failure(Error.Validation("PriceListItem.Price", "Birim fiyat negatif olamaz."));

        if (minimumQuantity.HasValue && minimumQuantity.Value < 0)
            return Result<PriceListItem>.Failure(Error.Validation("PriceListItem.MinQty", "Minimum miktar negatif olamaz."));

        if (maximumQuantity.HasValue && maximumQuantity.Value < 0)
            return Result<PriceListItem>.Failure(Error.Validation("PriceListItem.MaxQty", "Maksimum miktar negatif olamaz."));

        if (minimumQuantity.HasValue && maximumQuantity.HasValue && minimumQuantity.Value > maximumQuantity.Value)
            return Result<PriceListItem>.Failure(Error.Validation("PriceListItem.Quantity", "Minimum miktar maksimum miktardan büyük olamaz."));

        var item = new PriceListItem
        {
            Id = Guid.NewGuid(),
            PriceListId = priceListId,
            ProductId = productId,
            ProductCode = productCode,
            ProductName = productName,
            UnitPrice = unitPrice,
            UnitOfMeasure = unitOfMeasure,
            MinimumQuantity = minimumQuantity,
            MaximumQuantity = maximumQuantity,
            LastPriceUpdate = DateTime.UtcNow,
            IsActive = true
        };

        return Result<PriceListItem>.Success(item);
    }

    internal void UpdatePrice(Money newPrice)
    {
        PreviousPrice = UnitPrice;
        UnitPrice = newPrice;
        LastPriceUpdate = DateTime.UtcNow;
    }

    public void SetDiscountPercentage(decimal? percentage)
    {
        if (percentage.HasValue && (percentage.Value < 0 || percentage.Value > 100))
            throw new ArgumentException("İndirim oranı 0-100 arasında olmalıdır.");
        DiscountPercentage = percentage;
    }

    public void Activate() => IsActive = true;
    public void Deactivate() => IsActive = false;

    public Money GetDiscountedPrice()
    {
        if (!DiscountPercentage.HasValue || DiscountPercentage.Value == 0)
            return UnitPrice;

        var discountedAmount = UnitPrice.Amount * (1 - DiscountPercentage.Value / 100);
        return Money.Create(Math.Round(discountedAmount, 2), UnitPrice.Currency);
    }
}

public class PriceListCustomer : Entity<Guid>
{
    public Guid PriceListId { get; private set; }
    public Guid CustomerId { get; private set; }
    public string CustomerName { get; private set; } = string.Empty;
    public DateTime ValidFrom { get; private set; }
    public DateTime? ValidTo { get; private set; }
    public bool IsActive { get; private set; }

    private PriceListCustomer() { }

    internal static Result<PriceListCustomer> Create(
        Guid priceListId,
        Guid customerId,
        string customerName,
        DateTime validFrom,
        DateTime? validTo)
    {
        if (validTo.HasValue && validTo.Value < validFrom)
            return Result<PriceListCustomer>.Failure(Error.Validation("PriceListCustomer.ValidTo", "Bitiş tarihi başlangıç tarihinden önce olamaz."));

        var assignment = new PriceListCustomer
        {
            Id = Guid.NewGuid(),
            PriceListId = priceListId,
            CustomerId = customerId,
            CustomerName = customerName,
            ValidFrom = validFrom,
            ValidTo = validTo,
            IsActive = true
        };

        return Result<PriceListCustomer>.Success(assignment);
    }

    public void Deactivate() => IsActive = false;
    public void Activate() => IsActive = true;

    public bool IsValidAt(DateTime date)
    {
        return IsActive &&
               date >= ValidFrom &&
               (!ValidTo.HasValue || date <= ValidTo.Value);
    }
}

public enum PriceListType
{
    Standard = 1,
    CustomerSpecific = 2,
    Promotional = 3,
    Regional = 4,
    Segment = 5,
    Derived = 6,
    Wholesale = 7,
    Export = 8
}
