using MediatR;
using Stocker.Modules.HR.Domain.Entities;
using Stocker.Modules.HR.Domain.Repositories;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.DisciplinaryActions.Commands;

/// <summary>
/// Command to create a new disciplinary action
/// </summary>
public record CreateDisciplinaryActionCommand : IRequest<Result<int>>
{
    public Guid TenantId { get; init; }
    public int EmployeeId { get; init; }
    public string ActionCode { get; init; } = string.Empty;
    public DateTime IncidentDate { get; init; }
    public string IncidentDescription { get; init; } = string.Empty;
    public DisciplinaryActionType ActionType { get; init; }
    public SeverityLevel SeverityLevel { get; init; }
    public string? IncidentLocation { get; init; }
    public string? ViolatedPolicy { get; init; }
    public string? Witnesses { get; init; }
    public string? Evidence { get; init; }
    public int? InvestigatorId { get; init; }
    public int? ReportedById { get; init; }
    public int? HrRepresentativeId { get; init; }
    public bool IsConfidential { get; init; }
    public int PreviousWarningsCount { get; init; }
    public string? InternalNotes { get; init; }
}

/// <summary>
/// Handler for CreateDisciplinaryActionCommand
/// </summary>
public class CreateDisciplinaryActionCommandHandler : IRequestHandler<CreateDisciplinaryActionCommand, Result<int>>
{
    private readonly IDisciplinaryActionRepository _disciplinaryActionRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateDisciplinaryActionCommandHandler(
        IDisciplinaryActionRepository disciplinaryActionRepository,
        IUnitOfWork unitOfWork)
    {
        _disciplinaryActionRepository = disciplinaryActionRepository;
        _unitOfWork = unitOfWork;
    }

    public async System.Threading.Tasks.Task<Result<int>> Handle(CreateDisciplinaryActionCommand request, CancellationToken cancellationToken)
    {
        var disciplinaryAction = new DisciplinaryAction(
            request.EmployeeId,
            request.ActionCode,
            request.IncidentDate,
            request.IncidentDescription,
            request.ActionType,
            request.SeverityLevel);

        disciplinaryAction.SetTenantId(request.TenantId);

        if (!string.IsNullOrEmpty(request.IncidentLocation))
            disciplinaryAction.SetIncidentLocation(request.IncidentLocation);

        if (!string.IsNullOrEmpty(request.ViolatedPolicy))
            disciplinaryAction.SetViolatedPolicy(request.ViolatedPolicy);

        if (!string.IsNullOrEmpty(request.Witnesses))
            disciplinaryAction.SetWitnesses(request.Witnesses);

        if (!string.IsNullOrEmpty(request.Evidence))
            disciplinaryAction.SetEvidence(request.Evidence);

        if (request.InvestigatorId.HasValue)
            disciplinaryAction.StartInvestigation(request.InvestigatorId.Value);

        if (request.ReportedById.HasValue)
            disciplinaryAction.SetReportedBy(request.ReportedById);

        if (request.HrRepresentativeId.HasValue)
            disciplinaryAction.SetHrRepresentative(request.HrRepresentativeId);

        disciplinaryAction.SetConfidential(request.IsConfidential);
        disciplinaryAction.SetPreviousWarningsCount(request.PreviousWarningsCount);

        if (!string.IsNullOrEmpty(request.InternalNotes))
            disciplinaryAction.SetInternalNotes(request.InternalNotes);

        await _disciplinaryActionRepository.AddAsync(disciplinaryAction, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<int>.Success(disciplinaryAction.Id);
    }
}
