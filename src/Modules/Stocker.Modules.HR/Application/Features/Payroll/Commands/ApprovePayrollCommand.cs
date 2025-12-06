using FluentValidation;
using MediatR;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Domain.Enums;
using Stocker.Modules.HR.Domain.Repositories;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Payroll.Commands;

/// <summary>
/// Command to approve a payroll
/// </summary>
public class ApprovePayrollCommand : IRequest<Result<PayrollDto>>
{
    public Guid TenantId { get; set; }
    public int PayrollId { get; set; }
    public int ApprovedById { get; set; }
    public string? Notes { get; set; }
}

/// <summary>
/// Validator for ApprovePayrollCommand
/// </summary>
public class ApprovePayrollCommandValidator : AbstractValidator<ApprovePayrollCommand>
{
    public ApprovePayrollCommandValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Tenant ID is required");

        RuleFor(x => x.PayrollId)
            .GreaterThan(0).WithMessage("Valid payroll ID is required");

        RuleFor(x => x.ApprovedById)
            .GreaterThan(0).WithMessage("Valid approver ID is required");

        RuleFor(x => x.Notes)
            .MaximumLength(500).WithMessage("Notes must not exceed 500 characters");
    }
}

/// <summary>
/// Handler for ApprovePayrollCommand
/// </summary>
public class ApprovePayrollCommandHandler : IRequestHandler<ApprovePayrollCommand, Result<PayrollDto>>
{
    private readonly IPayrollRepository _payrollRepository;
    private readonly IEmployeeRepository _employeeRepository;
    private readonly IUnitOfWork _unitOfWork;

    public ApprovePayrollCommandHandler(
        IPayrollRepository payrollRepository,
        IEmployeeRepository employeeRepository,
        IUnitOfWork unitOfWork)
    {
        _payrollRepository = payrollRepository;
        _employeeRepository = employeeRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<PayrollDto>> Handle(ApprovePayrollCommand request, CancellationToken cancellationToken)
    {
        var payroll = await _payrollRepository.GetByIdAsync(request.PayrollId, cancellationToken);
        if (payroll == null)
        {
            return Result<PayrollDto>.Failure(
                Error.NotFound("Payroll.NotFound", $"Payroll with ID {request.PayrollId} not found"));
        }

        if (payroll.Status != PayrollStatus.Calculated && payroll.Status != PayrollStatus.PendingApproval)
        {
            return Result<PayrollDto>.Failure(
                Error.Validation("Payroll.InvalidStatus", "Only calculated or pending payrolls can be approved"));
        }

        var employee = await _employeeRepository.GetByIdAsync(payroll.EmployeeId, cancellationToken);

        payroll.Approve(request.ApprovedById);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = new PayrollDto
        {
            Id = payroll.Id,
            EmployeeId = payroll.EmployeeId,
            EmployeeName = employee != null ? $"{employee.FirstName} {employee.LastName}" : string.Empty,
            EmployeeCode = employee?.EmployeeCode,
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
            Notes = payroll.Notes,
            CreatedAt = payroll.CreatedDate
        };

        return Result<PayrollDto>.Success(dto);
    }
}
