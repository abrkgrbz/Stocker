using MediatR;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Grievances.Queries;

/// <summary>
/// Query to get a grievance by ID
/// </summary>
public record GetGrievanceByIdQuery(int Id) : IRequest<Result<GrievanceDto>>;

/// <summary>
/// Handler for GetGrievanceByIdQuery
/// </summary>
public class GetGrievanceByIdQueryHandler : IRequestHandler<GetGrievanceByIdQuery, Result<GrievanceDto>>
{
    private readonly IHRUnitOfWork _unitOfWork;

    public GetGrievanceByIdQueryHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<GrievanceDto>> Handle(GetGrievanceByIdQuery request, CancellationToken cancellationToken)
    {
        var entity = await _unitOfWork.Grievances.GetByIdAsync(request.Id, cancellationToken);
        if (entity == null)
        {
            return Result<GrievanceDto>.Failure(
                Error.NotFound("Grievance", $"Grievance with ID {request.Id} not found"));
        }

        // Get related names
        var complainant = await _unitOfWork.Employees.GetByIdAsync(entity.ComplainantId, cancellationToken);
        var complainantName = complainant != null ? $"{complainant.FirstName} {complainant.LastName}" : string.Empty;

        string? accusedPersonName = null;
        if (entity.AccusedPersonId.HasValue)
        {
            var accusedPerson = await _unitOfWork.Employees.GetByIdAsync(entity.AccusedPersonId.Value, cancellationToken);
            accusedPersonName = accusedPerson != null ? $"{accusedPerson.FirstName} {accusedPerson.LastName}" : null;
        }

        string? assignedToName = null;
        if (entity.AssignedToId.HasValue)
        {
            var assignedTo = await _unitOfWork.Employees.GetByIdAsync(entity.AssignedToId.Value, cancellationToken);
            assignedToName = assignedTo != null ? $"{assignedTo.FirstName} {assignedTo.LastName}" : null;
        }

        string? hrRepresentativeName = null;
        if (entity.HrRepresentativeId.HasValue)
        {
            var hrRep = await _unitOfWork.Employees.GetByIdAsync(entity.HrRepresentativeId.Value, cancellationToken);
            hrRepresentativeName = hrRep != null ? $"{hrRep.FirstName} {hrRep.LastName}" : null;
        }

        var dto = new GrievanceDto
        {
            Id = entity.Id,
            GrievanceCode = entity.GrievanceCode,
            ComplainantId = entity.ComplainantId,
            ComplainantName = complainantName,
            Status = entity.Status.ToString(),
            GrievanceType = entity.GrievanceType.ToString(),
            Priority = entity.Priority.ToString(),
            Subject = entity.Subject,
            Description = entity.Description,
            IncidentDate = entity.IncidentDate,
            IncidentLocation = entity.IncidentLocation,
            AccusedPersonId = entity.AccusedPersonId,
            AccusedPersonName = accusedPersonName,
            AccusedPersonDescription = entity.AccusedPersonDescription,
            Witnesses = entity.Witnesses,
            Evidence = entity.Evidence,
            IsAnonymous = entity.IsAnonymous,
            IsConfidential = entity.IsConfidential,
            RetaliationProtectionRequested = entity.RetaliationProtectionRequested,
            AssignedToId = entity.AssignedToId,
            AssignedToName = assignedToName,
            HrRepresentativeId = entity.HrRepresentativeId,
            HrRepresentativeName = hrRepresentativeName,
            AssignedDate = entity.AssignedDate,
            FiledDate = entity.FiledDate,
            AcknowledgedDate = entity.AcknowledgedDate,
            TargetResolutionDate = entity.TargetResolutionDate,
            ResolutionDate = entity.ResolutionDate,
            ClosedDate = entity.ClosedDate,
            InvestigationRequired = entity.InvestigationRequired,
            InvestigationStartDate = entity.InvestigationStartDate,
            InvestigationEndDate = entity.InvestigationEndDate,
            InvestigationNotes = entity.InvestigationNotes,
            InvestigationFindings = entity.InvestigationFindings,
            Resolution = entity.Resolution,
            ResolutionType = entity.ResolutionType?.ToString(),
            ActionsTaken = entity.ActionsTaken,
            PreventiveMeasures = entity.PreventiveMeasures,
            ComplainantSatisfied = entity.ComplainantSatisfied,
            SatisfactionFeedback = entity.SatisfactionFeedback,
            SatisfactionRating = entity.SatisfactionRating,
            WasEscalated = entity.WasEscalated,
            EscalationDate = entity.EscalationDate,
            EscalationReason = entity.EscalationReason,
            EscalationLevel = entity.EscalationLevel,
            InternalNotes = entity.InternalNotes,
            Category = entity.Category,
            Subcategory = entity.Subcategory,
            Tags = entity.Tags,
            CreatedAt = entity.CreatedDate,
            UpdatedAt = entity.UpdatedDate
        };

        return Result<GrievanceDto>.Success(dto);
    }
}
