using System.Net.Http;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Logging;
using Stocker.Modules.CRM.Domain.Enums;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Workflows.ActionHandlers;

/// <summary>
/// Handles Webhook workflow actions to call external APIs
/// </summary>
public class WebhookActionHandler : IWorkflowActionHandler
{
    private static readonly HttpClient _httpClient = new()
    {
        Timeout = TimeSpan.FromSeconds(30)
    };

    private readonly ILogger<WebhookActionHandler> _logger;

    public WebhookActionHandler(ILogger<WebhookActionHandler> logger)
    {
        _logger = logger;
    }

    public bool CanHandle(string actionType)
    {
        return actionType == WorkflowActionType.WebhookCall.ToString() ||
               actionType == nameof(WorkflowActionType.WebhookCall) ||
               actionType == "Webhook"; // Alias for WebhookCall
    }

    public async Task<Result<WorkflowActionResult>> ExecuteAsync(
        WorkflowActionContext context,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var config = ParseConfiguration(context.ActionConfiguration);

            if (string.IsNullOrEmpty(config.Url))
            {
                return Result<WorkflowActionResult>.Failure(
                    Error.Validation("Webhook", "Webhook URL is required"));
            }

            // Replace variables in URL
            var url = ReplaceVariables(config.Url, context);

            // Validate URL
            if (!Uri.TryCreate(url, UriKind.Absolute, out var uri) ||
                (uri.Scheme != Uri.UriSchemeHttp && uri.Scheme != Uri.UriSchemeHttps))
            {
                return Result<WorkflowActionResult>.Failure(
                    Error.Validation("Webhook", $"Invalid webhook URL: {url}"));
            }

            // Create request
            var method = ParseHttpMethod(config.Method);
            var request = new HttpRequestMessage(method, uri);

            // Add headers
            if (config.Headers != null)
            {
                foreach (var header in config.Headers)
                {
                    var headerValue = ReplaceVariables(header.Value, context);
                    request.Headers.TryAddWithoutValidation(header.Key, headerValue);
                }
            }

            // Add authentication
            if (!string.IsNullOrEmpty(config.AuthType))
            {
                AddAuthentication(request, config, context);
            }

            // Add body for POST/PUT/PATCH
            if (method == HttpMethod.Post || method == HttpMethod.Put || method == HttpMethod.Patch)
            {
                var body = BuildRequestBody(config, context);
                request.Content = new StringContent(body, Encoding.UTF8, config.ContentType ?? "application/json");
            }

            _logger.LogInformation(
                "Sending webhook for workflow {WorkflowId}, execution {ExecutionId} to {Url}",
                context.WorkflowId, context.ExecutionId, url);

            // Create cancellation token with timeout
            using var timeoutCts = new CancellationTokenSource(TimeSpan.FromSeconds(config.TimeoutSeconds ?? 30));
            using var linkedCts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken, timeoutCts.Token);

            // Send request
            var response = await _httpClient.SendAsync(request, linkedCts.Token);
            var responseBody = await response.Content.ReadAsStringAsync(linkedCts.Token);

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning(
                    "Webhook returned non-success status for workflow {WorkflowId}, execution {ExecutionId}. Status: {StatusCode}, Response: {Response}",
                    context.WorkflowId, context.ExecutionId, response.StatusCode, responseBody);

                // Check if we should fail on non-success status
                if (config.FailOnNonSuccessStatus ?? true)
                {
                    return Result<WorkflowActionResult>.Failure(
                        Error.Failure("Webhook", $"Webhook returned status {(int)response.StatusCode}: {response.ReasonPhrase}"));
                }
            }

            _logger.LogInformation(
                "Webhook completed for workflow {WorkflowId}, execution {ExecutionId}. Status: {StatusCode}",
                context.WorkflowId, context.ExecutionId, response.StatusCode);

            var outputData = new Dictionary<string, object>
            {
                ["url"] = url,
                ["method"] = method.Method,
                ["statusCode"] = (int)response.StatusCode,
                ["responseBody"] = TruncateResponse(responseBody, 2000),
                ["sentAt"] = DateTime.UtcNow,
                ["isSuccess"] = response.IsSuccessStatusCode
            };

            // Try to parse response as JSON
            if (!string.IsNullOrEmpty(responseBody))
            {
                try
                {
                    var responseData = JsonSerializer.Deserialize<Dictionary<string, object>>(responseBody);
                    if (responseData != null)
                    {
                        outputData["responseData"] = responseData;
                    }
                }
                catch
                {
                    // Not JSON, keep as string
                }
            }

            return Result<WorkflowActionResult>.Success(
                WorkflowActionResult.Success(outputData));
        }
        catch (HttpRequestException ex)
        {
            _logger.LogError(ex,
                "HTTP error executing Webhook action for workflow {WorkflowId}, execution {ExecutionId}",
                context.WorkflowId, context.ExecutionId);

            return Result<WorkflowActionResult>.Failure(
                Error.Failure("Webhook", $"HTTP error: {ex.Message}"));
        }
        catch (OperationCanceledException ex) when (!cancellationToken.IsCancellationRequested)
        {
            _logger.LogError(ex,
                "Webhook timeout for workflow {WorkflowId}, execution {ExecutionId}",
                context.WorkflowId, context.ExecutionId);

            return Result<WorkflowActionResult>.Failure(
                Error.Failure("Webhook", "Webhook request timed out"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "Error executing Webhook action for workflow {WorkflowId}, execution {ExecutionId}",
                context.WorkflowId, context.ExecutionId);

            return Result<WorkflowActionResult>.Failure(
                Error.Failure("Webhook", $"Failed to execute Webhook action: {ex.Message}"));
        }
    }

    private WebhookConfiguration ParseConfiguration(string actionConfiguration)
    {
        try
        {
            return JsonSerializer.Deserialize<WebhookConfiguration>(actionConfiguration)
                ?? new WebhookConfiguration();
        }
        catch
        {
            _logger.LogWarning("Failed to parse webhook configuration, using defaults");
            return new WebhookConfiguration();
        }
    }

    private HttpMethod ParseHttpMethod(string? method)
    {
        return method?.ToUpperInvariant() switch
        {
            "GET" => HttpMethod.Get,
            "POST" => HttpMethod.Post,
            "PUT" => HttpMethod.Put,
            "PATCH" => HttpMethod.Patch,
            "DELETE" => HttpMethod.Delete,
            _ => HttpMethod.Post
        };
    }

    private void AddAuthentication(HttpRequestMessage request, WebhookConfiguration config, WorkflowActionContext context)
    {
        switch (config.AuthType?.ToLowerInvariant())
        {
            case "bearer":
                if (!string.IsNullOrEmpty(config.AuthToken))
                {
                    var token = ReplaceVariables(config.AuthToken, context);
                    request.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);
                }
                break;

            case "basic":
                if (!string.IsNullOrEmpty(config.AuthUsername) && !string.IsNullOrEmpty(config.AuthPassword))
                {
                    var username = ReplaceVariables(config.AuthUsername, context);
                    var password = ReplaceVariables(config.AuthPassword, context);
                    var credentials = Convert.ToBase64String(Encoding.UTF8.GetBytes($"{username}:{password}"));
                    request.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Basic", credentials);
                }
                break;

            case "apikey":
                if (!string.IsNullOrEmpty(config.ApiKeyHeader) && !string.IsNullOrEmpty(config.ApiKeyValue))
                {
                    var headerName = config.ApiKeyHeader;
                    var headerValue = ReplaceVariables(config.ApiKeyValue, context);
                    request.Headers.TryAddWithoutValidation(headerName, headerValue);
                }
                break;
        }
    }

    private string BuildRequestBody(WebhookConfiguration config, WorkflowActionContext context)
    {
        // If custom body template is provided, use it
        if (!string.IsNullOrEmpty(config.BodyTemplate))
        {
            return ReplaceVariables(config.BodyTemplate, context);
        }

        // Build default body with workflow context
        var bodyData = new Dictionary<string, object>
        {
            ["workflowId"] = context.WorkflowId,
            ["executionId"] = context.ExecutionId,
            ["entityType"] = context.EntityType,
            ["entityId"] = context.EntityId,
            ["actionType"] = context.ActionType,
            ["timestamp"] = DateTime.UtcNow.ToString("o")
        };

        // Include trigger data
        if (context.TriggerData != null && (config.IncludeTriggerData ?? true))
        {
            bodyData["triggerData"] = context.TriggerData;
        }

        return JsonSerializer.Serialize(bodyData, new JsonSerializerOptions
        {
            WriteIndented = false,
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });
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

    private static string TruncateResponse(string response, int maxLength)
    {
        if (string.IsNullOrEmpty(response) || response.Length <= maxLength)
            return response;

        return response.Substring(0, maxLength) + "...";
    }

    private class WebhookConfiguration
    {
        public string Url { get; set; } = string.Empty;
        public string? Method { get; set; }
        public string? ContentType { get; set; }
        public Dictionary<string, string>? Headers { get; set; }
        public string? BodyTemplate { get; set; }
        public bool? IncludeTriggerData { get; set; }
        public int? TimeoutSeconds { get; set; }
        public bool? FailOnNonSuccessStatus { get; set; }

        // Authentication
        public string? AuthType { get; set; }
        public string? AuthToken { get; set; }
        public string? AuthUsername { get; set; }
        public string? AuthPassword { get; set; }
        public string? ApiKeyHeader { get; set; }
        public string? ApiKeyValue { get; set; }
    }
}
