using MediatR;
using Stocker.Modules.HR.Domain.Entities;
using Stocker.Modules.HR.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Payslips.Commands;

/// <summary>
/// Command to update a payslip
/// </summary>
public record UpdatePayslipCommand : IRequest<Result<bool>>
{
    public int PayslipId { get; init; }
    // Earnings
    public decimal? BaseSalary { get; init; }
    public decimal? OvertimePay { get; init; }
    public decimal? Bonus { get; init; }
    public decimal? Gratuity { get; init; }
    public decimal? Commission { get; init; }
    public decimal? OtherEarnings { get; init; }
    // Allowances
    public decimal? TransportationAllowance { get; init; }
    public decimal? MealAllowance { get; init; }
    public decimal? HousingAllowance { get; init; }
    public decimal? PhoneAllowance { get; init; }
    public decimal? OtherAllowances { get; init; }
    // Deductions
    public decimal? IncomeTax { get; init; }
    public decimal? StampTax { get; init; }
    public decimal? SsiEmployeeShare { get; init; }
    public decimal? UnemploymentInsuranceEmployee { get; init; }
    public decimal? PrivatePensionDeduction { get; init; }
    public decimal? UnionDues { get; init; }
    public decimal? Garnishment { get; init; }
    public decimal? AdvanceDeduction { get; init; }
    public decimal? OtherDeductions { get; init; }
    // Work info
    public int? DaysWorked { get; init; }
    public decimal? HoursWorked { get; init; }
    public decimal? OvertimeHours { get; init; }
    public int? LeaveDays { get; init; }
    public int? AbsenceDays { get; init; }
    public int? HolidayDays { get; init; }
    // Payment info
    public string? BankName { get; init; }
    public string? Iban { get; init; }
    public string? PaymentMethod { get; init; }
    public string? PaymentReference { get; init; }
    public string? Notes { get; init; }
    public string? InternalNotes { get; init; }
}

/// <summary>
/// Handler for UpdatePayslipCommand
/// </summary>
public class UpdatePayslipCommandHandler : IRequestHandler<UpdatePayslipCommand, Result<bool>>
{
    private readonly IHRUnitOfWork _unitOfWork;

    public UpdatePayslipCommandHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(UpdatePayslipCommand request, CancellationToken cancellationToken)
    {
        // Get existing payslip
        var payslip = await _unitOfWork.Payslips.GetByIdAsync(request.PayslipId, cancellationToken);
        if (payslip == null)
        {
            return Result<bool>.Failure(
                Error.NotFound("Payslip", $"Payslip with ID {request.PayslipId} not found"));
        }

        // Check if payslip can be updated
        if (payslip.Status == PayslipStatus.Paid || payslip.Status == PayslipStatus.Sent)
        {
            return Result<bool>.Failure(
                Error.Conflict("Payslip", "Cannot update sent or paid payslip"));
        }

        // Update earnings if specified
        if (request.BaseSalary.HasValue || request.OvertimePay.HasValue || request.Bonus.HasValue ||
            request.Gratuity.HasValue || request.Commission.HasValue || request.OtherEarnings.HasValue)
        {
            payslip.SetEarnings(
                request.BaseSalary ?? payslip.BaseSalary,
                request.OvertimePay ?? payslip.OvertimePay,
                request.Bonus ?? payslip.Bonus,
                request.Gratuity ?? payslip.Gratuity,
                request.Commission ?? payslip.Commission,
                request.OtherEarnings ?? payslip.OtherEarnings);
        }

        // Update allowances if specified
        if (request.TransportationAllowance.HasValue || request.MealAllowance.HasValue ||
            request.HousingAllowance.HasValue || request.PhoneAllowance.HasValue || request.OtherAllowances.HasValue)
        {
            payslip.SetAllowances(
                request.TransportationAllowance ?? payslip.TransportationAllowance,
                request.MealAllowance ?? payslip.MealAllowance,
                request.HousingAllowance ?? payslip.HousingAllowance,
                request.PhoneAllowance ?? payslip.PhoneAllowance,
                request.OtherAllowances ?? payslip.OtherAllowances);
        }

        // Update deductions if specified
        if (request.IncomeTax.HasValue || request.StampTax.HasValue || request.SsiEmployeeShare.HasValue ||
            request.UnemploymentInsuranceEmployee.HasValue || request.PrivatePensionDeduction.HasValue ||
            request.UnionDues.HasValue || request.Garnishment.HasValue || request.AdvanceDeduction.HasValue ||
            request.OtherDeductions.HasValue)
        {
            payslip.SetDeductions(
                request.IncomeTax ?? payslip.IncomeTax,
                request.StampTax ?? payslip.StampTax,
                request.SsiEmployeeShare ?? payslip.SsiEmployeeShare,
                request.UnemploymentInsuranceEmployee ?? payslip.UnemploymentInsuranceEmployee,
                request.PrivatePensionDeduction ?? payslip.PrivatePensionDeduction,
                request.UnionDues ?? payslip.UnionDues,
                request.Garnishment ?? payslip.Garnishment,
                request.AdvanceDeduction ?? payslip.AdvanceDeduction,
                request.OtherDeductions ?? payslip.OtherDeductions);
        }

        // Update work info if specified
        if (request.DaysWorked.HasValue || request.HoursWorked.HasValue || request.OvertimeHours.HasValue ||
            request.LeaveDays.HasValue || request.AbsenceDays.HasValue || request.HolidayDays.HasValue)
        {
            payslip.SetWorkInfo(
                request.DaysWorked ?? payslip.DaysWorked,
                request.HoursWorked ?? payslip.HoursWorked,
                request.OvertimeHours ?? payslip.OvertimeHours,
                request.LeaveDays ?? payslip.LeaveDays,
                request.AbsenceDays ?? payslip.AbsenceDays,
                request.HolidayDays ?? payslip.HolidayDays);
        }

        // Update bank info if specified
        if (!string.IsNullOrEmpty(request.BankName) || !string.IsNullOrEmpty(request.Iban) ||
            !string.IsNullOrEmpty(request.PaymentMethod) || !string.IsNullOrEmpty(request.PaymentReference))
        {
            var paymentMethod = payslip.PaymentMethod;
            if (!string.IsNullOrEmpty(request.PaymentMethod) && Enum.TryParse<PaymentMethod>(request.PaymentMethod, true, out var parsedMethod))
                paymentMethod = parsedMethod;

            payslip.SetBankInfo(
                request.BankName ?? payslip.BankName,
                request.Iban ?? payslip.Iban,
                paymentMethod,
                request.PaymentReference ?? payslip.PaymentReference);
        }

        // Update notes if specified
        if (!string.IsNullOrEmpty(request.Notes))
            payslip.SetNotes(request.Notes);

        if (!string.IsNullOrEmpty(request.InternalNotes))
            payslip.SetInternalNotes(request.InternalNotes);

        // Save changes
        _unitOfWork.Payslips.Update(payslip);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
