using System.Text.Json;
using Stocker.Infrastructure.Alerts.Domain;
using Stocker.Infrastructure.Alerts.Interfaces;

namespace Stocker.Infrastructure.Alerts.Services;

/// <summary>
/// Fluent builder implementation for creating alerts.
/// </summary>
public class AlertBuilder : IAlertBuilder
{
    private readonly IAlertService _alertService;

    private Guid _tenantId;
    private AlertCategory _category = AlertCategory.System;
    private AlertSeverity _severity = AlertSeverity.Info;
    private string _sourceModule = "System";
    private string _title = string.Empty;
    private string _message = string.Empty;
    private Guid? _userId;
    private string? _targetRole;
    private string? _actionUrl;
    private string? _actionLabel;
    private string? _relatedEntityType;
    private Guid? _relatedEntityId;
    private string? _metadataJson;
    private DateTime? _expiresAt;
    private bool _sendRealTime = true;
    private bool _sendEmail = false;

    public AlertBuilder(IAlertService alertService)
    {
        _alertService = alertService;
    }

    public IAlertBuilder ForTenant(Guid tenantId)
    {
        _tenantId = tenantId;
        return this;
    }

    public IAlertBuilder WithCategory(AlertCategory category)
    {
        _category = category;
        return this;
    }

    public IAlertBuilder WithSeverity(AlertSeverity severity)
    {
        _severity = severity;
        // Auto-enable email for high severity
        if (severity >= AlertSeverity.High)
            _sendEmail = true;
        return this;
    }

    public IAlertBuilder FromModule(string moduleName)
    {
        _sourceModule = moduleName;
        return this;
    }

    public IAlertBuilder WithContent(string title, string message)
    {
        _title = title;
        _message = message;
        return this;
    }

    public IAlertBuilder ForUser(Guid userId)
    {
        _userId = userId;
        return this;
    }

    public IAlertBuilder ForRole(string roleName)
    {
        _targetRole = roleName;
        return this;
    }

    public IAlertBuilder WithAction(string url, string label)
    {
        _actionUrl = url;
        _actionLabel = label;
        return this;
    }

    public IAlertBuilder WithRelatedEntity(string entityType, Guid entityId)
    {
        _relatedEntityType = entityType;
        _relatedEntityId = entityId;
        return this;
    }

    public IAlertBuilder WithMetadata(object metadata)
    {
        _metadataJson = JsonSerializer.Serialize(metadata);
        return this;
    }

    public IAlertBuilder ExpiresAt(DateTime expirationDate)
    {
        _expiresAt = expirationDate;
        return this;
    }

    public IAlertBuilder ExpiresIn(TimeSpan duration)
    {
        _expiresAt = DateTime.UtcNow.Add(duration);
        return this;
    }

    public IAlertBuilder WithEmailNotification(bool send = true)
    {
        _sendEmail = send;
        return this;
    }

    public IAlertBuilder WithRealTimeNotification(bool send = true)
    {
        _sendRealTime = send;
        return this;
    }

    public AlertEntity Build()
    {
        var alert = AlertEntity.Create(
            _tenantId,
            _category,
            _severity,
            _sourceModule,
            _title,
            _message);

        if (_userId.HasValue)
            alert.ForUser(_userId.Value);

        if (!string.IsNullOrEmpty(_targetRole))
            alert.ForRole(_targetRole);

        if (!string.IsNullOrEmpty(_actionUrl) && !string.IsNullOrEmpty(_actionLabel))
            alert.WithAction(_actionUrl, _actionLabel);

        if (!string.IsNullOrEmpty(_relatedEntityType) && _relatedEntityId.HasValue)
            alert.WithRelatedEntity(_relatedEntityType, _relatedEntityId.Value);

        if (!string.IsNullOrEmpty(_metadataJson))
            alert.WithMetadata(_metadataJson);

        if (_expiresAt.HasValue)
            alert.WithExpiration(_expiresAt.Value);

        alert.WithEmailNotification(_sendEmail);
        alert.WithRealTimeNotification(_sendRealTime);

        return alert;
    }

    public async Task<AlertEntity> BuildAndSendAsync(CancellationToken cancellationToken = default)
    {
        var alert = Build();
        var result = await _alertService.CreateAlertAsync(alert, cancellationToken);

        if (!result.IsSuccess)
            throw new InvalidOperationException($"Failed to create alert: {result.Error?.Description}");

        return result.Value!;
    }
}

/// <summary>
/// Factory for creating alert builders.
/// </summary>
public class AlertBuilderFactory : IAlertBuilderFactory
{
    private readonly IAlertService _alertService;

    public AlertBuilderFactory(IAlertService alertService)
    {
        _alertService = alertService;
    }

    public IAlertBuilder Create()
    {
        return new AlertBuilder(_alertService);
    }
}
