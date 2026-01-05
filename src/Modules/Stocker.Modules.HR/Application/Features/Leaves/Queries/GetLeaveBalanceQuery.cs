using FluentValidation;
using MediatR;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Leaves.Queries;

/// <summary>
/// Query to get employee's leave balance
/// </summary>
public record GetLeaveBalanceQuery : IRequest<Result<EmployeeLeaveSummaryDto>>
{
    public int EmployeeId { get; init; }
    public int? Year { get; init; }
}

/// <summary>
/// Validator for GetLeaveBalanceQuery
/// </summary>
public class GetLeaveBalanceQueryValidator : AbstractValidator<GetLeaveBalanceQuery>
{
    public GetLeaveBalanceQueryValidator()
    {
        RuleFor(x => x.EmployeeId)
            .GreaterThan(0).WithMessage("Employee ID is required");

        RuleFor(x => x.Year)
            .GreaterThan(1900).When(x => x.Year.HasValue)
            .WithMessage("Year must be valid");
    }
}

/// <summary>
/// Handler for GetLeaveBalanceQuery
/// </summary>
public class GetLeaveBalanceQueryHandler : IRequestHandler<GetLeaveBalanceQuery, Result<EmployeeLeaveSummaryDto>>
{
    private readonly IHRUnitOfWork _unitOfWork;

    public GetLeaveBalanceQueryHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<EmployeeLeaveSummaryDto>> Handle(GetLeaveBalanceQuery request, CancellationToken cancellationToken)
    {
        // Validate employee
        var employee = await _unitOfWork.Employees.GetByIdAsync(request.EmployeeId, cancellationToken);
        if (employee == null)
        {
            return Result<EmployeeLeaveSummaryDto>.Failure(
                Error.NotFound("Employee", $"Employee with ID {request.EmployeeId} not found"));
        }

        // Use current year if not specified
        var year = request.Year ?? DateTime.UtcNow.Year;

        // Get all leave balances for the employee and year
        var balances = await _unitOfWork.LeaveBalances.GetByEmployeeAndYearAsync(
            request.EmployeeId,
            year,
            cancellationToken);

        // Map to DTOs
        var balanceDtos = new List<LeaveBalanceDto>();
        foreach (var balance in balances)
        {
            var leaveType = await _unitOfWork.LeaveTypes.GetByIdAsync(balance.LeaveTypeId, cancellationToken);

            balanceDtos.Add(new LeaveBalanceDto
            {
                Id = balance.Id,
                EmployeeId = balance.EmployeeId,
                EmployeeName = $"{employee.FirstName} {employee.LastName}",
                LeaveTypeId = balance.LeaveTypeId,
                LeaveTypeName = leaveType?.Name ?? "Unknown",
                Year = balance.Year,
                Entitled = balance.Entitled,
                Used = balance.Used,
                Pending = balance.Pending,
                CarriedForward = balance.CarriedForward,
                Adjustment = balance.Adjustment,
                AdjustmentReason = balance.AdjustmentReason,
                Available = balance.Available
            });
        }

        // Create summary
        var summary = new EmployeeLeaveSummaryDto
        {
            EmployeeId = request.EmployeeId,
            EmployeeName = $"{employee.FirstName} {employee.LastName}",
            Year = year,
            Balances = balanceDtos,
            TotalEntitled = balanceDtos.Sum(b => b.Entitled),
            TotalUsed = balanceDtos.Sum(b => b.Used),
            TotalPending = balanceDtos.Sum(b => b.Pending),
            TotalAvailable = balanceDtos.Sum(b => b.Available)
        };

        return Result<EmployeeLeaveSummaryDto>.Success(summary);
    }
}
