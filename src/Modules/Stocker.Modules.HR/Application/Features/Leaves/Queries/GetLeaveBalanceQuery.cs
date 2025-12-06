using FluentValidation;
using MediatR;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Domain.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Leaves.Queries;

/// <summary>
/// Query to get employee's leave balance
/// </summary>
public class GetLeaveBalanceQuery : IRequest<Result<EmployeeLeaveSummaryDto>>
{
    public Guid TenantId { get; set; }
    public int EmployeeId { get; set; }
    public int? Year { get; set; }
}

/// <summary>
/// Validator for GetLeaveBalanceQuery
/// </summary>
public class GetLeaveBalanceQueryValidator : AbstractValidator<GetLeaveBalanceQuery>
{
    public GetLeaveBalanceQueryValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Tenant ID is required");

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
    private readonly ILeaveBalanceRepository _leaveBalanceRepository;
    private readonly IEmployeeRepository _employeeRepository;
    private readonly ILeaveTypeRepository _leaveTypeRepository;

    public GetLeaveBalanceQueryHandler(
        ILeaveBalanceRepository leaveBalanceRepository,
        IEmployeeRepository employeeRepository,
        ILeaveTypeRepository leaveTypeRepository)
    {
        _leaveBalanceRepository = leaveBalanceRepository;
        _employeeRepository = employeeRepository;
        _leaveTypeRepository = leaveTypeRepository;
    }

    public async Task<Result<EmployeeLeaveSummaryDto>> Handle(GetLeaveBalanceQuery request, CancellationToken cancellationToken)
    {
        // Validate employee
        var employee = await _employeeRepository.GetByIdAsync(request.EmployeeId, cancellationToken);
        if (employee == null)
        {
            return Result<EmployeeLeaveSummaryDto>.Failure(
                Error.NotFound("Employee", $"Employee with ID {request.EmployeeId} not found"));
        }

        // Use current year if not specified
        var year = request.Year ?? DateTime.UtcNow.Year;

        // Get all leave balances for the employee and year
        var balances = await _leaveBalanceRepository.GetByEmployeeAndYearAsync(
            request.EmployeeId,
            year,
            cancellationToken);

        // Map to DTOs
        var balanceDtos = new List<LeaveBalanceDto>();
        foreach (var balance in balances)
        {
            var leaveType = await _leaveTypeRepository.GetByIdAsync(balance.LeaveTypeId, cancellationToken);

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
