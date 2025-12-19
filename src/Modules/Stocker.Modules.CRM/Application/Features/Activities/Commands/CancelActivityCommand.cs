using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.Modules.CRM.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Activities.Commands;

public class CancelActivityCommand : IRequest<Result<ActivityDto>>
{
    public Guid Id { get; set; }
    public string? CancelReason { get; set; }
}

public class CancelActivityCommandValidator : AbstractValidator<CancelActivityCommand>
{
    public CancelActivityCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Activity ID is required");

        RuleFor(x => x.CancelReason)
            .MaximumLength(500).WithMessage("Cancel reason must not exceed 500 characters");
    }
}

/// <summary>
/// Handler for CancelActivityCommand
/// Uses ICRMUnitOfWork for consistent data access
/// </summary>
public class CancelActivityCommandHandler : IRequestHandler<CancelActivityCommand, Result<ActivityDto>>
{
    private readonly ICRMUnitOfWork _unitOfWork;

    public CancelActivityCommandHandler(ICRMUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<ActivityDto>> Handle(CancelActivityCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var activity = await _unitOfWork.ReadRepository<Activity>().AsQueryable()
            .FirstOrDefaultAsync(a => a.Id == request.Id && a.TenantId == tenantId, cancellationToken);

        if (activity == null)
            return Result<ActivityDto>.Failure(Error.NotFound("Activity.NotFound", $"Activity with ID {request.Id} not found"));

        activity.Cancel(request.CancelReason);

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
