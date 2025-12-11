using MediatR;
using Stocker.Modules.HR.Domain.Entities;
using Stocker.Modules.HR.Domain.Repositories;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.DisciplinaryActions.Commands;

/// <summary>
/// Command to update a disciplinary action
/// </summary>
public record UpdateDisciplinaryActionCommand : IRequest<Result<int>>
{
    public Guid TenantId { get; init; }
    public int DisciplinaryActionId { get; init; }
    public string? InvestigationNotes { get; init; }
    public string? InvestigationFindings { get; init; }
    public DateTime? DefenseDeadline { get; init; }
    public string? DefenseText { get; init; }
    public int? DecisionMakerId { get; init; }
    public string? Decision { get; init; }
    public string? DecisionRationale { get; init; }
    public AppliedSanction? AppliedSanction { get; init; }
    public string? SanctionDetails { get; init; }
    public DateTime? SanctionStartDate { get; init; }
    public DateTime? SanctionEndDate { get; init; }
    public int? SanctionDurationDays { get; init; }
    public decimal? SalaryDeductionAmount { get; init; }
    public DateTime? FollowUpDate { get; init; }
    public string? FollowUpNotes { get; init; }
    public int? PerformanceImprovementPlanId { get; init; }
    public string? AppealNotes { get; init; }
    public AppealOutcome? AppealOutcome { get; init; }
    public string? InternalNotes { get; init; }
}

/// <summary>
/// Handler for UpdateDisciplinaryActionCommand
/// </summary>
public class UpdateDisciplinaryActionCommandHandler : IRequestHandler<UpdateDisciplinaryActionCommand, Result<int>>
{
    private readonly IDisciplinaryActionRepository _disciplinaryActionRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateDisciplinaryActionCommandHandler(
        IDisciplinaryActionRepository disciplinaryActionRepository,
        IUnitOfWork unitOfWork)
    {
        _disciplinaryActionRepository = disciplinaryActionRepository;
        _unitOfWork = unitOfWork;
    }

    public async System.Threading.Tasks.Task<Result<int>> Handle(UpdateDisciplinaryActionCommand request, CancellationToken cancellationToken)
    {
        var disciplinaryAction = await _disciplinaryActionRepository.GetByIdAsync(request.DisciplinaryActionId, cancellationToken);
        if (disciplinaryAction == null)
        {
            return Result<int>.Failure(
                Error.NotFound("DisciplinaryAction", $"Disciplinary action with ID {request.DisciplinaryActionId} not found"));
        }

        if (!string.IsNullOrEmpty(request.InvestigationNotes))
            disciplinaryAction.SetInvestigationNotes(request.InvestigationNotes);

        if (!string.IsNullOrEmpty(request.InvestigationFindings))
            disciplinaryAction.CompleteInvestigation(request.InvestigationFindings);

        if (request.DefenseDeadline.HasValue)
            disciplinaryAction.RequestDefense(request.DefenseDeadline.Value);

        if (!string.IsNullOrEmpty(request.DefenseText))
            disciplinaryAction.ReceiveDefense(request.DefenseText);

        if (request.DecisionMakerId.HasValue && !string.IsNullOrEmpty(request.Decision)
            && !string.IsNullOrEmpty(request.DecisionRationale) && request.AppliedSanction.HasValue)
        {
            disciplinaryAction.MakeDecision(
                request.DecisionMakerId.Value,
                request.Decision,
                request.DecisionRationale,
                request.AppliedSanction.Value);
        }

        if (request.SanctionStartDate.HasValue)
        {
            disciplinaryAction.ApplySanction(
                request.SanctionStartDate.Value,
                request.SanctionEndDate,
                request.SanctionDurationDays,
                request.SanctionDetails);
        }

        if (request.SalaryDeductionAmount.HasValue)
            disciplinaryAction.SetSalaryDeduction(request.SalaryDeductionAmount.Value);

        if (request.FollowUpDate.HasValue)
            disciplinaryAction.SetFollowUp(request.FollowUpDate.Value, request.FollowUpNotes);

        if (request.PerformanceImprovementPlanId.HasValue)
            disciplinaryAction.SetPIP(request.PerformanceImprovementPlanId.Value);

        if (!string.IsNullOrEmpty(request.AppealNotes) && request.AppealOutcome.HasValue)
        {
            disciplinaryAction.FileAppeal(request.AppealNotes);
            disciplinaryAction.ResolveAppeal(request.AppealOutcome.Value);
        }

        if (!string.IsNullOrEmpty(request.InternalNotes))
            disciplinaryAction.SetInternalNotes(request.InternalNotes);

        _disciplinaryActionRepository.Update(disciplinaryAction);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<int>.Success(disciplinaryAction.Id);
    }
}
