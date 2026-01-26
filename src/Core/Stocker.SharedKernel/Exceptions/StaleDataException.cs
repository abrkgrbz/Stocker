namespace Stocker.SharedKernel.Exceptions;

/// <summary>
/// Exception thrown when data is stale (outdated beyond acceptable threshold).
/// Used for critical data like exchange rates, price lists, etc.
/// Bayat veri istisnası - döviz kurları, fiyat listeleri gibi kritik veriler için
/// </summary>
public class StaleDataException : DomainException
{
    /// <summary>
    /// The type of data that is stale
    /// </summary>
    public string DataType { get; }

    /// <summary>
    /// When the data was last updated
    /// </summary>
    public DateTime LastUpdated { get; }

    /// <summary>
    /// Maximum allowed age for the data
    /// </summary>
    public TimeSpan MaxAllowedAge { get; }

    /// <summary>
    /// How old the data actually is
    /// </summary>
    public TimeSpan ActualAge { get; }

    public StaleDataException(string dataType, DateTime lastUpdated, TimeSpan maxAllowedAge)
        : base($"{dataType} data is stale. Last updated: {lastUpdated:yyyy-MM-dd HH:mm:ss} UTC. " +
               $"Maximum allowed age: {maxAllowedAge.TotalHours:F1} hours. " +
               $"Please update the data or contact system administrator.")
    {
        DataType = dataType;
        LastUpdated = lastUpdated;
        MaxAllowedAge = maxAllowedAge;
        ActualAge = DateTime.UtcNow - lastUpdated;
    }

    public StaleDataException(string message) : base(message)
    {
        DataType = "Unknown";
        LastUpdated = DateTime.MinValue;
        MaxAllowedAge = TimeSpan.Zero;
        ActualAge = TimeSpan.MaxValue;
    }

    public StaleDataException(string message, Exception innerException) : base(message, innerException)
    {
        DataType = "Unknown";
        LastUpdated = DateTime.MinValue;
        MaxAllowedAge = TimeSpan.Zero;
        ActualAge = TimeSpan.MaxValue;
    }
}
