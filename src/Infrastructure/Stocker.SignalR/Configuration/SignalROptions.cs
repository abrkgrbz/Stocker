namespace Stocker.SignalR.Configuration;

/// <summary>
/// Configuration options for SignalR infrastructure
/// </summary>
public class SignalROptions
{
    public const string SectionName = "SignalR";

    /// <summary>
    /// Whether SignalR is enabled
    /// </summary>
    public bool Enabled { get; set; } = true;

    /// <summary>
    /// Keep-alive interval in seconds
    /// </summary>
    public int KeepAliveIntervalSeconds { get; set; } = 15;

    /// <summary>
    /// Client timeout multiplier (multiplied by KeepAliveInterval)
    /// </summary>
    public double ClientTimeoutMultiplier { get; set; } = 2.0;

    /// <summary>
    /// Handshake timeout in seconds
    /// </summary>
    public int HandshakeTimeoutSeconds { get; set; } = 15;

    /// <summary>
    /// Maximum message size in bytes (default: 32KB)
    /// </summary>
    public long MaximumReceiveMessageSize { get; set; } = 32 * 1024;

    /// <summary>
    /// Stream buffer capacity
    /// </summary>
    public int StreamBufferCapacity { get; set; } = 10;

    /// <summary>
    /// Maximum parallel hub method invocations per client
    /// </summary>
    public int MaximumParallelInvocationsPerClient { get; set; } = 1;

    /// <summary>
    /// Whether to enable detailed error messages
    /// </summary>
    public bool EnableDetailedErrors { get; set; } = false;

    /// <summary>
    /// Hub-specific options
    /// </summary>
    public HubOptions Hubs { get; set; } = new();

    /// <summary>
    /// Chat-specific options
    /// </summary>
    public ChatOptions Chat { get; set; } = new();

    /// <summary>
    /// Monitoring-specific options
    /// </summary>
    public MonitoringOptions Monitoring { get; set; } = new();
}

/// <summary>
/// Hub-specific configuration options
/// </summary>
public class HubOptions
{
    /// <summary>
    /// Maximum number of connections per user
    /// </summary>
    public int MaxConnectionsPerUser { get; set; } = 5;

    /// <summary>
    /// Whether to require authentication for hubs
    /// </summary>
    public bool RequireAuthentication { get; set; } = true;

    /// <summary>
    /// Whether to enable hub logging
    /// </summary>
    public bool EnableLogging { get; set; } = true;

    /// <summary>
    /// Log level for hub operations (Trace, Debug, Information, Warning, Error, Critical)
    /// </summary>
    public string LogLevel { get; set; } = "Information";
}

/// <summary>
/// Chat hub configuration options
/// </summary>
public class ChatOptions
{
    /// <summary>
    /// Maximum message length
    /// </summary>
    public int MaxMessageLength { get; set; } = 2000;

    /// <summary>
    /// Maximum messages to keep in history per room
    /// </summary>
    public int MaxMessageHistoryPerRoom { get; set; } = 100;

    /// <summary>
    /// Maximum users per room
    /// </summary>
    public int MaxUsersPerRoom { get; set; } = 100;

    /// <summary>
    /// Maximum rooms per tenant
    /// </summary>
    public int MaxRoomsPerTenant { get; set; } = 50;

    /// <summary>
    /// Message rate limit (messages per minute per user)
    /// </summary>
    public int MessageRateLimitPerMinute { get; set; } = 30;

    /// <summary>
    /// Whether to persist messages to database
    /// </summary>
    public bool PersistMessages { get; set; } = false;
}

/// <summary>
/// Monitoring hub configuration options
/// </summary>
public class MonitoringOptions
{
    /// <summary>
    /// Metrics push interval in seconds
    /// </summary>
    public int MetricsPushIntervalSeconds { get; set; } = 30;

    /// <summary>
    /// Whether to enable real-time metrics
    /// </summary>
    public bool EnableRealTimeMetrics { get; set; } = true;

    /// <summary>
    /// Whether to include detailed system metrics
    /// </summary>
    public bool IncludeSystemMetrics { get; set; } = true;

    /// <summary>
    /// Whether to include database metrics
    /// </summary>
    public bool IncludeDatabaseMetrics { get; set; } = true;

    /// <summary>
    /// Alert threshold for CPU usage percentage
    /// </summary>
    public double CpuAlertThreshold { get; set; } = 80.0;

    /// <summary>
    /// Alert threshold for memory usage percentage
    /// </summary>
    public double MemoryAlertThreshold { get; set; } = 85.0;
}

/// <summary>
/// Extension methods for SignalROptions
/// </summary>
public static class SignalROptionsExtensions
{
    /// <summary>
    /// Gets the client timeout based on keep-alive interval and multiplier
    /// </summary>
    public static TimeSpan GetClientTimeout(this SignalROptions options)
    {
        return TimeSpan.FromSeconds(options.KeepAliveIntervalSeconds * options.ClientTimeoutMultiplier);
    }

    /// <summary>
    /// Gets the keep-alive interval as TimeSpan
    /// </summary>
    public static TimeSpan GetKeepAliveInterval(this SignalROptions options)
    {
        return TimeSpan.FromSeconds(options.KeepAliveIntervalSeconds);
    }

    /// <summary>
    /// Gets the handshake timeout as TimeSpan
    /// </summary>
    public static TimeSpan GetHandshakeTimeout(this SignalROptions options)
    {
        return TimeSpan.FromSeconds(options.HandshakeTimeoutSeconds);
    }

    /// <summary>
    /// Gets the metrics push interval as TimeSpan
    /// </summary>
    public static TimeSpan GetMetricsPushInterval(this SignalROptions options)
    {
        return TimeSpan.FromSeconds(options.Monitoring.MetricsPushIntervalSeconds);
    }
}
