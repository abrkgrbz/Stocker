using Microsoft.Extensions.Logging;
using Stocker.Modules.Inventory.Application.Services;
using Stocker.SignalR.Hubs;
using Stocker.SignalR.Models.Notifications;
using Stocker.SignalR.Services.Interfaces;

namespace Stocker.Modules.Inventory.Infrastructure.Services;

/// <summary>
/// SignalR-based implementation of stock alert notification service
/// </summary>
public class StockAlertNotificationService : IStockAlertNotificationService
{
    private readonly INotificationService _notificationService;
    private readonly ILogger<StockAlertNotificationService> _logger;

    public StockAlertNotificationService(
        INotificationService notificationService,
        ILogger<StockAlertNotificationService> logger)
    {
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task NotifyLowStockAsync(StockAlertDto alert, CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "Düşük Stok Uyarısı",
                Message = alert.Message ?? $"{alert.ProductName} ({alert.ProductCode}) ürününün stok seviyesi düşük. Mevcut: {alert.CurrentStock:N0}, Minimum: {alert.MinStockLevel:N0}",
                Type = NotificationType.Stock,
                Priority = alert.Severity == StockAlertSeverity.Critical ? NotificationPriority.High : NotificationPriority.Normal,
                ActionUrl = $"/inventory/products/{alert.ProductId}",
                Icon = "warning",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "low_stock",
                    ["productId"] = alert.ProductId,
                    ["productCode"] = alert.ProductCode,
                    ["productName"] = alert.ProductName,
                    ["warehouseId"] = alert.WarehouseId,
                    ["warehouseName"] = alert.WarehouseName,
                    ["currentStock"] = alert.CurrentStock,
                    ["minStockLevel"] = alert.MinStockLevel,
                    ["reorderPoint"] = alert.ReorderPoint,
                    ["severity"] = alert.Severity.ToString().ToLowerInvariant()
                }
            };

            await _notificationService.SendToTenantAsync(alert.TenantId, notification);

            _logger.LogInformation(
                "Low stock alert sent for product {ProductCode} in tenant {TenantId}. Current: {Current}, Min: {Min}",
                alert.ProductCode, alert.TenantId, alert.CurrentStock, alert.MinStockLevel);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send low stock notification for product {ProductCode}", alert.ProductCode);
        }
    }

    public async Task NotifyOutOfStockAsync(StockAlertDto alert, CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "Stok Tükendi!",
                Message = alert.Message ?? $"{alert.ProductName} ({alert.ProductCode}) ürününün stoku tükendi!",
                Type = NotificationType.Stock,
                Priority = NotificationPriority.Urgent,
                ActionUrl = $"/inventory/products/{alert.ProductId}",
                Icon = "error",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "out_of_stock",
                    ["productId"] = alert.ProductId,
                    ["productCode"] = alert.ProductCode,
                    ["productName"] = alert.ProductName,
                    ["warehouseId"] = alert.WarehouseId,
                    ["warehouseName"] = alert.WarehouseName,
                    ["severity"] = "critical"
                }
            };

            await _notificationService.SendToTenantAsync(alert.TenantId, notification);

            _logger.LogWarning(
                "Out of stock alert sent for product {ProductCode} in tenant {TenantId}",
                alert.ProductCode, alert.TenantId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send out of stock notification for product {ProductCode}", alert.ProductCode);
        }
    }

    public async Task NotifyExpiringStockAsync(ExpiringStockAlertDto alert, CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "SKT Yaklaşıyor",
                Message = alert.Message ?? $"{alert.ProductName} - Lot {alert.LotNumber}: Son kullanma tarihi {alert.DaysUntilExpiry} gün içinde doluyor. ({alert.Quantity:N0} adet)",
                Type = NotificationType.Stock,
                Priority = alert.DaysUntilExpiry <= 7 ? NotificationPriority.High : NotificationPriority.Normal,
                ActionUrl = $"/inventory/lot-batches/{alert.LotBatchId}",
                Icon = "clock",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "expiring_soon",
                    ["lotBatchId"] = alert.LotBatchId,
                    ["lotNumber"] = alert.LotNumber,
                    ["productId"] = alert.ProductId,
                    ["productCode"] = alert.ProductCode,
                    ["productName"] = alert.ProductName,
                    ["quantity"] = alert.Quantity,
                    ["expiryDate"] = alert.ExpiryDate.ToString("yyyy-MM-dd"),
                    ["daysUntilExpiry"] = alert.DaysUntilExpiry,
                    ["severity"] = alert.Severity.ToString().ToLowerInvariant()
                }
            };

            await _notificationService.SendToTenantAsync(alert.TenantId, notification);

            _logger.LogInformation(
                "Expiring stock alert sent for lot {LotNumber} (product {ProductCode}) in tenant {TenantId}. Expires in {Days} days",
                alert.LotNumber, alert.ProductCode, alert.TenantId, alert.DaysUntilExpiry);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send expiring stock notification for lot {LotNumber}", alert.LotNumber);
        }
    }

    public async Task NotifyExpiredStockAsync(ExpiringStockAlertDto alert, CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "SKT Dolmuş Ürün!",
                Message = alert.Message ?? $"{alert.ProductName} - Lot {alert.LotNumber}: Son kullanma tarihi {Math.Abs(alert.DaysUntilExpiry)} gün önce doldu! ({alert.Quantity:N0} adet)",
                Type = NotificationType.Stock,
                Priority = NotificationPriority.Urgent,
                ActionUrl = $"/inventory/lot-batches/{alert.LotBatchId}",
                Icon = "error",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "expired",
                    ["lotBatchId"] = alert.LotBatchId,
                    ["lotNumber"] = alert.LotNumber,
                    ["productId"] = alert.ProductId,
                    ["productCode"] = alert.ProductCode,
                    ["productName"] = alert.ProductName,
                    ["quantity"] = alert.Quantity,
                    ["expiryDate"] = alert.ExpiryDate.ToString("yyyy-MM-dd"),
                    ["daysExpired"] = Math.Abs(alert.DaysUntilExpiry),
                    ["severity"] = "critical"
                }
            };

            await _notificationService.SendToTenantAsync(alert.TenantId, notification);

            _logger.LogWarning(
                "Expired stock alert sent for lot {LotNumber} (product {ProductCode}) in tenant {TenantId}. Expired {Days} days ago",
                alert.LotNumber, alert.ProductCode, alert.TenantId, Math.Abs(alert.DaysUntilExpiry));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send expired stock notification for lot {LotNumber}", alert.LotNumber);
        }
    }

    public async Task NotifyTransferStatusChangedAsync(TransferStatusAlertDto alert, CancellationToken cancellationToken = default)
    {
        try
        {
            var statusMessages = new Dictionary<string, string>
            {
                ["Pending"] = "onay bekliyor",
                ["Approved"] = "onaylandı",
                ["InTransit"] = "yolda",
                ["Received"] = "teslim alındı",
                ["Cancelled"] = "iptal edildi",
                ["Rejected"] = "reddedildi"
            };

            var statusText = statusMessages.TryGetValue(alert.NewStatus, out var msg) ? msg : alert.NewStatus;

            var notification = new NotificationMessage
            {
                Title = "Transfer Durumu Değişti",
                Message = alert.Message ?? $"{alert.TransferNumber}: {alert.FromWarehouse} → {alert.ToWarehouse} transferi {statusText}. ({alert.ItemCount} kalem)",
                Type = NotificationType.Stock,
                Priority = alert.NewStatus == "Cancelled" || alert.NewStatus == "Rejected"
                    ? NotificationPriority.High
                    : NotificationPriority.Normal,
                ActionUrl = $"/inventory/stock-transfers/{alert.TransferId}",
                Icon = "swap",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "transfer_status",
                    ["transferId"] = alert.TransferId,
                    ["transferNumber"] = alert.TransferNumber,
                    ["fromWarehouse"] = alert.FromWarehouse,
                    ["toWarehouse"] = alert.ToWarehouse,
                    ["oldStatus"] = alert.OldStatus,
                    ["newStatus"] = alert.NewStatus,
                    ["itemCount"] = alert.ItemCount
                }
            };

            await _notificationService.SendToTenantAsync(alert.TenantId, notification);

            _logger.LogInformation(
                "Transfer status alert sent for {TransferNumber} in tenant {TenantId}. Status: {OldStatus} → {NewStatus}",
                alert.TransferNumber, alert.TenantId, alert.OldStatus, alert.NewStatus);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send transfer status notification for {TransferNumber}", alert.TransferNumber);
        }
    }

    public async Task NotifyStockCountPendingAsync(StockCountAlertDto alert, CancellationToken cancellationToken = default)
    {
        try
        {
            var notification = new NotificationMessage
            {
                Title = "Sayım Onay Bekliyor",
                Message = alert.Message ?? $"{alert.CountNumber} sayımı ({alert.WarehouseName}) onay bekliyor. {alert.ItemCount} kalem, {alert.DiscrepancyCount} fark tespit edildi.",
                Type = NotificationType.Stock,
                Priority = alert.DiscrepancyCount > 0 ? NotificationPriority.High : NotificationPriority.Normal,
                ActionUrl = $"/inventory/stock-counts/{alert.StockCountId}",
                Icon = "audit",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "stock_count_pending",
                    ["stockCountId"] = alert.StockCountId,
                    ["countNumber"] = alert.CountNumber,
                    ["warehouseName"] = alert.WarehouseName,
                    ["status"] = alert.Status,
                    ["itemCount"] = alert.ItemCount,
                    ["discrepancyCount"] = alert.DiscrepancyCount
                }
            };

            await _notificationService.SendToTenantAsync(alert.TenantId, notification);

            _logger.LogInformation(
                "Stock count pending alert sent for {CountNumber} in tenant {TenantId}. Discrepancies: {Count}",
                alert.CountNumber, alert.TenantId, alert.DiscrepancyCount);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send stock count notification for {CountNumber}", alert.CountNumber);
        }
    }

    public async Task NotifyStockAdjustedAsync(StockAdjustmentAlertDto alert, CancellationToken cancellationToken = default)
    {
        try
        {
            var adjustmentText = alert.AdjustmentQuantity > 0 ? $"+{alert.AdjustmentQuantity:N0}" : $"{alert.AdjustmentQuantity:N0}";

            var notification = new NotificationMessage
            {
                Title = "Stok Düzeltmesi Yapıldı",
                Message = $"{alert.ProductName} ({alert.ProductCode}): {alert.OldQuantity:N0} → {alert.NewQuantity:N0} ({adjustmentText}). Sebep: {alert.Reason}",
                Type = NotificationType.Stock,
                Priority = Math.Abs(alert.AdjustmentQuantity) > 100 ? NotificationPriority.High : NotificationPriority.Normal,
                ActionUrl = $"/inventory/products/{alert.ProductId}",
                Icon = "edit",
                Data = new Dictionary<string, object>
                {
                    ["alertType"] = "stock_adjustment",
                    ["productId"] = alert.ProductId,
                    ["productCode"] = alert.ProductCode,
                    ["productName"] = alert.ProductName,
                    ["warehouseId"] = alert.WarehouseId,
                    ["warehouseName"] = alert.WarehouseName,
                    ["oldQuantity"] = alert.OldQuantity,
                    ["newQuantity"] = alert.NewQuantity,
                    ["adjustmentQuantity"] = alert.AdjustmentQuantity,
                    ["adjustmentType"] = alert.AdjustmentType,
                    ["reason"] = alert.Reason,
                    ["adjustedBy"] = alert.AdjustedBy ?? "System"
                }
            };

            await _notificationService.SendToTenantAsync(alert.TenantId, notification);

            _logger.LogInformation(
                "Stock adjustment alert sent for product {ProductCode} in tenant {TenantId}. Change: {Change}",
                alert.ProductCode, alert.TenantId, adjustmentText);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send stock adjustment notification for product {ProductCode}", alert.ProductCode);
        }
    }

    public async Task NotifyBatchAlertsAsync(IEnumerable<StockAlertDto> alerts, CancellationToken cancellationToken = default)
    {
        var alertList = alerts.ToList();

        if (!alertList.Any())
            return;

        try
        {
            // Group by tenant
            var alertsByTenant = alertList.GroupBy(a => a.TenantId);

            foreach (var tenantAlerts in alertsByTenant)
            {
                var criticalCount = tenantAlerts.Count(a => a.Severity == StockAlertSeverity.Critical);
                var warningCount = tenantAlerts.Count(a => a.Severity == StockAlertSeverity.Warning);

                var notification = new NotificationMessage
                {
                    Title = $"{tenantAlerts.Count()} Stok Uyarısı",
                    Message = $"{criticalCount} kritik, {warningCount} uyarı seviyesinde stok bildirimi var.",
                    Type = NotificationType.Stock,
                    Priority = criticalCount > 0 ? NotificationPriority.Urgent : NotificationPriority.High,
                    ActionUrl = "/inventory?filter=alerts",
                    Icon = "warning",
                    Data = new Dictionary<string, object>
                    {
                        ["alertType"] = "batch_alerts",
                        ["totalCount"] = tenantAlerts.Count(),
                        ["criticalCount"] = criticalCount,
                        ["warningCount"] = warningCount,
                        ["alerts"] = tenantAlerts.Select(a => new
                        {
                            productId = a.ProductId,
                            productCode = a.ProductCode,
                            productName = a.ProductName,
                            currentStock = a.CurrentStock,
                            severity = a.Severity.ToString().ToLowerInvariant()
                        }).ToList()
                    }
                };

                await _notificationService.SendToTenantAsync(tenantAlerts.Key, notification);
            }

            _logger.LogInformation("Sent batch stock alerts for {Count} products across {TenantCount} tenants",
                alertList.Count, alertsByTenant.Count());
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send batch stock alerts");
        }
    }
}
