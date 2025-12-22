using MassTransit;
using Microsoft.Extensions.Logging;
using Stocker.Modules.CRM.Application.Services.Workflows;
using Stocker.Modules.CRM.Domain.Enums;
using Stocker.Shared.Events.CRM;

namespace Stocker.Modules.CRM.Infrastructure.EventConsumers;

/// <summary>
/// Consumer for CustomerUpdatedEvent
/// Triggers matching workflows when a customer is updated
/// </summary>
public class CustomerUpdatedEventConsumer : IConsumer<CustomerUpdatedEvent>
{
    private readonly IWorkflowTriggerService _workflowTriggerService;
    private readonly ILogger<CustomerUpdatedEventConsumer> _logger;

    public CustomerUpdatedEventConsumer(
        IWorkflowTriggerService workflowTriggerService,
        ILogger<CustomerUpdatedEventConsumer> logger)
    {
        _workflowTriggerService = workflowTriggerService;
        _logger = logger;
    }

    public async Task Consume(ConsumeContext<CustomerUpdatedEvent> context)
    {
        var @event = context.Message;

        _logger.LogInformation(
            "CustomerUpdatedEvent consumed: CustomerId={CustomerId}, CompanyName={CompanyName}, TenantId={TenantId}, EventId={EventId}",
            @event.CustomerId,
            @event.CompanyName,
            @event.TenantId,
            @event.EventId);

        // Build trigger data from the event for workflow context
        var triggerData = new Dictionary<string, object>
        {
            ["CustomerId"] = @event.CustomerId,
            ["CompanyName"] = @event.CompanyName ?? "",
            ["Email"] = @event.Email ?? "",
            ["Phone"] = @event.Phone ?? "",
            ["Website"] = @event.Website ?? "",
            ["Industry"] = @event.Industry ?? "",
            ["AnnualRevenue"] = @event.AnnualRevenue ?? 0m,
            ["NumberOfEmployees"] = @event.NumberOfEmployees ?? 0,
            ["UpdatedAt"] = @event.UpdatedAt,
            ["UpdatedBy"] = @event.UpdatedBy,
            ["TenantId"] = @event.TenantId
        };

        // Trigger workflows for Customer EntityUpdated event
        var result = await _workflowTriggerService.TriggerWorkflowsAsync(
            entityType: "Customer",
            entityId: @event.CustomerId.ToString(),
            tenantId: @event.TenantId,
            triggerType: WorkflowTriggerType.EntityUpdated,
            triggerData: triggerData,
            cancellationToken: context.CancellationToken);

        if (result.IsSuccess)
        {
            _logger.LogInformation(
                "Triggered {WorkflowCount} workflow(s) for customer update. CustomerId: {CustomerId}",
                result.Value,
                @event.CustomerId);
        }
        else
        {
            _logger.LogWarning(
                "Failed to trigger workflows for customer update. CustomerId: {CustomerId}, Error: {Error}",
                @event.CustomerId,
                result.Error?.Description);
        }
    }
}
