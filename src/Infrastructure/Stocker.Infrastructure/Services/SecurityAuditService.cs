using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Interfaces;
using Stocker.Domain.Master.Entities;
using System.Net;
using System.Text.Json;

namespace Stocker.Infrastructure.Services;

/// <summary>
/// Implementation of security audit logging service
/// </summary>
public class SecurityAuditService : ISecurityAuditService
{
    private readonly IMasterDbContext _masterDbContext;
    private readonly ILogger<SecurityAuditService> _logger;

    public SecurityAuditService(
        IMasterDbContext masterDbContext,
        ILogger<SecurityAuditService> logger)
    {
        _masterDbContext = masterDbContext;
        _logger = logger;
    }

    public async Task LogAuthEventAsync(SecurityAuditEvent evt, CancellationToken cancellationToken = default)
    {
        try
        {
            var auditLog = SecurityAuditLog.CreateAuthEvent(
                evt.Event,
                evt.Email ?? "unknown",
                evt.TenantCode,
                evt.UserId,
                NormalizeIpAddress(evt.IpAddress),
                evt.UserAgent);

            if (!string.IsNullOrEmpty(evt.RequestId))
                auditLog.WithRequestInfo(evt.RequestId, evt.UserAgent);

            if (!string.IsNullOrEmpty(evt.Metadata))
                auditLog.WithMetadata(evt.Metadata);

            if (evt.DurationMs.HasValue)
                auditLog.WithDuration(evt.DurationMs.Value);

            if (evt.RiskScore.HasValue)
                auditLog.WithRiskScore(evt.RiskScore.Value);

            if (evt.Blocked)
                auditLog.MarkAsBlocked();

            _masterDbContext.SecurityAuditLogs.Add(auditLog);
            await _masterDbContext.SaveChangesAsync(cancellationToken);

            _logger.LogInformation(
                "Auth event logged: {Event} for {Email} from {IpAddress}",
                evt.Event, evt.Email, evt.IpAddress);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "Failed to log auth event: {Event} for {Email}",
                evt.Event, evt.Email);
            // Don't throw - audit logging should not break the main flow
        }
    }

    public async Task LogSecurityEventAsync(SecurityAuditEvent evt, CancellationToken cancellationToken = default)
    {
        try
        {
            var auditLog = SecurityAuditLog.CreateSecurityEvent(
                evt.Event,
                evt.Email,
                evt.TenantCode,
                NormalizeIpAddress(evt.IpAddress),
                evt.RiskScore,
                evt.Blocked);

            if (!string.IsNullOrEmpty(evt.RequestId))
                auditLog.WithRequestInfo(evt.RequestId, evt.UserAgent);

            if (!string.IsNullOrEmpty(evt.Metadata))
                auditLog.WithMetadata(evt.Metadata);

            if (evt.DurationMs.HasValue)
                auditLog.WithDuration(evt.DurationMs.Value);

            _masterDbContext.SecurityAuditLogs.Add(auditLog);
            await _masterDbContext.SaveChangesAsync(cancellationToken);

            _logger.LogWarning(
                "Security event logged: {Event} - Email: {Email}, IP: {IpAddress}, RiskScore: {RiskScore}, Blocked: {Blocked}",
                evt.Event, evt.Email, evt.IpAddress, evt.RiskScore, evt.Blocked);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "Failed to log security event: {Event} for {Email}",
                evt.Event, evt.Email);
            // Don't throw - audit logging should not break the main flow
        }
    }

    public async Task<IEnumerable<SecurityAuditEvent>> GetAuditLogsAsync(
        SecurityAuditFilter filter,
        CancellationToken cancellationToken = default)
    {
        var query = _masterDbContext.SecurityAuditLogs.AsQueryable();

        // Apply filters
        if (!string.IsNullOrEmpty(filter.Email))
            query = query.Where(a => a.Email == filter.Email);

        if (!string.IsNullOrEmpty(filter.TenantCode))
            query = query.Where(a => a.TenantCode == filter.TenantCode);

        if (!string.IsNullOrEmpty(filter.IpAddress))
            query = query.Where(a => a.IpAddress == filter.IpAddress);

        if (!string.IsNullOrEmpty(filter.Event))
            query = query.Where(a => a.Event == filter.Event);

        if (filter.MinRiskScore.HasValue)
            query = query.Where(a => a.RiskScore >= filter.MinRiskScore.Value);

        if (filter.BlockedOnly == true)
            query = query.Where(a => a.Blocked);

        if (filter.FromDate.HasValue)
            query = query.Where(a => a.Timestamp >= filter.FromDate.Value);

        if (filter.ToDate.HasValue)
            query = query.Where(a => a.Timestamp <= filter.ToDate.Value);

        // Order by most recent first
        query = query.OrderByDescending(a => a.Timestamp);

        // Apply pagination
        var skip = (filter.PageNumber - 1) * filter.PageSize;
        query = query.Skip(skip).Take(filter.PageSize);

        var results = await query.ToListAsync(cancellationToken);

        return results.Select(MapToEvent);
    }

    public async Task<int> GetFailedLoginAttemptsAsync(
        string email,
        TimeSpan timeWindow,
        CancellationToken cancellationToken = default)
    {
        var cutoffTime = DateTime.UtcNow - timeWindow;

        var count = await _masterDbContext.SecurityAuditLogs
            .Where(a => a.Email == email &&
                       a.Event == "login_failed" &&
                       a.Timestamp >= cutoffTime)
            .CountAsync(cancellationToken);

        return count;
    }

    public async Task<int> GetSuspiciousActivityCountAsync(
        string ipAddress,
        TimeSpan timeWindow,
        CancellationToken cancellationToken = default)
    {
        var cutoffTime = DateTime.UtcNow - timeWindow;

        var count = await _masterDbContext.SecurityAuditLogs
            .Where(a => a.IpAddress == ipAddress &&
                       (a.RiskScore >= 50 || a.Blocked) &&
                       a.Timestamp >= cutoffTime)
            .CountAsync(cancellationToken);

        return count;
    }

    public async Task<bool> HasUnusualLoginPatternAsync(
        string email,
        string ipAddress,
        string? userAgent = null,
        CancellationToken cancellationToken = default)
    {
        // Get recent successful logins (last 30 days)
        var cutoffTime = DateTime.UtcNow.AddDays(-30);

        var recentLogins = await _masterDbContext.SecurityAuditLogs
            .Where(a => a.Email == email &&
                       a.Event == "login_success" &&
                       a.Timestamp >= cutoffTime)
            .OrderByDescending(a => a.Timestamp)
            .Take(20)
            .ToListAsync(cancellationToken);

        if (!recentLogins.Any())
            return false; // First login, not unusual

        // Check if this IP was used before
        var knownIp = recentLogins.Any(a => a.IpAddress == ipAddress);
        if (!knownIp)
        {
            _logger.LogWarning(
                "Unusual login pattern detected: New IP address {IpAddress} for user {Email}",
                ipAddress, email);
            return true;
        }

        // Check if user agent is significantly different
        if (!string.IsNullOrEmpty(userAgent))
        {
            var knownUserAgents = recentLogins
                .Where(a => !string.IsNullOrEmpty(a.UserAgent))
                .Select(a => a.UserAgent)
                .Distinct()
                .ToList();

            // Simple check: if user agent is completely new
            var similarUserAgent = knownUserAgents.Any(ua =>
                ua!.Contains(ExtractBrowserInfo(userAgent)) ||
                ExtractBrowserInfo(userAgent).Contains(ua));

            if (!similarUserAgent && knownUserAgents.Any())
            {
                _logger.LogWarning(
                    "Unusual login pattern detected: New user agent for user {Email}",
                    email);
                return true;
            }
        }

        return false;
    }

    private static SecurityAuditEvent MapToEvent(SecurityAuditLog log)
    {
        return new SecurityAuditEvent
        {
            Event = log.Event,
            Email = log.Email,
            TenantCode = log.TenantCode,
            UserId = log.UserId,
            IpAddress = log.IpAddress,
            UserAgent = log.UserAgent,
            RequestId = log.RequestId,
            RiskScore = log.RiskScore,
            Blocked = log.Blocked,
            Metadata = log.Metadata,
            DurationMs = log.DurationMs,
            GdprCategory = log.GdprCategory
        };
    }

    private static string ExtractBrowserInfo(string userAgent)
    {
        // Simple browser extraction (Chrome, Firefox, Safari, Edge, etc.)
        if (userAgent.Contains("Chrome")) return "Chrome";
        if (userAgent.Contains("Firefox")) return "Firefox";
        if (userAgent.Contains("Safari")) return "Safari";
        if (userAgent.Contains("Edge")) return "Edge";
        return "Unknown";
    }

    /// <summary>
    /// Normalizes IP address by removing IPv6 prefix from IPv4-mapped addresses
    /// Converts "::ffff:10.0.1.4" to "10.0.1.4"
    /// </summary>
    private static string? NormalizeIpAddress(string? ipAddress)
    {
        if (string.IsNullOrEmpty(ipAddress))
            return ipAddress;

        // Try to parse as IP address
        if (IPAddress.TryParse(ipAddress, out var parsedIp))
        {
            // If it's an IPv4-mapped IPv6 address, extract the IPv4 part
            if (parsedIp.IsIPv4MappedToIPv6)
            {
                return parsedIp.MapToIPv4().ToString();
            }

            // Return the normalized IP address
            return parsedIp.ToString();
        }

        // If parsing fails, return as-is
        return ipAddress;
    }
}
