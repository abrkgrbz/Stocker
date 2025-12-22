using MassTransit;
using Microsoft.Extensions.Logging;
using Stocker.Modules.CRM.Application.Services.Workflows;
using Stocker.Modules.CRM.Domain.Enums;
using Stocker.Shared.Events.CRM;

namespace Stocker.Modules.CRM.Infrastructure.EventConsumers;

/// <summary>
/// Consumer for DealWonEvent
/// Triggers matching workflows when a deal is won
/// </summary>
public class DealWonEventConsumer : IConsumer<DealWonEvent>
{
    private readonly IWorkflowTriggerService _workflowTriggerService;
    private readonly ILogger<DealWonEventConsumer> _logger;

    public DealWonEventConsumer(
        IWorkflowTriggerService workflowTriggerService,
        ILogger<DealWonEventConsumer> logger)
    {
        _workflowTriggerService = workflowTriggerService;
        _logger = logger;
    }

    public async Task Consume(ConsumeContext<DealWonEvent> context)
    {
        var @event = context.Message;

        _logger.LogInformation(
            "DealWonEvent consumed: DealId={DealId}, CustomerId={CustomerId}, Amount={Amount} {Currency}, TenantId={TenantId}, EventId={EventId}",
            @event.DealId,
            @event.CustomerId,
            @event.Amount,
            @event.Currency,
            @event.TenantId,
            @event.EventId);

        // Log product details
        if (@event.Products.Any())
        {
            _logger.LogInformation(
                "Deal contains {ProductCount} products",
                @event.Products.Count);
        }

        // Build trigger data from the event for workflow context
        var triggerData = new Dictionary<string, object>
        {
            ["DealId"] = @event.DealId,
            ["CustomerId"] = @event.CustomerId,
            ["Amount"] = @event.Amount,
            ["Currency"] = @event.Currency ?? "",
            ["ProductCount"] = @event.Products.Count,
            ["ClosedDate"] = @event.ClosedDate,
            ["WonBy"] = @event.WonBy,
            ["TenantId"] = @event.TenantId
        };

        // Trigger workflows for Deal StatusChanged (Won) event
        var result = await _workflowTriggerService.TriggerWorkflowsAsync(
            entityType: "Deal",
            entityId: @event.DealId.ToString(),
            tenantId: @event.TenantId,
            triggerType: WorkflowTriggerType.StatusChanged,
            triggerData: triggerData,
            cancellationToken: context.CancellationToken);

        if (result.IsSuccess)
        {
            _logger.LogInformation(
                "Triggered {WorkflowCount} workflow(s) for deal won. DealId: {DealId}",
                result.Value,
                @event.DealId);
        }
        else
        {
            _logger.LogWarning(
                "Failed to trigger workflows for deal won. DealId: {DealId}, Error: {Error}",
                @event.DealId,
                result.Error?.Description);
        }
    }
}
