using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Interfaces;
using Stocker.SignalR.Hubs;

namespace Stocker.SignalR.Services;

/// <summary>
/// SignalR-based implementation of setup progress notifications
/// </summary>
public class SetupProgressNotifier : ISetupProgressNotifier
{
    private readonly IHubContext<SetupProgressHub> _hubContext;
    private readonly ILogger<SetupProgressNotifier> _logger;

    public SetupProgressNotifier(
        IHubContext<SetupProgressHub> hubContext,
        ILogger<SetupProgressNotifier> logger)
    {
        _hubContext = hubContext;
        _logger = logger;
    }

    public async Task NotifyProgressAsync(SetupProgressUpdate progress, CancellationToken cancellationToken = default)
    {
        try
        {
            var groupName = SetupProgressHub.GetGroupName(progress.TenantId);

            var message = new SetupProgressMessage
            {
                TenantId = progress.TenantId,
                Step = (SetupStep)(int)progress.Step,
                StepName = progress.StepName,
                Message = progress.Message,
                ProgressPercentage = progress.ProgressPercentage,
                IsCompleted = progress.IsCompleted,
                HasError = progress.HasError,
                ErrorMessage = progress.ErrorMessage,
                Timestamp = progress.Timestamp,
                Metadata = progress.Metadata
            };

            await _hubContext.Clients.Group(groupName)
                .SendAsync("SetupProgress", message, cancellationToken);

            _logger.LogInformation(
                "Setup progress sent for tenant {TenantId}: Step={Step}, Progress={Progress}%, Message={Message}",
                progress.TenantId, progress.Step, progress.ProgressPercentage, progress.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send setup progress notification for tenant {TenantId}", progress.TenantId);
        }
    }

    public async Task NotifyCompletedAsync(Guid tenantId, string message, CancellationToken cancellationToken = default)
    {
        var progress = SetupProgressUpdate.Completed(tenantId, message);
        await NotifyProgressAsync(progress, cancellationToken);
    }

    public async Task NotifyErrorAsync(Guid tenantId, string errorMessage, CancellationToken cancellationToken = default)
    {
        var progress = SetupProgressUpdate.Error(tenantId, errorMessage);
        await NotifyProgressAsync(progress, cancellationToken);
    }
}
