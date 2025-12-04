using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Application.Services;

namespace Stocker.Modules.Inventory.Controllers;

/// <summary>
/// Controller for barcode generation, scanning, and label printing operations
/// </summary>
[ApiController]
[Route("api/inventory/barcodes")]
[Authorize]
public class BarcodeController : ControllerBase
{
    private readonly IBarcodeService _barcodeService;

    public BarcodeController(IBarcodeService barcodeService)
    {
        _barcodeService = barcodeService;
    }

    /// <summary>
    /// Generate a barcode image
    /// </summary>
    /// <param name="request">Barcode generation parameters</param>
    /// <returns>Generated barcode image as base64</returns>
    [HttpPost("generate")]
    [ProducesResponseType(typeof(GenerateBarcodeResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<GenerateBarcodeResponse>> GenerateBarcode([FromBody] GenerateBarcodeRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Content))
            return BadRequest("Barcode content is required");

        var result = await _barcodeService.GenerateBarcodeAsync(request);
        return Ok(result);
    }

    /// <summary>
    /// Generate a barcode image and return as file
    /// </summary>
    /// <param name="content">Barcode content</param>
    /// <param name="format">Barcode format (default: Code128)</param>
    /// <param name="width">Image width (default: 300)</param>
    /// <param name="height">Image height (default: 100)</param>
    /// <returns>PNG image file</returns>
    [HttpGet("generate")]
    [ProducesResponseType(typeof(FileContentResult), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GenerateBarcodeImage(
        [FromQuery] string content,
        [FromQuery] BarcodeFormat format = BarcodeFormat.Code128,
        [FromQuery] int width = 300,
        [FromQuery] int height = 100)
    {
        if (string.IsNullOrWhiteSpace(content))
            return BadRequest("Barcode content is required");

        var result = await _barcodeService.GenerateBarcodeAsync(new GenerateBarcodeRequest
        {
            Content = content,
            Format = format,
            Width = width,
            Height = height
        });

        var imageBytes = Convert.FromBase64String(result.ImageBase64);
        return File(imageBytes, "image/png", $"barcode_{content}.png");
    }

    /// <summary>
    /// Generate a product label with barcode
    /// </summary>
    /// <param name="request">Label generation parameters</param>
    /// <returns>Generated label image as base64</returns>
    [HttpPost("labels/product")]
    [ProducesResponseType(typeof(GenerateProductLabelResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<GenerateProductLabelResponse>> GenerateProductLabel([FromBody] GenerateProductLabelRequest request)
    {
        try
        {
            var result = await _barcodeService.GenerateProductLabelAsync(request);
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
    }

    /// <summary>
    /// Generate a product label as downloadable image
    /// </summary>
    /// <param name="productId">Product ID</param>
    /// <param name="size">Label size preset</param>
    /// <param name="format">Barcode format</param>
    /// <returns>PNG image file</returns>
    [HttpGet("labels/product/{productId}")]
    [ProducesResponseType(typeof(FileContentResult), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DownloadProductLabel(
        int productId,
        [FromQuery] LabelSize size = LabelSize.Medium,
        [FromQuery] BarcodeFormat format = BarcodeFormat.Code128)
    {
        try
        {
            var result = await _barcodeService.GenerateProductLabelAsync(new GenerateProductLabelRequest
            {
                ProductId = productId,
                LabelSize = size,
                BarcodeFormat = format,
                IncludeProductName = true,
                IncludePrice = true
            });

            var imageBytes = Convert.FromBase64String(result.LabelImageBase64);
            return File(imageBytes, "image/png", $"label_{result.ProductCode}.png");
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
    }

    /// <summary>
    /// Generate multiple product labels (bulk)
    /// </summary>
    /// <param name="request">Bulk label generation parameters</param>
    /// <returns>ZIP file with all label images</returns>
    [HttpPost("labels/bulk")]
    [ProducesResponseType(typeof(BulkLabelGenerationResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<BulkLabelGenerationResponse>> GenerateBulkLabels([FromBody] BulkLabelGenerationRequest request)
    {
        if (request.Products == null || !request.Products.Any())
            return BadRequest("At least one product is required");

        var result = await _barcodeService.GenerateBulkLabelsAsync(request);
        return Ok(result);
    }

    /// <summary>
    /// Download bulk labels as ZIP file
    /// </summary>
    /// <param name="request">Bulk label generation parameters</param>
    /// <returns>ZIP file</returns>
    [HttpPost("labels/bulk/download")]
    [ProducesResponseType(typeof(FileContentResult), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> DownloadBulkLabels([FromBody] BulkLabelGenerationRequest request)
    {
        if (request.Products == null || !request.Products.Any())
            return BadRequest("At least one product is required");

        var result = await _barcodeService.GenerateBulkLabelsAsync(request);
        var fileBytes = Convert.FromBase64String(result.FileBase64);
        return File(fileBytes, result.ContentType, result.FileName);
    }

    /// <summary>
    /// Lookup product/variant/serial by barcode (scan)
    /// </summary>
    /// <param name="barcode">Scanned barcode</param>
    /// <param name="includeStock">Include stock information</param>
    /// <param name="warehouseId">Filter stock by warehouse</param>
    /// <returns>Lookup result with product/variant/serial information</returns>
    [HttpGet("lookup/{barcode}")]
    [ProducesResponseType(typeof(BarcodeLookupResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<BarcodeLookupResponse>> LookupBarcode(
        string barcode,
        [FromQuery] bool includeStock = true,
        [FromQuery] int? warehouseId = null)
    {
        var result = await _barcodeService.LookupBarcodeAsync(new BarcodeLookupRequest
        {
            Barcode = barcode,
            IncludeStock = includeStock,
            WarehouseId = warehouseId
        });

        return Ok(result);
    }

    /// <summary>
    /// Lookup product/variant/serial by barcode (POST for complex barcodes)
    /// </summary>
    /// <param name="request">Lookup request</param>
    /// <returns>Lookup result with product/variant/serial information</returns>
    [HttpPost("lookup")]
    [ProducesResponseType(typeof(BarcodeLookupResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<BarcodeLookupResponse>> LookupBarcodePost([FromBody] BarcodeLookupRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Barcode))
            return BadRequest("Barcode is required");

        var result = await _barcodeService.LookupBarcodeAsync(request);
        return Ok(result);
    }

    /// <summary>
    /// Auto-generate a unique barcode for a product
    /// </summary>
    /// <param name="request">Auto-generation parameters</param>
    /// <returns>Generated barcode</returns>
    [HttpPost("auto-generate")]
    [ProducesResponseType(typeof(AutoGenerateBarcodeResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<AutoGenerateBarcodeResponse>> AutoGenerateBarcode([FromBody] AutoGenerateBarcodeRequest request)
    {
        try
        {
            var result = await _barcodeService.AutoGenerateBarcodeAsync(request);
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
    }

    /// <summary>
    /// Validate barcode format and checksum
    /// </summary>
    /// <param name="barcode">Barcode to validate</param>
    /// <param name="format">Expected format</param>
    /// <returns>Validation result</returns>
    [HttpGet("validate")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    public async Task<ActionResult> ValidateBarcode(
        [FromQuery] string barcode,
        [FromQuery] BarcodeFormat format = BarcodeFormat.Code128)
    {
        var (isValid, errorMessage) = await _barcodeService.ValidateBarcodeAsync(barcode, format);
        return Ok(new { isValid, errorMessage });
    }

    /// <summary>
    /// Check if barcode is unique
    /// </summary>
    /// <param name="barcode">Barcode to check</param>
    /// <param name="excludeProductId">Product ID to exclude from check</param>
    /// <returns>Uniqueness check result</returns>
    [HttpGet("check-unique")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    public async Task<ActionResult> CheckBarcodeUnique(
        [FromQuery] string barcode,
        [FromQuery] int? excludeProductId = null)
    {
        var (isUnique, conflictingProductCode) = await _barcodeService.CheckBarcodeUniqueAsync(barcode, excludeProductId);
        return Ok(new { isUnique, conflictingProductCode });
    }

    /// <summary>
    /// Get supported barcode formats
    /// </summary>
    /// <returns>List of supported formats</returns>
    [HttpGet("formats")]
    [ProducesResponseType(typeof(IEnumerable<object>), StatusCodes.Status200OK)]
    public ActionResult GetSupportedFormats()
    {
        var formats = Enum.GetValues<BarcodeFormat>()
            .Select(f => new
            {
                value = f.ToString(),
                label = GetFormatLabel(f),
                description = GetFormatDescription(f),
                isLinear = IsLinearBarcode(f)
            });

        return Ok(formats);
    }

    /// <summary>
    /// Get label size presets
    /// </summary>
    /// <returns>List of label size presets</returns>
    [HttpGet("label-sizes")]
    [ProducesResponseType(typeof(IEnumerable<object>), StatusCodes.Status200OK)]
    public ActionResult GetLabelSizes()
    {
        var sizes = new[]
        {
            new { value = "Small", label = "Küçük (30x20mm)", width = 120, height = 80 },
            new { value = "Medium", label = "Orta (50x30mm)", width = 200, height = 120 },
            new { value = "Large", label = "Büyük (70x40mm)", width = 280, height = 160 },
            new { value = "Wide", label = "Geniş (100x30mm)", width = 400, height = 120 },
            new { value = "Square", label = "Kare (50x50mm)", width = 200, height = 200 },
            new { value = "Custom", label = "Özel", width = 0, height = 0 }
        };

        return Ok(sizes);
    }

    #region Private Methods

    private static string GetFormatLabel(BarcodeFormat format)
    {
        return format switch
        {
            BarcodeFormat.EAN13 => "EAN-13",
            BarcodeFormat.EAN8 => "EAN-8",
            BarcodeFormat.UPC_A => "UPC-A",
            BarcodeFormat.UPC_E => "UPC-E",
            BarcodeFormat.Code128 => "Code 128",
            BarcodeFormat.Code39 => "Code 39",
            BarcodeFormat.QRCode => "QR Code",
            BarcodeFormat.DataMatrix => "Data Matrix",
            BarcodeFormat.PDF417 => "PDF417",
            BarcodeFormat.ITF14 => "ITF-14",
            _ => format.ToString()
        };
    }

    private static string GetFormatDescription(BarcodeFormat format)
    {
        return format switch
        {
            BarcodeFormat.EAN13 => "Uluslararası ürün barkodu (13 hane)",
            BarcodeFormat.EAN8 => "Küçük ürünler için barkod (8 hane)",
            BarcodeFormat.UPC_A => "ABD ürün barkodu (12 hane)",
            BarcodeFormat.UPC_E => "Kompakt ABD barkodu (6 hane)",
            BarcodeFormat.Code128 => "Yüksek yoğunluklu alfanümerik barkod",
            BarcodeFormat.Code39 => "Yaygın endüstriyel barkod",
            BarcodeFormat.QRCode => "2D matris kodu, URL ve metin için ideal",
            BarcodeFormat.DataMatrix => "Küçük 2D matris kodu",
            BarcodeFormat.PDF417 => "Yüksek kapasiteli 2D barkod",
            BarcodeFormat.ITF14 => "Lojistik ve paletler için barkod",
            _ => ""
        };
    }

    private static bool IsLinearBarcode(BarcodeFormat format)
    {
        return format switch
        {
            BarcodeFormat.QRCode => false,
            BarcodeFormat.DataMatrix => false,
            BarcodeFormat.PDF417 => false,
            _ => true
        };
    }

    #endregion
}
