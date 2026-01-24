using System.Collections.Concurrent;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.Extensions.Logging;

namespace Stocker.Modules.Inventory.Infrastructure.Integration;

/// <summary>
/// Webhook event types that can trigger notifications.
/// </summary>
public enum WebhookEventType
{
    StockLevelChanged,
    StockLowAlert,
    StockOutAlert,
    TransferCreated,
    TransferCompleted,
    TransferCancelled,
    AdjustmentCreated,
    ProductCreated,
    ProductUpdated,
    ProductDeleted,
    LotExpiring,
    LotExpired,
    ReservationCreated,
    ReservationExpired
}

/// <summary>
/// Webhook subscription configuration.
/// </summary>
public class WebhookSubscription
{
    public Guid Id { get; init; } = Guid.NewGuid();
    public Guid TenantId { get; init; }
    public string Url { get; init; } = string.Empty;
    public string? Secret { get; init; }
    public WebhookEventType[] Events { get; init; } = Array.Empty<WebhookEventType>();
    public bool IsActive { get; set; } = true;
    public int MaxRetries { get; init; } = 3;
    public DateTime CreatedAt { get; init; } = DateTime.UtcNow;
    public int ConsecutiveFailures { get; set; }
    public DateTime? LastSuccessAt { get; set; }
    public DateTime? LastFailureAt { get; set; }
}

/// <summary>
/// Webhook delivery payload.
/// </summary>
public class WebhookPayload
{
    public Guid Id { get; init; } = Guid.NewGuid();
    public WebhookEventType EventType { get; init; }
    public Guid TenantId { get; init; }
    public DateTime OccurredAt { get; init; } = DateTime.UtcNow;
    public object? Data { get; init; }
    public string? CorrelationId { get; init; }
}

/// <summary>
/// Webhook delivery result.
/// </summary>
public class WebhookDeliveryResult
{
    public Guid PayloadId { get; init; }
    public Guid SubscriptionId { get; init; }
    public bool Success { get; init; }
    public int StatusCode { get; init; }
    public int AttemptNumber { get; init; }
    public string? ErrorMessage { get; init; }
    public DateTime DeliveredAt { get; init; } = DateTime.UtcNow;
    public TimeSpan Duration { get; init; }
}

/// <summary>
/// Webhook notification service for sending inventory events to external systems.
/// Supports retry logic, signature verification, and delivery tracking.
/// </summary>
public class WebhookService
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ILogger<WebhookService> _logger;
    private readonly ConcurrentDictionary<Guid, WebhookSubscription> _subscriptions = new();
    private readonly ConcurrentQueue<WebhookDeliveryResult> _deliveryLog = new();
    private const int MaxDeliveryLogSize = 1000;
    private const int MaxConsecutiveFailuresBeforeDisable = 10;

    public WebhookService(
        IHttpClientFactory httpClientFactory,
        ILogger<WebhookService> logger)
    {
        _httpClientFactory = httpClientFactory;
        _logger = logger;
    }

    /// <summary>
    /// Register a webhook subscription.
    /// </summary>
    public WebhookSubscription Subscribe(WebhookSubscription subscription)
    {
        _subscriptions[subscription.Id] = subscription;
        _logger.LogInformation(
            "Webhook subscription registered: {SubscriptionId} for tenant {TenantId}, events: {Events}",
            subscription.Id, subscription.TenantId, string.Join(", ", subscription.Events));
        return subscription;
    }

    /// <summary>
    /// Remove a webhook subscription.
    /// </summary>
    public bool Unsubscribe(Guid subscriptionId)
    {
        var removed = _subscriptions.TryRemove(subscriptionId, out _);
        if (removed)
            _logger.LogInformation("Webhook subscription removed: {SubscriptionId}", subscriptionId);
        return removed;
    }

    /// <summary>
    /// Get all subscriptions for a tenant.
    /// </summary>
    public IReadOnlyList<WebhookSubscription> GetSubscriptions(Guid tenantId)
    {
        return _subscriptions.Values
            .Where(s => s.TenantId == tenantId)
            .ToList()
            .AsReadOnly();
    }

    /// <summary>
    /// Dispatch a webhook event to all matching subscriptions.
    /// </summary>
    public async Task<IReadOnlyList<WebhookDeliveryResult>> DispatchAsync(
        WebhookPayload payload,
        CancellationToken cancellationToken = default)
    {
        var matchingSubscriptions = _subscriptions.Values
            .Where(s => s.TenantId == payload.TenantId
                     && s.IsActive
                     && s.Events.Contains(payload.EventType))
            .ToList();

        if (matchingSubscriptions.Count == 0)
        {
            _logger.LogDebug("No active subscriptions for event {EventType} on tenant {TenantId}",
                payload.EventType, payload.TenantId);
            return Array.Empty<WebhookDeliveryResult>();
        }

        var results = new List<WebhookDeliveryResult>();

        foreach (var subscription in matchingSubscriptions)
        {
            var result = await DeliverWithRetryAsync(payload, subscription, cancellationToken);
            results.Add(result);
            TrackDelivery(result);
        }

        return results.AsReadOnly();
    }

    /// <summary>
    /// Deliver webhook with retry logic.
    /// </summary>
    private async Task<WebhookDeliveryResult> DeliverWithRetryAsync(
        WebhookPayload payload,
        WebhookSubscription subscription,
        CancellationToken cancellationToken)
    {
        for (int attempt = 1; attempt <= subscription.MaxRetries; attempt++)
        {
            var result = await AttemptDeliveryAsync(payload, subscription, attempt, cancellationToken);

            if (result.Success)
            {
                subscription.ConsecutiveFailures = 0;
                subscription.LastSuccessAt = DateTime.UtcNow;
                return result;
            }

            if (attempt < subscription.MaxRetries)
            {
                // Exponential backoff: 1s, 2s, 4s...
                var delay = TimeSpan.FromSeconds(Math.Pow(2, attempt - 1));
                await Task.Delay(delay, cancellationToken);
            }
            else
            {
                // All retries exhausted
                subscription.ConsecutiveFailures++;
                subscription.LastFailureAt = DateTime.UtcNow;

                if (subscription.ConsecutiveFailures >= MaxConsecutiveFailuresBeforeDisable)
                {
                    subscription.IsActive = false;
                    _logger.LogWarning(
                        "Webhook subscription {SubscriptionId} disabled after {Failures} consecutive failures",
                        subscription.Id, subscription.ConsecutiveFailures);
                }

                return result;
            }
        }

        // Should not reach here, but fallback
        return new WebhookDeliveryResult
        {
            PayloadId = payload.Id,
            SubscriptionId = subscription.Id,
            Success = false,
            ErrorMessage = "Max retries exceeded"
        };
    }

    /// <summary>
    /// Attempt a single webhook delivery.
    /// </summary>
    private async Task<WebhookDeliveryResult> AttemptDeliveryAsync(
        WebhookPayload payload,
        WebhookSubscription subscription,
        int attemptNumber,
        CancellationToken cancellationToken)
    {
        var startTime = DateTime.UtcNow;

        try
        {
            using var client = _httpClientFactory.CreateClient("Webhook");
            client.Timeout = TimeSpan.FromSeconds(10);

            var jsonPayload = JsonSerializer.Serialize(payload, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                WriteIndented = false
            });

            using var request = new HttpRequestMessage(HttpMethod.Post, subscription.Url);
            request.Content = new StringContent(jsonPayload, System.Text.Encoding.UTF8, "application/json");

            // Add webhook headers
            request.Headers.Add("X-Webhook-Id", payload.Id.ToString());
            request.Headers.Add("X-Webhook-Event", payload.EventType.ToString());
            request.Headers.Add("X-Webhook-Timestamp", payload.OccurredAt.ToString("O"));
            request.Headers.Add("X-Webhook-Attempt", attemptNumber.ToString());

            // Add HMAC signature if secret is configured
            if (!string.IsNullOrEmpty(subscription.Secret))
            {
                var signature = ComputeHmacSignature(jsonPayload, subscription.Secret);
                request.Headers.Add("X-Webhook-Signature", $"sha256={signature}");
            }

            var response = await client.SendAsync(request, cancellationToken);
            var duration = DateTime.UtcNow - startTime;

            var result = new WebhookDeliveryResult
            {
                PayloadId = payload.Id,
                SubscriptionId = subscription.Id,
                Success = response.IsSuccessStatusCode,
                StatusCode = (int)response.StatusCode,
                AttemptNumber = attemptNumber,
                Duration = duration
            };

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning(
                    "Webhook delivery failed: {SubscriptionId} attempt {Attempt}, status {StatusCode}",
                    subscription.Id, attemptNumber, (int)response.StatusCode);
            }

            return result;
        }
        catch (Exception ex) when (ex is HttpRequestException or TaskCanceledException or OperationCanceledException)
        {
            var duration = DateTime.UtcNow - startTime;

            _logger.LogWarning(ex,
                "Webhook delivery error: {SubscriptionId} attempt {Attempt}",
                subscription.Id, attemptNumber);

            return new WebhookDeliveryResult
            {
                PayloadId = payload.Id,
                SubscriptionId = subscription.Id,
                Success = false,
                AttemptNumber = attemptNumber,
                ErrorMessage = ex.Message,
                Duration = duration
            };
        }
    }

    /// <summary>
    /// Compute HMAC-SHA256 signature for payload verification.
    /// </summary>
    private static string ComputeHmacSignature(string payload, string secret)
    {
        using var hmac = new System.Security.Cryptography.HMACSHA256(
            System.Text.Encoding.UTF8.GetBytes(secret));
        var hash = hmac.ComputeHash(System.Text.Encoding.UTF8.GetBytes(payload));
        return Convert.ToHexString(hash).ToLowerInvariant();
    }

    /// <summary>
    /// Track delivery result in bounded log.
    /// </summary>
    private void TrackDelivery(WebhookDeliveryResult result)
    {
        _deliveryLog.Enqueue(result);
        while (_deliveryLog.Count > MaxDeliveryLogSize)
            _deliveryLog.TryDequeue(out _);
    }

    /// <summary>
    /// Get recent delivery results for diagnostics.
    /// </summary>
    public IReadOnlyList<WebhookDeliveryResult> GetRecentDeliveries(int count = 50)
    {
        return _deliveryLog.ToArray()
            .OrderByDescending(d => d.DeliveredAt)
            .Take(count)
            .ToList()
            .AsReadOnly();
    }
}
