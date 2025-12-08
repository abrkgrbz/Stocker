using Stocker.SharedKernel.MultiTenancy;

namespace Stocker.Modules.Purchase.Domain.Entities;

/// <summary>
/// Satın Alma Sözleşmesi / Purchase Contract
/// </summary>
public class PurchaseContract : TenantAggregateRoot
{
    public string ContractNumber { get; private set; } = string.Empty;
    public string Title { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public PurchaseContractStatus Status { get; private set; }
    public PurchaseContractType Type { get; private set; }

    // Supplier
    public Guid SupplierId { get; private set; }
    public string SupplierCode { get; private set; } = string.Empty;
    public string SupplierName { get; private set; } = string.Empty;

    // Dates
    public DateTime StartDate { get; private set; }
    public DateTime EndDate { get; private set; }
    public DateTime? SignedDate { get; private set; }
    public DateTime? TerminationDate { get; private set; }
    public bool AutoRenew { get; private set; }
    public int? RenewalPeriodMonths { get; private set; }
    public int? RenewalNoticeDays { get; private set; }

    // Financial limits
    public decimal? MinimumOrderValue { get; private set; }
    public decimal? MaximumOrderValue { get; private set; }
    public decimal? TotalContractValue { get; private set; }
    public decimal UsedAmount { get; private set; }
    public decimal RemainingAmount { get; private set; }
    public string Currency { get; private set; } = "TRY";

    // Quantity limits
    public decimal? MinimumQuantity { get; private set; }
    public decimal? MaximumQuantity { get; private set; }
    public decimal UsedQuantity { get; private set; }

    // Payment terms
    public int PaymentTermDays { get; private set; }
    public PaymentMethod? PaymentMethod { get; private set; }
    public decimal? DiscountRate { get; private set; }

    // Delivery terms
    public int? LeadTimeDays { get; private set; }
    public string? DeliveryTerms { get; private set; }
    public string? ShippingMethod { get; private set; }

    // Contact info
    public string? ContactPerson { get; private set; }
    public string? ContactEmail { get; private set; }
    public string? ContactPhone { get; private set; }

    // Terms and conditions
    public string? Terms { get; private set; }
    public string? PenaltyClause { get; private set; }
    public string? WarrantyTerms { get; private set; }
    public string? QualityRequirements { get; private set; }

    // Document
    public string? DocumentPath { get; private set; }
    public string? DocumentUrl { get; private set; }

    // Notes
    public string? Notes { get; private set; }
    public string? InternalNotes { get; private set; }
    public string? TerminationReason { get; private set; }

    // Audit
    public Guid? CreatedById { get; private set; }
    public string? CreatedByName { get; private set; }
    public Guid? ApprovedById { get; private set; }
    public string? ApprovedByName { get; private set; }
    public DateTime? ApprovalDate { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }

    private readonly List<PurchaseContractItem> _items = new();
    public IReadOnlyCollection<PurchaseContractItem> Items => _items.AsReadOnly();

    private readonly List<PurchaseContractPriceBreak> _priceBreaks = new();
    public IReadOnlyCollection<PurchaseContractPriceBreak> PriceBreaks => _priceBreaks.AsReadOnly();

    protected PurchaseContract() : base() { }

    public static PurchaseContract Create(
        string contractNumber,
        string title,
        Guid supplierId,
        string supplierCode,
        string supplierName,
        DateTime startDate,
        DateTime endDate,
        Guid tenantId,
        PurchaseContractType type = PurchaseContractType.Standard,
        string currency = "TRY")
    {
        var contract = new PurchaseContract();
        contract.Id = Guid.NewGuid();
        contract.SetTenantId(tenantId);
        contract.ContractNumber = contractNumber;
        contract.Title = title;
        contract.SupplierId = supplierId;
        contract.SupplierCode = supplierCode;
        contract.SupplierName = supplierName;
        contract.StartDate = startDate;
        contract.EndDate = endDate;
        contract.Type = type;
        contract.Status = PurchaseContractStatus.Draft;
        contract.Currency = currency;
        contract.PaymentTermDays = 30;
        contract.UsedAmount = 0;
        contract.UsedQuantity = 0;
        contract.CreatedAt = DateTime.UtcNow;
        return contract;
    }

    public void Update(
        string title,
        string? description,
        PurchaseContractType type,
        DateTime startDate,
        DateTime endDate,
        decimal? totalContractValue,
        decimal? minimumOrderValue,
        decimal? maximumOrderValue,
        int paymentTermDays,
        decimal? discountRate,
        int? leadTimeDays,
        string? deliveryTerms,
        string? terms,
        string? notes,
        string? internalNotes)
    {
        Title = title;
        Description = description;
        Type = type;
        StartDate = startDate;
        EndDate = endDate;
        TotalContractValue = totalContractValue;
        MinimumOrderValue = minimumOrderValue;
        MaximumOrderValue = maximumOrderValue;
        PaymentTermDays = paymentTermDays;
        DiscountRate = discountRate;
        LeadTimeDays = leadTimeDays;
        DeliveryTerms = deliveryTerms;
        Terms = terms;
        Notes = notes;
        InternalNotes = internalNotes;
        CalculateRemainingAmount();
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetRenewalTerms(bool autoRenew, int? renewalPeriodMonths, int? renewalNoticeDays)
    {
        AutoRenew = autoRenew;
        RenewalPeriodMonths = renewalPeriodMonths;
        RenewalNoticeDays = renewalNoticeDays;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetQuantityLimits(decimal? minimumQuantity, decimal? maximumQuantity)
    {
        MinimumQuantity = minimumQuantity;
        MaximumQuantity = maximumQuantity;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetContact(string? contactPerson, string? contactEmail, string? contactPhone)
    {
        ContactPerson = contactPerson;
        ContactEmail = contactEmail;
        ContactPhone = contactPhone;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetDocumentPath(string? documentPath, string? documentUrl)
    {
        DocumentPath = documentPath;
        DocumentUrl = documentUrl;
        UpdatedAt = DateTime.UtcNow;
    }

    public void AddItem(PurchaseContractItem item)
    {
        _items.Add(item);
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

    public void AddPriceBreak(PurchaseContractPriceBreak priceBreak)
    {
        _priceBreaks.Add(priceBreak);
        UpdatedAt = DateTime.UtcNow;
    }

    public void RemovePriceBreak(Guid priceBreakId)
    {
        var priceBreak = _priceBreaks.FirstOrDefault(p => p.Id == priceBreakId);
        if (priceBreak != null)
        {
            _priceBreaks.Remove(priceBreak);
            UpdatedAt = DateTime.UtcNow;
        }
    }

    public void Submit()
    {
        if (Status != PurchaseContractStatus.Draft)
            throw new InvalidOperationException("Only draft contracts can be submitted.");

        Status = PurchaseContractStatus.PendingApproval;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Approve(Guid approvedById, string approvedByName)
    {
        if (Status != PurchaseContractStatus.PendingApproval)
            throw new InvalidOperationException("Only pending contracts can be approved.");

        Status = PurchaseContractStatus.Approved;
        ApprovedById = approvedById;
        ApprovedByName = approvedByName;
        ApprovalDate = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Reject(string reason)
    {
        if (Status != PurchaseContractStatus.PendingApproval)
            throw new InvalidOperationException("Only pending contracts can be rejected.");

        Status = PurchaseContractStatus.Rejected;
        InternalNotes = reason;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Activate()
    {
        if (Status != PurchaseContractStatus.Approved && Status != PurchaseContractStatus.Suspended)
            throw new InvalidOperationException("Only approved or suspended contracts can be activated.");

        if (DateTime.UtcNow < StartDate)
            throw new InvalidOperationException("Contract cannot be activated before start date.");

        Status = PurchaseContractStatus.Active;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Sign(DateTime signedDate)
    {
        SignedDate = signedDate;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Suspend(string reason)
    {
        if (Status != PurchaseContractStatus.Active)
            throw new InvalidOperationException("Only active contracts can be suspended.");

        Status = PurchaseContractStatus.Suspended;
        InternalNotes = reason;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Terminate(string reason)
    {
        if (Status == PurchaseContractStatus.Terminated || Status == PurchaseContractStatus.Expired)
            throw new InvalidOperationException("Contract is already terminated or expired.");

        Status = PurchaseContractStatus.Terminated;
        TerminationReason = reason;
        TerminationDate = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Expire()
    {
        if (DateTime.UtcNow > EndDate && Status == PurchaseContractStatus.Active)
        {
            Status = PurchaseContractStatus.Expired;
            UpdatedAt = DateTime.UtcNow;
        }
    }

    public void Renew(DateTime newEndDate)
    {
        if (!AutoRenew)
            throw new InvalidOperationException("Contract is not set for auto-renewal.");

        EndDate = newEndDate;
        Status = PurchaseContractStatus.Active;
        UpdatedAt = DateTime.UtcNow;
    }

    public void RecordUsage(decimal amount, decimal quantity = 0)
    {
        UsedAmount += amount;
        UsedQuantity += quantity;
        CalculateRemainingAmount();
        UpdatedAt = DateTime.UtcNow;
    }

    private void CalculateRemainingAmount()
    {
        RemainingAmount = TotalContractValue.HasValue ? TotalContractValue.Value - UsedAmount : 0;
    }

    public bool IsWithinLimits(decimal orderAmount, decimal orderQuantity = 0)
    {
        if (Status != PurchaseContractStatus.Active)
            return false;

        if (MinimumOrderValue.HasValue && orderAmount < MinimumOrderValue.Value)
            return false;

        if (MaximumOrderValue.HasValue && orderAmount > MaximumOrderValue.Value)
            return false;

        if (TotalContractValue.HasValue && (UsedAmount + orderAmount) > TotalContractValue.Value)
            return false;

        if (MinimumQuantity.HasValue && orderQuantity < MinimumQuantity.Value)
            return false;

        if (MaximumQuantity.HasValue && (UsedQuantity + orderQuantity) > MaximumQuantity.Value)
            return false;

        return true;
    }

    public decimal GetEffectivePrice(Guid productId, decimal quantity)
    {
        // Check price breaks first
        var priceBreak = _priceBreaks
            .Where(pb => pb.ProductId == productId && pb.MinQuantity <= quantity)
            .OrderByDescending(pb => pb.MinQuantity)
            .FirstOrDefault();

        if (priceBreak != null)
            return priceBreak.UnitPrice;

        // Fall back to contract item price
        var item = _items.FirstOrDefault(i => i.ProductId == productId);
        return item?.UnitPrice ?? 0;
    }
}

public class PurchaseContractItem : TenantEntity
{
    public Guid ContractId { get; private set; }
    public Guid? ProductId { get; private set; }
    public string ProductCode { get; private set; } = string.Empty;
    public string ProductName { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public string Unit { get; private set; } = "Adet";
    public decimal UnitPrice { get; private set; }
    public decimal? MinQuantity { get; private set; }
    public decimal? MaxQuantity { get; private set; }
    public decimal? ContractedQuantity { get; private set; }
    public decimal UsedQuantity { get; private set; }
    public decimal? DiscountRate { get; private set; }
    public int? LeadTimeDays { get; private set; }
    public string? Notes { get; private set; }
    public bool IsActive { get; private set; }

    protected PurchaseContractItem() : base() { }

    public static PurchaseContractItem Create(
        Guid contractId,
        Guid tenantId,
        string productCode,
        string productName,
        decimal unitPrice,
        string unit = "Adet",
        Guid? productId = null,
        string? description = null,
        decimal? minQuantity = null,
        decimal? maxQuantity = null,
        decimal? contractedQuantity = null,
        decimal? discountRate = null,
        int? leadTimeDays = null)
    {
        var item = new PurchaseContractItem();
        item.Id = Guid.NewGuid();
        item.SetTenantId(tenantId);
        item.ContractId = contractId;
        item.ProductId = productId;
        item.ProductCode = productCode;
        item.ProductName = productName;
        item.Description = description;
        item.Unit = unit;
        item.UnitPrice = unitPrice;
        item.MinQuantity = minQuantity;
        item.MaxQuantity = maxQuantity;
        item.ContractedQuantity = contractedQuantity;
        item.DiscountRate = discountRate;
        item.LeadTimeDays = leadTimeDays;
        item.UsedQuantity = 0;
        item.IsActive = true;
        return item;
    }

    public void Update(
        string productCode,
        string productName,
        string? description,
        string unit,
        decimal unitPrice,
        decimal? minQuantity,
        decimal? maxQuantity,
        decimal? contractedQuantity,
        decimal? discountRate,
        int? leadTimeDays)
    {
        ProductCode = productCode;
        ProductName = productName;
        Description = description;
        Unit = unit;
        UnitPrice = unitPrice;
        MinQuantity = minQuantity;
        MaxQuantity = maxQuantity;
        ContractedQuantity = contractedQuantity;
        DiscountRate = discountRate;
        LeadTimeDays = leadTimeDays;
    }

    public void RecordUsage(decimal quantity)
    {
        UsedQuantity += quantity;
    }

    public void Activate() => IsActive = true;
    public void Deactivate() => IsActive = false;
}

public class PurchaseContractPriceBreak : TenantEntity
{
    public Guid ContractId { get; private set; }
    public Guid? ContractItemId { get; private set; }
    public Guid? ProductId { get; private set; }
    public string ProductCode { get; private set; } = string.Empty;
    public decimal MinQuantity { get; private set; }
    public decimal? MaxQuantity { get; private set; }
    public decimal UnitPrice { get; private set; }
    public decimal? DiscountRate { get; private set; }

    protected PurchaseContractPriceBreak() : base() { }

    public static PurchaseContractPriceBreak Create(
        Guid contractId,
        Guid tenantId,
        string productCode,
        decimal minQuantity,
        decimal unitPrice,
        Guid? productId = null,
        Guid? contractItemId = null,
        decimal? maxQuantity = null,
        decimal? discountRate = null)
    {
        var priceBreak = new PurchaseContractPriceBreak();
        priceBreak.Id = Guid.NewGuid();
        priceBreak.SetTenantId(tenantId);
        priceBreak.ContractId = contractId;
        priceBreak.ContractItemId = contractItemId;
        priceBreak.ProductId = productId;
        priceBreak.ProductCode = productCode;
        priceBreak.MinQuantity = minQuantity;
        priceBreak.MaxQuantity = maxQuantity;
        priceBreak.UnitPrice = unitPrice;
        priceBreak.DiscountRate = discountRate;
        return priceBreak;
    }
}

// Enums
public enum PurchaseContractStatus
{
    Draft,
    PendingApproval,
    Approved,
    Rejected,
    Active,
    Suspended,
    Expired,
    Terminated
}

public enum PurchaseContractType
{
    Standard,
    Blanket,
    Framework,
    Spot,
    Annual
}
