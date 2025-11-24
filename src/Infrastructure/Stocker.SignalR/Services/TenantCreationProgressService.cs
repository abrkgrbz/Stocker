using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Interfaces;
using Stocker.SignalR.Hubs;
using Stocker.SignalR.Models;

namespace Stocker.SignalR.Services;

/// <summary>
/// Service for sending real-time tenant creation progress updates via SignalR
/// </summary>
public class TenantCreationProgressService : ITenantCreationProgressService
{
    private readonly IHubContext<NotificationHub> _hubContext;
    private readonly ILogger<TenantCreationProgressService> _logger;

    public TenantCreationProgressService(
        IHubContext<NotificationHub> hubContext,
        ILogger<TenantCreationProgressService> logger)
    {
        _hubContext = hubContext;
        _logger = logger;
    }

    public async Task SendProgressAsync(
        Guid registrationId,
        TenantCreationStep step,
        string message,
        int progressPercentage,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var progress = new TenantCreationProgress
            {
                RegistrationId = registrationId,
                Step = step,
                Message = message,
                ProgressPercentage = progressPercentage,
                Timestamp = DateTime.UtcNow,
                IsCompleted = false,
                HasError = false
            };

            // Send to registration group (user can subscribe with registrationId)
            await _hubContext.Clients
                .Group($"registration-{registrationId}")
                .SendAsync("TenantCreationProgress", progress, cancellationToken);

            _logger.LogInformation(
                "📊 Tenant creation progress sent for registration {RegistrationId}: {Step} ({Progress}%)",
                registrationId, step, progressPercentage);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "❌ Failed to send tenant creation progress for registration {RegistrationId}",
                registrationId);
        }
    }

    public async Task SendErrorAsync(
        Guid registrationId,
        string errorMessage,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var progress = new TenantCreationProgress
            {
                RegistrationId = registrationId,
                Step = TenantCreationStep.Failed,
                Message = errorMessage,
                ProgressPercentage = 0,
                Timestamp = DateTime.UtcNow,
                IsCompleted = true,
                HasError = true,
                ErrorMessage = errorMessage
            };

            await _hubContext.Clients
                .Group($"registration-{registrationId}")
                .SendAsync("TenantCreationProgress", progress, cancellationToken);

            _logger.LogError(
                "❌ Tenant creation failed for registration {RegistrationId}: {Error}",
                registrationId, errorMessage);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "❌ Failed to send tenant creation error for registration {RegistrationId}",
                registrationId);
        }
    }

    public async Task SendCompletionAsync(
        Guid registrationId,
        Guid tenantId,
        string tenantName,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var progress = new TenantCreationProgress
            {
                RegistrationId = registrationId,
                Step = TenantCreationStep.Completed,
                Message = "Hesabınız başarıyla oluşturuldu! Yönlendiriliyorsunuz...",
                ProgressPercentage = 100,
                Timestamp = DateTime.UtcNow,
                IsCompleted = true,
                HasError = false,
                Metadata = new Dictionary<string, object>
                {
                    ["tenantId"] = tenantId,
                    ["tenantName"] = tenantName
                }
            };

            await _hubContext.Clients
                .Group($"registration-{registrationId}")
                .SendAsync("TenantCreationProgress", progress, cancellationToken);

            _logger.LogInformation(
                "✅ Tenant creation completed for registration {RegistrationId}, TenantId: {TenantId}",
                registrationId, tenantId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "❌ Failed to send tenant creation completion for registration {RegistrationId}",
                registrationId);
        }
    }
}
