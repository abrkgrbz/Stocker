using System.Text.Json;
using Microsoft.Extensions.Logging;
using Stocker.Modules.CRM.Application.Services.Email;
using Stocker.Modules.CRM.Domain.Enums;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Workflows.ActionHandlers;

/// <summary>
/// Handles SendEmail workflow actions
/// </summary>
public class SendEmailActionHandler : IWorkflowActionHandler
{
    private readonly IEmailService _emailService;
    private readonly ILogger<SendEmailActionHandler> _logger;

    public SendEmailActionHandler(
        IEmailService emailService,
        ILogger<SendEmailActionHandler> logger)
    {
        _emailService = emailService;
        _logger = logger;
    }

    public bool CanHandle(string actionType)
    {
        return actionType == WorkflowActionType.SendEmail.ToString() ||
               actionType == nameof(WorkflowActionType.SendEmail);
    }

    public async Task<Result<WorkflowActionResult>> ExecuteAsync(
        WorkflowActionContext context,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var config = ParseConfiguration(context.ActionConfiguration);

            if (string.IsNullOrEmpty(config.To))
            {
                return Result<WorkflowActionResult>.Failure(
                    Error.Validation("SendEmail", "Recipient email address is required"));
            }

            if (string.IsNullOrEmpty(config.Subject))
            {
                return Result<WorkflowActionResult>.Failure(
                    Error.Validation("SendEmail", "Email subject is required"));
            }

            // Replace template variables
            var subject = ReplaceVariables(config.Subject, context);
            var body = ReplaceVariables(config.Body ?? string.Empty, context);
            var to = ReplaceVariables(config.To, context);

            var emailMessage = new EmailMessage(
                To: to,
                Subject: subject,
                Body: body,
                IsHtml: true
            );

            var sendResult = await _emailService.SendEmailAsync(emailMessage, cancellationToken);

            if (!sendResult.IsSuccess)
            {
                _logger.LogError(
                    "Failed to send email for workflow {WorkflowId}, execution {ExecutionId}: {Error}",
                    context.WorkflowId, context.ExecutionId, sendResult.ErrorMessage);

                return Result<WorkflowActionResult>.Failure(
                    Error.Failure("SendEmail", sendResult.ErrorMessage ?? "Failed to send email"));
            }

            _logger.LogInformation(
                "Email sent successfully for workflow {WorkflowId}, execution {ExecutionId} to {To}",
                context.WorkflowId, context.ExecutionId, to);

            var outputData = new Dictionary<string, object>
            {
                ["sentTo"] = to,
                ["sentAt"] = sendResult.SentAt ?? DateTime.UtcNow,
                ["subject"] = subject
            };

            return Result<WorkflowActionResult>.Success(
                WorkflowActionResult.Success(outputData));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "Error executing SendEmail action for workflow {WorkflowId}, execution {ExecutionId}",
                context.WorkflowId, context.ExecutionId);

            return Result<WorkflowActionResult>.Failure(
                Error.Failure("SendEmail", $"Failed to execute SendEmail action: {ex.Message}"));
        }
    }

    private EmailConfiguration ParseConfiguration(string actionConfiguration)
    {
        try
        {
            return JsonSerializer.Deserialize<EmailConfiguration>(actionConfiguration)
                ?? new EmailConfiguration();
        }
        catch
        {
            _logger.LogWarning("Failed to parse email configuration, using defaults");
            return new EmailConfiguration();
        }
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

    private class EmailConfiguration
    {
        public string To { get; set; } = string.Empty;
        public string Subject { get; set; } = string.Empty;
        public string? Body { get; set; }
        public string? TemplateName { get; set; }
    }
}
