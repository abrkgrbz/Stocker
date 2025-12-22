using MassTransit;
using Microsoft.Extensions.Logging;
using Stocker.Modules.CRM.Application.Services.Workflows;
using Stocker.Modules.CRM.Domain.Enums;
using Stocker.Shared.Events.CRM;

namespace Stocker.Modules.CRM.Infrastructure.EventConsumers;

/// <summary>
/// Consumer for CustomerCreatedEvent
/// Triggers matching workflows when a customer is created
/// </summary>
public class CustomerCreatedEventConsumer : IConsumer<CustomerCreatedEvent>
{
    private readonly IWorkflowTriggerService _workflowTriggerService;
    private readonly ILogger<CustomerCreatedEventConsumer> _logger;

    public CustomerCreatedEventConsumer(
        IWorkflowTriggerService workflowTriggerService,
        ILogger<CustomerCreatedEventConsumer> logger)
    {
        _workflowTriggerService = workflowTriggerService;
        _logger = logger;
    }

    public async Task Consume(ConsumeContext<CustomerCreatedEvent> context)
    {
        var @event = context.Message;

        _logger.LogInformation(
            "CustomerCreatedEvent consumed: CustomerId={CustomerId}, CompanyName={CompanyName}, TenantId={TenantId}, EventId={EventId}",
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
            ["CreatedAt"] = @event.CreatedAt,
            ["TenantId"] = @event.TenantId
        };

        // Trigger workflows for Customer EntityCreated event
        var result = await _workflowTriggerService.TriggerWorkflowsAsync(
            entityType: "Customer",
            entityId: @event.CustomerId.ToString(),
            tenantId: @event.TenantId,
            triggerType: WorkflowTriggerType.EntityCreated,
            triggerData: triggerData,
            cancellationToken: context.CancellationToken);

        if (result.IsSuccess)
        {
            _logger.LogInformation(
                "Triggered {WorkflowCount} workflow(s) for customer creation. CustomerId: {CustomerId}",
                result.Value,
                @event.CustomerId);
        }
        else
        {
            _logger.LogWarning(
                "Failed to trigger workflows for customer creation. CustomerId: {CustomerId}, Error: {Error}",
                @event.CustomerId,
                result.Error?.Description);
        }
    }
}
