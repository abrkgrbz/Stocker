using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.Modules.CRM.Domain.Enums;
using Stocker.Modules.CRM.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Activities.Commands;

public class UpdateActivityCommand : IRequest<Result<ActivityDto>>
{
    public Guid Id { get; set; }
    public string Subject { get; set; } = string.Empty;
    public string? Description { get; set; }
    public ActivityType Type { get; set; }
    public ActivityStatus Status { get; set; }
    public ActivityPriority Priority { get; set; }
    public DateTime DueDate { get; set; }
    public int? Duration { get; set; }
    public string? Location { get; set; }
    public Guid? LeadId { get; set; }
    public Guid? CustomerId { get; set; }
    public Guid? ContactId { get; set; }
    public Guid? OpportunityId { get; set; }
    public Guid? DealId { get; set; }
    public string? AssignedToId { get; set; }
    public string? Notes { get; set; }
}

public class UpdateActivityCommandValidator : AbstractValidator<UpdateActivityCommand>
{
    public UpdateActivityCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Activity ID is required");

        RuleFor(x => x.Subject)
            .NotEmpty().WithMessage("Subject is required")
            .MaximumLength(200).WithMessage("Subject must not exceed 200 characters");

        RuleFor(x => x.Description)
            .MaximumLength(1000).WithMessage("Description must not exceed 1000 characters");

        RuleFor(x => x.Type)
            .IsInEnum().WithMessage("Invalid activity type");

        RuleFor(x => x.Status)
            .IsInEnum().WithMessage("Invalid activity status");

        RuleFor(x => x.Priority)
            .IsInEnum().WithMessage("Invalid activity priority");

        RuleFor(x => x.DueDate)
            .NotEmpty().WithMessage("Due date is required");

        RuleFor(x => x.Duration)
            .GreaterThan(0).When(x => x.Duration.HasValue)
            .WithMessage("Duration must be greater than 0");

        RuleFor(x => x.Location)
            .MaximumLength(500).WithMessage("Location must not exceed 500 characters");

        RuleFor(x => x.Notes)
            .MaximumLength(2000).WithMessage("Notes must not exceed 2000 characters");
    }
}

/// <summary>
/// Handler for UpdateActivityCommand
/// Uses ICRMUnitOfWork for consistent data access
/// </summary>
public class UpdateActivityCommandHandler : IRequestHandler<UpdateActivityCommand, Result<ActivityDto>>
{
    private readonly ICRMUnitOfWork _unitOfWork;

    public UpdateActivityCommandHandler(ICRMUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<ActivityDto>> Handle(UpdateActivityCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var activity = await _unitOfWork.ReadRepository<Activity>().AsQueryable()
            .FirstOrDefaultAsync(a => a.Id == request.Id && a.TenantId == tenantId, cancellationToken);

        if (activity == null)
            return Result<ActivityDto>.Failure(Error.NotFound("Activity.NotFound", $"Activity with ID {request.Id} not found"));

        activity.UpdateDetails(request.Subject, request.Description, request.Priority);
        activity.SetDueDate(request.DueDate);

        if (!string.IsNullOrEmpty(request.AssignedToId) && int.TryParse(request.AssignedToId, out var assignedToId))
        {
            activity.AssignTo(assignedToId);
        }

        // Update relationship if changed
        if (request.LeadId.HasValue)
            activity.RelateToLead(request.LeadId.Value);
        else if (request.CustomerId.HasValue)
            activity.RelateToCustomer(request.CustomerId.Value);
        else if (request.ContactId.HasValue)
            activity.RelateToContact(request.ContactId.Value);
        else if (request.OpportunityId.HasValue)
            activity.RelateToOpportunity(request.OpportunityId.Value);
        else if (request.DealId.HasValue)
            activity.RelateToDeal(request.DealId.Value);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = new ActivityDto
        {
            Id = activity.Id,
            Subject = activity.Subject,
            Description = activity.Description,
            Type = activity.Type,
            Status = activity.Status,
            Priority = activity.Priority,
            DueAt = activity.DueDate,
            CompletedAt = activity.CompletedDate,
            Duration = activity.Duration,
            Location = activity.Location,
            LeadId = activity.LeadId,
            CustomerId = activity.CustomerId,
            ContactId = activity.ContactId,
            OpportunityId = activity.OpportunityId,
            DealId = activity.DealId,
            OwnerId = activity.OwnerId,
            IsOverdue = activity.IsOverdue(),
            Outcome = activity.TaskOutcome,
            CreatedAt = DateTime.UtcNow
        };

        return Result<ActivityDto>.Success(dto);
    }
}
