using FluentValidation;
using MediatR;
using Stocker.Modules.HR.Domain.Entities;
using Stocker.Modules.HR.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Grievances.Commands;

/// <summary>
/// Command to update a grievance
/// </summary>
public record UpdateGrievanceCommand : IRequest<Result<bool>>
{
    public int GrievanceId { get; init; }
    public GrievanceStatus? Status { get; init; }
    public GrievancePriority? Priority { get; init; }
    public int? AssignedToId { get; init; }
    public int? HrRepresentativeId { get; init; }
    public string? InvestigationNotes { get; init; }
    public string? Resolution { get; init; }
    public ResolutionType? ResolutionType { get; init; }
    public string? InternalNotes { get; init; }
}

/// <summary>
/// Validator for UpdateGrievanceCommand
/// </summary>
public class UpdateGrievanceCommandValidator : AbstractValidator<UpdateGrievanceCommand>
{
    public UpdateGrievanceCommandValidator()
    {
        RuleFor(x => x.GrievanceId)
            .GreaterThan(0).WithMessage("Grievance ID must be greater than 0");
    }
}

/// <summary>
/// Handler for UpdateGrievanceCommand
/// </summary>
public class UpdateGrievanceCommandHandler : IRequestHandler<UpdateGrievanceCommand, Result<bool>>
{
    private readonly IHRUnitOfWork _unitOfWork;

    public UpdateGrievanceCommandHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(UpdateGrievanceCommand request, CancellationToken cancellationToken)
    {
        // Get existing grievance
        var grievance = await _unitOfWork.Grievances.GetByIdAsync(request.GrievanceId, cancellationToken);
        if (grievance == null)
        {
            return Result<bool>.Failure(
                Error.NotFound("Grievance", $"Grievance with ID {request.GrievanceId} not found"));
        }

        // Verify assignee if specified
        if (request.AssignedToId.HasValue)
        {
            var assignee = await _unitOfWork.Employees.GetByIdAsync(request.AssignedToId.Value, cancellationToken);
            if (assignee == null)
            {
                return Result<bool>.Failure(
                    Error.NotFound("Employee", $"Assignee with ID {request.AssignedToId} not found"));
            }
            grievance.AssignTo(request.AssignedToId.Value, request.HrRepresentativeId);
        }

        // Update properties
        if (request.Priority.HasValue)
            grievance.SetPriority(request.Priority.Value);

        if (!string.IsNullOrEmpty(request.InvestigationNotes))
            grievance.SetInvestigationNotes(request.InvestigationNotes);

        if (!string.IsNullOrEmpty(request.Resolution) && request.ResolutionType.HasValue)
            grievance.Resolve(request.Resolution, request.ResolutionType.Value);

        if (!string.IsNullOrEmpty(request.InternalNotes))
            grievance.SetInternalNotes(request.InternalNotes);

        // Save changes
        await _unitOfWork.Grievances.UpdateAsync(grievance, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
