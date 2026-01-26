using Stocker.Infrastructure.Alerts.Domain;

namespace Stocker.Infrastructure.Alerts.Interfaces;

/// <summary>
/// Fluent builder interface for creating alerts.
/// Provides a clean API for modules to create alerts.
/// </summary>
public interface IAlertBuilder
{
    /// <summary>
    /// Starts building a new alert for a tenant.
    /// </summary>
    IAlertBuilder ForTenant(Guid tenantId);

    /// <summary>
    /// Sets the alert category.
    /// </summary>
    IAlertBuilder WithCategory(AlertCategory category);

    /// <summary>
    /// Sets the alert severity.
    /// </summary>
    IAlertBuilder WithSeverity(AlertSeverity severity);

    /// <summary>
    /// Sets the source module name.
    /// </summary>
    IAlertBuilder FromModule(string moduleName);

    /// <summary>
    /// Sets the alert title and message.
    /// </summary>
    IAlertBuilder WithContent(string title, string message);

    /// <summary>
    /// Targets a specific user.
    /// </summary>
    IAlertBuilder ForUser(Guid userId);

    /// <summary>
    /// Targets users with a specific role.
    /// </summary>
    IAlertBuilder ForRole(string roleName);

    /// <summary>
    /// Adds an action button with URL.
    /// </summary>
    IAlertBuilder WithAction(string url, string label);

    /// <summary>
    /// Links to a related entity for deep linking.
    /// </summary>
    IAlertBuilder WithRelatedEntity(string entityType, Guid entityId);

    /// <summary>
    /// Adds custom metadata.
    /// </summary>
    IAlertBuilder WithMetadata(object metadata);

    /// <summary>
    /// Sets alert expiration.
    /// </summary>
    IAlertBuilder ExpiresAt(DateTime expirationDate);

    /// <summary>
    /// Sets alert expiration relative to now.
    /// </summary>
    IAlertBuilder ExpiresIn(TimeSpan duration);

    /// <summary>
    /// Configures email notification.
    /// </summary>
    IAlertBuilder WithEmailNotification(bool send = true);

    /// <summary>
    /// Configures real-time notification.
    /// </summary>
    IAlertBuilder WithRealTimeNotification(bool send = true);

    /// <summary>
    /// Builds the alert entity.
    /// </summary>
    AlertEntity Build();

    /// <summary>
    /// Builds and immediately sends the alert.
    /// </summary>
    Task<AlertEntity> BuildAndSendAsync(CancellationToken cancellationToken = default);
}

/// <summary>
/// Factory for creating alert builders.
/// </summary>
public interface IAlertBuilderFactory
{
    /// <summary>
    /// Creates a new alert builder.
    /// </summary>
    IAlertBuilder Create();
}
