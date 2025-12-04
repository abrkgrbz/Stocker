using Microsoft.Extensions.Logging;
using SkiaSharp;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Application.Services;
using Stocker.Modules.Inventory.Domain.Repositories;
using ZXing;
using ZXing.Common;
using ZXing.SkiaSharp;
using ZXing.SkiaSharp.Rendering;
using AppBarcodeFormat = Stocker.Modules.Inventory.Application.DTOs.BarcodeFormat;

namespace Stocker.Modules.Inventory.Infrastructure.Services;

/// <summary>
/// Service for barcode generation and lookup operations
/// </summary>
public class BarcodeService : IBarcodeService
{
    private readonly IProductRepository _productRepository;
    private readonly IProductVariantRepository _variantRepository;
    private readonly ISerialNumberRepository _serialNumberRepository;
    private readonly ILotBatchRepository _lotBatchRepository;
    private readonly IStockRepository _stockRepository;
    private readonly IWarehouseRepository _warehouseRepository;
    private readonly ILogger<BarcodeService> _logger;

    public BarcodeService(
        IProductRepository productRepository,
        IProductVariantRepository variantRepository,
        ISerialNumberRepository serialNumberRepository,
        ILotBatchRepository lotBatchRepository,
        IStockRepository stockRepository,
        IWarehouseRepository warehouseRepository,
        ILogger<BarcodeService> logger)
    {
        _productRepository = productRepository;
        _variantRepository = variantRepository;
        _serialNumberRepository = serialNumberRepository;
        _lotBatchRepository = lotBatchRepository;
        _stockRepository = stockRepository;
        _warehouseRepository = warehouseRepository;
        _logger = logger;
    }

    public async Task<GenerateBarcodeResponse> GenerateBarcodeAsync(GenerateBarcodeRequest request, CancellationToken cancellationToken = default)
    {
        try
        {
            var zxingFormat = MapToZXingFormat(request.Format);
            var writer = new BarcodeWriter<SKBitmap>
            {
                Format = zxingFormat,
                Options = new EncodingOptions
                {
                    Width = request.Width,
                    Height = request.Height,
                    Margin = 2,
                    PureBarcode = !request.IncludeText
                },
                Renderer = new SKBitmapRenderer()
            };

            using var bitmap = writer.Write(request.Content);
            using var image = SKImage.FromBitmap(bitmap);
            using var data = image.Encode(SKEncodedImageFormat.Png, 100);

            var base64 = Convert.ToBase64String(data.ToArray());

            return await Task.FromResult(new GenerateBarcodeResponse
            {
                Content = request.Content,
                Format = request.Format,
                ImageBase64 = base64,
                ImageUrl = $"data:image/png;base64,{base64}",
                ContentType = "image/png",
                Width = bitmap.Width,
                Height = bitmap.Height
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating barcode for content: {Content}", request.Content);
            throw new InvalidOperationException($"Failed to generate barcode: {ex.Message}", ex);
        }
    }

    public async Task<GenerateProductLabelResponse> GenerateProductLabelAsync(GenerateProductLabelRequest request, CancellationToken cancellationToken = default)
    {
        var product = await _productRepository.GetByIdAsync(request.ProductId, cancellationToken);
        if (product == null)
            throw new KeyNotFoundException($"Product with ID {request.ProductId} not found");

        var (width, height) = GetLabelDimensions(request.LabelSize, request.CustomWidth, request.CustomHeight);

        // Create label bitmap
        using var surface = SKSurface.Create(new SKImageInfo(width, height));
        var canvas = surface.Canvas;
        canvas.Clear(SKColors.White);

        var currentY = 10;
        var padding = 10;
        var usableWidth = width - (padding * 2);

        // Draw product name
        if (request.IncludeProductName)
        {
            using var nameFont = new SKFont(SKTypeface.Default, 14);
            using var namePaint = new SKPaint { Color = SKColors.Black, IsAntialias = true };

            var productName = product.Name.Length > 30 ? product.Name.Substring(0, 30) + "..." : product.Name;
            canvas.DrawText(productName, padding, currentY + 14, nameFont, namePaint);
            currentY += 24;
        }

        // Draw barcode
        var barcodeContent = product.Barcode ?? product.Code;
        if (!string.IsNullOrEmpty(barcodeContent))
        {
            var barcodeHeight = request.IncludeQRCode ? 60 : 50;
            var barcodeResponse = await GenerateBarcodeAsync(new GenerateBarcodeRequest
            {
                Content = barcodeContent,
                Format = request.BarcodeFormat,
                Width = usableWidth - 20,
                Height = barcodeHeight,
                IncludeText = true
            }, cancellationToken);

            var barcodeBytes = Convert.FromBase64String(barcodeResponse.ImageBase64);
            using var barcodeStream = new MemoryStream(barcodeBytes);
            using var barcodeBitmap = SKBitmap.Decode(barcodeStream);

            if (barcodeBitmap != null)
            {
                var barcodeRect = new SKRect(padding + 10, currentY, width - padding - 10, currentY + barcodeHeight);
                canvas.DrawBitmap(barcodeBitmap, barcodeRect);
                currentY += barcodeHeight + 5;
            }
        }

        // Draw QR code if requested
        if (request.IncludeQRCode)
        {
            var qrContent = $"PROD:{product.Code}";
            var qrResponse = await GenerateBarcodeAsync(new GenerateBarcodeRequest
            {
                Content = qrContent,
                Format = AppBarcodeFormat.QRCode,
                Width = 60,
                Height = 60,
                IncludeText = false
            }, cancellationToken);

            var qrBytes = Convert.FromBase64String(qrResponse.ImageBase64);
            using var qrStream = new MemoryStream(qrBytes);
            using var qrBitmap = SKBitmap.Decode(qrStream);

            if (qrBitmap != null)
            {
                var qrRect = new SKRect(width - 70, currentY - 60, width - 10, currentY);
                canvas.DrawBitmap(qrBitmap, qrRect);
            }
        }

        // Draw price
        if (request.IncludePrice && product.UnitPrice != null)
        {
            using var priceFont = new SKFont(SKTypeface.FromFamilyName("Arial", SKFontStyle.Bold), 16);
            using var pricePaint = new SKPaint { Color = SKColors.Black, IsAntialias = true };

            var priceText = $"{product.UnitPrice.Amount:N2} {product.UnitPrice.Currency}";
            canvas.DrawText(priceText, padding, currentY + 16, priceFont, pricePaint);
            currentY += 20;
        }

        // Draw SKU
        if (request.IncludeSKU && !string.IsNullOrEmpty(product.SKU))
        {
            using var skuFont = new SKFont(SKTypeface.Default, 10);
            using var skuPaint = new SKPaint { Color = SKColors.Gray, IsAntialias = true };

            canvas.DrawText($"SKU: {product.SKU}", padding, currentY + 10, skuFont, skuPaint);
        }

        // Draw border
        using var borderPaint = new SKPaint
        {
            Color = SKColors.LightGray,
            Style = SKPaintStyle.Stroke,
            StrokeWidth = 1
        };
        canvas.DrawRect(0, 0, width - 1, height - 1, borderPaint);

        // Export to PNG
        using var image = surface.Snapshot();
        using var data = image.Encode(SKEncodedImageFormat.Png, 100);
        var base64 = Convert.ToBase64String(data.ToArray());

        return new GenerateProductLabelResponse
        {
            ProductId = product.Id,
            ProductCode = product.Code,
            ProductName = product.Name,
            Barcode = product.Barcode,
            Price = product.UnitPrice?.Amount,
            PriceCurrency = product.UnitPrice?.Currency,
            LabelImageBase64 = base64,
            LabelImageUrl = $"data:image/png;base64,{base64}",
            ContentType = "image/png",
            LabelSize = request.LabelSize,
            Width = width,
            Height = height
        };
    }

    public async Task<BulkLabelGenerationResponse> GenerateBulkLabelsAsync(BulkLabelGenerationRequest request, CancellationToken cancellationToken = default)
    {
        var labels = new List<byte[]>();
        var totalLabels = 0;

        foreach (var item in request.Products)
        {
            for (var i = 0; i < item.Quantity; i++)
            {
                var labelResponse = await GenerateProductLabelAsync(new GenerateProductLabelRequest
                {
                    ProductId = item.ProductId,
                    LabelSize = request.LabelSize,
                    BarcodeFormat = request.BarcodeFormat,
                    IncludeProductName = request.IncludeProductName,
                    IncludePrice = request.IncludePrice
                }, cancellationToken);

                labels.Add(Convert.FromBase64String(labelResponse.LabelImageBase64));
                totalLabels++;
            }
        }

        // Return as ZIP with individual PNG files
        using var memoryStream = new MemoryStream();
        using (var archive = new System.IO.Compression.ZipArchive(memoryStream, System.IO.Compression.ZipArchiveMode.Create, true))
        {
            for (var i = 0; i < labels.Count; i++)
            {
                var entry = archive.CreateEntry($"label_{i + 1:D4}.png");
                using var entryStream = entry.Open();
                await entryStream.WriteAsync(labels[i], cancellationToken);
            }
        }

        memoryStream.Position = 0;
        var zipBytes = memoryStream.ToArray();
        var base64 = Convert.ToBase64String(zipBytes);

        return new BulkLabelGenerationResponse
        {
            TotalLabels = totalLabels,
            TotalProducts = request.Products.Count,
            FileBase64 = base64,
            FileUrl = $"data:application/zip;base64,{base64}",
            ContentType = "application/zip",
            FileName = $"labels_{DateTime.UtcNow:yyyyMMdd_HHmmss}.zip"
        };
    }

    public async Task<BarcodeLookupResponse> LookupBarcodeAsync(BarcodeLookupRequest request, CancellationToken cancellationToken = default)
    {
        var response = new BarcodeLookupResponse
        {
            SearchedBarcode = request.Barcode,
            Found = false
        };

        // 1. Search in products by barcode
        var product = await _productRepository.GetByBarcodeAsync(request.Barcode, cancellationToken);
        if (product != null)
        {
            response.Found = true;
            response.MatchType = "Product";
            response.Product = new ProductLookupResult
            {
                Id = product.Id,
                Code = product.Code,
                Name = product.Name,
                Barcode = product.Barcode,
                SKU = product.SKU,
                CategoryName = product.Category?.Name,
                UnitPrice = product.UnitPrice?.Amount,
                UnitPriceCurrency = product.UnitPrice?.Currency,
                UnitName = product.UnitEntity?.Name,
                PrimaryImageUrl = product.PrimaryImageUrl,
                TotalStockQuantity = product.Stocks?.Sum(s => s.Quantity) ?? 0,
                AvailableStockQuantity = product.Stocks?.Sum(s => s.AvailableQuantity) ?? 0
            };

            // Get stock by warehouse if requested
            if (request.IncludeStock)
            {
                var stocks = product.Stocks ?? new List<Domain.Entities.Stock>();
                if (request.WarehouseId.HasValue)
                    stocks = stocks.Where(s => s.WarehouseId == request.WarehouseId.Value).ToList();

                response.Product.StockByWarehouse = stocks.Select(s => new WarehouseStockInfo
                {
                    WarehouseId = s.WarehouseId,
                    WarehouseName = s.Warehouse?.Name ?? "",
                    Quantity = s.Quantity,
                    AvailableQuantity = s.AvailableQuantity,
                    ReservedQuantity = s.ReservedQuantity
                }).ToList();
            }

            return response;
        }

        // 2. Search in products by code (as fallback)
        product = await _productRepository.GetByCodeAsync(request.Barcode, cancellationToken);
        if (product != null)
        {
            response.Found = true;
            response.MatchType = "Product";
            response.Product = new ProductLookupResult
            {
                Id = product.Id,
                Code = product.Code,
                Name = product.Name,
                Barcode = product.Barcode,
                SKU = product.SKU,
                CategoryName = product.Category?.Name,
                UnitPrice = product.UnitPrice?.Amount,
                UnitPriceCurrency = product.UnitPrice?.Currency,
                UnitName = product.UnitEntity?.Name,
                PrimaryImageUrl = product.PrimaryImageUrl,
                TotalStockQuantity = product.Stocks?.Sum(s => s.Quantity) ?? 0,
                AvailableStockQuantity = product.Stocks?.Sum(s => s.AvailableQuantity) ?? 0
            };
            return response;
        }

        // 3. Search in product variants by barcode
        var variant = await _variantRepository.GetByBarcodeAsync(request.Barcode, cancellationToken);
        if (variant != null)
        {
            response.Found = true;
            response.MatchType = "ProductVariant";
            response.Variant = new ProductVariantLookupResult
            {
                Id = variant.Id,
                ProductId = variant.ProductId,
                ProductName = variant.Product?.Name ?? "",
                VariantCode = variant.Sku,
                Barcode = variant.Barcode,
                SKU = variant.Sku,
                VariantName = variant.VariantName,
                UnitPrice = variant.Price?.Amount,
                TotalStockQuantity = variant.Stocks?.Sum(s => s.Quantity) ?? 0
            };
            return response;
        }

        // 4. Search in serial numbers
        var serialNumber = await _serialNumberRepository.GetBySerialAsync(request.Barcode, cancellationToken);
        if (serialNumber != null)
        {
            response.Found = true;
            response.MatchType = "SerialNumber";
            response.SerialNumber = new SerialNumberLookupResult
            {
                Id = serialNumber.Id,
                SerialNumber = serialNumber.Serial,
                ProductId = serialNumber.ProductId,
                ProductName = serialNumber.Product?.Name ?? "",
                Status = serialNumber.Status.ToString(),
                WarehouseId = serialNumber.WarehouseId,
                WarehouseName = serialNumber.Warehouse?.Name,
                ReceivedDate = serialNumber.ReceivedDate,
                SoldDate = serialNumber.SoldDate
            };
            return response;
        }

        // 5. Search in lot batches
        var lotBatch = await _lotBatchRepository.GetByLotNumberAsync(request.Barcode, cancellationToken);
        if (lotBatch != null)
        {
            response.Found = true;
            response.MatchType = "LotBatch";
            response.LotBatch = new LotBatchLookupResult
            {
                Id = lotBatch.Id,
                LotNumber = lotBatch.LotNumber,
                ProductId = lotBatch.ProductId,
                ProductName = lotBatch.Product?.Name ?? "",
                Status = lotBatch.Status.ToString(),
                Quantity = lotBatch.CurrentQuantity,
                AvailableQuantity = lotBatch.AvailableQuantity,
                ManufactureDate = lotBatch.ManufacturedDate,
                ExpiryDate = lotBatch.ExpiryDate,
                DaysUntilExpiry = lotBatch.ExpiryDate.HasValue
                    ? (int)(lotBatch.ExpiryDate.Value - DateTime.UtcNow).TotalDays
                    : null
            };
            return response;
        }

        return response;
    }

    public async Task<AutoGenerateBarcodeResponse> AutoGenerateBarcodeAsync(AutoGenerateBarcodeRequest request, CancellationToken cancellationToken = default)
    {
        var product = await _productRepository.GetByIdAsync(request.ProductId, cancellationToken);
        if (product == null)
            throw new KeyNotFoundException($"Product with ID {request.ProductId} not found");

        string barcode;

        switch (request.Format)
        {
            case AppBarcodeFormat.EAN13:
                barcode = GenerateEAN13(product.Id);
                break;
            case AppBarcodeFormat.EAN8:
                barcode = GenerateEAN8(product.Id);
                break;
            case AppBarcodeFormat.Code128:
            case AppBarcodeFormat.Code39:
            default:
                barcode = $"P{product.Id:D10}";
                break;
        }

        // Check uniqueness
        var (isUnique, conflicting) = await CheckBarcodeUniqueAsync(barcode, product.Id, cancellationToken);
        if (!isUnique)
        {
            // Generate alternative
            barcode = $"{barcode}_{DateTime.UtcNow.Ticks % 10000}";
        }

        // Update product if requested
        if (request.UpdateProduct)
        {
            product.SetBarcode(barcode);
            await _productRepository.UpdateAsync(product, cancellationToken);
        }

        return new AutoGenerateBarcodeResponse
        {
            ProductId = product.Id,
            GeneratedBarcode = barcode,
            Format = request.Format,
            ProductUpdated = request.UpdateProduct,
            ValidationMessage = isUnique ? null : $"Original barcode conflicted with product '{conflicting}', alternative generated"
        };
    }

    public Task<(bool IsValid, string? ErrorMessage)> ValidateBarcodeAsync(string barcode, AppBarcodeFormat format, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(barcode))
            return Task.FromResult((false, (string?)"Barcode cannot be empty"));

        switch (format)
        {
            case AppBarcodeFormat.EAN13:
                if (barcode.Length != 13 || !barcode.All(char.IsDigit))
                    return Task.FromResult((false, (string?)"EAN-13 must be exactly 13 digits"));
                if (!ValidateEAN13Checksum(barcode))
                    return Task.FromResult((false, (string?)"Invalid EAN-13 checksum"));
                break;

            case AppBarcodeFormat.EAN8:
                if (barcode.Length != 8 || !barcode.All(char.IsDigit))
                    return Task.FromResult((false, (string?)"EAN-8 must be exactly 8 digits"));
                break;

            case AppBarcodeFormat.UPC_A:
                if (barcode.Length != 12 || !barcode.All(char.IsDigit))
                    return Task.FromResult((false, (string?)"UPC-A must be exactly 12 digits"));
                break;

            case AppBarcodeFormat.Code128:
                // Code128 can encode most ASCII characters
                if (barcode.Length > 80)
                    return Task.FromResult((false, (string?)"Code128 barcode too long (max 80 characters)"));
                break;

            case AppBarcodeFormat.QRCode:
                if (barcode.Length > 4296)
                    return Task.FromResult((false, (string?)"QR Code content too long (max 4296 characters)"));
                break;
        }

        return Task.FromResult<(bool, string?)>((true, null));
    }

    public async Task<(bool IsUnique, string? ConflictingProductCode)> CheckBarcodeUniqueAsync(string barcode, int? excludeProductId = null, CancellationToken cancellationToken = default)
    {
        var existingProduct = await _productRepository.GetByBarcodeAsync(barcode, cancellationToken);

        if (existingProduct != null && existingProduct.Id != excludeProductId)
        {
            return (false, existingProduct.Code);
        }

        return (true, null);
    }

    #region Private Helper Methods

    private static ZXing.BarcodeFormat MapToZXingFormat(AppBarcodeFormat format)
    {
        return format switch
        {
            AppBarcodeFormat.EAN13 => ZXing.BarcodeFormat.EAN_13,
            AppBarcodeFormat.EAN8 => ZXing.BarcodeFormat.EAN_8,
            AppBarcodeFormat.UPC_A => ZXing.BarcodeFormat.UPC_A,
            AppBarcodeFormat.UPC_E => ZXing.BarcodeFormat.UPC_E,
            AppBarcodeFormat.Code128 => ZXing.BarcodeFormat.CODE_128,
            AppBarcodeFormat.Code39 => ZXing.BarcodeFormat.CODE_39,
            AppBarcodeFormat.QRCode => ZXing.BarcodeFormat.QR_CODE,
            AppBarcodeFormat.DataMatrix => ZXing.BarcodeFormat.DATA_MATRIX,
            AppBarcodeFormat.PDF417 => ZXing.BarcodeFormat.PDF_417,
            AppBarcodeFormat.ITF14 => ZXing.BarcodeFormat.ITF,
            _ => ZXing.BarcodeFormat.CODE_128
        };
    }

    private static (int Width, int Height) GetLabelDimensions(LabelSize size, int? customWidth, int? customHeight)
    {
        return size switch
        {
            LabelSize.Small => (120, 80),    // ~30x20mm at 96dpi
            LabelSize.Medium => (200, 120),  // ~50x30mm
            LabelSize.Large => (280, 160),   // ~70x40mm
            LabelSize.Wide => (400, 120),    // ~100x30mm
            LabelSize.Square => (200, 200),  // ~50x50mm for QR
            LabelSize.Custom => (customWidth ?? 200, customHeight ?? 120),
            _ => (200, 120)
        };
    }

    private static string GenerateEAN13(int productId)
    {
        // Format: 200 (internal use prefix) + 9 digit product ID + check digit
        var baseCode = $"200{productId:D9}";
        var checkDigit = CalculateEAN13CheckDigit(baseCode);
        return baseCode + checkDigit;
    }

    private static string GenerateEAN8(int productId)
    {
        // Format: 7 digits + check digit
        var baseCode = $"{productId:D7}";
        var checkDigit = CalculateEAN8CheckDigit(baseCode);
        return baseCode + checkDigit;
    }

    private static int CalculateEAN13CheckDigit(string code)
    {
        var sum = 0;
        for (var i = 0; i < 12; i++)
        {
            var digit = int.Parse(code[i].ToString());
            sum += (i % 2 == 0) ? digit : digit * 3;
        }
        return (10 - (sum % 10)) % 10;
    }

    private static int CalculateEAN8CheckDigit(string code)
    {
        var sum = 0;
        for (var i = 0; i < 7; i++)
        {
            var digit = int.Parse(code[i].ToString());
            sum += (i % 2 == 0) ? digit * 3 : digit;
        }
        return (10 - (sum % 10)) % 10;
    }

    private static bool ValidateEAN13Checksum(string barcode)
    {
        var sum = 0;
        for (var i = 0; i < 12; i++)
        {
            var digit = int.Parse(barcode[i].ToString());
            sum += (i % 2 == 0) ? digit : digit * 3;
        }
        var checkDigit = (10 - (sum % 10)) % 10;
        return checkDigit == int.Parse(barcode[12].ToString());
    }

    #endregion
}
