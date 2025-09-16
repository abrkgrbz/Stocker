using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Interfaces;
using Stocker.Domain.Tenant.Entities;
using System.Collections.Concurrent;
using System.Text.Json;
using System.Threading.Channels;

namespace Stocker.Infrastructure.Services;

/// <summary>
/// Enhanced audit service with async batch processing and caching
/// </summary>
public class EnhancedAuditService : IAuditService, IDisposable
{
    private readonly ITenantDbContext _context;
    private readonly Application.Common.Interfaces.ICurrentUserService _currentUserService;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly ICacheService _cacheService;
    private readonly ILogger<EnhancedAuditService> _logger;
    
    // Batch processing
    private readonly Channel<AuditLogEntry> _auditChannel;
    private readonly CancellationTokenSource _cancellationTokenSource;
    private readonly Task _processingTask;
    private readonly int _batchSize = 50;
    private readonly TimeSpan _batchTimeout = TimeSpan.FromSeconds(5);
    
    // Cache for frequently accessed audit logs
    private readonly string _cacheKeyPrefix = "audit:";
    private readonly TimeSpan _cacheExpiry = TimeSpan.FromMinutes(5);

    public EnhancedAuditService(
        ITenantDbContext context,
        Application.Common.Interfaces.ICurrentUserService currentUserService,
        IHttpContextAccessor httpContextAccessor,
        ICacheService cacheService,
        ILogger<EnhancedAuditService> logger)
    {
        _context = context;
        _currentUserService = currentUserService;
        _httpContextAccessor = httpContextAccessor;
        _cacheService = cacheService;
        _logger = logger;
        
        // Only initialize processing if we have a valid tenant context
        if (_context != null)
        {
            // Initialize channel for async processing
            _auditChannel = Channel.CreateUnbounded<AuditLogEntry>(new UnboundedChannelOptions
            {
                SingleReader = true,
                SingleWriter = false
            });
            
            _cancellationTokenSource = new CancellationTokenSource();
            _processingTask = ProcessAuditLogsAsync(_cancellationTokenSource.Token);
        }
        else
        {
            _logger.LogDebug("EnhancedAuditService initialized without tenant context - audit logging disabled for this request");
        }
    }

    public async Task LogAsync(
        string entityName,
        string entityId,
        string action,
        object? oldValues = null,
        object? newValues = null,
        Dictionary<string, object>? additionalData = null)
    {
        try
        {
            // Skip audit logging if no tenant context available
            if (_context == null || _auditChannel == null)
            {
                _logger.LogDebug("Skipping audit log - no tenant context available");
                return;
            }
            
            if (!Guid.TryParse(_currentUserService.TenantId, out var tenantId) || tenantId == Guid.Empty)
            {
                _logger.LogWarning("Cannot create audit log without tenant ID");
                return;
            }

            var entry = CreateAuditLogEntry(
                tenantId,
                entityName,
                entityId,
                action,
                oldValues,
                newValues,
                additionalData);

            // Queue for async processing
            await _auditChannel.Writer.WriteAsync(entry);
            
            // Cache recent audit for quick retrieval
            await CacheAuditLogAsync(entry);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error queuing audit log for {EntityName}:{EntityId}", entityName, entityId);
        }
    }

    public async Task LogSettingChangeAsync(
        string settingKey,
        string? oldValue,
        string newValue,
        Dictionary<string, object>? additionalData = null)
    {
        await LogAsync(
            "TenantSetting",
            settingKey,
            "SettingChanged",
            oldValue != null ? new { Value = oldValue } : null,
            new { Value = newValue },
            additionalData);
    }

    public async Task LogModuleToggleAsync(
        string moduleCode,
        bool oldStatus,
        bool newStatus,
        Dictionary<string, object>? additionalData = null)
    {
        await LogAsync(
            "Module",
            moduleCode,
            newStatus ? "Activated" : "Deactivated",
            new { IsActive = oldStatus },
            new { IsActive = newStatus },
            additionalData);
    }

    public async Task LogSecurityEventAsync(
        string eventType,
        string description,
        Dictionary<string, object>? additionalData = null)
    {
        var data = additionalData ?? new Dictionary<string, object>();
        data["EventType"] = eventType;
        data["Description"] = description;
        data["Severity"] = DetermineSeverity(eventType);
        
        await LogAsync(
            "SecurityEvent",
            Guid.NewGuid().ToString(),
            eventType,
            null,
            null,
            data);
    }

    public async Task LogPerformanceEventAsync(
        string operation,
        long elapsedMilliseconds,
        Dictionary<string, object>? additionalData = null)
    {
        if (elapsedMilliseconds > 1000) // Only log slow operations
        {
            var data = additionalData ?? new Dictionary<string, object>();
            data["ElapsedMs"] = elapsedMilliseconds;
            data["Operation"] = operation;
            
            await LogAsync(
                "PerformanceEvent",
                Guid.NewGuid().ToString(),
                "SlowOperation",
                null,
                null,
                data);
        }
    }

    private AuditLogEntry CreateAuditLogEntry(
        Guid tenantId,
        string entityName,
        string entityId,
        string action,
        object? oldValues,
        object? newValues,
        Dictionary<string, object>? additionalData)
    {
        var httpContext = _httpContextAccessor.HttpContext;
        
        return new AuditLogEntry
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            EntityName = entityName,
            EntityId = entityId,
            Action = action,
            UserId = _currentUserService.UserId?.ToString() ?? Guid.Empty.ToString(),
            UserName = _currentUserService.UserName ?? "System",
            UserEmail = _currentUserService.Email,
            IpAddress = GetClientIpAddress(httpContext),
            UserAgent = httpContext?.Request.Headers["User-Agent"].ToString(),
            OldValues = oldValues != null ? JsonSerializer.Serialize(oldValues, GetJsonOptions()) : null,
            NewValues = newValues != null ? JsonSerializer.Serialize(newValues, GetJsonOptions()) : null,
            AdditionalData = additionalData != null ? JsonSerializer.Serialize(additionalData, GetJsonOptions()) : null,
            Timestamp = DateTime.UtcNow
        };
    }

    private async Task ProcessAuditLogsAsync(CancellationToken cancellationToken)
    {
        var batch = new List<AuditLogEntry>(_batchSize);
        var lastFlush = DateTime.UtcNow;

        await foreach (var entry in _auditChannel.Reader.ReadAllAsync(cancellationToken))
        {
            batch.Add(entry);

            var shouldFlush = batch.Count >= _batchSize || 
                             DateTime.UtcNow - lastFlush > _batchTimeout;

            if (shouldFlush && batch.Count > 0)
            {
                await FlushBatchAsync(batch, cancellationToken);
                batch.Clear();
                lastFlush = DateTime.UtcNow;
            }
        }

        // Flush any remaining items
        if (batch.Count > 0)
        {
            await FlushBatchAsync(batch, cancellationToken);
        }
    }

    private async Task FlushBatchAsync(List<AuditLogEntry> batch, CancellationToken cancellationToken)
    {
        try
        {
            var auditLogs = batch.Select(entry => AuditLog.Create(
                entry.TenantId,
                entry.EntityName,
                entry.EntityId,
                entry.Action,
                entry.UserId,
                entry.UserName,
                entry.UserEmail,
                entry.IpAddress,
                entry.UserAgent
            )).ToList();

            // Set values
            for (int i = 0; i < auditLogs.Count; i++)
            {
                if (batch[i].OldValues != null)
                    auditLogs[i].SetOldValues(batch[i].OldValues);
                
                if (batch[i].NewValues != null)
                    auditLogs[i].SetNewValues(batch[i].NewValues);
                
                if (batch[i].AdditionalData != null)
                    auditLogs[i].SetAdditionalData(batch[i].AdditionalData);
            }

            await _context.AuditLogs.AddRangeAsync(auditLogs, cancellationToken);
            await _context.SaveChangesAsync(cancellationToken);
            
            _logger.LogDebug("Flushed {Count} audit logs to database", batch.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error flushing audit log batch of {Count} items", batch.Count);
        }
    }

    private async Task CacheAuditLogAsync(AuditLogEntry entry)
    {
        try
        {
            var cacheKey = $"{_cacheKeyPrefix}{entry.EntityName}:{entry.EntityId}:latest";
            await _cacheService.SetAsync(cacheKey, entry, _cacheExpiry);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to cache audit log entry");
        }
    }

    private string? GetClientIpAddress(HttpContext? context)
    {
        if (context == null)
            return null;

        // Check for forwarded IP (behind proxy/load balancer)
        var forwardedFor = context.Request.Headers["X-Forwarded-For"].FirstOrDefault();
        if (!string.IsNullOrEmpty(forwardedFor))
        {
            return forwardedFor.Split(',').First().Trim();
        }

        // Check for real IP header
        var realIp = context.Request.Headers["X-Real-IP"].FirstOrDefault();
        if (!string.IsNullOrEmpty(realIp))
        {
            return realIp;
        }

        // Fall back to remote IP
        return context.Connection.RemoteIpAddress?.ToString();
    }

    private string DetermineSeverity(string eventType)
    {
        return eventType switch
        {
            "LoginFailed" => "Warning",
            "UnauthorizedAccess" => "Critical",
            "DataExport" => "Info",
            "ConfigurationChange" => "Warning",
            _ => "Info"
        };
    }

    private JsonSerializerOptions GetJsonOptions()
    {
        return new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true,
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            WriteIndented = false
        };
    }

    public void Dispose()
    {
        if (_auditChannel != null)
        {
            _auditChannel.Writer.TryComplete();
        }
        
        if (_cancellationTokenSource != null)
        {
            _cancellationTokenSource.Cancel();
        }
        
        if (_processingTask != null)
        {
            try
            {
                _processingTask.Wait(TimeSpan.FromSeconds(5));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during audit service disposal");
            }
        }
        
        _cancellationTokenSource?.Dispose();
    }

    private class AuditLogEntry
    {
        public Guid Id { get; set; }
        public Guid TenantId { get; set; }
        public string EntityName { get; set; } = string.Empty;
        public string EntityId { get; set; } = string.Empty;
        public string Action { get; set; } = string.Empty;
        public string UserId { get; set; } = string.Empty;
        public string UserName { get; set; } = string.Empty;
        public string? UserEmail { get; set; }
        public string? IpAddress { get; set; }
        public string? UserAgent { get; set; }
        public string? OldValues { get; set; }
        public string? NewValues { get; set; }
        public string? AdditionalData { get; set; }
        public DateTime Timestamp { get; set; }
    }
}