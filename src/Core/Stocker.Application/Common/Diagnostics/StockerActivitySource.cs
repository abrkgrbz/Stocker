using System.Diagnostics;

namespace Stocker.Application.Common.Diagnostics;

/// <summary>
/// Merkezi ActivitySource tanımları - Distributed Tracing için
/// </summary>
public static class StockerActivitySource
{
    /// <summary>
    /// Application servis adı
    /// </summary>
    public const string ServiceName = "Stocker.API";

    /// <summary>
    /// Ana ActivitySource - Genel işlemler için
    /// </summary>
    public static readonly ActivitySource Main = new(ServiceName, "1.0.0");

    /// <summary>
    /// Inventory modülü ActivitySource
    /// </summary>
    public static readonly ActivitySource Inventory = new($"{ServiceName}.Inventory", "1.0.0");

    /// <summary>
    /// Sales modülü ActivitySource
    /// </summary>
    public static readonly ActivitySource Sales = new($"{ServiceName}.Sales", "1.0.0");

    /// <summary>
    /// Finance modülü ActivitySource
    /// </summary>
    public static readonly ActivitySource Finance = new($"{ServiceName}.Finance", "1.0.0");

    /// <summary>
    /// Identity işlemleri ActivitySource
    /// </summary>
    public static readonly ActivitySource Identity = new($"{ServiceName}.Identity", "1.0.0");

    /// <summary>
    /// Database işlemleri ActivitySource
    /// </summary>
    public static readonly ActivitySource Database = new($"{ServiceName}.Database", "1.0.0");

    /// <summary>
    /// Cache işlemleri ActivitySource
    /// </summary>
    public static readonly ActivitySource Cache = new($"{ServiceName}.Cache", "1.0.0");

    /// <summary>
    /// External API çağrıları ActivitySource
    /// </summary>
    public static readonly ActivitySource ExternalApi = new($"{ServiceName}.ExternalApi", "1.0.0");

    /// <summary>
    /// Tüm ActivitySource'ları döndürür
    /// </summary>
    public static IEnumerable<ActivitySource> GetAllSources()
    {
        yield return Main;
        yield return Inventory;
        yield return Sales;
        yield return Finance;
        yield return Identity;
        yield return Database;
        yield return Cache;
        yield return ExternalApi;
    }
}

/// <summary>
/// Activity extension metodları
/// </summary>
public static class ActivityExtensions
{
    /// <summary>
    /// Activity'e tenant bilgisi ekler
    /// </summary>
    public static Activity? SetTenantId(this Activity? activity, Guid? tenantId)
    {
        if (activity != null && tenantId.HasValue)
        {
            activity.SetTag("tenant.id", tenantId.Value.ToString());
        }
        return activity;
    }

    /// <summary>
    /// Activity'e kullanıcı bilgisi ekler
    /// </summary>
    public static Activity? SetUserId(this Activity? activity, Guid? userId, string? userName = null)
    {
        if (activity != null)
        {
            if (userId.HasValue)
                activity.SetTag("user.id", userId.Value.ToString());
            if (!string.IsNullOrEmpty(userName))
                activity.SetTag("user.name", userName);
        }
        return activity;
    }

    /// <summary>
    /// Activity'e MediatR request bilgisi ekler
    /// </summary>
    public static Activity? SetRequestInfo<TRequest>(this Activity? activity, TRequest request) where TRequest : notnull
    {
        if (activity != null)
        {
            activity.SetTag("mediatr.request.type", typeof(TRequest).Name);
            activity.SetTag("mediatr.request.fullname", typeof(TRequest).FullName);
        }
        return activity;
    }

    /// <summary>
    /// Activity'e hata bilgisi ekler
    /// </summary>
    public static Activity? SetError(this Activity? activity, Exception ex)
    {
        if (activity != null)
        {
            activity.SetStatus(ActivityStatusCode.Error, ex.Message);
            activity.SetTag("error.type", ex.GetType().Name);
            activity.SetTag("error.message", ex.Message);
            activity.AddEvent(new ActivityEvent("exception", tags: new ActivityTagsCollection
            {
                { "exception.type", ex.GetType().FullName },
                { "exception.message", ex.Message },
                { "exception.stacktrace", ex.StackTrace }
            }));
        }
        return activity;
    }

    /// <summary>
    /// Activity'e database işlem bilgisi ekler
    /// </summary>
    public static Activity? SetDbOperation(this Activity? activity, string operation, string? tableName = null)
    {
        if (activity != null)
        {
            activity.SetTag("db.operation", operation);
            if (!string.IsNullOrEmpty(tableName))
                activity.SetTag("db.table", tableName);
        }
        return activity;
    }

    /// <summary>
    /// Activity'e cache işlem bilgisi ekler
    /// </summary>
    public static Activity? SetCacheOperation(this Activity? activity, string operation, string key, bool hit)
    {
        if (activity != null)
        {
            activity.SetTag("cache.operation", operation);
            activity.SetTag("cache.key", key);
            activity.SetTag("cache.hit", hit);
        }
        return activity;
    }
}
