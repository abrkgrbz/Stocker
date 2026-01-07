using MediatR;
using Stocker.Modules.HR.Domain.Entities;
using Stocker.Modules.HR.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Overtimes.Commands;

/// <summary>
/// Command to update an overtime
/// </summary>
public record UpdateOvertimeCommand : IRequest<Result<bool>>
{
    public int OvertimeId { get; init; }
    public string? OvertimeType { get; init; }
    public string? Status { get; init; }
    public DateOnly? Date { get; init; }
    public TimeOnly? StartTime { get; init; }
    public TimeOnly? EndTime { get; init; }
    public decimal? PlannedHours { get; init; }
    public decimal? ActualHours { get; init; }
    public int? BreakMinutes { get; init; }
    public decimal? PayMultiplier { get; init; }
    public int? ProjectId { get; init; }
    public string? ProjectName { get; init; }
    public string? TaskId { get; init; }
    public string? CostCenter { get; init; }
    public string? Reason { get; init; }
    public string? Description { get; init; }
    public string? WorkDetails { get; init; }
    public string? ApprovalNotes { get; init; }
    public string? RejectionReason { get; init; }
    public bool? IsCompensatoryTimeOff { get; init; }
    public decimal? CompensatoryHoursEarned { get; init; }
    public decimal? CompensatoryHoursUsed { get; init; }
    public string? Notes { get; init; }
}

/// <summary>
/// Handler for UpdateOvertimeCommand
/// </summary>
public class UpdateOvertimeCommandHandler : IRequestHandler<UpdateOvertimeCommand, Result<bool>>
{
    private readonly IHRUnitOfWork _unitOfWork;

    public UpdateOvertimeCommandHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(UpdateOvertimeCommand request, CancellationToken cancellationToken)
    {
        // Get existing overtime
        var overtime = await _unitOfWork.Overtimes.GetByIdAsync(request.OvertimeId, cancellationToken);
        if (overtime == null)
        {
            return Result<bool>.Failure(
                Error.NotFound("Overtime", $"Overtime with ID {request.OvertimeId} not found"));
        }

        // Check if overtime can be updated
        if (overtime.Status == OvertimeStatus.Approved || overtime.Status == OvertimeStatus.Completed)
        {
            return Result<bool>.Failure(
                Error.Conflict("Overtime", "Cannot update approved or completed overtime"));
        }

        // Update the overtime
        if (request.ActualHours.HasValue)
            overtime.RecordActualHours(request.ActualHours.Value, request.BreakMinutes);

        if (request.BreakMinutes.HasValue)
            overtime.SetBreakMinutes(request.BreakMinutes.Value);

        if (request.ProjectId.HasValue || !string.IsNullOrEmpty(request.ProjectName))
            overtime.SetProject(request.ProjectId, request.ProjectName);

        if (!string.IsNullOrEmpty(request.TaskId))
            overtime.SetTaskId(request.TaskId);

        if (!string.IsNullOrEmpty(request.CostCenter))
            overtime.SetCostCenter(request.CostCenter);

        if (!string.IsNullOrEmpty(request.WorkDetails))
            overtime.SetWorkDetails(request.WorkDetails);

        if (!string.IsNullOrEmpty(request.Notes))
            overtime.SetNotes(request.Notes);

        // Save changes
        _unitOfWork.Overtimes.Update(overtime);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
