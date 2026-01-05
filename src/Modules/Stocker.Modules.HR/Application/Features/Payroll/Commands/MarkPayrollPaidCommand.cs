using FluentValidation;
using MediatR;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Domain.Enums;
using Stocker.Modules.HR.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Payroll.Commands;

/// <summary>
/// Command to mark a payroll as paid
/// </summary>
public record MarkPayrollPaidCommand : IRequest<Result<PayrollDto>>
{
    public int PayrollId { get; init; }
    public MarkPayrollPaidDto PaymentData { get; init; } = null!;
}

/// <summary>
/// Validator for MarkPayrollPaidCommand
/// </summary>
public class MarkPayrollPaidCommandValidator : AbstractValidator<MarkPayrollPaidCommand>
{
    public MarkPayrollPaidCommandValidator()
    {
        RuleFor(x => x.PayrollId)
            .GreaterThan(0).WithMessage("Valid payroll ID is required");

        When(x => x.PaymentData != null, () =>
        {
            RuleFor(x => x.PaymentData.PaymentReference)
                .MaximumLength(100).WithMessage("Payment reference must not exceed 100 characters");
        });
    }
}

/// <summary>
/// Handler for MarkPayrollPaidCommand
/// </summary>
public class MarkPayrollPaidCommandHandler : IRequestHandler<MarkPayrollPaidCommand, Result<PayrollDto>>
{
    private readonly IHRUnitOfWork _unitOfWork;

    public MarkPayrollPaidCommandHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<PayrollDto>> Handle(MarkPayrollPaidCommand request, CancellationToken cancellationToken)
    {
        var payroll = await _unitOfWork.Payrolls.GetByIdAsync(request.PayrollId, cancellationToken);
        if (payroll == null)
        {
            return Result<PayrollDto>.Failure(
                Error.NotFound("Payroll.NotFound", $"Payroll with ID {request.PayrollId} not found"));
        }

        if (payroll.Status != PayrollStatus.Approved)
        {
            return Result<PayrollDto>.Failure(
                Error.Validation("Payroll.InvalidStatus", "Only approved payrolls can be marked as paid"));
        }

        var employee = await _unitOfWork.Employees.GetByIdAsync(payroll.EmployeeId, cancellationToken);

        payroll.MarkAsPaid(request.PaymentData?.PaymentReference);
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
            PaidDate = payroll.PaidDate,
            PaymentReference = payroll.PaymentReference,
            Notes = payroll.Notes,
            CreatedAt = payroll.CreatedDate
        };

        return Result<PayrollDto>.Success(dto);
    }
}
