using MediatR;
using Stocker.Modules.HR.Domain.Entities;
using Stocker.Modules.HR.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.TimeSheets.Commands;

/// <summary>
/// Command to create a new timesheet
/// </summary>
public record CreateTimeSheetCommand : IRequest<Result<int>>
{
    public int EmployeeId { get; init; }
    public DateOnly PeriodStart { get; init; }
    public DateOnly PeriodEnd { get; init; }
}

/// <summary>
/// Handler for CreateTimeSheetCommand
/// </summary>
public class CreateTimeSheetCommandHandler : IRequestHandler<CreateTimeSheetCommand, Result<int>>
{
    private readonly IHRUnitOfWork _unitOfWork;

    public CreateTimeSheetCommandHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<int>> Handle(CreateTimeSheetCommand request, CancellationToken cancellationToken)
    {
        // Verify employee exists
        var employee = await _unitOfWork.Employees.GetByIdAsync(request.EmployeeId, cancellationToken);
        if (employee == null)
        {
            return Result<int>.Failure(
                Error.NotFound("Employee", $"Employee with ID {request.EmployeeId} not found"));
        }

        // Check if timesheet already exists for this employee and period
        var existingTimeSheet = await _unitOfWork.TimeSheets.GetByEmployeeAndPeriodAsync(
            request.EmployeeId, request.PeriodStart, request.PeriodEnd, cancellationToken);
        if (existingTimeSheet != null)
        {
            return Result<int>.Failure(
                Error.Conflict("TimeSheet", $"TimeSheet already exists for employee {request.EmployeeId} for period {request.PeriodStart} to {request.PeriodEnd}"));
        }

        // Validate period dates
        if (request.PeriodStart >= request.PeriodEnd)
        {
            return Result<int>.Failure(
                Error.Validation("TimeSheet.Period", "Period start date must be before period end date"));
        }

        // Create the timesheet
        var timeSheet = new TimeSheet(
            request.EmployeeId,
            request.PeriodStart,
            request.PeriodEnd);

        // Set tenant ID
        timeSheet.SetTenantId(_unitOfWork.TenantId);

        // Save to repository
        await _unitOfWork.TimeSheets.AddAsync(timeSheet, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<int>.Success(timeSheet.Id);
    }
}
