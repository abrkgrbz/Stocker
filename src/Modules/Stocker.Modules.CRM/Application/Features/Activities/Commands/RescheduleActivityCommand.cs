using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Infrastructure.Persistence;
using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Activities.Commands;

public class RescheduleActivityCommand : IRequest<Result<ActivityDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public Guid Id { get; set; }
    public DateTime NewDueDate { get; set; }
    public string? RescheduleReason { get; set; }
}

public class RescheduleActivityCommandValidator : AbstractValidator<RescheduleActivityCommand>
{
    public RescheduleActivityCommandValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Tenant ID is required");

        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Activity ID is required");

        RuleFor(x => x.NewDueDate)
            .NotEmpty().WithMessage("New due date is required")
            .GreaterThan(DateTime.UtcNow).WithMessage("New due date must be in the future");

        RuleFor(x => x.RescheduleReason)
            .MaximumLength(500).WithMessage("Reschedule reason must not exceed 500 characters");
    }
}

public class RescheduleActivityCommandHandler : IRequestHandler<RescheduleActivityCommand, Result<ActivityDto>>
{
    private readonly CRMDbContext _context;

    public RescheduleActivityCommandHandler(CRMDbContext context)
    {
        _context = context;
    }

    public async Task<Result<ActivityDto>> Handle(RescheduleActivityCommand request, CancellationToken cancellationToken)
    {
        var activity = await _context.Activities
            .FirstOrDefaultAsync(a => a.Id == request.Id && a.TenantId == request.TenantId, cancellationToken);

        if (activity == null)
            return Result<ActivityDto>.Failure(Error.NotFound("Activity.NotFound", $"Activity with ID {request.Id} not found"));

        activity.Defer(request.NewDueDate);

        await _context.SaveChangesAsync(cancellationToken);

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