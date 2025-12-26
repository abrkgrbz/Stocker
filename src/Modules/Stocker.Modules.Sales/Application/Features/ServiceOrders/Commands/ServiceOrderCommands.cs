using MediatR;
using Stocker.Modules.Sales.Application.DTOs;
using Stocker.Modules.Sales.Domain.Entities;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Sales.Application.Features.ServiceOrders.Commands;

public record CreateServiceOrderCommand : IRequest<Result<ServiceOrderDto>>
{
    public DateTime OrderDate { get; init; } = DateTime.UtcNow;
    public ServiceOrderType Type { get; init; } = ServiceOrderType.Repair;
    public ServiceOrderPriority Priority { get; init; } = ServiceOrderPriority.Normal;
    public Guid? CustomerId { get; init; }
    public string CustomerName { get; init; } = string.Empty;
    public string? CustomerEmail { get; init; }
    public string? CustomerPhone { get; init; }
    public string? CustomerAddress { get; init; }
    public Guid? ProductId { get; init; }
    public string? ProductCode { get; init; }
    public string? ProductName { get; init; }
    public string? SerialNumber { get; init; }
    public string? AssetTag { get; init; }
    public string? ReportedIssue { get; init; }
    public ServiceCategory? IssueCategory { get; init; }
    public ServiceLocation Location { get; init; } = ServiceLocation.InHouse;
    public string? ServiceAddress { get; init; }
    public string Currency { get; init; } = "TRY";
}

public record CreateWarrantyServiceOrderCommand : IRequest<Result<ServiceOrderDto>>
{
    public Guid? CustomerId { get; init; }
    public string CustomerName { get; init; } = string.Empty;
    public string? CustomerPhone { get; init; }
    public Guid WarrantyId { get; init; }
    public string WarrantyNumber { get; init; } = string.Empty;
    public string ReportedIssue { get; init; } = string.Empty;
    public ServiceOrderPriority Priority { get; init; } = ServiceOrderPriority.Normal;
}

public record UpdateServiceOrderCommand : IRequest<Result<ServiceOrderDto>>
{
    public Guid Id { get; init; }
    public ServiceOrderPriority Priority { get; init; }
    public string? CustomerEmail { get; init; }
    public string? CustomerPhone { get; init; }
    public string? CustomerAddress { get; init; }
    public string? ProductCode { get; init; }
    public string? ProductName { get; init; }
    public string? SerialNumber { get; init; }
    public string? ReportedIssue { get; init; }
    public ServiceCategory? IssueCategory { get; init; }
    public ServiceLocation Location { get; init; }
    public string? ServiceAddress { get; init; }
}

public record ScheduleServiceOrderCommand : IRequest<Result<ServiceOrderDto>>
{
    public Guid Id { get; init; }
    public DateTime ScheduledDate { get; init; }
    public TimeSpan? EstimatedDuration { get; init; }
    public DateTime? EndDate { get; init; }
}

public record AssignTechnicianCommand : IRequest<Result<ServiceOrderDto>>
{
    public Guid Id { get; init; }
    public Guid TechnicianId { get; init; }
    public string? TechnicianName { get; init; }
}

public record AssignTeamCommand : IRequest<Result<ServiceOrderDto>>
{
    public Guid Id { get; init; }
    public Guid TeamId { get; init; }
    public string? TeamName { get; init; }
}

public record StartServiceOrderCommand : IRequest<Result<ServiceOrderDto>>
{
    public Guid Id { get; init; }
}

public record PauseServiceOrderCommand : IRequest<Result<ServiceOrderDto>>
{
    public Guid Id { get; init; }
    public string Reason { get; init; } = string.Empty;
}

public record ResumeServiceOrderCommand : IRequest<Result<ServiceOrderDto>>
{
    public Guid Id { get; init; }
}

public record CompleteServiceOrderCommand : IRequest<Result<ServiceOrderDto>>
{
    public Guid Id { get; init; }
    public string? CompletionNotes { get; init; }
}

public record CancelServiceOrderCommand : IRequest<Result<ServiceOrderDto>>
{
    public Guid Id { get; init; }
    public string Reason { get; init; } = string.Empty;
}

public record SetDiagnosisCommand : IRequest<Result<ServiceOrderDto>>
{
    public Guid Id { get; init; }
    public string DiagnosisNotes { get; init; } = string.Empty;
}

public record SetRepairNotesCommand : IRequest<Result<ServiceOrderDto>>
{
    public Guid Id { get; init; }
    public string RepairNotes { get; init; } = string.Empty;
}

public record SetBillingDetailsCommand : IRequest<Result<ServiceOrderDto>>
{
    public Guid Id { get; init; }
    public decimal LaborCost { get; init; }
    public decimal PartsCost { get; init; }
    public decimal TravelCost { get; init; }
    public decimal OtherCost { get; init; }
    public decimal DiscountAmount { get; init; }
    public decimal TaxAmount { get; init; }
}

public record RecordFeedbackCommand : IRequest<Result<ServiceOrderDto>>
{
    public Guid Id { get; init; }
    public int Rating { get; init; }
    public string? Feedback { get; init; }
}

public record AddServiceNoteCommand : IRequest<Result<ServiceOrderDto>>
{
    public Guid Id { get; init; }
    public string Content { get; init; } = string.Empty;
    public ServiceNoteType Type { get; init; } = ServiceNoteType.General;
}

public record DeleteServiceOrderCommand : IRequest<Result>
{
    public Guid Id { get; init; }
}
