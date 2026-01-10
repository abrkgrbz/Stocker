using Microsoft.Extensions.Logging;
using Stocker.Modules.Inventory.Application.Contracts;
using Stocker.SignalR.Models.Notifications;
using Stocker.SignalR.Services.Interfaces;

namespace Stocker.Modules.Inventory.Infrastructure.Services;

/// <summary>
/// SignalR-based implementation of inventory notification service.
/// </summary>
public class InventoryNotificationService : IInventoryNotificationService
{
    private readonly INotificationService _notificationService;
    private readonly ILogger<InventoryNotificationService> _logger;

    public InventoryNotificationService(
        INotificationService notificationService,
        ILogger<InventoryNotificationService> logger)
    {
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task SendLowStockAlertAsync(
        Guid tenantId,
        int productId,
        string productName,
        string productCode,
        int warehouseId,
        string warehouseName,
        decimal currentQuantity,
        decimal minimumQuantity,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "Düşük Stok Uyarısı",
                Message = $"{productName} ({productCode}) ürününün stok seviyesi düşük. Mevcut: {currentQuantity:N0}, Minimum: {minimumQuantity:N0}",
                Type = NotificationType.Stock,
                Priority = currentQuantity <= 0 ? NotificationPriority.Urgent : NotificationPriority.High,
                ActionUrl = $"/inventory/products/{productId}",
                Icon = "warning",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "low_stock",
                    ["productId"] = productId,
                    ["productCode"] = productCode,
                    ["productName"] = productName,
                    ["warehouseId"] = warehouseId,
                    ["warehouseName"] = warehouseName,
                    ["currentQuantity"] = currentQuantity,
                    ["minimumQuantity"] = minimumQuantity
                }
            };

            await _notificationService.SendToTenantAsync(tenantId.ToString(), notification);
            _logger.LogInformation("Low stock alert sent for product {ProductCode} in tenant {TenantId}", productCode, tenantId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send low stock alert for product {ProductCode}", productCode);
        }
    }

    public async Task SendStockCountCompletedAsync(
        Guid tenantId,
        int stockCountId,
        string countNumber,
        int warehouseId,
        string warehouseName,
        int totalProducts,
        int discrepancies,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "Stok Sayımı Tamamlandı",
                Message = $"{countNumber} sayımı ({warehouseName}) tamamlandı. {totalProducts} ürün sayıldı, {discrepancies} fark tespit edildi.",
                Type = NotificationType.Stock,
                Priority = discrepancies > 0 ? NotificationPriority.High : NotificationPriority.Normal,
                ActionUrl = $"/inventory/stock-counts/{stockCountId}",
                Icon = "check-circle",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "stock_count_completed",
                    ["stockCountId"] = stockCountId,
                    ["countNumber"] = countNumber,
                    ["warehouseId"] = warehouseId,
                    ["warehouseName"] = warehouseName,
                    ["totalProducts"] = totalProducts,
                    ["discrepancies"] = discrepancies
                }
            };

            await _notificationService.SendToTenantAsync(tenantId.ToString(), notification);
            _logger.LogInformation("Stock count completed notification sent for {CountNumber} in tenant {TenantId}", countNumber, tenantId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send stock count completed notification for {CountNumber}", countNumber);
        }
    }

    public async Task SendStockCountApprovedAsync(
        Guid tenantId,
        int stockCountId,
        string countNumber,
        int warehouseId,
        string warehouseName,
        string approvedBy,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "Stok Sayımı Onaylandı",
                Message = $"{countNumber} sayımı ({warehouseName}) {approvedBy} tarafından onaylandı.",
                Type = NotificationType.Stock,
                Priority = NotificationPriority.Normal,
                ActionUrl = $"/inventory/stock-counts/{stockCountId}",
                Icon = "check-circle",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "stock_count_approved",
                    ["stockCountId"] = stockCountId,
                    ["countNumber"] = countNumber,
                    ["warehouseId"] = warehouseId,
                    ["warehouseName"] = warehouseName,
                    ["approvedBy"] = approvedBy
                }
            };

            await _notificationService.SendToTenantAsync(tenantId.ToString(), notification);
            _logger.LogInformation("Stock count approved notification sent for {CountNumber} in tenant {TenantId}", countNumber, tenantId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send stock count approved notification for {CountNumber}", countNumber);
        }
    }

    public async Task SendStockCountRejectedAsync(
        Guid tenantId,
        int stockCountId,
        string countNumber,
        int warehouseId,
        string warehouseName,
        string rejectedBy,
        string? reason,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "Stok Sayımı Reddedildi",
                Message = $"{countNumber} sayımı ({warehouseName}) reddedildi. Sebep: {reason ?? "Belirtilmedi"}",
                Type = NotificationType.Stock,
                Priority = NotificationPriority.High,
                ActionUrl = $"/inventory/stock-counts/{stockCountId}",
                Icon = "x-circle",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "stock_count_rejected",
                    ["stockCountId"] = stockCountId,
                    ["countNumber"] = countNumber,
                    ["warehouseId"] = warehouseId,
                    ["warehouseName"] = warehouseName,
                    ["rejectedBy"] = rejectedBy,
                    ["reason"] = reason ?? string.Empty
                }
            };

            await _notificationService.SendToTenantAsync(tenantId.ToString(), notification);
            _logger.LogInformation("Stock count rejected notification sent for {CountNumber} in tenant {TenantId}", countNumber, tenantId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send stock count rejected notification for {CountNumber}", countNumber);
        }
    }

    public async Task SendLotBatchExpiringAlertAsync(
        Guid tenantId,
        int lotBatchId,
        string lotNumber,
        int productId,
        string productName,
        DateTime expiryDate,
        int daysUntilExpiry,
        decimal remainingQuantity,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "SKT Yaklaşıyor",
                Message = $"{productName} - Lot {lotNumber}: Son kullanma tarihi {daysUntilExpiry} gün içinde doluyor. ({remainingQuantity:N0} adet)",
                Type = NotificationType.Stock,
                Priority = daysUntilExpiry <= 7 ? NotificationPriority.High : NotificationPriority.Normal,
                ActionUrl = $"/inventory/lot-batches/{lotBatchId}",
                Icon = "clock",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "lot_batch_expiring",
                    ["lotBatchId"] = lotBatchId,
                    ["lotNumber"] = lotNumber,
                    ["productId"] = productId,
                    ["productName"] = productName,
                    ["expiryDate"] = expiryDate.ToString("yyyy-MM-dd"),
                    ["daysUntilExpiry"] = daysUntilExpiry,
                    ["remainingQuantity"] = remainingQuantity
                }
            };

            await _notificationService.SendToTenantAsync(tenantId.ToString(), notification);
            _logger.LogInformation("Lot batch expiring alert sent for lot {LotNumber} in tenant {TenantId}", lotNumber, tenantId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send lot batch expiring alert for lot {LotNumber}", lotNumber);
        }
    }

    public async Task SendLotBatchExpiredAlertAsync(
        Guid tenantId,
        int lotBatchId,
        string lotNumber,
        int productId,
        string productName,
        DateTime expiryDate,
        decimal remainingQuantity,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "SKT Dolmuş Ürün!",
                Message = $"{productName} - Lot {lotNumber}: Son kullanma tarihi doldu! ({remainingQuantity:N0} adet)",
                Type = NotificationType.Stock,
                Priority = NotificationPriority.Urgent,
                ActionUrl = $"/inventory/lot-batches/{lotBatchId}",
                Icon = "alert-triangle",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "lot_batch_expired",
                    ["lotBatchId"] = lotBatchId,
                    ["lotNumber"] = lotNumber,
                    ["productId"] = productId,
                    ["productName"] = productName,
                    ["expiryDate"] = expiryDate.ToString("yyyy-MM-dd"),
                    ["remainingQuantity"] = remainingQuantity
                }
            };

            await _notificationService.SendToTenantAsync(tenantId.ToString(), notification);
            _logger.LogWarning("Lot batch expired alert sent for lot {LotNumber} in tenant {TenantId}", lotNumber, tenantId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send lot batch expired alert for lot {LotNumber}", lotNumber);
        }
    }

    public async Task SendLotBatchQuarantinedAlertAsync(
        Guid tenantId,
        int lotBatchId,
        string lotNumber,
        int productId,
        string productName,
        string reason,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "Lot Karantinaya Alındı",
                Message = $"{productName} - Lot {lotNumber} karantinaya alındı. Sebep: {reason}",
                Type = NotificationType.Stock,
                Priority = NotificationPriority.High,
                ActionUrl = $"/inventory/lot-batches/{lotBatchId}",
                Icon = "shield-alert",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "lot_batch_quarantined",
                    ["lotBatchId"] = lotBatchId,
                    ["lotNumber"] = lotNumber,
                    ["productId"] = productId,
                    ["productName"] = productName,
                    ["reason"] = reason
                }
            };

            await _notificationService.SendToTenantAsync(tenantId.ToString(), notification);
            _logger.LogWarning("Lot batch quarantined alert sent for lot {LotNumber} in tenant {TenantId}", lotNumber, tenantId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send lot batch quarantined alert for lot {LotNumber}", lotNumber);
        }
    }

    public async Task SendSerialNumberDefectiveAlertAsync(
        Guid tenantId,
        int serialNumberId,
        string serial,
        int productId,
        string productName,
        string? reason,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "Arızalı Seri Numarası",
                Message = $"{productName} - Seri {serial} arızalı olarak işaretlendi. Sebep: {reason ?? "Belirtilmedi"}",
                Type = NotificationType.Stock,
                Priority = NotificationPriority.High,
                ActionUrl = $"/inventory/serial-numbers/{serialNumberId}",
                Icon = "alert-circle",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "serial_number_defective",
                    ["serialNumberId"] = serialNumberId,
                    ["serial"] = serial,
                    ["productId"] = productId,
                    ["productName"] = productName,
                    ["reason"] = reason ?? string.Empty
                }
            };

            await _notificationService.SendToTenantAsync(tenantId.ToString(), notification);
            _logger.LogWarning("Serial number defective alert sent for serial {Serial} in tenant {TenantId}", serial, tenantId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send serial number defective alert for serial {Serial}", serial);
        }
    }

    public async Task SendSerialNumberLostAlertAsync(
        Guid tenantId,
        int serialNumberId,
        string serial,
        int productId,
        string productName,
        string? reason,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "Kayıp Seri Numarası",
                Message = $"{productName} - Seri {serial} kayıp olarak işaretlendi. Sebep: {reason ?? "Belirtilmedi"}",
                Type = NotificationType.Stock,
                Priority = NotificationPriority.Urgent,
                ActionUrl = $"/inventory/serial-numbers/{serialNumberId}",
                Icon = "search-x",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "serial_number_lost",
                    ["serialNumberId"] = serialNumberId,
                    ["serial"] = serial,
                    ["productId"] = productId,
                    ["productName"] = productName,
                    ["reason"] = reason ?? string.Empty
                }
            };

            await _notificationService.SendToTenantAsync(tenantId.ToString(), notification);
            _logger.LogWarning("Serial number lost alert sent for serial {Serial} in tenant {TenantId}", serial, tenantId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send serial number lost alert for serial {Serial}", serial);
        }
    }

    public async Task SendPriceListUpdatedAsync(
        Guid tenantId,
        int priceListId,
        string priceListCode,
        string priceListName,
        int itemsAffected,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "Fiyat Listesi Güncellendi",
                Message = $"{priceListName} ({priceListCode}) fiyat listesi güncellendi. {itemsAffected} ürün etkilendi.",
                Type = NotificationType.Stock,
                Priority = NotificationPriority.Normal,
                ActionUrl = $"/inventory/price-lists/{priceListId}",
                Icon = "tag",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "price_list_updated",
                    ["priceListId"] = priceListId,
                    ["priceListCode"] = priceListCode,
                    ["priceListName"] = priceListName,
                    ["itemsAffected"] = itemsAffected
                }
            };

            await _notificationService.SendToTenantAsync(tenantId.ToString(), notification);
            _logger.LogInformation("Price list updated notification sent for {PriceListCode} in tenant {TenantId}", priceListCode, tenantId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send price list updated notification for {PriceListCode}", priceListCode);
        }
    }

    public async Task SendStockAdjustmentAppliedAsync(
        Guid tenantId,
        int stockCountId,
        string countNumber,
        int warehouseId,
        string warehouseName,
        decimal totalDifference,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var diffText = totalDifference > 0 ? $"+{totalDifference:N0}" : $"{totalDifference:N0}";
            var notification = new NotificationMessage
            {
                Title = "Stok Düzeltmesi Uygulandı",
                Message = $"{countNumber} sayımı ({warehouseName}) sonuçları stoka yansıtıldı. Toplam fark: {diffText}",
                Type = NotificationType.Stock,
                Priority = Math.Abs(totalDifference) > 100 ? NotificationPriority.High : NotificationPriority.Normal,
                ActionUrl = $"/inventory/stock-counts/{stockCountId}",
                Icon = "refresh-cw",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "stock_adjustment_applied",
                    ["stockCountId"] = stockCountId,
                    ["countNumber"] = countNumber,
                    ["warehouseId"] = warehouseId,
                    ["warehouseName"] = warehouseName,
                    ["totalDifference"] = totalDifference
                }
            };

            await _notificationService.SendToTenantAsync(tenantId.ToString(), notification);
            _logger.LogInformation("Stock adjustment applied notification sent for {CountNumber} in tenant {TenantId}", countNumber, tenantId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send stock adjustment applied notification for {CountNumber}", countNumber);
        }
    }

    public async Task SendCycleCountCompletedAsync(
        Guid tenantId,
        int cycleCountId,
        string countNumber,
        int warehouseId,
        string warehouseName,
        int categoryId,
        string categoryName,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "Dönemsel Sayım Tamamlandı",
                Message = $"{countNumber} dönemsel sayımı ({warehouseName} - {categoryName}) tamamlandı.",
                Type = NotificationType.Stock,
                Priority = NotificationPriority.Normal,
                ActionUrl = $"/inventory/cycle-counts/{cycleCountId}",
                Icon = "check-circle",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "cycle_count_completed",
                    ["cycleCountId"] = cycleCountId,
                    ["countNumber"] = countNumber,
                    ["warehouseId"] = warehouseId,
                    ["warehouseName"] = warehouseName,
                    ["categoryId"] = categoryId,
                    ["categoryName"] = categoryName
                }
            };

            await _notificationService.SendToTenantAsync(tenantId.ToString(), notification);
            _logger.LogInformation("Cycle count completed notification sent for {CountNumber} in tenant {TenantId}", countNumber, tenantId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send cycle count completed notification for {CountNumber}", countNumber);
        }
    }

    public async Task NotifyStockCountScheduledAsync(
        Guid tenantId,
        int stockCountId,
        string countNumber,
        int warehouseId,
        DateTime scheduledDate,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "Stok Sayımı Planlandı",
                Message = $"{countNumber} sayımı {scheduledDate:dd.MM.yyyy HH:mm} tarihine planlandı.",
                Type = NotificationType.Stock,
                Priority = NotificationPriority.Normal,
                ActionUrl = $"/inventory/stock-counts/{stockCountId}",
                Icon = "calendar",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "stock_count_scheduled",
                    ["stockCountId"] = stockCountId,
                    ["countNumber"] = countNumber,
                    ["warehouseId"] = warehouseId,
                    ["scheduledDate"] = scheduledDate.ToString("yyyy-MM-dd HH:mm:ss")
                }
            };

            await _notificationService.SendToTenantAsync(tenantId.ToString(), notification);
            _logger.LogInformation("Stock count scheduled notification sent for {CountNumber} in tenant {TenantId}", countNumber, tenantId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send stock count scheduled notification for {CountNumber}", countNumber);
        }
    }

    public async Task NotifyStockCountStartedAsync(
        Guid tenantId,
        int stockCountId,
        string countNumber,
        int warehouseId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "Stok Sayımı Başladı",
                Message = $"{countNumber} sayımı başladı.",
                Type = NotificationType.Stock,
                Priority = NotificationPriority.Normal,
                ActionUrl = $"/inventory/stock-counts/{stockCountId}",
                Icon = "play-circle",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "stock_count_started",
                    ["stockCountId"] = stockCountId,
                    ["countNumber"] = countNumber,
                    ["warehouseId"] = warehouseId
                }
            };

            await _notificationService.SendToTenantAsync(tenantId.ToString(), notification);
            _logger.LogInformation("Stock count started notification sent for {CountNumber} in tenant {TenantId}", countNumber, tenantId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send stock count started notification for {CountNumber}", countNumber);
        }
    }

    public async Task NotifyStockCountCompletedAsync(
        Guid tenantId,
        int stockCountId,
        string countNumber,
        int itemsWithVariance,
        decimal? accuracyPercent,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var accuracyText = accuracyPercent.HasValue ? $"Doğruluk: %{accuracyPercent:N1}" : "";
            var notification = new NotificationMessage
            {
                Title = "Stok Sayımı Tamamlandı",
                Message = $"{countNumber} sayımı tamamlandı. {itemsWithVariance} kalemde fark tespit edildi. {accuracyText}",
                Type = NotificationType.Stock,
                Priority = itemsWithVariance > 0 ? NotificationPriority.High : NotificationPriority.Normal,
                ActionUrl = $"/inventory/stock-counts/{stockCountId}",
                Icon = "check-circle",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "stock_count_completed",
                    ["stockCountId"] = stockCountId,
                    ["countNumber"] = countNumber,
                    ["itemsWithVariance"] = itemsWithVariance,
                    ["accuracyPercent"] = accuracyPercent ?? 0
                }
            };

            await _notificationService.SendToTenantAsync(tenantId.ToString(), notification);
            _logger.LogInformation("Stock count completed notification sent for {CountNumber} in tenant {TenantId}", countNumber, tenantId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send stock count completed notification for {CountNumber}", countNumber);
        }
    }

    public async Task NotifyStockCountApprovedAsync(
        Guid tenantId,
        int stockCountId,
        string countNumber,
        string approvedBy,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "Stok Sayımı Onaylandı",
                Message = $"{countNumber} sayımı {approvedBy} tarafından onaylandı.",
                Type = NotificationType.Stock,
                Priority = NotificationPriority.Normal,
                ActionUrl = $"/inventory/stock-counts/{stockCountId}",
                Icon = "check-circle",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "stock_count_approved",
                    ["stockCountId"] = stockCountId,
                    ["countNumber"] = countNumber,
                    ["approvedBy"] = approvedBy
                }
            };

            await _notificationService.SendToTenantAsync(tenantId.ToString(), notification);
            _logger.LogInformation("Stock count approved notification sent for {CountNumber} in tenant {TenantId}", countNumber, tenantId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send stock count approved notification for {CountNumber}", countNumber);
        }
    }

    public async Task NotifyStockCountCancelledAsync(
        Guid tenantId,
        int stockCountId,
        string countNumber,
        string reason,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "Stok Sayımı İptal Edildi",
                Message = $"{countNumber} sayımı iptal edildi. Sebep: {reason}",
                Type = NotificationType.Stock,
                Priority = NotificationPriority.High,
                ActionUrl = $"/inventory/stock-counts/{stockCountId}",
                Icon = "x-circle",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "stock_count_cancelled",
                    ["stockCountId"] = stockCountId,
                    ["countNumber"] = countNumber,
                    ["reason"] = reason
                }
            };

            await _notificationService.SendToTenantAsync(tenantId.ToString(), notification);
            _logger.LogWarning("Stock count cancelled notification sent for {CountNumber} in tenant {TenantId}", countNumber, tenantId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send stock count cancelled notification for {CountNumber}", countNumber);
        }
    }
}
