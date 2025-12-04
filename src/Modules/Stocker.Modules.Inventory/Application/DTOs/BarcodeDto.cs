namespace Stocker.Modules.Inventory.Application.DTOs;

/// <summary>
/// Supported barcode formats
/// </summary>
public enum BarcodeFormat
{
    EAN13,
    EAN8,
    UPC_A,
    UPC_E,
    Code128,
    Code39,
    QRCode,
    DataMatrix,
    PDF417,
    ITF14
}

/// <summary>
/// Barcode label size presets
/// </summary>
public enum LabelSize
{
    Small,      // 30x20mm
    Medium,     // 50x30mm
    Large,      // 70x40mm
    Wide,       // 100x30mm
    Square,     // 50x50mm (for QR)
    Custom
}

/// <summary>
/// Request DTO for generating barcode
/// </summary>
public class GenerateBarcodeRequest
{
    public string Content { get; set; } = string.Empty;
    public BarcodeFormat Format { get; set; } = BarcodeFormat.Code128;
    public int Width { get; set; } = 300;
    public int Height { get; set; } = 100;
    public bool IncludeText { get; set; } = true;
    public string? CustomText { get; set; }
}

/// <summary>
/// Response DTO for generated barcode
/// </summary>
public class GenerateBarcodeResponse
{
    public string Content { get; set; } = string.Empty;
    public BarcodeFormat Format { get; set; }
    public string ImageBase64 { get; set; } = string.Empty;
    public string ImageUrl { get; set; } = string.Empty;
    public string ContentType { get; set; } = "image/png";
    public int Width { get; set; }
    public int Height { get; set; }
}

/// <summary>
/// Request DTO for generating product label
/// </summary>
public class GenerateProductLabelRequest
{
    public int ProductId { get; set; }
    public LabelSize LabelSize { get; set; } = LabelSize.Medium;
    public BarcodeFormat BarcodeFormat { get; set; } = BarcodeFormat.Code128;
    public bool IncludeProductName { get; set; } = true;
    public bool IncludePrice { get; set; } = true;
    public bool IncludeSKU { get; set; } = false;
    public bool IncludeQRCode { get; set; } = false;
    public int Quantity { get; set; } = 1;
    public int? CustomWidth { get; set; }
    public int? CustomHeight { get; set; }
}

/// <summary>
/// Response DTO for generated product label
/// </summary>
public class GenerateProductLabelResponse
{
    public int ProductId { get; set; }
    public string ProductCode { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public string? Barcode { get; set; }
    public decimal? Price { get; set; }
    public string? PriceCurrency { get; set; }
    public string LabelImageBase64 { get; set; } = string.Empty;
    public string LabelImageUrl { get; set; } = string.Empty;
    public string ContentType { get; set; } = "image/png";
    public LabelSize LabelSize { get; set; }
    public int Width { get; set; }
    public int Height { get; set; }
}

/// <summary>
/// Request DTO for bulk label generation
/// </summary>
public class BulkLabelGenerationRequest
{
    public List<ProductLabelItem> Products { get; set; } = new();
    public LabelSize LabelSize { get; set; } = LabelSize.Medium;
    public BarcodeFormat BarcodeFormat { get; set; } = BarcodeFormat.Code128;
    public bool IncludeProductName { get; set; } = true;
    public bool IncludePrice { get; set; } = true;
    public string OutputFormat { get; set; } = "pdf"; // pdf, zip
}

/// <summary>
/// Product item for bulk label generation
/// </summary>
public class ProductLabelItem
{
    public int ProductId { get; set; }
    public int Quantity { get; set; } = 1;
}

/// <summary>
/// Response for bulk label generation
/// </summary>
public class BulkLabelGenerationResponse
{
    public int TotalLabels { get; set; }
    public int TotalProducts { get; set; }
    public string FileBase64 { get; set; } = string.Empty;
    public string FileUrl { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
    public string FileName { get; set; } = string.Empty;
}

/// <summary>
/// Request for barcode lookup/scan
/// </summary>
public class BarcodeLookupRequest
{
    public string Barcode { get; set; } = string.Empty;
    public bool IncludeStock { get; set; } = true;
    public int? WarehouseId { get; set; }
}

/// <summary>
/// Response for barcode lookup
/// </summary>
public class BarcodeLookupResponse
{
    public bool Found { get; set; }
    public string SearchedBarcode { get; set; } = string.Empty;
    public string? MatchType { get; set; } // Product, ProductVariant, SerialNumber, LotBatch
    public ProductLookupResult? Product { get; set; }
    public ProductVariantLookupResult? Variant { get; set; }
    public SerialNumberLookupResult? SerialNumber { get; set; }
    public LotBatchLookupResult? LotBatch { get; set; }
}

/// <summary>
/// Product lookup result
/// </summary>
public class ProductLookupResult
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Barcode { get; set; }
    public string? SKU { get; set; }
    public string? CategoryName { get; set; }
    public decimal? UnitPrice { get; set; }
    public string? UnitPriceCurrency { get; set; }
    public string? UnitName { get; set; }
    public decimal TotalStockQuantity { get; set; }
    public decimal AvailableStockQuantity { get; set; }
    public string? PrimaryImageUrl { get; set; }
    public List<WarehouseStockInfo> StockByWarehouse { get; set; } = new();
}

/// <summary>
/// Product variant lookup result
/// </summary>
public class ProductVariantLookupResult
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string VariantCode { get; set; } = string.Empty;
    public string? Barcode { get; set; }
    public string? SKU { get; set; }
    public string VariantName { get; set; } = string.Empty;
    public decimal? UnitPrice { get; set; }
    public decimal TotalStockQuantity { get; set; }
}

/// <summary>
/// Serial number lookup result
/// </summary>
public class SerialNumberLookupResult
{
    public int Id { get; set; }
    public string SerialNumber { get; set; } = string.Empty;
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public int? WarehouseId { get; set; }
    public string? WarehouseName { get; set; }
    public DateTime? ReceivedDate { get; set; }
    public DateTime? SoldDate { get; set; }
}

/// <summary>
/// Lot batch lookup result
/// </summary>
public class LotBatchLookupResult
{
    public int Id { get; set; }
    public string LotNumber { get; set; } = string.Empty;
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public decimal Quantity { get; set; }
    public decimal AvailableQuantity { get; set; }
    public DateTime? ManufactureDate { get; set; }
    public DateTime? ExpiryDate { get; set; }
    public int? DaysUntilExpiry { get; set; }
}

/// <summary>
/// Stock info by warehouse
/// </summary>
public class WarehouseStockInfo
{
    public int WarehouseId { get; set; }
    public string WarehouseName { get; set; } = string.Empty;
    public decimal Quantity { get; set; }
    public decimal AvailableQuantity { get; set; }
    public decimal ReservedQuantity { get; set; }
}

/// <summary>
/// Request for auto-generating barcode
/// </summary>
public class AutoGenerateBarcodeRequest
{
    public int ProductId { get; set; }
    public BarcodeFormat Format { get; set; } = BarcodeFormat.EAN13;
    public bool UpdateProduct { get; set; } = true;
}

/// <summary>
/// Response for auto-generated barcode
/// </summary>
public class AutoGenerateBarcodeResponse
{
    public int ProductId { get; set; }
    public string GeneratedBarcode { get; set; } = string.Empty;
    public BarcodeFormat Format { get; set; }
    public bool ProductUpdated { get; set; }
    public string? ValidationMessage { get; set; }
}
