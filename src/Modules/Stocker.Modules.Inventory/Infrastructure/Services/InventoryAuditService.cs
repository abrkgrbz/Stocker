using System.Text.Json;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Domain.Tenant.Entities;
using Stocker.Modules.Inventory.Application.Contracts;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Infrastructure.Persistence;
using Stocker.SharedKernel.Interfaces;

namespace Stocker.Modules.Inventory.Infrastructure.Services;

/// <summary>
/// Implementation of inventory audit service
/// </summary>
public class InventoryAuditService : IInventoryAuditService
{
    private readonly InventoryDbContext _dbContext;
    private readonly ITenantService _tenantService;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly ILogger<InventoryAuditService> _logger;

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        WriteIndented = false
    };

    public InventoryAuditService(
        InventoryDbContext dbContext,
        ITenantService tenantService,
        IHttpContextAccessor httpContextAccessor,
        ILogger<InventoryAuditService> logger)
    {
        _dbContext = dbContext;
        _tenantService = tenantService;
        _httpContextAccessor = httpContextAccessor;
        _logger = logger;
    }

    public async Task LogAsync(
        string entityType,
        string entityId,
        string entityName,
        string action,
        object? oldValue = null,
        object? newValue = null,
        string? additionalData = null,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var tenantId = _tenantService.GetCurrentTenantId();
            var userId = GetCurrentUserId();
            var userName = GetCurrentUserName();
            var userEmail = GetCurrentUserEmail();
            var ipAddress = GetClientIpAddress();
            var userAgent = GetUserAgent();

            var auditLog = AuditLog.Create(
                tenantId ?? Guid.Empty,
                entityType,
                entityId,
                action,
                userId,
                userName,
                userEmail,
                ipAddress,
                userAgent);

            // Set entity name in additional data
            var additionalObj = new Dictionary<string, object?>
            {
                { "entityName", entityName }
            };

            if (!string.IsNullOrEmpty(additionalData))
            {
                try
                {
                    var parsedAdditional = JsonSerializer.Deserialize<Dictionary<string, object?>>(additionalData, JsonOptions);
                    if (parsedAdditional != null)
                    {
                        foreach (var kvp in parsedAdditional)
                        {
                            additionalObj[kvp.Key] = kvp.Value;
                        }
                    }
                }
                catch
                {
                    additionalObj["rawData"] = additionalData;
                }
            }

            auditLog.SetAdditionalData(JsonSerializer.Serialize(additionalObj, JsonOptions));

            if (oldValue != null)
            {
                auditLog.SetOldValues(JsonSerializer.Serialize(oldValue, JsonOptions));
            }

            if (newValue != null)
            {
                auditLog.SetNewValues(JsonSerializer.Serialize(newValue, JsonOptions));
            }

            // Calculate changes
            if (oldValue != null && newValue != null)
            {
                var changes = CalculateChanges(oldValue, newValue);
                if (changes.Any())
                {
                    auditLog.SetChanges(JsonSerializer.Serialize(changes, JsonOptions));
                }
            }

            _dbContext.AuditLogs.Add(auditLog);
            await _dbContext.SaveChangesAsync(cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to log audit entry for {EntityType} {EntityId}", entityType, entityId);
            // Don't throw - audit logging should not break the main operation
        }
    }

    public async Task<PaginatedAuditLogsDto> GetAuditLogsAsync(
        InventoryAuditFilterDto filter,
        CancellationToken cancellationToken = default)
    {
        var query = _dbContext.AuditLogs.AsNoTracking();

        // Apply filters
        if (!string.IsNullOrEmpty(filter.EntityType))
        {
            query = query.Where(a => a.EntityName == filter.EntityType);
        }

        if (!string.IsNullOrEmpty(filter.EntityId))
        {
            query = query.Where(a => a.EntityId == filter.EntityId);
        }

        if (!string.IsNullOrEmpty(filter.Action))
        {
            query = query.Where(a => a.Action == filter.Action);
        }

        if (filter.UserId.HasValue)
        {
            query = query.Where(a => a.UserId == filter.UserId.Value.ToString());
        }

        if (filter.FromDate.HasValue)
        {
            query = query.Where(a => a.Timestamp >= filter.FromDate.Value);
        }

        if (filter.ToDate.HasValue)
        {
            query = query.Where(a => a.Timestamp <= filter.ToDate.Value);
        }

        // Get total count
        var totalCount = await query.CountAsync(cancellationToken);

        // Apply pagination
        var items = await query
            .OrderByDescending(a => a.Timestamp)
            .Skip((filter.PageNumber - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .ToListAsync(cancellationToken);

        var totalPages = (int)Math.Ceiling(totalCount / (double)filter.PageSize);

        return new PaginatedAuditLogsDto
        {
            Items = items.Select(MapToDto).ToList(),
            TotalCount = totalCount,
            PageNumber = filter.PageNumber,
            PageSize = filter.PageSize,
            TotalPages = totalPages,
            HasNextPage = filter.PageNumber < totalPages,
            HasPreviousPage = filter.PageNumber > 1
        };
    }

    public async Task<InventoryAuditDashboardDto> GetAuditDashboardAsync(
        int days = 30,
        CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        var today = now.Date;
        var weekAgo = today.AddDays(-7);
        var monthAgo = today.AddDays(-30);
        var startDate = today.AddDays(-days);

        var allLogs = await _dbContext.AuditLogs
            .AsNoTracking()
            .Where(a => a.Timestamp >= startDate)
            .ToListAsync(cancellationToken);

        // Basic counts
        var totalCount = await _dbContext.AuditLogs.CountAsync(cancellationToken);
        var todayCount = allLogs.Count(a => a.Timestamp.Date == today);
        var weekCount = allLogs.Count(a => a.Timestamp >= weekAgo);
        var monthCount = allLogs.Count(a => a.Timestamp >= monthAgo);

        // By entity type
        var byEntityType = allLogs
            .GroupBy(a => a.EntityName)
            .Select(g => new AuditSummaryByEntityDto
            {
                EntityType = g.Key,
                EntityTypeLabel = InventoryEntityTypes.Labels.GetValueOrDefault(g.Key, g.Key),
                TotalCount = g.Count(),
                CreatedCount = g.Count(a => a.Action == InventoryAuditActions.Created),
                UpdatedCount = g.Count(a => a.Action == InventoryAuditActions.Updated),
                DeletedCount = g.Count(a => a.Action == InventoryAuditActions.Deleted),
                LastActivityDate = g.Max(a => a.Timestamp)
            })
            .OrderByDescending(x => x.TotalCount)
            .ToList();

        // Top users
        var topUsers = allLogs
            .GroupBy(a => new { a.UserId, a.UserName })
            .Select(g => new AuditSummaryByUserDto
            {
                UserId = g.Key.UserId,
                UserName = g.Key.UserName,
                TotalActions = g.Count(),
                LastActivityDate = g.Max(a => a.Timestamp)
            })
            .OrderByDescending(x => x.TotalActions)
            .Take(10)
            .ToList();

        // Activity trend (daily)
        var activityTrend = allLogs
            .GroupBy(a => a.Timestamp.Date)
            .Select(g => new AuditActivityByDateDto
            {
                Date = g.Key,
                CreatedCount = g.Count(a => a.Action == InventoryAuditActions.Created),
                UpdatedCount = g.Count(a => a.Action == InventoryAuditActions.Updated),
                DeletedCount = g.Count(a => a.Action == InventoryAuditActions.Deleted),
                TotalCount = g.Count()
            })
            .OrderBy(x => x.Date)
            .ToList();

        // Recent activities
        var recentActivities = allLogs
            .OrderByDescending(a => a.Timestamp)
            .Take(20)
            .Select(MapToDto)
            .ToList();

        return new InventoryAuditDashboardDto
        {
            TotalAuditLogs = totalCount,
            TodayCount = todayCount,
            ThisWeekCount = weekCount,
            ThisMonthCount = monthCount,
            ByEntityType = byEntityType,
            TopUsers = topUsers,
            ActivityTrend = activityTrend,
            RecentActivities = recentActivities
        };
    }

    public async Task<EntityHistoryDto?> GetEntityHistoryAsync(
        string entityType,
        string entityId,
        CancellationToken cancellationToken = default)
    {
        var logs = await _dbContext.AuditLogs
            .AsNoTracking()
            .Where(a => a.EntityName == entityType && a.EntityId == entityId)
            .OrderByDescending(a => a.Timestamp)
            .ToListAsync(cancellationToken);

        if (!logs.Any())
        {
            return null;
        }

        var firstLog = logs.OrderBy(a => a.Timestamp).First();
        var lastLog = logs.First();

        // Try to get entity name from additional data
        var entityName = entityId;
        if (!string.IsNullOrEmpty(firstLog.AdditionalData))
        {
            try
            {
                var additionalData = JsonSerializer.Deserialize<Dictionary<string, object?>>(firstLog.AdditionalData, JsonOptions);
                if (additionalData?.TryGetValue("entityName", out var name) == true && name != null)
                {
                    entityName = name.ToString() ?? entityId;
                }
            }
            catch { }
        }

        return new EntityHistoryDto
        {
            EntityType = entityType,
            EntityId = entityId,
            EntityName = entityName,
            CreatedAt = firstLog.Action == InventoryAuditActions.Created ? firstLog.Timestamp : logs.Min(a => a.Timestamp),
            CreatedBy = firstLog.UserName,
            LastModifiedAt = lastLog.Timestamp,
            LastModifiedBy = lastLog.UserName,
            TotalChanges = logs.Count,
            Changes = logs.Select(MapToDto).ToList()
        };
    }

    public async Task<InventoryAuditLogDto?> GetAuditLogByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var auditLog = await _dbContext.AuditLogs
            .AsNoTracking()
            .FirstOrDefaultAsync(a => a.Id == id, cancellationToken);

        return auditLog != null ? MapToDto(auditLog) : null;
    }

    public Dictionary<string, string> GetEntityTypes()
    {
        return InventoryEntityTypes.Labels;
    }

    public Dictionary<string, string> GetActionTypes()
    {
        return InventoryAuditActions.Labels;
    }

    #region Private Methods

    private string GetCurrentUserId()
    {
        var user = _httpContextAccessor.HttpContext?.User;
        return user?.FindFirst("sub")?.Value
               ?? user?.FindFirst("id")?.Value
               ?? "system";
    }

    private string GetCurrentUserName()
    {
        var user = _httpContextAccessor.HttpContext?.User;
        return user?.FindFirst("name")?.Value
               ?? user?.FindFirst("preferred_username")?.Value
               ?? user?.Identity?.Name
               ?? "System";
    }

    private string? GetCurrentUserEmail()
    {
        var user = _httpContextAccessor.HttpContext?.User;
        return user?.FindFirst("email")?.Value;
    }

    private string? GetClientIpAddress()
    {
        var context = _httpContextAccessor.HttpContext;
        if (context == null) return null;

        var forwardedFor = context.Request.Headers["X-Forwarded-For"].FirstOrDefault();
        if (!string.IsNullOrEmpty(forwardedFor))
        {
            return forwardedFor.Split(',').FirstOrDefault()?.Trim();
        }

        return context.Connection.RemoteIpAddress?.ToString();
    }

    private string? GetUserAgent()
    {
        return _httpContextAccessor.HttpContext?.Request.Headers["User-Agent"].FirstOrDefault();
    }

    private List<FieldChangeDto> CalculateChanges(object oldValue, object newValue)
    {
        var changes = new List<FieldChangeDto>();

        try
        {
            var oldJson = JsonSerializer.Serialize(oldValue, JsonOptions);
            var newJson = JsonSerializer.Serialize(newValue, JsonOptions);

            var oldDict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(oldJson, JsonOptions);
            var newDict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(newJson, JsonOptions);

            if (oldDict == null || newDict == null) return changes;

            var allKeys = oldDict.Keys.Union(newDict.Keys).Distinct();

            foreach (var key in allKeys)
            {
                var oldVal = oldDict.TryGetValue(key, out var ov) ? ov.ToString() : null;
                var newVal = newDict.TryGetValue(key, out var nv) ? nv.ToString() : null;

                if (oldVal != newVal)
                {
                    changes.Add(new FieldChangeDto
                    {
                        FieldName = key,
                        FieldLabel = GetFieldLabel(key),
                        OldValue = oldVal,
                        NewValue = newVal
                    });
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to calculate field changes");
        }

        return changes;
    }

    private static string GetFieldLabel(string fieldName)
    {
        // Common field name translations
        var labels = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
        {
            { "name", "Ad" },
            { "code", "Kod" },
            { "description", "Açıklama" },
            { "barcode", "Barkod" },
            { "sku", "SKU" },
            { "price", "Fiyat" },
            { "unitPrice", "Birim Fiyat" },
            { "costPrice", "Maliyet Fiyatı" },
            { "quantity", "Miktar" },
            { "minStockLevel", "Min. Stok" },
            { "maxStockLevel", "Max. Stok" },
            { "reorderLevel", "Sipariş Seviyesi" },
            { "status", "Durum" },
            { "isActive", "Aktif" },
            { "categoryId", "Kategori" },
            { "brandId", "Marka" },
            { "unitId", "Birim" },
            { "warehouseId", "Depo" },
            { "supplierId", "Tedarikçi" },
            { "email", "E-posta" },
            { "phone", "Telefon" },
            { "address", "Adres" },
            { "city", "Şehir" },
            { "country", "Ülke" },
            { "expiryDate", "SKT" },
            { "manufacturedDate", "Üretim Tarihi" },
            { "lotNumber", "Lot No" },
            { "serialNumber", "Seri No" },
        };

        return labels.GetValueOrDefault(fieldName, fieldName);
    }

    private InventoryAuditLogDto MapToDto(AuditLog auditLog)
    {
        var dto = new InventoryAuditLogDto
        {
            Id = auditLog.Id,
            EntityType = auditLog.EntityName,
            EntityId = auditLog.EntityId,
            EntityName = auditLog.EntityId, // Will be overwritten if available
            Action = auditLog.Action,
            ActionLabel = InventoryAuditActions.Labels.GetValueOrDefault(auditLog.Action, auditLog.Action),
            OldValues = auditLog.OldValues,
            NewValues = auditLog.NewValues,
            UserId = auditLog.UserId,
            UserName = auditLog.UserName,
            UserEmail = auditLog.UserEmail,
            IpAddress = auditLog.IpAddress,
            UserAgent = auditLog.UserAgent,
            Timestamp = auditLog.Timestamp,
            AdditionalData = auditLog.AdditionalData
        };

        // Parse changes
        if (!string.IsNullOrEmpty(auditLog.Changes))
        {
            try
            {
                dto.Changes = JsonSerializer.Deserialize<List<FieldChangeDto>>(auditLog.Changes, JsonOptions);
            }
            catch { }
        }

        // Get entity name from additional data
        if (!string.IsNullOrEmpty(auditLog.AdditionalData))
        {
            try
            {
                var additionalData = JsonSerializer.Deserialize<Dictionary<string, object?>>(auditLog.AdditionalData, JsonOptions);
                if (additionalData?.TryGetValue("entityName", out var name) == true && name != null)
                {
                    dto.EntityName = name.ToString() ?? dto.EntityId;
                }
            }
            catch { }
        }

        return dto;
    }

    #endregion

    #region IInventoryAuditService (Contracts) Implementation

    public async Task LogProductCreatedAsync(
        Guid tenantId,
        int productId,
        string productCode,
        string productName,
        string? createdBy = null,
        CancellationToken cancellationToken = default)
    {
        await LogAsync(
            InventoryEntityTypes.Product,
            productId.ToString(),
            productName,
            InventoryAuditActions.Created,
            additionalData: JsonSerializer.Serialize(new { productCode, createdBy }, JsonOptions),
            cancellationToken: cancellationToken);
    }

    public async Task LogProductUpdatedAsync(
        Guid tenantId,
        int productId,
        string productCode,
        string productName,
        string? changes = null,
        string? updatedBy = null,
        CancellationToken cancellationToken = default)
    {
        await LogAsync(
            InventoryEntityTypes.Product,
            productId.ToString(),
            productName,
            InventoryAuditActions.Updated,
            additionalData: JsonSerializer.Serialize(new { productCode, changes, updatedBy }, JsonOptions),
            cancellationToken: cancellationToken);
    }

    public async Task LogStockMovementAsync(
        Guid tenantId,
        int productId,
        int warehouseId,
        string movementType,
        decimal quantity,
        decimal previousQuantity,
        decimal newQuantity,
        string? reference = null,
        string? performedBy = null,
        CancellationToken cancellationToken = default)
    {
        await LogAsync(
            InventoryEntityTypes.StockMovement,
            $"{productId}-{warehouseId}",
            $"Product {productId} in Warehouse {warehouseId}",
            movementType,
            oldValue: new { quantity = previousQuantity },
            newValue: new { quantity = newQuantity },
            additionalData: JsonSerializer.Serialize(new { movementType, quantity, reference, performedBy }, JsonOptions),
            cancellationToken: cancellationToken);
    }

    public async Task LogStockCountAsync(
        Guid tenantId,
        int stockCountId,
        string countNumber,
        int warehouseId,
        string action,
        string? performedBy = null,
        string? notes = null,
        CancellationToken cancellationToken = default)
    {
        await LogAsync(
            InventoryEntityTypes.StockCount,
            stockCountId.ToString(),
            countNumber,
            action,
            additionalData: JsonSerializer.Serialize(new { warehouseId, performedBy, notes }, JsonOptions),
            cancellationToken: cancellationToken);
    }

    public async Task LogStockAdjustmentAsync(
        Guid tenantId,
        int productId,
        int warehouseId,
        decimal previousQuantity,
        decimal adjustedQuantity,
        decimal newQuantity,
        string adjustmentReason,
        string? reference = null,
        string? performedBy = null,
        CancellationToken cancellationToken = default)
    {
        await LogAsync(
            InventoryEntityTypes.StockAdjustment,
            $"{productId}-{warehouseId}",
            $"Product {productId} Adjustment",
            "Adjusted",
            oldValue: new { quantity = previousQuantity },
            newValue: new { quantity = newQuantity },
            additionalData: JsonSerializer.Serialize(new { adjustedQuantity, adjustmentReason, reference, performedBy }, JsonOptions),
            cancellationToken: cancellationToken);
    }

    public async Task LogLotBatchEventAsync(
        Guid tenantId,
        int lotBatchId,
        string lotNumber,
        int productId,
        string eventType,
        string? details = null,
        string? performedBy = null,
        CancellationToken cancellationToken = default)
    {
        await LogAsync(
            InventoryEntityTypes.LotBatch,
            lotBatchId.ToString(),
            lotNumber,
            eventType,
            additionalData: JsonSerializer.Serialize(new { productId, details, performedBy }, JsonOptions),
            cancellationToken: cancellationToken);
    }

    public async Task LogSerialNumberEventAsync(
        Guid tenantId,
        int serialNumberId,
        string serial,
        int productId,
        string eventType,
        string? details = null,
        string? performedBy = null,
        CancellationToken cancellationToken = default)
    {
        await LogAsync(
            InventoryEntityTypes.SerialNumber,
            serialNumberId.ToString(),
            serial,
            eventType,
            additionalData: JsonSerializer.Serialize(new { productId, details, performedBy }, JsonOptions),
            cancellationToken: cancellationToken);
    }

    public async Task LogPriceListEventAsync(
        Guid tenantId,
        int priceListId,
        string priceListCode,
        string eventType,
        string? details = null,
        string? performedBy = null,
        CancellationToken cancellationToken = default)
    {
        await LogAsync(
            InventoryEntityTypes.PriceList,
            priceListId.ToString(),
            priceListCode,
            eventType,
            additionalData: JsonSerializer.Serialize(new { details, performedBy }, JsonOptions),
            cancellationToken: cancellationToken);
    }

    public async Task LogWarehouseEventAsync(
        Guid tenantId,
        int warehouseId,
        string warehouseCode,
        string eventType,
        string? details = null,
        string? performedBy = null,
        CancellationToken cancellationToken = default)
    {
        await LogAsync(
            InventoryEntityTypes.Warehouse,
            warehouseId.ToString(),
            warehouseCode,
            eventType,
            additionalData: JsonSerializer.Serialize(new { details, performedBy }, JsonOptions),
            cancellationToken: cancellationToken);
    }

    public async Task LogCycleCountEventAsync(
        Guid tenantId,
        int cycleCountId,
        string countNumber,
        int warehouseId,
        int categoryId,
        string eventType,
        string? details = null,
        string? performedBy = null,
        CancellationToken cancellationToken = default)
    {
        await LogAsync(
            InventoryEntityTypes.CycleCount,
            cycleCountId.ToString(),
            countNumber,
            eventType,
            additionalData: JsonSerializer.Serialize(new { warehouseId, categoryId, details, performedBy }, JsonOptions),
            cancellationToken: cancellationToken);
    }

    public async Task LogStockCountEventAsync(
        Guid tenantId,
        int stockCountId,
        string countNumber,
        string eventType,
        string? details = null,
        string? userId = null,
        CancellationToken cancellationToken = default)
    {
        await LogAsync(
            InventoryEntityTypes.StockCount,
            stockCountId.ToString(),
            countNumber,
            eventType,
            additionalData: JsonSerializer.Serialize(new { details, userId }, JsonOptions),
            cancellationToken: cancellationToken);
    }

    #endregion
}
