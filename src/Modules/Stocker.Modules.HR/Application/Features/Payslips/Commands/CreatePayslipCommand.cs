using MediatR;
using Stocker.Modules.HR.Domain.Entities;
using Stocker.Modules.HR.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Payslips.Commands;

/// <summary>
/// Command to create a new payslip
/// </summary>
public record CreatePayslipCommand : IRequest<Result<int>>
{
    public int EmployeeId { get; init; }
    public int PayrollId { get; init; }
    public string PayslipNumber { get; init; } = string.Empty;
    public int Year { get; init; }
    public int Month { get; init; }
    public DateOnly PeriodStart { get; init; }
    public DateOnly PeriodEnd { get; init; }
    public DateOnly PaymentDate { get; init; }
    public decimal BaseSalary { get; init; }
    public decimal OvertimePay { get; init; }
    public decimal Bonus { get; init; }
    public decimal TransportationAllowance { get; init; }
    public decimal MealAllowance { get; init; }
    public int DaysWorked { get; init; }
    public decimal HoursWorked { get; init; }
    public string? BankName { get; init; }
    public string? Iban { get; init; }
}

/// <summary>
/// Handler for CreatePayslipCommand
/// </summary>
public class CreatePayslipCommandHandler : IRequestHandler<CreatePayslipCommand, Result<int>>
{
    private readonly IHRUnitOfWork _unitOfWork;

    public CreatePayslipCommandHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<int>> Handle(CreatePayslipCommand request, CancellationToken cancellationToken)
    {
        // Verify employee exists
        var employee = await _unitOfWork.Employees.GetByIdAsync(request.EmployeeId, cancellationToken);
        if (employee == null)
        {
            return Result<int>.Failure(
                Error.NotFound("Employee", $"Employee with ID {request.EmployeeId} not found"));
        }

        // Check if payslip already exists for this employee and period
        var existingPayslip = await _unitOfWork.Payslips.GetByEmployeeAndPeriodAsync(
            request.EmployeeId, request.Year, request.Month, cancellationToken);
        if (existingPayslip != null)
        {
            return Result<int>.Failure(
                Error.Conflict("Payslip", $"Payslip already exists for employee {request.EmployeeId} for period {request.Year}-{request.Month:D2}"));
        }

        // Create the payslip
        var payslip = new Payslip(
            request.EmployeeId,
            request.PayrollId,
            request.PayslipNumber,
            request.Year,
            request.Month,
            request.PeriodStart,
            request.PeriodEnd,
            request.PaymentDate);

        // Set tenant ID
        payslip.SetTenantId(_unitOfWork.TenantId);

        // Set earnings
        payslip.SetEarnings(
            request.BaseSalary,
            request.OvertimePay,
            request.Bonus,
            0, // gratuity
            0, // commission
            0); // other earnings

        // Set allowances
        payslip.SetAllowances(
            request.TransportationAllowance,
            request.MealAllowance,
            0, // housing
            0, // phone
            0); // other

        // Set work info
        payslip.SetWorkInfo(
            request.DaysWorked,
            request.HoursWorked,
            0, // overtime hours
            0, // leave days
            0, // absence days
            0); // holiday days

        // Set bank info
        payslip.SetBankInfo(
            request.BankName,
            request.Iban,
            PaymentMethod.BankTransfer,
            null);

        // Save to repository
        await _unitOfWork.Payslips.AddAsync(payslip, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<int>.Success(payslip.Id);
    }
}
