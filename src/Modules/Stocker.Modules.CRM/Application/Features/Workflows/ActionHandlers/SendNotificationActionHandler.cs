using System.Text.Json;
using Microsoft.Extensions.Logging;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.Modules.CRM.Domain.Enums;
using Stocker.Modules.CRM.Infrastructure.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Workflows.ActionHandlers;

/// <summary>
/// Handles SendNotification workflow actions for in-app notifications
/// </summary>
public class SendNotificationActionHandler : IWorkflowActionHandler
{
    private readonly INotificationRepository _notificationRepository;
    private readonly ILogger<SendNotificationActionHandler> _logger;

    public SendNotificationActionHandler(
        INotificationRepository notificationRepository,
        ILogger<SendNotificationActionHandler> logger)
    {
        _notificationRepository = notificationRepository;
        _logger = logger;
    }

    public bool CanHandle(string actionType)
    {
        return actionType == WorkflowActionType.SendNotification.ToString() ||
               actionType == nameof(WorkflowActionType.SendNotification);
    }

    public async Task<Result<WorkflowActionResult>> ExecuteAsync(
        WorkflowActionContext context,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var config = ParseConfiguration(context.ActionConfiguration);

            if (string.IsNullOrEmpty(config.Title))
            {
                return Result<WorkflowActionResult>.Failure(
                    Error.Validation("SendNotification", "Notification title is required"));
            }

            if (string.IsNullOrEmpty(config.Message))
            {
                return Result<WorkflowActionResult>.Failure(
                    Error.Validation("SendNotification", "Notification message is required"));
            }

            // Get userId from configuration or trigger data
            var userId = ResolveUserId(config, context);
            if (userId == Guid.Empty)
            {
                return Result<WorkflowActionResult>.Failure(
                    Error.Validation("SendNotification", "User ID is required for notification"));
            }

            // Get tenantId from trigger data
            var tenantId = ResolveTenantId(context);
            if (tenantId == Guid.Empty)
            {
                return Result<WorkflowActionResult>.Failure(
                    Error.Validation("SendNotification", "Tenant ID is required for notification"));
            }

            // Replace template variables
            var title = ReplaceVariables(config.Title, context);
            var message = ReplaceVariables(config.Message, context);

            // Parse notification type
            var notificationType = ParseNotificationType(config.Type);

            // Parse related entity
            int? relatedEntityId = null;
            if (int.TryParse(context.EntityId, out var parsedEntityId))
            {
                relatedEntityId = parsedEntityId;
            }

            // Create notification
            var notificationResult = Notification.Create(
                tenantId: tenantId,
                userId: userId,
                type: notificationType,
                title: title,
                message: message,
                channel: NotificationChannel.InApp,
                relatedEntityId: relatedEntityId,
                relatedEntityType: context.EntityType,
                metadata: CreateMetadata(context, config)
            );

            if (!notificationResult.IsSuccess)
            {
                _logger.LogError(
                    "Failed to create notification for workflow {WorkflowId}, execution {ExecutionId}: {Error}",
                    context.WorkflowId, context.ExecutionId, notificationResult.Error?.Description);

                return Result<WorkflowActionResult>.Failure(
                    notificationResult.Error ?? Error.Failure("SendNotification", "Failed to create notification"));
            }

            var notification = notificationResult.Value;

            // Save notification
            await _notificationRepository.CreateAsync(notification, cancellationToken);

            // Mark as sent
            notification.MarkAsSent();
            await _notificationRepository.UpdateAsync(notification, cancellationToken);

            _logger.LogInformation(
                "Notification sent successfully for workflow {WorkflowId}, execution {ExecutionId} to user {UserId}",
                context.WorkflowId, context.ExecutionId, userId);

            var outputData = new Dictionary<string, object>
            {
                ["notificationId"] = notification.Id,
                ["sentTo"] = userId.ToString(),
                ["sentAt"] = DateTime.UtcNow,
                ["title"] = title,
                ["type"] = notificationType.ToString()
            };

            return Result<WorkflowActionResult>.Success(
                WorkflowActionResult.Success(outputData));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "Error executing SendNotification action for workflow {WorkflowId}, execution {ExecutionId}",
                context.WorkflowId, context.ExecutionId);

            return Result<WorkflowActionResult>.Failure(
                Error.Failure("SendNotification", $"Failed to execute SendNotification action: {ex.Message}"));
        }
    }

    private NotificationConfiguration ParseConfiguration(string actionConfiguration)
    {
        try
        {
            return JsonSerializer.Deserialize<NotificationConfiguration>(actionConfiguration)
                ?? new NotificationConfiguration();
        }
        catch
        {
            _logger.LogWarning("Failed to parse notification configuration, using defaults");
            return new NotificationConfiguration();
        }
    }

    private Guid ResolveUserId(NotificationConfiguration config, WorkflowActionContext context)
    {
        // First try to get from configuration
        if (!string.IsNullOrEmpty(config.UserId))
        {
            // Handle template variable
            var resolvedUserId = ReplaceVariables(config.UserId, context);
            if (Guid.TryParse(resolvedUserId, out var configUserId))
            {
                return configUserId;
            }
        }

        // Try to get from trigger data
        if (context.TriggerData != null)
        {
            // Try common user field names
            var userFields = new[] { "UserId", "CreatedBy", "UpdatedBy", "OwnerId", "AssignedTo", "WonBy" };
            foreach (var field in userFields)
            {
                if (context.TriggerData.TryGetValue(field, out var value))
                {
                    if (value is Guid guidValue)
                        return guidValue;
                    if (Guid.TryParse(value?.ToString(), out var parsedGuid))
                        return parsedGuid;
                }
            }
        }

        return Guid.Empty;
    }

    private Guid ResolveTenantId(WorkflowActionContext context)
    {
        if (context.TriggerData != null &&
            context.TriggerData.TryGetValue("TenantId", out var tenantIdValue))
        {
            if (tenantIdValue is Guid guidValue)
                return guidValue;
            if (Guid.TryParse(tenantIdValue?.ToString(), out var parsedGuid))
                return parsedGuid;
        }

        return Guid.Empty;
    }

    private NotificationType ParseNotificationType(string? type)
    {
        if (string.IsNullOrEmpty(type))
            return NotificationType.Workflow;

        if (Enum.TryParse<NotificationType>(type, true, out var notificationType))
            return notificationType;

        return NotificationType.Workflow;
    }

    private string ReplaceVariables(string template, WorkflowActionContext context)
    {
        if (string.IsNullOrEmpty(template))
            return template;

        var result = template;

        // Replace workflow variables
        result = result.Replace("{{WorkflowId}}", context.WorkflowId.ToString());
        result = result.Replace("{{ExecutionId}}", context.ExecutionId.ToString());
        result = result.Replace("{{EntityId}}", context.EntityId.ToString());
        result = result.Replace("{{EntityType}}", context.EntityType);
        result = result.Replace("{{CurrentDate}}", DateTime.Now.ToString("yyyy-MM-dd"));
        result = result.Replace("{{CurrentTime}}", DateTime.Now.ToString("HH:mm:ss"));
        result = result.Replace("{{CurrentDateTime}}", DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss"));

        // Replace trigger data variables
        if (context.TriggerData != null)
        {
            foreach (var kvp in context.TriggerData)
            {
                result = result.Replace($"{{{{{kvp.Key}}}}}", kvp.Value?.ToString() ?? string.Empty);
            }
        }

        return result;
    }

    private string? CreateMetadata(WorkflowActionContext context, NotificationConfiguration config)
    {
        var metadata = new Dictionary<string, object>
        {
            ["workflowId"] = context.WorkflowId,
            ["executionId"] = context.ExecutionId,
            ["stepId"] = context.StepId,
            ["actionType"] = context.ActionType
        };

        if (!string.IsNullOrEmpty(config.ActionUrl))
        {
            metadata["actionUrl"] = ReplaceVariables(config.ActionUrl, context);
        }

        if (!string.IsNullOrEmpty(config.ActionText))
        {
            metadata["actionText"] = config.ActionText;
        }

        if (!string.IsNullOrEmpty(config.Icon))
        {
            metadata["icon"] = config.Icon;
        }

        return JsonSerializer.Serialize(metadata);
    }

    private class NotificationConfiguration
    {
        public string Title { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public string? UserId { get; set; }
        public string? Type { get; set; }
        public string? ActionUrl { get; set; }
        public string? ActionText { get; set; }
        public string? Icon { get; set; }
    }
}
