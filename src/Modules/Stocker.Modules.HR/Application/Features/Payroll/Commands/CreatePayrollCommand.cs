using FluentValidation;
using MediatR;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Application.Services;
using Stocker.Modules.HR.Domain.Entities;
using Stocker.Modules.HR.Domain.Repositories;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Payroll.Commands;

/// <summary>
/// Command to create a new payroll record
/// </summary>
public class CreatePayrollCommand : IRequest<Result<PayrollDto>>
{
    public Guid TenantId { get; set; }
    public CreatePayrollDto PayrollData { get; set; } = null!;
}

/// <summary>
/// Validator for CreatePayrollCommand
/// </summary>
public class CreatePayrollCommandValidator : AbstractValidator<CreatePayrollCommand>
{
    public CreatePayrollCommandValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Tenant ID is required");

        RuleFor(x => x.PayrollData)
            .NotNull().WithMessage("Payroll data is required");

        When(x => x.PayrollData != null, () =>
        {
            RuleFor(x => x.PayrollData.EmployeeId)
                .GreaterThan(0).WithMessage("Valid employee ID is required");

            RuleFor(x => x.PayrollData.Year)
                .InclusiveBetween(2000, 2100).WithMessage("Year must be between 2000 and 2100");

            RuleFor(x => x.PayrollData.Month)
                .InclusiveBetween(1, 12).WithMessage("Month must be between 1 and 12");
        });
    }
}

/// <summary>
/// Handler for CreatePayrollCommand
/// </summary>
public class CreatePayrollCommandHandler : IRequestHandler<CreatePayrollCommand, Result<PayrollDto>>
{
    private readonly IPayrollRepository _payrollRepository;
    private readonly IEmployeeRepository _employeeRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ITurkishPayrollCalculationService _calculationService;

    public CreatePayrollCommandHandler(
        IPayrollRepository payrollRepository,
        IEmployeeRepository employeeRepository,
        IUnitOfWork unitOfWork,
        ITurkishPayrollCalculationService calculationService)
    {
        _payrollRepository = payrollRepository;
        _employeeRepository = employeeRepository;
        _unitOfWork = unitOfWork;
        _calculationService = calculationService;
    }

    public async Task<Result<PayrollDto>> Handle(CreatePayrollCommand request, CancellationToken cancellationToken)
    {
        var data = request.PayrollData;

        // Check if payroll already exists for this employee/period
        var existingPayroll = await _payrollRepository.GetByEmployeeAndPeriodAsync(
            data.EmployeeId, data.Year, data.Month, cancellationToken);
        if (existingPayroll != null)
        {
            return Result<PayrollDto>.Failure(
                Error.Conflict("Payroll.AlreadyExists",
                    $"Payroll already exists for employee {data.EmployeeId} for {data.Year}/{data.Month}"));
        }

        // Get employee for base salary
        var employee = await _employeeRepository.GetByIdAsync(data.EmployeeId, cancellationToken);
        if (employee == null)
        {
            return Result<PayrollDto>.Failure(
                Error.NotFound("Employee.NotFound", $"Employee with ID {data.EmployeeId} not found"));
        }

        // Calculate period dates
        var periodStartDate = new DateTime(data.Year, data.Month, 1);
        var periodEndDate = periodStartDate.AddMonths(1).AddDays(-1);

        // Use provided base salary or employee's base salary
        var baseSalary = data.BaseSalary > 0 ? data.BaseSalary : employee.BaseSalary;

        var payroll = new Domain.Entities.Payroll(
            data.EmployeeId,
            data.Year,
            data.Month,
            periodStartDate,
            periodEndDate,
            baseSalary);

        payroll.SetTenantId(request.TenantId);

        // Set earnings
        payroll.SetEarnings(
            overtime: data.OvertimePay,
            bonus: data.Bonus,
            allowances: data.Allowances);

        // Calculate deductions
        if (data.AutoCalculate)
        {
            // Use Turkish payroll calculation service
            var calcInput = new PayrollCalculationInput
            {
                BaseSalary = baseSalary,
                OvertimePay = data.OvertimePay,
                Bonus = data.Bonus,
                Allowances = data.Allowances,
                CumulativeGrossEarnings = data.CumulativeGrossEarnings,
                ApplyMinWageExemption = data.ApplyMinWageExemption
            };

            var calcResult = _calculationService.Calculate(calcInput);

            // Set deductions from calculation
            payroll.SetDeductions(
                incomeTax: calcResult.IncomeTax,
                socialSecurityEmployee: calcResult.SgkInsuranceEmployee,
                unemploymentInsuranceEmployee: calcResult.SgkUnemploymentEmployee,
                stampTax: calcResult.StampTax);

            // Set employer contributions
            payroll.SetEmployerContributions(
                socialSecurityEmployer: calcResult.SgkInsuranceEmployer,
                unemploymentInsuranceEmployer: calcResult.SgkUnemploymentEmployer);

            // Set Turkish tax calculation details
            payroll.SetTurkishTaxCalculation(
                cumulativeGrossEarnings: data.CumulativeGrossEarnings,
                minWageExemption: calcResult.MinWageExemption,
                taxBase: calcResult.TaxBase,
                taxBracket: calcResult.TaxBracket,
                taxBracketRate: calcResult.TaxBracketRate,
                sgkCeilingApplied: calcResult.SgkCeilingApplied,
                sgkBase: calcResult.SgkBase,
                effectiveTaxRate: calcResult.EffectiveTaxRate);
        }
        else
        {
            // Use manually provided values
            payroll.SetDeductions(
                incomeTax: data.IncomeTax ?? 0,
                socialSecurityEmployee: data.SocialSecurityEmployee ?? 0,
                unemploymentInsuranceEmployee: data.UnemploymentInsuranceEmployee ?? 0,
                stampTax: data.StampTax ?? 0,
                otherDeductions: data.OtherDeductions ?? 0);
        }

        if (!string.IsNullOrEmpty(data.Notes))
        {
            payroll.SetNotes(data.Notes);
        }

        await _payrollRepository.AddAsync(payroll, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = MapToDto(payroll, employee);
        return Result<PayrollDto>.Success(dto);
    }

    private static PayrollDto MapToDto(Domain.Entities.Payroll payroll, Employee employee)
    {
        return new PayrollDto
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
            ApprovedDate = payroll.ApprovedDate,
            ApprovedById = payroll.ApprovedById,
            PaidDate = payroll.PaidDate,
            PaymentReference = payroll.PaymentReference,
            Notes = payroll.Notes,
            CreatedAt = payroll.CreatedDate,
            // Detaylı Kesinti Alanları
            IncomeTax = payroll.IncomeTax,
            SocialSecurityEmployee = payroll.SocialSecurityEmployee,
            UnemploymentInsuranceEmployee = payroll.UnemploymentInsuranceEmployee,
            StampTax = payroll.StampTax,
            OtherDeductions = payroll.OtherDeductions,
            // İşveren Maliyetleri
            SocialSecurityEmployer = payroll.SocialSecurityEmployer,
            UnemploymentInsuranceEmployer = payroll.UnemploymentInsuranceEmployer,
            // Türkiye Vergi Hesaplama
            CumulativeGrossEarnings = payroll.CumulativeGrossEarnings,
            MinWageExemption = payroll.MinWageExemption,
            TaxBase = payroll.TaxBase,
            TaxBracket = payroll.TaxBracket,
            TaxBracketRate = payroll.TaxBracketRate,
            SgkCeilingApplied = payroll.SgkCeilingApplied,
            SgkBase = payroll.SgkBase,
            EffectiveTaxRate = payroll.EffectiveTaxRate,
            // Kazanç Detayları
            OvertimePay = payroll.OvertimePay,
            Bonus = payroll.Bonus,
            Allowances = payroll.Allowances
        };
    }
}
