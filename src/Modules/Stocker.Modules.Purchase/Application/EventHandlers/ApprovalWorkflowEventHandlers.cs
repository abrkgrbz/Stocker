using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.Purchase.Domain.Events;

namespace Stocker.Modules.Purchase.Application.EventHandlers;

#region ApprovalWorkflow Event Handlers

/// <summary>
/// Onay iş akışı başlatıldığında tetiklenen handler
/// </summary>
public class ApprovalWorkflowStartedEventHandler : INotificationHandler<ApprovalWorkflowStartedDomainEvent>
{
    private readonly ILogger<ApprovalWorkflowStartedEventHandler> _logger;

    public ApprovalWorkflowStartedEventHandler(ILogger<ApprovalWorkflowStartedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(ApprovalWorkflowStartedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Onay iş akışı başlatıldı: {DocumentType} - {DocumentNumber}, Onaylayacak: {CurrentApproverUserId}, Tenant: {TenantId}",
            notification.DocumentType,
            notification.DocumentNumber,
            notification.CurrentApproverUserId,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Onay adımı tamamlandığında tetiklenen handler
/// </summary>
public class ApprovalStepCompletedEventHandler : INotificationHandler<ApprovalStepCompletedDomainEvent>
{
    private readonly ILogger<ApprovalStepCompletedEventHandler> _logger;

    public ApprovalStepCompletedEventHandler(ILogger<ApprovalStepCompletedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(ApprovalStepCompletedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Onay adımı tamamlandı: {DocumentType} - {DocumentNumber}, Adım: {StepNumber}, Karar: {Decision}, Tenant: {TenantId}",
            notification.DocumentType,
            notification.DocumentNumber,
            notification.StepNumber,
            notification.Decision,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Onay iş akışı tamamlandığında tetiklenen handler
/// </summary>
public class ApprovalWorkflowCompletedEventHandler : INotificationHandler<ApprovalWorkflowCompletedDomainEvent>
{
    private readonly ILogger<ApprovalWorkflowCompletedEventHandler> _logger;

    public ApprovalWorkflowCompletedEventHandler(ILogger<ApprovalWorkflowCompletedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(ApprovalWorkflowCompletedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Onay iş akışı tamamlandı: {DocumentType} - {DocumentNumber}, Sonuç: {FinalDecision}, Tenant: {TenantId}",
            notification.DocumentType,
            notification.DocumentNumber,
            notification.FinalDecision,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Onay iş akışı reddedildiğinde tetiklenen handler
/// </summary>
public class ApprovalWorkflowRejectedEventHandler : INotificationHandler<ApprovalWorkflowRejectedDomainEvent>
{
    private readonly ILogger<ApprovalWorkflowRejectedEventHandler> _logger;

    public ApprovalWorkflowRejectedEventHandler(ILogger<ApprovalWorkflowRejectedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(ApprovalWorkflowRejectedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Onay iş akışı reddedildi: {DocumentType} - {DocumentNumber}, Sebep: {RejectionReason}, Tenant: {TenantId}",
            notification.DocumentType,
            notification.DocumentNumber,
            notification.RejectionReason,
            notification.TenantId);

        return Task.CompletedTask;
    }
}

#endregion
