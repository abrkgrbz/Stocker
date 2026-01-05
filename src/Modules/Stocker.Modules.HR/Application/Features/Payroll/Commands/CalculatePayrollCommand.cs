using FluentValidation;
using MediatR;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Domain.Entities;
using Stocker.Modules.HR.Domain.Enums;
using Stocker.Modules.HR.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Payroll.Commands;

/// <summary>
/// Command to calculate payroll amounts
/// </summary>
public record CalculatePayrollCommand : IRequest<Result<PayrollDto>>
{
    public int PayrollId { get; init; }
    public int CalculatedById { get; init; }
}

/// <summary>
/// Validator for CalculatePayrollCommand
/// </summary>
public class CalculatePayrollCommandValidator : AbstractValidator<CalculatePayrollCommand>
{
    public CalculatePayrollCommandValidator()
    {
        RuleFor(x => x.PayrollId)
            .GreaterThan(0).WithMessage("Valid payroll ID is required");

        RuleFor(x => x.CalculatedById)
            .GreaterThan(0).WithMessage("Valid calculator ID is required");
    }
}

/// <summary>
/// Handler for CalculatePayrollCommand
/// </summary>
public class CalculatePayrollCommandHandler : IRequestHandler<CalculatePayrollCommand, Result<PayrollDto>>
{
    private readonly IHRUnitOfWork _unitOfWork;

    public CalculatePayrollCommandHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<PayrollDto>> Handle(CalculatePayrollCommand request, CancellationToken cancellationToken)
    {
        var payroll = await _unitOfWork.Payrolls.GetByIdAsync(request.PayrollId, cancellationToken);
        if (payroll == null)
        {
            return Result<PayrollDto>.Failure(
                Error.NotFound("Payroll.NotFound", $"Payroll with ID {request.PayrollId} not found"));
        }

        if (payroll.Status != PayrollStatus.Draft)
        {
            return Result<PayrollDto>.Failure(
                Error.Validation("Payroll.InvalidStatus", "Only draft payrolls can be calculated"));
        }

        var employee = await _unitOfWork.Employees.GetByIdAsync(payroll.EmployeeId, cancellationToken);
        if (employee == null)
        {
            return Result<PayrollDto>.Failure(
                Error.NotFound("Employee.NotFound", $"Employee with ID {payroll.EmployeeId} not found"));
        }

        // Calculate totals from items based on PayrollItemType
        decimal overtimePay = 0;
        decimal bonus = 0;
        decimal allowances = 0;
        decimal otherEarnings = 0;
        decimal incomeTax = 0;
        decimal socialSecurityEmployee = 0;
        decimal unemploymentInsuranceEmployee = 0;
        decimal healthInsurance = 0;
        decimal stampTax = 0;
        decimal otherDeductions = 0;
        decimal socialSecurityEmployer = 0;
        decimal unemploymentInsuranceEmployer = 0;

        foreach (var item in payroll.Items)
        {
            if (item.ItemType == PayrollItemType.Earning)
            {
                // Earnings - categorize by code
                if (item.Code.Contains("OVERTIME", StringComparison.OrdinalIgnoreCase))
                    overtimePay += item.Amount;
                else if (item.Code.Contains("BONUS", StringComparison.OrdinalIgnoreCase))
                    bonus += item.Amount;
                else if (item.Code.Contains("ALLOWANCE", StringComparison.OrdinalIgnoreCase))
                    allowances += item.Amount;
                else
                    otherEarnings += item.Amount;
            }
            else if (item.ItemType == PayrollItemType.Deduction)
            {
                // Deductions - categorize by code
                if (item.Code.Contains("TAX", StringComparison.OrdinalIgnoreCase))
                    incomeTax += item.Amount;
                else if (item.Code.Contains("SSK", StringComparison.OrdinalIgnoreCase) || item.Code.Contains("SOCIALSEC", StringComparison.OrdinalIgnoreCase))
                    socialSecurityEmployee += item.Amount;
                else if (item.Code.Contains("UNEMPLOYMENT", StringComparison.OrdinalIgnoreCase))
                    unemploymentInsuranceEmployee += item.Amount;
                else if (item.Code.Contains("HEALTH", StringComparison.OrdinalIgnoreCase))
                    healthInsurance += item.Amount;
                else if (item.Code.Contains("STAMP", StringComparison.OrdinalIgnoreCase))
                    stampTax += item.Amount;
                else
                    otherDeductions += item.Amount;
            }
            else if (item.ItemType == PayrollItemType.EmployerContribution)
            {
                // Employer contributions
                if (item.Code.Contains("SSK", StringComparison.OrdinalIgnoreCase) || item.Code.Contains("SOCIALSEC", StringComparison.OrdinalIgnoreCase))
                    socialSecurityEmployer += item.Amount;
                else if (item.Code.Contains("UNEMPLOYMENT", StringComparison.OrdinalIgnoreCase))
                    unemploymentInsuranceEmployer += item.Amount;
            }
        }

        payroll.SetEarnings(overtimePay, bonus, allowances, otherEarnings);
        payroll.SetDeductions(incomeTax, socialSecurityEmployee, unemploymentInsuranceEmployee,
            healthInsurance, stampTax, otherDeductions);
        payroll.SetEmployerContributions(socialSecurityEmployer, unemploymentInsuranceEmployer);
        payroll.Calculate(request.CalculatedById);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = new PayrollDto
        {
            Id = payroll.Id,
            EmployeeId = payroll.EmployeeId,
            EmployeeName = $"{employee.FirstName} {employee.LastName}",
            EmployeeCode = employee.EmployeeCode,
            PayrollNumber = $"PAY-{payroll.Year:D4}{payroll.Month:D2}-{payroll.Id}",
            Year = payroll.Year,
            Month = payroll.Month,
            PeriodStartDate = payroll.PeriodStart,
            PeriodEndDate = payroll.PeriodEnd,
            BaseSalary = payroll.BaseSalary,
            TotalEarnings = payroll.GrossEarnings,
            TotalDeductions = payroll.TotalDeductions,
            TotalEmployerCost = payroll.TotalEmployerCost,
            NetSalary = payroll.NetSalary,
            GrossSalary = payroll.GrossEarnings,
            Currency = payroll.Currency,
            Status = payroll.Status,
            CalculatedDate = payroll.CalculatedDate,
            CalculatedById = payroll.CalculatedById,
            Notes = payroll.Notes,
            CreatedAt = payroll.CreatedDate
        };

        return Result<PayrollDto>.Success(dto);
    }
}
