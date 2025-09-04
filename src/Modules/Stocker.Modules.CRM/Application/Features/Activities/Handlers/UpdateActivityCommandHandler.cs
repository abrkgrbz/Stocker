using MediatR;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Application.Features.Activities.Commands;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Activities.Handlers;

public class UpdateActivityCommandHandler : IRequestHandler<UpdateActivityCommand, Result<ActivityDto>>
{
    private readonly SharedKernel.Interfaces.IUnitOfWork _unitOfWork;

    public UpdateActivityCommandHandler(SharedKernel.Interfaces.IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<ActivityDto>> Handle(UpdateActivityCommand request, CancellationToken cancellationToken)
    {
        // TODO: Implement activity update logic
        // This is a placeholder implementation until Activity entity and repository are created
        
        var activityDto = new ActivityDto
        {
            Id = request.Id,
            Subject = request.Subject,
            Description = request.Description,
            Type = request.Type,
            Status = request.Status,
            Priority = request.Priority,
            DueDate = request.DueDate,
            Duration = request.Duration,
            Location = request.Location,
            LeadId = request.LeadId,
            CustomerId = request.CustomerId,
            ContactId = request.ContactId,
            OpportunityId = request.OpportunityId,
            DealId = request.DealId,
            AssignedToId = request.AssignedToId,
            Notes = request.Notes,
            UpdatedAt = DateTime.UtcNow
        };

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<ActivityDto>.Success(activityDto);
    }
}