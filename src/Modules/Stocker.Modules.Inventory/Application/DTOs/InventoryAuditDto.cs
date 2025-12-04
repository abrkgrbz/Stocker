namespace Stocker.Modules.Inventory.Application.DTOs;

/// <summary>
/// Filter for inventory audit logs
/// </summary>
public class InventoryAuditFilterDto
{
    public string? EntityType { get; set; }
    public string? EntityId { get; set; }
    public string? Action { get; set; }
    public int? UserId { get; set; }
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}

/// <summary>
/// Inventory audit log entry
/// </summary>
public class InventoryAuditLogDto
{
    public Guid Id { get; set; }
    public string EntityType { get; set; } = default!;
    public string EntityId { get; set; } = default!;
    public string EntityName { get; set; } = default!;
    public string Action { get; set; } = default!;
    public string ActionLabel { get; set; } = default!;
    public string? OldValues { get; set; }
    public string? NewValues { get; set; }
    public List<FieldChangeDto>? Changes { get; set; }
    public string UserId { get; set; } = default!;
    public string UserName { get; set; } = default!;
    public string? UserEmail { get; set; }
    public string? IpAddress { get; set; }
    public string? UserAgent { get; set; }
    public DateTime Timestamp { get; set; }
    public string? AdditionalData { get; set; }
}

/// <summary>
/// Field change details
/// </summary>
public class FieldChangeDto
{
    public string FieldName { get; set; } = default!;
    public string FieldLabel { get; set; } = default!;
    public string? OldValue { get; set; }
    public string? NewValue { get; set; }
}

/// <summary>
/// Summary of audit logs by entity type
/// </summary>
public class AuditSummaryByEntityDto
{
    public string EntityType { get; set; } = default!;
    public string EntityTypeLabel { get; set; } = default!;
    public int TotalCount { get; set; }
    public int CreatedCount { get; set; }
    public int UpdatedCount { get; set; }
    public int DeletedCount { get; set; }
    public DateTime? LastActivityDate { get; set; }
}

/// <summary>
/// Summary of audit logs by user
/// </summary>
public class AuditSummaryByUserDto
{
    public string UserId { get; set; } = default!;
    public string UserName { get; set; } = default!;
    public int TotalActions { get; set; }
    public DateTime? LastActivityDate { get; set; }
}

/// <summary>
/// Summary of audit activity by date
/// </summary>
public class AuditActivityByDateDto
{
    public DateTime Date { get; set; }
    public int CreatedCount { get; set; }
    public int UpdatedCount { get; set; }
    public int DeletedCount { get; set; }
    public int TotalCount { get; set; }
}

/// <summary>
/// Overall audit dashboard
/// </summary>
public class InventoryAuditDashboardDto
{
    public int TotalAuditLogs { get; set; }
    public int TodayCount { get; set; }
    public int ThisWeekCount { get; set; }
    public int ThisMonthCount { get; set; }
    public List<AuditSummaryByEntityDto> ByEntityType { get; set; } = new();
    public List<AuditSummaryByUserDto> TopUsers { get; set; } = new();
    public List<AuditActivityByDateDto> ActivityTrend { get; set; } = new();
    public List<InventoryAuditLogDto> RecentActivities { get; set; } = new();
}

/// <summary>
/// Entity history - all changes for a specific entity
/// </summary>
public class EntityHistoryDto
{
    public string EntityType { get; set; } = default!;
    public string EntityId { get; set; } = default!;
    public string EntityName { get; set; } = default!;
    public DateTime CreatedAt { get; set; }
    public string CreatedBy { get; set; } = default!;
    public DateTime? LastModifiedAt { get; set; }
    public string? LastModifiedBy { get; set; }
    public int TotalChanges { get; set; }
    public List<InventoryAuditLogDto> Changes { get; set; } = new();
}

/// <summary>
/// Paginated response for audit logs
/// </summary>
public class PaginatedAuditLogsDto
{
    public List<InventoryAuditLogDto> Items { get; set; } = new();
    public int TotalCount { get; set; }
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
    public int TotalPages { get; set; }
    public bool HasNextPage { get; set; }
    public bool HasPreviousPage { get; set; }
}

/// <summary>
/// Entity types tracked for audit
/// </summary>
public static class InventoryEntityTypes
{
    public const string Product = "Product";
    public const string Category = "Category";
    public const string Brand = "Brand";
    public const string Unit = "Unit";
    public const string Warehouse = "Warehouse";
    public const string Location = "Location";
    public const string Supplier = "Supplier";
    public const string Stock = "Stock";
    public const string StockMovement = "StockMovement";
    public const string StockReservation = "StockReservation";
    public const string StockTransfer = "StockTransfer";
    public const string StockCount = "StockCount";
    public const string PriceList = "PriceList";
    public const string SerialNumber = "SerialNumber";
    public const string LotBatch = "LotBatch";
    public const string ProductAttribute = "ProductAttribute";
    public const string ProductVariant = "ProductVariant";
    public const string ProductBundle = "ProductBundle";

    public static readonly Dictionary<string, string> Labels = new()
    {
        { Product, "Ürün" },
        { Category, "Kategori" },
        { Brand, "Marka" },
        { Unit, "Birim" },
        { Warehouse, "Depo" },
        { Location, "Konum" },
        { Supplier, "Tedarikçi" },
        { Stock, "Stok" },
        { StockMovement, "Stok Hareketi" },
        { StockReservation, "Stok Rezervasyonu" },
        { StockTransfer, "Stok Transferi" },
        { StockCount, "Stok Sayımı" },
        { PriceList, "Fiyat Listesi" },
        { SerialNumber, "Seri Numarası" },
        { LotBatch, "Parti/Lot" },
        { ProductAttribute, "Ürün Özelliği" },
        { ProductVariant, "Ürün Varyantı" },
        { ProductBundle, "Ürün Paketi" },
    };
}

/// <summary>
/// Action types for audit
/// </summary>
public static class InventoryAuditActions
{
    public const string Created = "Created";
    public const string Updated = "Updated";
    public const string Deleted = "Deleted";
    public const string Activated = "Activated";
    public const string Deactivated = "Deactivated";
    public const string StatusChanged = "StatusChanged";
    public const string QuantityAdjusted = "QuantityAdjusted";
    public const string PriceChanged = "PriceChanged";
    public const string Transferred = "Transferred";
    public const string Reserved = "Reserved";
    public const string Released = "Released";
    public const string Counted = "Counted";
    public const string Approved = "Approved";
    public const string Rejected = "Rejected";
    public const string Received = "Received";
    public const string Shipped = "Shipped";
    public const string Completed = "Completed";
    public const string Cancelled = "Cancelled";

    public static readonly Dictionary<string, string> Labels = new()
    {
        { Created, "Oluşturuldu" },
        { Updated, "Güncellendi" },
        { Deleted, "Silindi" },
        { Activated, "Aktifleştirildi" },
        { Deactivated, "Deaktifleştirildi" },
        { StatusChanged, "Durum Değişti" },
        { QuantityAdjusted, "Miktar Ayarlandı" },
        { PriceChanged, "Fiyat Değişti" },
        { Transferred, "Transfer Edildi" },
        { Reserved, "Rezerve Edildi" },
        { Released, "Serbest Bırakıldı" },
        { Counted, "Sayıldı" },
        { Approved, "Onaylandı" },
        { Rejected, "Reddedildi" },
        { Received, "Teslim Alındı" },
        { Shipped, "Gönderildi" },
        { Completed, "Tamamlandı" },
        { Cancelled, "İptal Edildi" },
    };
}
