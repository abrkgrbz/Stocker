using MassTransit;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Stocker.Shared.Events;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.MultiTenancy;

namespace Stocker.Persistence.Filters;

/// <summary>
/// MassTransit consume filter that sets up tenant context for messages implementing ITenantEvent.
/// This filter runs before the consumer and resolves the tenant connection string from the master database.
/// </summary>
/// <typeparam name="T">The message type being consumed</typeparam>
public class TenantConsumeFilter<T> : IFilter<ConsumeContext<T>> where T : class
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<TenantConsumeFilter<T>> _logger;

    public TenantConsumeFilter(
        IServiceProvider serviceProvider,
        ILogger<TenantConsumeFilter<T>> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    public async Task Send(ConsumeContext<T> context, IPipe<ConsumeContext<T>> next)
    {
        // Check if message implements ITenantEvent
        if (context.Message is ITenantEvent tenantEvent)
        {
            var tenantId = tenantEvent.TenantId;

            _logger.LogDebug(
                "Setting tenant context for message {MessageType}. TenantId: {TenantId}",
                typeof(T).Name,
                tenantId);

            // Resolve services from the scoped container
            var tenantResolver = _serviceProvider.GetRequiredService<ITenantResolver>();
            var backgroundTenantService = _serviceProvider.GetRequiredService<IBackgroundTenantService>();

            // Resolve tenant info from master database
            var tenantInfo = await tenantResolver.ResolveByIdAsync(tenantId);

            if (tenantInfo == null)
            {
                _logger.LogWarning(
                    "Tenant not found for TenantId: {TenantId}. Message: {MessageType}",
                    tenantId,
                    typeof(T).Name);

                throw new InvalidOperationException($"Tenant not found: {tenantId}");
            }

            if (!tenantInfo.IsActive)
            {
                _logger.LogWarning(
                    "Tenant is inactive. TenantId: {TenantId}. Message: {MessageType}",
                    tenantId,
                    typeof(T).Name);

                throw new InvalidOperationException($"Tenant is inactive: {tenantId}");
            }

            // Set tenant context for background processing
            backgroundTenantService.SetTenantInfo(
                tenantId,
                tenantInfo.Name,
                tenantInfo.ConnectionString);

            _logger.LogInformation(
                "Tenant context set successfully for {MessageType}. TenantId: {TenantId}, TenantName: {TenantName}",
                typeof(T).Name,
                tenantId,
                tenantInfo.Name);
        }

        // Continue the pipeline
        await next.Send(context);
    }

    public void Probe(ProbeContext context)
    {
        context.CreateFilterScope("tenantConsumeFilter");
    }
}
