namespace Stocker.Domain.Migration.Enums;

/// <summary>
/// Migration session status
/// </summary>
public enum MigrationSessionStatus
{
    /// <summary>Session created, waiting for data upload</summary>
    Created = 0,

    /// <summary>Data is being uploaded in chunks</summary>
    Uploading = 1,

    /// <summary>All chunks uploaded, ready for validation</summary>
    Uploaded = 2,

    /// <summary>Validation in progress</summary>
    Validating = 3,

    /// <summary>Validation complete, waiting for user review</summary>
    Validated = 4,

    /// <summary>Import in progress (Hangfire job running)</summary>
    Importing = 5,

    /// <summary>Import completed successfully</summary>
    Completed = 6,

    /// <summary>Import failed</summary>
    Failed = 7,

    /// <summary>Session cancelled by user</summary>
    Cancelled = 8,

    /// <summary>Session expired (auto-cleanup)</summary>
    Expired = 9
}

/// <summary>
/// Source system types
/// </summary>
public enum MigrationSourceType
{
    /// <summary>Excel/CSV file upload</summary>
    Excel = 0,

    /// <summary>Logo ERP (Tiger, Go, etc.)</summary>
    Logo = 1,

    /// <summary>ETA SQL</summary>
    Eta = 2,

    /// <summary>Mikro</summary>
    Mikro = 3,

    /// <summary>Netsis</summary>
    Netsis = 4,

    /// <summary>Parasut (API-based)</summary>
    Parasut = 5,

    /// <summary>Generic SQL connection</summary>
    GenericSql = 6
}

/// <summary>
/// Entity types that can be migrated
/// </summary>
public enum MigrationEntityType
{
    /// <summary>Customers/Clients (Cariler)</summary>
    Customer = 0,

    /// <summary>Products (Stok Kartlari)</summary>
    Product = 1,

    /// <summary>Stock quantities (Stok Miktarlari)</summary>
    Stock = 2,

    /// <summary>Categories (Kategoriler)</summary>
    Category = 3,

    /// <summary>Brands (Markalar)</summary>
    Brand = 4,

    /// <summary>Units (Birimler)</summary>
    Unit = 5,

    /// <summary>Warehouses (Depolar)</summary>
    Warehouse = 6,

    /// <summary>Suppliers (Tedarikciler)</summary>
    Supplier = 7,

    /// <summary>Invoices (Faturalar)</summary>
    Invoice = 8,

    /// <summary>Invoice items</summary>
    InvoiceItem = 9,

    /// <summary>Accounting entries (Muhasebe kayitlari)</summary>
    AccountingEntry = 10,

    /// <summary>Opening stock balances (Açılış stokları)</summary>
    OpeningBalance = 11,

    /// <summary>Stock movements (Stok hareketleri)</summary>
    StockMovement = 12,

    /// <summary>Price lists (Fiyat listeleri)</summary>
    PriceList = 13
}

/// <summary>
/// Validation result status for each record
/// </summary>
public enum ValidationStatus
{
    /// <summary>Not yet validated</summary>
    Pending = 0,

    /// <summary>Valid, ready for import</summary>
    Valid = 1,

    /// <summary>Has warnings but can be imported</summary>
    Warning = 2,

    /// <summary>Has errors, cannot be imported</summary>
    Error = 3,

    /// <summary>Skipped by user</summary>
    Skipped = 4,

    /// <summary>Fixed by user</summary>
    Fixed = 5
}

/// <summary>
/// Chunk upload status
/// </summary>
public enum ChunkStatus
{
    /// <summary>Chunk received</summary>
    Received = 0,

    /// <summary>Chunk validated</summary>
    Validated = 1,

    /// <summary>Chunk imported</summary>
    Imported = 2,

    /// <summary>Chunk failed</summary>
    Failed = 3
}
