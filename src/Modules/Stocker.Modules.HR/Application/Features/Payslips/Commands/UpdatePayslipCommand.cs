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
    public decimal? BaseSalary { get; init; }
    public decimal? OvertimePay { get; init; }
    public decimal? Bonus { get; init; }
    public decimal? TransportationAllowance { get; init; }
    public decimal? MealAllowance { get; init; }
    public decimal? IncomeTax { get; init; }
    public decimal? StampTax { get; init; }
    public decimal? SsiEmployeeShare { get; init; }
    public int? DaysWorked { get; init; }
    public decimal? HoursWorked { get; init; }
    public string? BankName { get; init; }
    public string? Iban { get; init; }
    public string? Notes { get; init; }
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
        if (request.BaseSalary.HasValue || request.OvertimePay.HasValue || request.Bonus.HasValue)
        {
            payslip.SetEarnings(
                request.BaseSalary ?? payslip.BaseSalary,
                request.OvertimePay ?? payslip.OvertimePay,
                request.Bonus ?? payslip.Bonus,
                payslip.Gratuity,
                payslip.Commission,
                payslip.OtherEarnings);
        }

        // Update allowances if specified
        if (request.TransportationAllowance.HasValue || request.MealAllowance.HasValue)
        {
            payslip.SetAllowances(
                request.TransportationAllowance ?? payslip.TransportationAllowance,
                request.MealAllowance ?? payslip.MealAllowance,
                payslip.HousingAllowance,
                payslip.PhoneAllowance,
                payslip.OtherAllowances);
        }

        // Update deductions if specified
        if (request.IncomeTax.HasValue || request.StampTax.HasValue || request.SsiEmployeeShare.HasValue)
        {
            payslip.SetDeductions(
                request.IncomeTax ?? payslip.IncomeTax,
                request.StampTax ?? payslip.StampTax,
                request.SsiEmployeeShare ?? payslip.SsiEmployeeShare,
                payslip.UnemploymentInsuranceEmployee,
                payslip.PrivatePensionDeduction,
                payslip.UnionDues,
                payslip.Garnishment,
                payslip.AdvanceDeduction,
                payslip.OtherDeductions);
        }

        // Update work info if specified
        if (request.DaysWorked.HasValue || request.HoursWorked.HasValue)
        {
            payslip.SetWorkInfo(
                request.DaysWorked ?? payslip.DaysWorked,
                request.HoursWorked ?? payslip.HoursWorked,
                payslip.OvertimeHours,
                payslip.LeaveDays,
                payslip.AbsenceDays,
                payslip.HolidayDays);
        }

        // Update bank info if specified
        if (!string.IsNullOrEmpty(request.BankName) || !string.IsNullOrEmpty(request.Iban))
        {
            payslip.SetBankInfo(
                request.BankName ?? payslip.BankName,
                request.Iban ?? payslip.Iban,
                payslip.PaymentMethod,
                payslip.PaymentReference);
        }

        // Update notes if specified
        if (!string.IsNullOrEmpty(request.Notes))
            payslip.SetNotes(request.Notes);

        // Save changes
        _unitOfWork.Payslips.Update(payslip);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
