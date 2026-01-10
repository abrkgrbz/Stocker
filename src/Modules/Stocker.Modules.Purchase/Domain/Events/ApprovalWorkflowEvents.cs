using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.Purchase.Domain.Events;

#region ApprovalWorkflow Events

/// <summary>
/// Onay iş akışı başlatıldığında tetiklenen event
/// </summary>
public sealed record ApprovalWorkflowStartedDomainEvent(
    int ApprovalWorkflowId,
    Guid TenantId,
    string DocumentType,
    int DocumentId,
    string DocumentNumber,
    int CurrentApproverUserId) : DomainEvent;

/// <summary>
/// Onay adımı tamamlandığında tetiklenen event
/// </summary>
public sealed record ApprovalStepCompletedDomainEvent(
    int ApprovalWorkflowId,
    Guid TenantId,
    string DocumentType,
    string DocumentNumber,
    int StepNumber,
    int ApprovedByUserId,
    string Decision,
    DateTime CompletedAt) : DomainEvent;

/// <summary>
/// Onay iş akışı tamamlandığında tetiklenen event
/// </summary>
public sealed record ApprovalWorkflowCompletedDomainEvent(
    int ApprovalWorkflowId,
    Guid TenantId,
    string DocumentType,
    int DocumentId,
    string DocumentNumber,
    string FinalDecision,
    DateTime CompletedAt) : DomainEvent;

/// <summary>
/// Onay iş akışı reddedildiğinde tetiklenen event
/// </summary>
public sealed record ApprovalWorkflowRejectedDomainEvent(
    int ApprovalWorkflowId,
    Guid TenantId,
    string DocumentType,
    string DocumentNumber,
    int RejectedByUserId,
    string RejectionReason,
    DateTime RejectedAt) : DomainEvent;

#endregion
