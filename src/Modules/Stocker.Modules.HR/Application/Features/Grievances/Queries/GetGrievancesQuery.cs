using MediatR;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Grievances.Queries;

/// <summary>
/// Query to get all grievances
/// </summary>
public record GetGrievancesQuery : IRequest<Result<List<GrievanceDto>>>
{
    public int? ComplainantId { get; init; }
    public bool OpenOnly { get; init; } = false;
}

/// <summary>
/// Handler for GetGrievancesQuery
/// </summary>
public class GetGrievancesQueryHandler : IRequestHandler<GetGrievancesQuery, Result<List<GrievanceDto>>>
{
    private readonly IHRUnitOfWork _unitOfWork;

    public GetGrievancesQueryHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<List<GrievanceDto>>> Handle(GetGrievancesQuery request, CancellationToken cancellationToken)
    {
        var entities = await _unitOfWork.Grievances.GetAllAsync(cancellationToken);

        var filteredEntities = entities.AsEnumerable();

        if (request.ComplainantId.HasValue)
        {
            filteredEntities = filteredEntities.Where(e => e.ComplainantId == request.ComplainantId.Value);
        }

        if (request.OpenOnly)
        {
            filteredEntities = filteredEntities.Where(e =>
                e.Status != Domain.Entities.GrievanceStatus.Closed &&
                e.Status != Domain.Entities.GrievanceStatus.Withdrawn);
        }

        var dtos = new List<GrievanceDto>();
        foreach (var entity in filteredEntities)
        {
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

            dtos.Add(new GrievanceDto
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
            });
        }

        return Result<List<GrievanceDto>>.Success(dtos.OrderByDescending(g => g.FiledDate).ToList());
    }
}
