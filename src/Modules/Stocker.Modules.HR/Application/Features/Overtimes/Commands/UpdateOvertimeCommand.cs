using MediatR;
using Stocker.Modules.HR.Domain.Entities;
using Stocker.Modules.HR.Domain.Repositories;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Overtimes.Commands;

/// <summary>
/// Command to update an overtime
/// </summary>
public record UpdateOvertimeCommand : IRequest<Result<bool>>
{
    public Guid TenantId { get; init; }
    public int OvertimeId { get; init; }
    public decimal? ActualHours { get; init; }
    public int? BreakMinutes { get; init; }
    public int? ProjectId { get; init; }
    public string? ProjectName { get; init; }
    public string? TaskId { get; init; }
    public string? CostCenter { get; init; }
    public string? WorkDetails { get; init; }
    public string? Notes { get; init; }
    public OvertimeStatus? Status { get; init; }
}

/// <summary>
/// Handler for UpdateOvertimeCommand
/// </summary>
public class UpdateOvertimeCommandHandler : IRequestHandler<UpdateOvertimeCommand, Result<bool>>
{
    private readonly IOvertimeRepository _overtimeRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateOvertimeCommandHandler(
        IOvertimeRepository overtimeRepository,
        IUnitOfWork unitOfWork)
    {
        _overtimeRepository = overtimeRepository;
        _unitOfWork = unitOfWork;
    }

    public async System.Threading.Tasks.Task<Result<bool>> Handle(UpdateOvertimeCommand request, CancellationToken cancellationToken)
    {
        // Get existing overtime
        var overtime = await _overtimeRepository.GetByIdAsync(request.OvertimeId, cancellationToken);
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
        _overtimeRepository.Update(overtime);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
