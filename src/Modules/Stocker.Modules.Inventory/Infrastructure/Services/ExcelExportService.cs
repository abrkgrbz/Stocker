using ClosedXML.Excel;
using Microsoft.Extensions.Logging;
using Stocker.Modules.Inventory.Application.Services;
using Stocker.Modules.Inventory.Domain.Enums;
using Stocker.Modules.Inventory.Interfaces;
using Stocker.Domain.Common.ValueObjects;

namespace Stocker.Modules.Inventory.Infrastructure.Services;

/// <summary>
/// Service for Excel export/import operations using ClosedXML
/// </summary>
public class ExcelExportService : IExcelExportService
{
    private readonly IInventoryUnitOfWork _unitOfWork;
    private readonly ILogger<ExcelExportService> _logger;

    // Column definitions for product export/import
    private static readonly string[] ProductColumns = new[]
    {
        "Ürün Kodu", "Ürün Adı", "Açıklama", "Barkod", "SKU",
        "Kategori", "Marka", "Birim", "Ürün Tipi",
        "Satış Fiyatı", "Para Birimi", "Maliyet Fiyatı",
        "Min Stok", "Max Stok", "Yeniden Sipariş Seviyesi", "Yeniden Sipariş Miktarı",
        "Tedarik Süresi (Gün)", "Seri No Takibi", "Lot No Takibi", "Aktif"
    };

    // Column definitions for stock export
    private static readonly string[] StockColumns = new[]
    {
        "Ürün Kodu", "Ürün Adı", "Depo", "Lokasyon",
        "Miktar", "Rezerve", "Kullanılabilir",
        "Seri No", "Lot No", "Son Kullanma Tarihi"
    };

    // Column definitions for stock adjustment import
    private static readonly string[] StockAdjustmentColumns = new[]
    {
        "Ürün Kodu", "Depo Kodu", "Yeni Miktar", "Sebep", "Notlar"
    };

    public ExcelExportService(
        IInventoryUnitOfWork unitOfWork,
        ILogger<ExcelExportService> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<ExcelExportResult> ExportProductsAsync(IEnumerable<int>? productIds = null, CancellationToken cancellationToken = default)
    {
        try
        {
            _logger.LogInformation("Starting product export");

            // Always get all active products (simplified approach)
            var products = await _unitOfWork.Products.GetActiveProductsAsync(cancellationToken);

            // Filter by IDs if provided
            var productList = products.ToList();
            if (productIds != null)
            {
                var idSet = productIds.ToHashSet();
                productList = productList.Where(p => idSet.Contains(p.Id)).ToList();
            }

            using var workbook = new XLWorkbook();
            var worksheet = workbook.Worksheets.Add("Ürünler");

            // Add headers with styling
            for (int i = 0; i < ProductColumns.Length; i++)
            {
                var cell = worksheet.Cell(1, i + 1);
                cell.Value = ProductColumns[i];
                cell.Style.Font.Bold = true;
                cell.Style.Fill.BackgroundColor = XLColor.LightBlue;
                cell.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;
            }

            // Add data rows
            int row = 2;
            foreach (var product in productList)
            {
                worksheet.Cell(row, 1).Value = product.Code;
                worksheet.Cell(row, 2).Value = product.Name;
                worksheet.Cell(row, 3).Value = product.Description ?? "";
                worksheet.Cell(row, 4).Value = product.Barcode ?? "";
                worksheet.Cell(row, 5).Value = product.SKU ?? "";
                worksheet.Cell(row, 6).Value = product.Category?.Name ?? "";
                worksheet.Cell(row, 7).Value = product.Brand?.Name ?? "";
                worksheet.Cell(row, 8).Value = product.Unit ?? "";
                worksheet.Cell(row, 9).Value = GetProductTypeDisplayName(product.ProductType);
                worksheet.Cell(row, 10).Value = product.UnitPrice?.Amount ?? 0;
                worksheet.Cell(row, 11).Value = product.UnitPrice?.Currency ?? "TRY";
                worksheet.Cell(row, 12).Value = product.CostPrice?.Amount ?? 0;
                worksheet.Cell(row, 13).Value = product.MinimumStock;
                worksheet.Cell(row, 14).Value = product.MaximumStock;
                worksheet.Cell(row, 15).Value = product.ReorderPoint;
                worksheet.Cell(row, 16).Value = product.ReorderQuantity;
                worksheet.Cell(row, 17).Value = product.LeadTimeDays;
                worksheet.Cell(row, 18).Value = product.IsSerialTracked ? "Evet" : "Hayır";
                worksheet.Cell(row, 19).Value = product.IsLotTracked ? "Evet" : "Hayır";
                worksheet.Cell(row, 20).Value = product.IsActive ? "Aktif" : "Pasif";
                row++;
            }

            // Auto-fit columns
            worksheet.Columns().AdjustToContents();

            // Add filter to header row
            worksheet.RangeUsed()?.SetAutoFilter();

            using var stream = new MemoryStream();
            workbook.SaveAs(stream);

            var fileName = $"Urunler_{DateTime.Now:yyyyMMdd_HHmmss}.xlsx";
            _logger.LogInformation("Product export completed. {Count} products exported", productList.Count);

            return new ExcelExportResult
            {
                FileContent = stream.ToArray(),
                FileName = fileName,
                RecordCount = productList.Count
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error exporting products to Excel");
            throw;
        }
    }

    public async Task<ExcelExportResult> ExportStockAsync(int? warehouseId = null, bool includeZeroStock = false, CancellationToken cancellationToken = default)
    {
        try
        {
            _logger.LogInformation("Starting stock export. WarehouseId: {WarehouseId}, IncludeZeroStock: {IncludeZeroStock}",
                warehouseId, includeZeroStock);

            IEnumerable<Domain.Entities.Stock> stocks;

            if (warehouseId.HasValue)
            {
                stocks = await _unitOfWork.Stocks.GetByWarehouseAsync(warehouseId.Value, cancellationToken);
            }
            else
            {
                // Get all products and their stocks
                var products = await _unitOfWork.Products.GetActiveProductsAsync(cancellationToken);
                var allStocks = new List<Domain.Entities.Stock>();
                foreach (var product in products)
                {
                    var productStocks = await _unitOfWork.Stocks.GetByProductAsync(product.Id, cancellationToken);
                    allStocks.AddRange(productStocks);
                }
                stocks = allStocks;
            }

            if (!includeZeroStock)
            {
                stocks = stocks.Where(s => s.Quantity > 0);
            }

            using var workbook = new XLWorkbook();
            var worksheet = workbook.Worksheets.Add("Stok");

            // Add headers with styling
            for (int i = 0; i < StockColumns.Length; i++)
            {
                var cell = worksheet.Cell(1, i + 1);
                cell.Value = StockColumns[i];
                cell.Style.Font.Bold = true;
                cell.Style.Fill.BackgroundColor = XLColor.LightGreen;
                cell.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;
            }

            // Add data rows
            int row = 2;
            foreach (var stock in stocks)
            {
                worksheet.Cell(row, 1).Value = stock.Product?.Code ?? "";
                worksheet.Cell(row, 2).Value = stock.Product?.Name ?? "";
                worksheet.Cell(row, 3).Value = stock.Warehouse?.Name ?? "";
                worksheet.Cell(row, 4).Value = stock.Location?.Name ?? "";
                worksheet.Cell(row, 5).Value = stock.Quantity;
                worksheet.Cell(row, 6).Value = stock.ReservedQuantity;
                worksheet.Cell(row, 7).Value = stock.AvailableQuantity;
                worksheet.Cell(row, 8).Value = stock.SerialNumber ?? "";
                worksheet.Cell(row, 9).Value = stock.LotNumber ?? "";
                worksheet.Cell(row, 10).Value = stock.ExpiryDate?.ToString("yyyy-MM-dd") ?? "";
                row++;
            }

            // Auto-fit columns
            worksheet.Columns().AdjustToContents();

            // Add filter to header row
            worksheet.RangeUsed()?.SetAutoFilter();

            using var stream = new MemoryStream();
            workbook.SaveAs(stream);

            var fileName = $"Stok_{DateTime.Now:yyyyMMdd_HHmmss}.xlsx";
            var stockList = stocks.ToList();
            _logger.LogInformation("Stock export completed. {Count} records exported", stockList.Count);

            return new ExcelExportResult
            {
                FileContent = stream.ToArray(),
                FileName = fileName,
                RecordCount = stockList.Count
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error exporting stock to Excel");
            throw;
        }
    }

    public async Task<ExcelExportResult> ExportStockSummaryAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            _logger.LogInformation("Starting stock summary export");

            var products = await _unitOfWork.Products.GetActiveProductsAsync(cancellationToken);

            using var workbook = new XLWorkbook();
            var worksheet = workbook.Worksheets.Add("Stok Özeti");

            // Headers
            string[] summaryColumns = { "Ürün Kodu", "Ürün Adı", "Toplam Miktar", "Rezerve", "Kullanılabilir",
                                        "Min Stok", "Yeniden Sipariş", "Durum" };

            for (int i = 0; i < summaryColumns.Length; i++)
            {
                var cell = worksheet.Cell(1, i + 1);
                cell.Value = summaryColumns[i];
                cell.Style.Font.Bold = true;
                cell.Style.Fill.BackgroundColor = XLColor.LightYellow;
                cell.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;
            }

            int row = 2;
            foreach (var product in products)
            {
                var totalStock = await _unitOfWork.Stocks.GetTotalQuantityByProductAsync(product.Id, cancellationToken);

                // Get stocks and calculate reserved
                var stocks = await _unitOfWork.Stocks.GetByProductAsync(product.Id, cancellationToken);
                var totalReserved = stocks.Sum(s => s.ReservedQuantity);
                var available = totalStock - totalReserved;

                string status = "Normal";
                if (totalStock <= 0)
                    status = "Stok Yok";
                else if (totalStock < product.MinimumStock)
                    status = "Kritik";
                else if (totalStock < product.ReorderPoint)
                    status = "Düşük";

                worksheet.Cell(row, 1).Value = product.Code;
                worksheet.Cell(row, 2).Value = product.Name;
                worksheet.Cell(row, 3).Value = totalStock;
                worksheet.Cell(row, 4).Value = totalReserved;
                worksheet.Cell(row, 5).Value = available;
                worksheet.Cell(row, 6).Value = product.MinimumStock;
                worksheet.Cell(row, 7).Value = product.ReorderPoint;

                var statusCell = worksheet.Cell(row, 8);
                statusCell.Value = status;

                // Color code status
                statusCell.Style.Fill.BackgroundColor = status switch
                {
                    "Stok Yok" => XLColor.Red,
                    "Kritik" => XLColor.Orange,
                    "Düşük" => XLColor.Yellow,
                    _ => XLColor.LightGreen
                };

                row++;
            }

            worksheet.Columns().AdjustToContents();
            worksheet.RangeUsed()?.SetAutoFilter();

            using var stream = new MemoryStream();
            workbook.SaveAs(stream);

            var fileName = $"StokOzeti_{DateTime.Now:yyyyMMdd_HHmmss}.xlsx";
            _logger.LogInformation("Stock summary export completed. {Count} products", products.Count());

            return new ExcelExportResult
            {
                FileContent = stream.ToArray(),
                FileName = fileName,
                RecordCount = products.Count()
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error exporting stock summary to Excel");
            throw;
        }
    }

    public async Task<ExcelImportResult> ImportProductsAsync(Stream fileStream, bool updateExisting = false, CancellationToken cancellationToken = default)
    {
        var result = new ExcelImportResult();

        try
        {
            _logger.LogInformation("Starting product import. UpdateExisting: {UpdateExisting}", updateExisting);

            using var workbook = new XLWorkbook(fileStream);
            var worksheet = workbook.Worksheet(1);
            var rows = worksheet.RangeUsed()?.RowsUsed().Skip(1).ToList() ?? new List<IXLRangeRow>();

            result.TotalRows = rows.Count;

            // Get lookup data
            var categories = await _unitOfWork.Categories.GetAllAsync(cancellationToken);
            var brands = await _unitOfWork.Brands.GetAllAsync(cancellationToken);
            var units = await _unitOfWork.Units.GetAllAsync(cancellationToken);

            var categoryLookup = categories.ToDictionary(c => c.Name.ToLowerInvariant(), c => c.Id);
            var brandLookup = brands.ToDictionary(b => b.Name.ToLowerInvariant(), b => b.Id);
            var unitLookup = units.ToDictionary(u => u.Name.ToLowerInvariant(), u => u);

            foreach (var row in rows)
            {
                var rowNum = row.RowNumber();

                try
                {
                    var code = row.Cell(1).GetString().Trim();
                    if (string.IsNullOrEmpty(code))
                    {
                        result.Errors.Add(new ExcelImportError
                        {
                            RowNumber = rowNum,
                            ColumnName = "Ürün Kodu",
                            ErrorMessage = "Ürün kodu boş olamaz"
                        });
                        result.ErrorCount++;
                        continue;
                    }

                    // Check if product exists
                    var existingProduct = await _unitOfWork.Products.GetByCodeAsync(code, cancellationToken);

                    if (existingProduct != null && !updateExisting)
                    {
                        result.Warnings.Add($"Satır {rowNum}: '{code}' kodlu ürün zaten mevcut, atlandı");
                        result.SkippedCount++;
                        continue;
                    }

                    var name = row.Cell(2).GetString().Trim();
                    if (string.IsNullOrEmpty(name))
                    {
                        result.Errors.Add(new ExcelImportError
                        {
                            RowNumber = rowNum,
                            ColumnName = "Ürün Adı",
                            ErrorMessage = "Ürün adı boş olamaz"
                        });
                        result.ErrorCount++;
                        continue;
                    }

                    var categoryName = row.Cell(6).GetString().Trim().ToLowerInvariant();
                    if (!categoryLookup.TryGetValue(categoryName, out var categoryId) && !string.IsNullOrEmpty(categoryName))
                    {
                        result.Errors.Add(new ExcelImportError
                        {
                            RowNumber = rowNum,
                            ColumnName = "Kategori",
                            ErrorMessage = $"Kategori bulunamadı: {categoryName}",
                            Value = categoryName
                        });
                        result.ErrorCount++;
                        continue;
                    }

                    var unitName = row.Cell(8).GetString().Trim().ToLowerInvariant();
                    if (!unitLookup.TryGetValue(unitName, out var unit))
                    {
                        result.Errors.Add(new ExcelImportError
                        {
                            RowNumber = rowNum,
                            ColumnName = "Birim",
                            ErrorMessage = $"Birim bulunamadı: {unitName}",
                            Value = unitName
                        });
                        result.ErrorCount++;
                        continue;
                    }

                    var brandName = row.Cell(7).GetString().Trim().ToLowerInvariant();
                    int? brandId = null;
                    if (!string.IsNullOrEmpty(brandName) && brandLookup.TryGetValue(brandName, out var bid))
                    {
                        brandId = bid;
                    }

                    var unitPrice = ParseDecimalSafe(row.Cell(10).GetString());
                    var currency = row.Cell(11).GetString().Trim();
                    if (string.IsNullOrEmpty(currency)) currency = "TRY";

                    if (existingProduct != null)
                    {
                        // Update existing product
                        var updatedUnitPrice = Money.Create(unitPrice, currency);
                        var costPriceValue = ParseDecimalSafe(row.Cell(12).GetString());
                        var updatedCostPrice = costPriceValue > 0 ? Money.Create(costPriceValue, currency) : null;
                        var vatRate = ParseDecimalSafe(row.Cell(21).GetString(), 18);

                        existingProduct.UpdateProductInfo(
                            name,
                            row.Cell(3).GetString().Trim(), // Description
                            updatedUnitPrice,
                            updatedCostPrice,
                            vatRate
                        );
                        existingProduct.SetBarcode(row.Cell(4).GetString().Trim());
                        existingProduct.SetCategory(categoryId);
                        existingProduct.SetBrand(brandId);
                        existingProduct.SetStockLevels(
                            ParseDecimalSafe(row.Cell(13).GetString()),
                            ParseDecimalSafe(row.Cell(14).GetString()),
                            ParseDecimalSafe(row.Cell(15).GetString())
                        );
                        existingProduct.SetReorderQuantity(ParseDecimalSafe(row.Cell(16).GetString()));
                        existingProduct.SetLeadTimeDays(ParseIntSafe(row.Cell(17).GetString()));
                        existingProduct.SetTrackingOptions(
                            true, // isStockTracked
                            ParseBoolSafe(row.Cell(18).GetString()),
                            ParseBoolSafe(row.Cell(19).GetString())
                        );
                    }
                    else
                    {
                        // Create new product using proper constructor
                        var money = Money.Create(unitPrice, currency);
                        var product = new Domain.Entities.Product(
                            code,
                            name,
                            categoryId,
                            unit.Name,
                            money,
                            ParseDecimalSafe(row.Cell(21).GetString(), 18), // VAT Rate
                            row.Cell(5).GetString().Trim(), // SKU
                            ParseProductType(row.Cell(9).GetString()),
                            unit.Id,
                            ParseDecimalSafe(row.Cell(16).GetString()),
                            ParseIntSafe(row.Cell(17).GetString())
                        );

                        product.SetBarcode(row.Cell(4).GetString().Trim());
                        product.SetBrand(brandId);
                        product.SetStockLevels(
                            ParseDecimalSafe(row.Cell(13).GetString()),
                            ParseDecimalSafe(row.Cell(14).GetString()),
                            ParseDecimalSafe(row.Cell(15).GetString())
                        );
                        product.SetTrackingOptions(
                            true, // isStockTracked
                            ParseBoolSafe(row.Cell(18).GetString()),
                            ParseBoolSafe(row.Cell(19).GetString())
                        );

                        if (!ParseBoolSafe(row.Cell(20).GetString(), true))
                        {
                            product.Deactivate("Excel Import", "Imported as inactive");
                        }

                        await _unitOfWork.Products.AddAsync(product, cancellationToken);
                    }

                    result.SuccessCount++;
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Error importing row {RowNumber}", rowNum);
                    result.Errors.Add(new ExcelImportError
                    {
                        RowNumber = rowNum,
                        ErrorMessage = ex.Message
                    });
                    result.ErrorCount++;
                }
            }

            await _unitOfWork.SaveChangesAsync(cancellationToken);

            result.Success = result.ErrorCount == 0;
            _logger.LogInformation("Product import completed. Success: {Success}, Errors: {Errors}, Skipped: {Skipped}",
                result.SuccessCount, result.ErrorCount, result.SkippedCount);

            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error importing products from Excel");
            result.Errors.Add(new ExcelImportError
            {
                ErrorMessage = $"Dosya işlenirken hata oluştu: {ex.Message}"
            });
            return result;
        }
    }

    public async Task<ExcelImportResult> ImportStockAdjustmentsAsync(Stream fileStream, CancellationToken cancellationToken = default)
    {
        var result = new ExcelImportResult();

        try
        {
            _logger.LogInformation("Starting stock adjustment import");

            using var workbook = new XLWorkbook(fileStream);
            var worksheet = workbook.Worksheet(1);
            var rows = worksheet.RangeUsed()?.RowsUsed().Skip(1).ToList() ?? new List<IXLRangeRow>();

            result.TotalRows = rows.Count;

            var warehouses = await _unitOfWork.Warehouses.GetAllAsync(cancellationToken);
            var warehouseLookup = warehouses.ToDictionary(w => w.Code.ToLowerInvariant(), w => w.Id);

            foreach (var row in rows)
            {
                var rowNum = row.RowNumber();

                try
                {
                    var productCode = row.Cell(1).GetString().Trim();
                    if (string.IsNullOrEmpty(productCode))
                    {
                        result.Errors.Add(new ExcelImportError
                        {
                            RowNumber = rowNum,
                            ColumnName = "Ürün Kodu",
                            ErrorMessage = "Ürün kodu boş olamaz"
                        });
                        result.ErrorCount++;
                        continue;
                    }

                    var product = await _unitOfWork.Products.GetByCodeAsync(productCode, cancellationToken);
                    if (product == null)
                    {
                        result.Errors.Add(new ExcelImportError
                        {
                            RowNumber = rowNum,
                            ColumnName = "Ürün Kodu",
                            ErrorMessage = $"Ürün bulunamadı: {productCode}",
                            Value = productCode
                        });
                        result.ErrorCount++;
                        continue;
                    }

                    var warehouseCode = row.Cell(2).GetString().Trim().ToLowerInvariant();
                    if (!warehouseLookup.TryGetValue(warehouseCode, out var warehouseId))
                    {
                        result.Errors.Add(new ExcelImportError
                        {
                            RowNumber = rowNum,
                            ColumnName = "Depo Kodu",
                            ErrorMessage = $"Depo bulunamadı: {warehouseCode}",
                            Value = warehouseCode
                        });
                        result.ErrorCount++;
                        continue;
                    }

                    var newQuantityStr = row.Cell(3).GetString().Trim();
                    if (!decimal.TryParse(newQuantityStr, out var newQuantity))
                    {
                        result.Errors.Add(new ExcelImportError
                        {
                            RowNumber = rowNum,
                            ColumnName = "Yeni Miktar",
                            ErrorMessage = "Geçersiz miktar değeri",
                            Value = newQuantityStr
                        });
                        result.ErrorCount++;
                        continue;
                    }

                    var reason = row.Cell(4).GetString().Trim();
                    if (string.IsNullOrEmpty(reason)) reason = "Excel import";

                    // Get or create stock record
                    var stock = await _unitOfWork.Stocks.GetByProductAndWarehouseAsync(product.Id, warehouseId, cancellationToken);

                    if (stock == null)
                    {
                        // Create new stock record with initial quantity
                        stock = new Domain.Entities.Stock(product.Id, warehouseId, newQuantity);
                        await _unitOfWork.Stocks.AddAsync(stock, cancellationToken);
                    }
                    else
                    {
                        // Adjust stock using proper method (reason is logged separately)
                        stock.AdjustStock(newQuantity);
                    }

                    result.SuccessCount++;
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Error processing stock adjustment row {RowNumber}", rowNum);
                    result.Errors.Add(new ExcelImportError
                    {
                        RowNumber = rowNum,
                        ErrorMessage = ex.Message
                    });
                    result.ErrorCount++;
                }
            }

            await _unitOfWork.SaveChangesAsync(cancellationToken);

            result.Success = result.ErrorCount == 0;
            _logger.LogInformation("Stock adjustment import completed. Success: {Success}, Errors: {Errors}",
                result.SuccessCount, result.ErrorCount);

            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error importing stock adjustments from Excel");
            result.Errors.Add(new ExcelImportError
            {
                ErrorMessage = $"Dosya işlenirken hata oluştu: {ex.Message}"
            });
            return result;
        }
    }

    public Task<ExcelExportResult> GetProductImportTemplateAsync()
    {
        using var workbook = new XLWorkbook();
        var worksheet = workbook.Worksheets.Add("Ürün Şablonu");

        // Add headers with styling
        for (int i = 0; i < ProductColumns.Length; i++)
        {
            var cell = worksheet.Cell(1, i + 1);
            cell.Value = ProductColumns[i];
            cell.Style.Font.Bold = true;
            cell.Style.Fill.BackgroundColor = XLColor.LightBlue;
            cell.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;
        }

        // Add example row
        worksheet.Cell(2, 1).Value = "URN001";
        worksheet.Cell(2, 2).Value = "Örnek Ürün";
        worksheet.Cell(2, 3).Value = "Ürün açıklaması";
        worksheet.Cell(2, 4).Value = "8690000000001";
        worksheet.Cell(2, 5).Value = "SKU001";
        worksheet.Cell(2, 6).Value = "Kategori Adı";
        worksheet.Cell(2, 7).Value = "Marka Adı";
        worksheet.Cell(2, 8).Value = "Adet";
        worksheet.Cell(2, 9).Value = "Mamül";
        worksheet.Cell(2, 10).Value = 100;
        worksheet.Cell(2, 11).Value = "TRY";
        worksheet.Cell(2, 12).Value = 50;
        worksheet.Cell(2, 13).Value = 10;
        worksheet.Cell(2, 14).Value = 100;
        worksheet.Cell(2, 15).Value = 20;
        worksheet.Cell(2, 16).Value = 50;
        worksheet.Cell(2, 17).Value = 7;
        worksheet.Cell(2, 18).Value = "Hayır";
        worksheet.Cell(2, 19).Value = "Hayır";
        worksheet.Cell(2, 20).Value = "Aktif";

        // Add instruction sheet
        var instructionSheet = workbook.Worksheets.Add("Talimatlar");
        instructionSheet.Cell(1, 1).Value = "Ürün İçe Aktarma Talimatları";
        instructionSheet.Cell(1, 1).Style.Font.Bold = true;
        instructionSheet.Cell(1, 1).Style.Font.FontSize = 14;

        instructionSheet.Cell(3, 1).Value = "1. Zorunlu Alanlar: Ürün Kodu, Ürün Adı, Kategori, Birim";
        instructionSheet.Cell(4, 1).Value = "2. Ürün Tipi değerleri: Mamül, Hammadde, Yarı Mamül, Hizmet";
        instructionSheet.Cell(5, 1).Value = "3. Evet/Hayır alanları için 'Evet', 'Hayır', 'E', 'H', '1', '0' kullanabilirsiniz";
        instructionSheet.Cell(6, 1).Value = "4. Aktif/Pasif alanı için 'Aktif', 'Pasif', 'A', 'P' kullanabilirsiniz";
        instructionSheet.Cell(7, 1).Value = "5. Kategori ve Marka adları sistemde tanımlı olmalıdır";
        instructionSheet.Cell(8, 1).Value = "6. İlk satır başlık satırıdır, değiştirmeyiniz";

        worksheet.Columns().AdjustToContents();
        instructionSheet.Columns().AdjustToContents();

        using var stream = new MemoryStream();
        workbook.SaveAs(stream);

        return Task.FromResult(new ExcelExportResult
        {
            FileContent = stream.ToArray(),
            FileName = "UrunIceAktarmaSablonu.xlsx",
            RecordCount = 0
        });
    }

    public Task<ExcelExportResult> GetStockAdjustmentTemplateAsync()
    {
        using var workbook = new XLWorkbook();
        var worksheet = workbook.Worksheets.Add("Stok Düzeltme Şablonu");

        // Add headers with styling
        for (int i = 0; i < StockAdjustmentColumns.Length; i++)
        {
            var cell = worksheet.Cell(1, i + 1);
            cell.Value = StockAdjustmentColumns[i];
            cell.Style.Font.Bold = true;
            cell.Style.Fill.BackgroundColor = XLColor.LightGreen;
            cell.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;
        }

        // Add example row
        worksheet.Cell(2, 1).Value = "URN001";
        worksheet.Cell(2, 2).Value = "DEPO01";
        worksheet.Cell(2, 3).Value = 100;
        worksheet.Cell(2, 4).Value = "Sayım düzeltmesi";
        worksheet.Cell(2, 5).Value = "Yıl sonu sayımı";

        // Add instruction sheet
        var instructionSheet = workbook.Worksheets.Add("Talimatlar");
        instructionSheet.Cell(1, 1).Value = "Stok Düzeltme İçe Aktarma Talimatları";
        instructionSheet.Cell(1, 1).Style.Font.Bold = true;
        instructionSheet.Cell(1, 1).Style.Font.FontSize = 14;

        instructionSheet.Cell(3, 1).Value = "1. Zorunlu Alanlar: Ürün Kodu, Depo Kodu, Yeni Miktar";
        instructionSheet.Cell(4, 1).Value = "2. Yeni Miktar, stokun ayarlanacağı değerdir (fark değil)";
        instructionSheet.Cell(5, 1).Value = "3. Ürün Kodu ve Depo Kodu sistemde tanımlı olmalıdır";
        instructionSheet.Cell(6, 1).Value = "4. İlk satır başlık satırıdır, değiştirmeyiniz";

        worksheet.Columns().AdjustToContents();
        instructionSheet.Columns().AdjustToContents();

        using var stream = new MemoryStream();
        workbook.SaveAs(stream);

        return Task.FromResult(new ExcelExportResult
        {
            FileContent = stream.ToArray(),
            FileName = "StokDuzeltmeSablonu.xlsx",
            RecordCount = 0
        });
    }

    public async Task<ExcelValidationResult> ValidateImportFileAsync(Stream fileStream, ExcelImportType importType, CancellationToken cancellationToken = default)
    {
        var result = new ExcelValidationResult();

        try
        {
            using var workbook = new XLWorkbook(fileStream);
            var worksheet = workbook.Worksheet(1);

            var headerRow = worksheet.Row(1);
            var expectedColumns = importType == ExcelImportType.Products ? ProductColumns : StockAdjustmentColumns;

            // Check columns
            var actualColumns = new List<string>();
            for (int i = 1; i <= expectedColumns.Length + 5; i++)
            {
                var value = headerRow.Cell(i).GetString().Trim();
                if (!string.IsNullOrEmpty(value))
                    actualColumns.Add(value);
            }

            // Find missing required columns
            var requiredColumns = importType == ExcelImportType.Products
                ? new[] { "Ürün Kodu", "Ürün Adı", "Kategori", "Birim" }
                : new[] { "Ürün Kodu", "Depo Kodu", "Yeni Miktar" };

            foreach (var required in requiredColumns)
            {
                if (!actualColumns.Any(c => c.Equals(required, StringComparison.OrdinalIgnoreCase)))
                {
                    result.MissingRequiredColumns.Add(required);
                }
            }

            // Find unrecognized columns
            foreach (var col in actualColumns)
            {
                if (!expectedColumns.Any(e => e.Equals(col, StringComparison.OrdinalIgnoreCase)))
                {
                    result.UnrecognizedColumns.Add(col);
                }
            }

            // Count data rows
            var rows = worksheet.RangeUsed()?.RowsUsed().Skip(1).ToList() ?? new List<IXLRangeRow>();
            result.TotalRows = rows.Count;

            // Basic validation of data
            if (importType == ExcelImportType.Products)
            {
                await ValidateProductData(rows, result, cancellationToken);
            }
            else
            {
                await ValidateStockAdjustmentData(rows, result, cancellationToken);
            }

            result.IsValid = !result.MissingRequiredColumns.Any() && !result.Errors.Any();
            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error validating import file");
            result.Errors.Add(new ExcelImportError
            {
                ErrorMessage = $"Dosya doğrulanırken hata oluştu: {ex.Message}"
            });
            return result;
        }
    }

    private async Task ValidateProductData(List<IXLRangeRow> rows, ExcelValidationResult result, CancellationToken cancellationToken)
    {
        var categories = await _unitOfWork.Categories.GetAllAsync(cancellationToken);
        var units = await _unitOfWork.Units.GetAllAsync(cancellationToken);

        var categoryNames = categories.Select(c => c.Name.ToLowerInvariant()).ToHashSet();
        var unitNames = units.Select(u => u.Name.ToLowerInvariant()).ToHashSet();

        foreach (var row in rows)
        {
            var rowNum = row.RowNumber();

            var code = row.Cell(1).GetString().Trim();
            if (string.IsNullOrEmpty(code))
            {
                result.Errors.Add(new ExcelImportError
                {
                    RowNumber = rowNum,
                    ColumnName = "Ürün Kodu",
                    ErrorMessage = "Ürün kodu boş olamaz"
                });
            }

            var name = row.Cell(2).GetString().Trim();
            if (string.IsNullOrEmpty(name))
            {
                result.Errors.Add(new ExcelImportError
                {
                    RowNumber = rowNum,
                    ColumnName = "Ürün Adı",
                    ErrorMessage = "Ürün adı boş olamaz"
                });
            }

            var categoryName = row.Cell(6).GetString().Trim().ToLowerInvariant();
            if (!string.IsNullOrEmpty(categoryName) && !categoryNames.Contains(categoryName))
            {
                result.Warnings.Add($"Satır {rowNum}: Kategori '{categoryName}' sistemde bulunamadı");
            }

            var unitName = row.Cell(8).GetString().Trim().ToLowerInvariant();
            if (string.IsNullOrEmpty(unitName))
            {
                result.Errors.Add(new ExcelImportError
                {
                    RowNumber = rowNum,
                    ColumnName = "Birim",
                    ErrorMessage = "Birim boş olamaz"
                });
            }
            else if (!unitNames.Contains(unitName))
            {
                result.Warnings.Add($"Satır {rowNum}: Birim '{unitName}' sistemde bulunamadı");
            }
        }
    }

    private async Task ValidateStockAdjustmentData(List<IXLRangeRow> rows, ExcelValidationResult result, CancellationToken cancellationToken)
    {
        var warehouses = await _unitOfWork.Warehouses.GetAllAsync(cancellationToken);
        var warehouseCodes = warehouses.Select(w => w.Code.ToLowerInvariant()).ToHashSet();

        foreach (var row in rows)
        {
            var rowNum = row.RowNumber();

            var productCode = row.Cell(1).GetString().Trim();
            if (string.IsNullOrEmpty(productCode))
            {
                result.Errors.Add(new ExcelImportError
                {
                    RowNumber = rowNum,
                    ColumnName = "Ürün Kodu",
                    ErrorMessage = "Ürün kodu boş olamaz"
                });
            }

            var warehouseCode = row.Cell(2).GetString().Trim().ToLowerInvariant();
            if (string.IsNullOrEmpty(warehouseCode))
            {
                result.Errors.Add(new ExcelImportError
                {
                    RowNumber = rowNum,
                    ColumnName = "Depo Kodu",
                    ErrorMessage = "Depo kodu boş olamaz"
                });
            }
            else if (!warehouseCodes.Contains(warehouseCode))
            {
                result.Warnings.Add($"Satır {rowNum}: Depo kodu '{warehouseCode}' sistemde bulunamadı");
            }

            var quantityStr = row.Cell(3).GetString().Trim();
            if (!decimal.TryParse(quantityStr, out _))
            {
                result.Errors.Add(new ExcelImportError
                {
                    RowNumber = rowNum,
                    ColumnName = "Yeni Miktar",
                    ErrorMessage = "Geçersiz miktar değeri",
                    Value = quantityStr
                });
            }
        }
    }

    private static string GetProductTypeDisplayName(ProductType type)
    {
        return type switch
        {
            ProductType.Finished => "Mamül",
            ProductType.Raw => "Hammadde",
            ProductType.SemiFinished => "Yarı Mamül",
            ProductType.Service => "Hizmet",
            ProductType.Consumable => "Sarf Malzeme",
            ProductType.FixedAsset => "Sabit Kıymet",
            _ => type.ToString()
        };
    }

    private static ProductType ParseProductType(string value)
    {
        var normalized = value.Trim().ToLowerInvariant();
        return normalized switch
        {
            "mamül" or "mamul" or "finished" => ProductType.Finished,
            "hammadde" or "raw" or "rawmaterial" or "raw material" => ProductType.Raw,
            "yarı mamül" or "yarı mamul" or "semifinished" or "semi finished" => ProductType.SemiFinished,
            "hizmet" or "service" => ProductType.Service,
            "sarf" or "sarf malzeme" or "consumable" => ProductType.Consumable,
            "sabit kıymet" or "fixedasset" or "fixed asset" => ProductType.FixedAsset,
            _ => ProductType.Finished
        };
    }

    private static decimal ParseDecimalSafe(string value, decimal defaultValue = 0)
    {
        if (string.IsNullOrWhiteSpace(value)) return defaultValue;
        return decimal.TryParse(value.Trim(), out var result) ? result : defaultValue;
    }

    private static int ParseIntSafe(string value, int defaultValue = 0)
    {
        if (string.IsNullOrWhiteSpace(value)) return defaultValue;
        return int.TryParse(value.Trim(), out var result) ? result : defaultValue;
    }

    private static bool ParseBoolSafe(string value, bool defaultValue = false)
    {
        if (string.IsNullOrWhiteSpace(value)) return defaultValue;
        var normalized = value.Trim().ToLowerInvariant();
        return normalized switch
        {
            "evet" or "e" or "yes" or "y" or "true" or "1" or "aktif" or "a" => true,
            "hayır" or "h" or "no" or "n" or "false" or "0" or "pasif" or "p" => false,
            _ => defaultValue
        };
    }
}
