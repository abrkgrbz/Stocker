namespace Stocker.Modules.Inventory.Application.Services;

/// <summary>
/// Service interface for Excel export/import operations
/// </summary>
public interface IExcelExportService
{
    /// <summary>
    /// Export products to Excel file
    /// </summary>
    /// <param name="productIds">Optional list of product IDs to export. If null, exports all active products.</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Excel file as byte array with filename</returns>
    Task<ExcelExportResult> ExportProductsAsync(IEnumerable<int>? productIds = null, CancellationToken cancellationToken = default);

    /// <summary>
    /// Export stock data to Excel file
    /// </summary>
    /// <param name="warehouseId">Optional warehouse ID filter</param>
    /// <param name="includeZeroStock">Include items with zero stock</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Excel file as byte array with filename</returns>
    Task<ExcelExportResult> ExportStockAsync(int? warehouseId = null, bool includeZeroStock = false, CancellationToken cancellationToken = default);

    /// <summary>
    /// Export stock summary by product to Excel
    /// </summary>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Excel file as byte array with filename</returns>
    Task<ExcelExportResult> ExportStockSummaryAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Import products from Excel file
    /// </summary>
    /// <param name="fileStream">Excel file stream</param>
    /// <param name="updateExisting">If true, updates existing products by code. If false, skips existing.</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Import result with success/error counts</returns>
    Task<ExcelImportResult> ImportProductsAsync(Stream fileStream, bool updateExisting = false, CancellationToken cancellationToken = default);

    /// <summary>
    /// Import stock adjustments from Excel file
    /// </summary>
    /// <param name="fileStream">Excel file stream</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Import result with success/error counts</returns>
    Task<ExcelImportResult> ImportStockAdjustmentsAsync(Stream fileStream, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get a template Excel file for product import
    /// </summary>
    /// <returns>Excel template file as byte array</returns>
    Task<ExcelExportResult> GetProductImportTemplateAsync();

    /// <summary>
    /// Get a template Excel file for stock adjustment import
    /// </summary>
    /// <returns>Excel template file as byte array</returns>
    Task<ExcelExportResult> GetStockAdjustmentTemplateAsync();

    /// <summary>
    /// Validate an Excel file before import
    /// </summary>
    /// <param name="fileStream">Excel file stream</param>
    /// <param name="importType">Type of import (Products or StockAdjustments)</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Validation result with any errors</returns>
    Task<ExcelValidationResult> ValidateImportFileAsync(Stream fileStream, ExcelImportType importType, CancellationToken cancellationToken = default);
}

/// <summary>
/// Result of Excel export operation
/// </summary>
public class ExcelExportResult
{
    public byte[] FileContent { get; set; } = Array.Empty<byte>();
    public string FileName { get; set; } = string.Empty;
    public string ContentType { get; set; } = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    public int RecordCount { get; set; }
}

/// <summary>
/// Result of Excel import operation
/// </summary>
public class ExcelImportResult
{
    public bool Success { get; set; }
    public int TotalRows { get; set; }
    public int SuccessCount { get; set; }
    public int ErrorCount { get; set; }
    public int SkippedCount { get; set; }
    public List<ExcelImportError> Errors { get; set; } = new();
    public List<string> Warnings { get; set; } = new();
}

/// <summary>
/// Error details for a specific row during import
/// </summary>
public class ExcelImportError
{
    public int RowNumber { get; set; }
    public string? ColumnName { get; set; }
    public string ErrorMessage { get; set; } = string.Empty;
    public string? Value { get; set; }
}

/// <summary>
/// Result of Excel file validation
/// </summary>
public class ExcelValidationResult
{
    public bool IsValid { get; set; }
    public int TotalRows { get; set; }
    public List<ExcelImportError> Errors { get; set; } = new();
    public List<string> Warnings { get; set; } = new();
    public List<string> MissingRequiredColumns { get; set; } = new();
    public List<string> UnrecognizedColumns { get; set; } = new();
}

/// <summary>
/// Type of Excel import
/// </summary>
public enum ExcelImportType
{
    Products,
    StockAdjustments
}
