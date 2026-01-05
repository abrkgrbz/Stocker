using MediatR;
using Stocker.Modules.HR.Domain.Entities;
using Stocker.Modules.HR.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Overtimes.Commands;

/// <summary>
/// Command to create a new overtime
/// </summary>
public record CreateOvertimeCommand : IRequest<Result<int>>
{
    public int EmployeeId { get; init; }
    public DateOnly Date { get; init; }
    public TimeOnly StartTime { get; init; }
    public TimeOnly EndTime { get; init; }
    public OvertimeType OvertimeType { get; init; }
    public OvertimeReason Reason { get; init; }
    public string? Description { get; init; }
    public int? ProjectId { get; init; }
    public string? ProjectName { get; init; }
    public string? TaskId { get; init; }
    public string? CostCenter { get; init; }
    public string? WorkDetails { get; init; }
    public int BreakMinutes { get; init; }
    public bool IsPreApproved { get; init; }
    public bool IsEmergency { get; init; }
}

/// <summary>
/// Handler for CreateOvertimeCommand
/// </summary>
public class CreateOvertimeCommandHandler : IRequestHandler<CreateOvertimeCommand, Result<int>>
{
    private readonly IHRUnitOfWork _unitOfWork;

    public CreateOvertimeCommandHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<int>> Handle(CreateOvertimeCommand request, CancellationToken cancellationToken)
    {
        // Verify employee exists
        var employee = await _unitOfWork.Employees.GetByIdAsync(request.EmployeeId, cancellationToken);
        if (employee == null)
        {
            return Result<int>.Failure(
                Error.NotFound("Employee", $"Employee with ID {request.EmployeeId} not found"));
        }

        // Create the overtime
        var overtime = new Overtime(
            request.EmployeeId,
            request.Date,
            request.StartTime,
            request.EndTime,
            request.OvertimeType,
            request.Reason,
            request.Description);

        // Set tenant ID
        overtime.SetTenantId(_unitOfWork.TenantId);

        // Set optional properties
        if (request.ProjectId.HasValue || !string.IsNullOrEmpty(request.ProjectName))
            overtime.SetProject(request.ProjectId, request.ProjectName);

        if (!string.IsNullOrEmpty(request.TaskId))
            overtime.SetTaskId(request.TaskId);

        if (!string.IsNullOrEmpty(request.CostCenter))
            overtime.SetCostCenter(request.CostCenter);

        if (!string.IsNullOrEmpty(request.WorkDetails))
            overtime.SetWorkDetails(request.WorkDetails);

        if (request.BreakMinutes > 0)
            overtime.SetBreakMinutes(request.BreakMinutes);

        if (request.IsPreApproved)
            overtime.SetPreApproved(true);

        if (request.IsEmergency)
            overtime.SetEmergency(true);

        // Save to repository
        await _unitOfWork.Overtimes.AddAsync(overtime, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<int>.Success(overtime.Id);
    }
}
