using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Stocker.Modules.Inventory.Application.Services;
using Stocker.SharedKernel.Authorization;
using Stocker.SharedKernel.Interfaces;

namespace Stocker.Modules.Inventory.API.Controllers;

/// <summary>
/// Controller for Excel export/import operations for Inventory module
/// </summary>
[ApiController]
[Authorize]
[Route("api/inventory/excel")]
[RequireModule("Inventory")]
[ApiExplorerSettings(GroupName = "inventory")]
public class ExcelExportController : ControllerBase
{
    private readonly IExcelExportService _excelExportService;
    private readonly ITenantService _tenantService;
    private readonly ILogger<ExcelExportController> _logger;

    public ExcelExportController(
        IExcelExportService excelExportService,
        ITenantService tenantService,
        ILogger<ExcelExportController> logger)
    {
        _excelExportService = excelExportService;
        _tenantService = tenantService;
        _logger = logger;
    }

    #region Export Endpoints

    /// <summary>
    /// Export products to Excel file
    /// </summary>
    /// <param name="productIds">Optional list of product IDs to export</param>
    [HttpGet("products/export")]
    [ProducesResponseType(typeof(FileContentResult), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> ExportProducts([FromQuery] int[]? productIds = null)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue)
            return BadRequest(new { message = "Tenant bilgisi bulunamadı" });

        try
        {
            _logger.LogInformation("Exporting products to Excel for tenant {TenantId}", tenantId);

            var result = await _excelExportService.ExportProductsAsync(
                productIds?.Select(id => id),
                HttpContext.RequestAborted);

            return File(result.FileContent, result.ContentType, result.FileName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error exporting products to Excel");
            return BadRequest(new { message = "Ürün dışa aktarılırken hata oluştu", error = ex.Message });
        }
    }

    /// <summary>
    /// Export stock data to Excel file
    /// </summary>
    /// <param name="warehouseId">Optional warehouse filter</param>
    /// <param name="includeZeroStock">Include items with zero stock</param>
    [HttpGet("stock/export")]
    [ProducesResponseType(typeof(FileContentResult), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> ExportStock(
        [FromQuery] int? warehouseId = null,
        [FromQuery] bool includeZeroStock = false)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue)
            return BadRequest(new { message = "Tenant bilgisi bulunamadı" });

        try
        {
            _logger.LogInformation("Exporting stock to Excel for tenant {TenantId}, warehouse {WarehouseId}",
                tenantId, warehouseId);

            var result = await _excelExportService.ExportStockAsync(
                warehouseId,
                includeZeroStock,
                HttpContext.RequestAborted);

            return File(result.FileContent, result.ContentType, result.FileName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error exporting stock to Excel");
            return BadRequest(new { message = "Stok dışa aktarılırken hata oluştu", error = ex.Message });
        }
    }

    /// <summary>
    /// Export stock summary to Excel file
    /// </summary>
    [HttpGet("stock/summary/export")]
    [ProducesResponseType(typeof(FileContentResult), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> ExportStockSummary()
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue)
            return BadRequest(new { message = "Tenant bilgisi bulunamadı" });

        try
        {
            _logger.LogInformation("Exporting stock summary to Excel for tenant {TenantId}", tenantId);

            var result = await _excelExportService.ExportStockSummaryAsync(HttpContext.RequestAborted);

            return File(result.FileContent, result.ContentType, result.FileName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error exporting stock summary to Excel");
            return BadRequest(new { message = "Stok özeti dışa aktarılırken hata oluştu", error = ex.Message });
        }
    }

    #endregion

    #region Import Endpoints

    /// <summary>
    /// Import products from Excel file
    /// </summary>
    /// <param name="file">Excel file to import</param>
    /// <param name="updateExisting">If true, updates existing products by code</param>
    [HttpPost("products/import")]
    [ProducesResponseType(typeof(ExcelImportResult), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [Consumes("multipart/form-data")]
    public async Task<ActionResult<ExcelImportResult>> ImportProducts(
        IFormFile file,
        [FromQuery] bool updateExisting = false)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue)
            return BadRequest(new { message = "Tenant bilgisi bulunamadı" });

        if (file == null || file.Length == 0)
            return BadRequest(new { message = "Lütfen bir dosya yükleyin" });

        if (!IsValidExcelFile(file))
            return BadRequest(new { message = "Geçersiz dosya formatı. Lütfen .xlsx veya .xls dosyası yükleyin" });

        try
        {
            _logger.LogInformation("Importing products from Excel for tenant {TenantId}, UpdateExisting: {UpdateExisting}",
                tenantId, updateExisting);

            using var stream = file.OpenReadStream();
            var result = await _excelExportService.ImportProductsAsync(
                stream,
                updateExisting,
                HttpContext.RequestAborted);

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error importing products from Excel");
            return BadRequest(new { message = "Ürün içe aktarılırken hata oluştu", error = ex.Message });
        }
    }

    /// <summary>
    /// Import stock adjustments from Excel file
    /// </summary>
    /// <param name="file">Excel file to import</param>
    [HttpPost("stock/import")]
    [ProducesResponseType(typeof(ExcelImportResult), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [Consumes("multipart/form-data")]
    public async Task<ActionResult<ExcelImportResult>> ImportStockAdjustments(IFormFile file)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue)
            return BadRequest(new { message = "Tenant bilgisi bulunamadı" });

        if (file == null || file.Length == 0)
            return BadRequest(new { message = "Lütfen bir dosya yükleyin" });

        if (!IsValidExcelFile(file))
            return BadRequest(new { message = "Geçersiz dosya formatı. Lütfen .xlsx veya .xls dosyası yükleyin" });

        try
        {
            _logger.LogInformation("Importing stock adjustments from Excel for tenant {TenantId}", tenantId);

            using var stream = file.OpenReadStream();
            var result = await _excelExportService.ImportStockAdjustmentsAsync(
                stream,
                HttpContext.RequestAborted);

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error importing stock adjustments from Excel");
            return BadRequest(new { message = "Stok düzeltmeleri içe aktarılırken hata oluştu", error = ex.Message });
        }
    }

    #endregion

    #region Template Endpoints

    /// <summary>
    /// Download product import template
    /// </summary>
    [HttpGet("products/template")]
    [ProducesResponseType(typeof(FileContentResult), 200)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> GetProductImportTemplate()
    {
        try
        {
            var result = await _excelExportService.GetProductImportTemplateAsync();
            return File(result.FileContent, result.ContentType, result.FileName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating product import template");
            return BadRequest(new { message = "Şablon oluşturulurken hata oluştu", error = ex.Message });
        }
    }

    /// <summary>
    /// Download stock adjustment import template
    /// </summary>
    [HttpGet("stock/template")]
    [ProducesResponseType(typeof(FileContentResult), 200)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> GetStockAdjustmentTemplate()
    {
        try
        {
            var result = await _excelExportService.GetStockAdjustmentTemplateAsync();
            return File(result.FileContent, result.ContentType, result.FileName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating stock adjustment template");
            return BadRequest(new { message = "Şablon oluşturulurken hata oluştu", error = ex.Message });
        }
    }

    #endregion

    #region Validation Endpoints

    /// <summary>
    /// Validate an import file before importing
    /// </summary>
    /// <param name="file">Excel file to validate</param>
    /// <param name="importType">Type of import (Products or StockAdjustments)</param>
    [HttpPost("validate")]
    [ProducesResponseType(typeof(ExcelValidationResult), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [Consumes("multipart/form-data")]
    public async Task<ActionResult<ExcelValidationResult>> ValidateImportFile(
        IFormFile file,
        [FromQuery] ExcelImportType importType)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue)
            return BadRequest(new { message = "Tenant bilgisi bulunamadı" });

        if (file == null || file.Length == 0)
            return BadRequest(new { message = "Lütfen bir dosya yükleyin" });

        if (!IsValidExcelFile(file))
            return BadRequest(new { message = "Geçersiz dosya formatı. Lütfen .xlsx veya .xls dosyası yükleyin" });

        try
        {
            _logger.LogInformation("Validating import file for tenant {TenantId}, type {ImportType}",
                tenantId, importType);

            using var stream = file.OpenReadStream();
            var result = await _excelExportService.ValidateImportFileAsync(
                stream,
                importType,
                HttpContext.RequestAborted);

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error validating import file");
            return BadRequest(new { message = "Dosya doğrulanırken hata oluştu", error = ex.Message });
        }
    }

    #endregion

    #region Helper Methods

    private static bool IsValidExcelFile(IFormFile file)
    {
        if (file == null) return false;

        var validExtensions = new[] { ".xlsx", ".xls" };
        var extension = Path.GetExtension(file.FileName)?.ToLowerInvariant();

        if (string.IsNullOrEmpty(extension) || !validExtensions.Contains(extension))
            return false;

        var validContentTypes = new[]
        {
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/vnd.ms-excel",
            "application/octet-stream" // Some browsers send this for Excel files
        };

        return validContentTypes.Contains(file.ContentType);
    }

    #endregion
}
