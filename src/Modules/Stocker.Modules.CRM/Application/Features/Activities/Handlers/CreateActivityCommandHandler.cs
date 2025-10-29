using MediatR;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Application.Features.Activities.Commands;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.Modules.CRM.Domain.Enums;
using Stocker.Modules.CRM.Infrastructure.Persistence;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Activities.Handlers;

public class CreateActivityCommandHandler : IRequestHandler<CreateActivityCommand, Result<ActivityDto>>
{
    private readonly CRMDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public CreateActivityCommandHandler(CRMDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<Result<ActivityDto>> Handle(CreateActivityCommand request, CancellationToken cancellationToken)
    {
        // Create Activity entity
        var activity = new Activity(
            tenantId: request.TenantId,
            subject: request.Subject,
            type: request.Type,
            ownerId: 1 // TODO: Map UserId properly
        );

        // Set details
        activity.UpdateDetails(request.Subject, request.Description, request.Priority);
        activity.SetDueDate(request.DueDate);

        // Set relationships
        if (request.CustomerId.HasValue)
            activity.RelateToCustomer(request.CustomerId.Value);
        else if (request.ContactId.HasValue)
            activity.RelateToContact(request.ContactId.Value);
        else if (request.LeadId.HasValue)
            activity.RelateToLead(request.LeadId.Value);
        else if (request.OpportunityId.HasValue)
            activity.RelateToOpportunity(request.OpportunityId.Value);
        else if (request.DealId.HasValue)
            activity.RelateToDeal(request.DealId.Value);

        // Set type-specific details
        if (request.Type == ActivityType.Meeting)
        {
            var endTime = request.DueDate.AddMinutes(request.Duration ?? 60);
            activity.SetMeetingDetails(
                startTime: request.DueDate,
                endTime: endTime,
                location: request.Location,
                attendees: null,
                agenda: request.Description,
                meetingLink: null
            );
        }

        // Add to context
        _context.Activities.Add(activity);
        await _context.SaveChangesAsync(cancellationToken);

        // Map to DTO
        var activityDto = new ActivityDto
        {
            Id = activity.Id,
            // TenantId = activity.TenantId,
            Subject = activity.Subject,
            Description = activity.Description,
            Type = activity.Type,
            Status = activity.Status,
            Priority = activity.Priority,
            DueDate = activity.DueDate ?? DateTime.UtcNow,
            Duration = request.Duration,
            Location = activity.Location,
            LeadId = activity.LeadId,
            CustomerId = activity.CustomerId,
            ContactId = activity.ContactId,
            OpportunityId = activity.OpportunityId,
            DealId = activity.DealId,
            AssignedToId = request.AssignedToId,
            Notes = request.Notes,
            CreatedAt = DateTime.UtcNow
        };

        return Result<ActivityDto>.Success(activityDto);
    }
}