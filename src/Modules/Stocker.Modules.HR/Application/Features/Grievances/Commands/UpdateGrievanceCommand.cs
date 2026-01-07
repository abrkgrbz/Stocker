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
    public string? Status { get; init; }
    public string? GrievanceType { get; init; }
    public string? Priority { get; init; }
    public string? Subject { get; init; }
    public string? Description { get; init; }
    public int? AssignedToId { get; init; }
    public int? HrRepresentativeId { get; init; }
    public DateTime? TargetResolutionDate { get; init; }
    // Investigation
    public bool? InvestigationRequired { get; init; }
    public DateTime? InvestigationStartDate { get; init; }
    public DateTime? InvestigationEndDate { get; init; }
    public string? InvestigationNotes { get; init; }
    public string? InvestigationFindings { get; init; }
    // Resolution
    public string? Resolution { get; init; }
    public string? ResolutionType { get; init; }
    public string? ActionsTaken { get; init; }
    public string? PreventiveMeasures { get; init; }
    // Satisfaction
    public bool? ComplainantSatisfied { get; init; }
    public string? SatisfactionFeedback { get; init; }
    public int? SatisfactionRating { get; init; }
    // Escalation
    public bool? WasEscalated { get; init; }
    public DateTime? EscalationDate { get; init; }
    public string? EscalationReason { get; init; }
    public int? EscalationLevel { get; init; }
    // Other
    public string? InternalNotes { get; init; }
    public string? Category { get; init; }
    public string? Subcategory { get; init; }
    public string? Tags { get; init; }
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

        // Update basic properties
        if (!string.IsNullOrEmpty(request.GrievanceType) && Enum.TryParse<GrievanceType>(request.GrievanceType, true, out var grievanceType))
            grievance.SetGrievanceType(grievanceType);

        if (!string.IsNullOrEmpty(request.Priority) && Enum.TryParse<GrievancePriority>(request.Priority, true, out var priority))
            grievance.SetPriority(priority);

        if (!string.IsNullOrEmpty(request.Subject))
            grievance.SetSubject(request.Subject);

        if (!string.IsNullOrEmpty(request.Description))
            grievance.SetDescription(request.Description);

        if (request.TargetResolutionDate.HasValue)
            grievance.SetTargetResolutionDate(request.TargetResolutionDate.Value);

        // Update investigation
        if (request.InvestigationRequired.HasValue)
            grievance.SetInvestigationRequired(request.InvestigationRequired.Value);

        if (request.InvestigationStartDate.HasValue)
            grievance.SetInvestigationStartDate(request.InvestigationStartDate.Value);

        if (request.InvestigationEndDate.HasValue)
            grievance.SetInvestigationEndDate(request.InvestigationEndDate.Value);

        if (!string.IsNullOrEmpty(request.InvestigationNotes))
            grievance.SetInvestigationNotes(request.InvestigationNotes);

        if (!string.IsNullOrEmpty(request.InvestigationFindings))
            grievance.SetInvestigationFindings(request.InvestigationFindings);

        // Update resolution
        if (!string.IsNullOrEmpty(request.Resolution))
            grievance.SetResolution(request.Resolution);

        if (!string.IsNullOrEmpty(request.ResolutionType) && Enum.TryParse<ResolutionType>(request.ResolutionType, true, out var resolutionType))
            grievance.SetResolutionType(resolutionType);

        if (!string.IsNullOrEmpty(request.ActionsTaken))
            grievance.SetActionsTaken(request.ActionsTaken);

        if (!string.IsNullOrEmpty(request.PreventiveMeasures))
            grievance.SetPreventiveMeasures(request.PreventiveMeasures);

        // Update satisfaction
        if (request.ComplainantSatisfied.HasValue || request.SatisfactionRating.HasValue || !string.IsNullOrEmpty(request.SatisfactionFeedback))
            grievance.RecordSatisfaction(request.ComplainantSatisfied ?? false, request.SatisfactionRating, request.SatisfactionFeedback);

        // Update escalation
        if (request.WasEscalated.HasValue || request.EscalationDate.HasValue || !string.IsNullOrEmpty(request.EscalationReason) || request.EscalationLevel.HasValue)
            grievance.SetEscalation(
                request.WasEscalated ?? grievance.WasEscalated, 
                request.EscalationDate ?? grievance.EscalationDate, 
                request.EscalationReason ?? grievance.EscalationReason, 
                request.EscalationLevel ?? grievance.EscalationLevel);

        // Update other
        if (!string.IsNullOrEmpty(request.InternalNotes))
            grievance.SetInternalNotes(request.InternalNotes);

        if (!string.IsNullOrEmpty(request.Category) || !string.IsNullOrEmpty(request.Subcategory))
            grievance.SetCategory(request.Category ?? grievance.Category, request.Subcategory ?? grievance.Subcategory);

        if (!string.IsNullOrEmpty(request.Tags))
            grievance.SetTags(request.Tags);

        // Save changes
        await _unitOfWork.Grievances.UpdateAsync(grievance, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
